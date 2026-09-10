'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Chip, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { getDefaultWheelPrizes, type WheelPrize, type WheelSpinHistoryItem } from './wheel-model';
import { buildWheelPlan } from './wheel-plan';
import { getWheelStartRotation, getWheelTargetRotation } from './wheel-motion';
import { WheelRenderer } from './wheel-renderer';
import { WheelHistoryRail, WheelHistoryTicker, WheelRewardRail } from './wheel-rail';
import { buildFixedWheelPrizes, DEFAULT_GROUP_WEIGHTS, type FixedWheelGroupKey } from './wheel-groups';
import { WheelResultSheet, type WheelResultGroupKey, type WheelResultSheetData } from './wheel-result-sheet';
import { WheelProductHeader, WheelProductNav } from './wheel-chrome';

function WheelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [groupWeights, setGroupWeights] = useState(DEFAULT_GROUP_WEIGHTS);
  const [history, setHistory] = useState<WheelSpinHistoryItem[]>([]);
  const [spins, setSpins] = useState(0);
  const [peaches, setPeaches] = useState(0);
  const [spinExchangeCost, setSpinExchangeCost] = useState(3);
  const [converting, setConverting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [spinError, setSpinError] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'slowing' | 'settling'>('idle');
  const [rotation, setRotation] = useState(0);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastResult, setLastResult] = useState<WheelResultSheetData | null>(null);
  const spinTimersRef = useRef<number[]>([]);
  const [debugSpinMode, setDebugSpinMode] = useState(false);

  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
    const debugEnabled =
      searchParams.get('debugSpin') === '1' ||
      window.localStorage.getItem('tele-member-wheel-debug') === '1';
    setDebugSpinMode(debugEnabled);
  }, []);

  useEffect(() => () => {
    spinTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    spinTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([client.getWheelCurrent(), client.getMySpins(), client.getWheelHistory(), client.getMySummary().catch(() => null)])
      .then(([wheel, spinData, historyData, summary]) => {
        if (cancelled) return;
        setPrizes(((wheel?.prizes ?? []) as WheelPrize[]) ?? []);
        const nextGroupWeights = { ...DEFAULT_GROUP_WEIGHTS };
        for (const group of wheel?.groups ?? []) {
          if (group.groupKey in nextGroupWeights) {
            nextGroupWeights[group.groupKey as FixedWheelGroupKey] = Number(group.weight) || 0;
          }
        }
        setGroupWeights(nextGroupWeights);
        setSpins(Number(spinData?.balance ?? 0));
        setPeaches(Number(summary?.balance ?? 0));
        setSpinExchangeCost(Number(summary?.spinExchangeCost ?? 3));
        setHistory(((historyData?.spins ?? []) as any[]) ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, token]);

  const demoFallbackPrizes = getDefaultWheelPrizes();
  const effectivePrizes = prizes.length ? prizes : demoFallbackPrizes;
  const wheelGroupPrizes = useMemo(() => {
    return buildFixedWheelPrizes(effectivePrizes, groupWeights);
  }, [effectivePrizes, groupWeights]);
  const wheelSegments = useMemo(() => buildWheelPlan(wheelGroupPrizes, false, false).segments, [wheelGroupPrizes]);
  const canSpin = !loading && !spinning && (debugSpinMode || spins > 0);

  function createDebugSpinResult(prizeId?: string | null) {
    const selectedPrize =
      effectivePrizes.find((prize) => prize.id === prizeId) ??
      effectivePrizes.find((prize) => String(prize.type ?? '').toUpperCase() !== 'NOTHING') ??
      effectivePrizes[0] ??
      null;
    const prizeType = String(selectedPrize?.type ?? 'CUSTOM').toUpperCase();
    const glyph = String(
      selectedPrize?.metadata?.glyph ??
        selectedPrize?.metadata?.emoji ??
        selectedPrize?.metadata?.wheelGlyph ??
        (prizeType === 'POINT'
          ? '🍑'
          : prizeType === 'SPIN_TICKET'
            ? '🎞'
            : prizeType === 'VOUCHER'
              ? '🎁'
              : prizeType === 'VIP_CODE'
                ? '👑'
                : prizeType === 'NOTHING'
                  ? '😢'
                  : '✦'),
    );

    return {
      groupKey: selectedPrize?.groupKey ?? (prizeType === 'NOTHING' ? 'nothing' : prizeType === 'POINT' ? 'peach' : 'gift'),
      prize: selectedPrize
        ? {
            id: selectedPrize.id,
            name: selectedPrize.name,
            type: selectedPrize.type,
            glyph,
            code: null,
          }
        : null,
      prizeName: selectedPrize?.name ?? 'Sẵn sàng',
      prizeType,
      glyph,
      code: null,
      deliveryMode: selectedPrize?.metadata?.deliveryMode ?? 'immediate',
      deliveryTarget: selectedPrize?.metadata?.deliveryTarget ?? 'reward_inbox',
      points: Number(selectedPrize?.metadata?.points ?? selectedPrize?.metadata?.point_amount ?? 0) || null,
      description: selectedPrize?.metadata?.description ?? null,
    };
  }

  async function handleSpin() {
    if (spinning) return;
    spinTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    spinTimersRef.current = [];

    try {
      setSpinning(true);
      setSpinError('');
      setResultOpen(false);
      setSpinPhase('spinning');

      const debugResult = debugSpinMode && (spins <= 0 || !token);
      const data = debugResult ? createDebugSpinResult() : await client.spinWheel();

      const prizeId = data?.prize?.id;
      const resultGroupKey = String(data?.groupKey ?? data?.prize?.groupKey ?? (data?.prize?.type === 'NOTHING' ? 'nothing' : data?.prize?.type === 'POINT' ? 'peach' : 'gift')).trim().toLowerCase();
      const prizeName = String(data?.prize?.name ?? data?.prizeName ?? data?.resultLabel ?? (prizeId ? 'Đã trúng' : 'Không trúng'));
      const prizeType = String(data?.prize?.type ?? data?.prizeType ?? (prizeId ? 'CUSTOM' : 'NOTHING')).toUpperCase();
      const normalizedGroupKey: WheelResultGroupKey = resultGroupKey === 'peach' ? 'peach' : resultGroupKey === 'nothing' ? 'nothing' : 'gift';
      const glyph = String(data?.prize?.glyph ?? data?.glyph ?? (prizeType === 'POINT' ? '🍑' : prizeType === 'SPIN_TICKET' ? '🎞' : prizeType === 'VOUCHER' ? '🎁' : prizeType === 'VIP_CODE' ? '👑' : prizeType === 'NOTHING' ? '😢' : '✦'));
      const code = data?.prize?.code ? String(data.prize.code) : data?.code ? String(data.code) : null;
      const resultMetadata = (data?.prize?.metadata ?? data?.metadata ?? {}) as Record<string, unknown>;
      setLastResult({
        groupKey: normalizedGroupKey,
        prizeName,
        prizeType,
        glyph,
        code,
        points: Number(resultMetadata.points ?? resultMetadata.point_amount ?? data?.points ?? 0) || null,
        description: typeof resultMetadata.description === 'string' ? resultMetadata.description : null,
        deliveryMode: data?.deliveryMode ?? null,
        deliveryTarget: data?.deliveryTarget ?? null,
        status: normalizedGroupKey === 'nothing' ? 'missed' : prizeId ? 'won' : 'missed',
      });
      const targetRotation = getWheelTargetRotation(wheelSegments, normalizedGroupKey);
      // Resolve the destination before animating so the wheel only has one
      // transform transition and cannot jump during the final slowdown.
      const spinStart = getWheelStartRotation(rotation);
      const finalRotation = spinStart + 1440 + targetRotation;

      setRotation(spinStart);
      window.requestAnimationFrame(() => setRotation(finalRotation));

      if (!debugResult) {
        const [updatedSpins, updatedSummary] = await Promise.all([client.getMySpins(), client.getMySummary().catch(() => null)]);
        setSpins(Number(updatedSpins?.balance ?? 0));
        if (updatedSummary) setPeaches(Number(updatedSummary.balance ?? 0));
        const refreshedHistory = await client.getWheelHistory();
        setHistory(((refreshedHistory?.spins ?? []) as any[]) ?? []);
      }

      spinTimersRef.current.push(window.setTimeout(() => setSpinPhase('slowing'), 3300));
      spinTimersRef.current.push(window.setTimeout(() => setSpinPhase('settling'), 4120));
      spinTimersRef.current.push(window.setTimeout(() => {
        setSpinPhase('idle');
        setSpinning(false);
        setResultOpen(true);
      }, 4540));
    } catch (err) {
      setSpinPhase('idle');
      setSpinning(false);
      setSpinError(err instanceof Error ? err.message : 'Không thể hoàn tất lượt quay. Vui lòng thử lại.');
    } finally {
      if (spinTimersRef.current.length === 0) {
        setSpinning(false);
      }
    }
  }

  async function handleConvertSpin() {
    if (!token || converting || spinning || peaches < spinExchangeCost) return;
    try {
      setConverting(true);
      setSpinError('');
      const response = await client.convertPeachesToSpin(1);
      const [updatedSpins, updatedSummary] = await Promise.all([client.getMySpins(), client.getMySummary().catch(() => null)]);
      setSpins(Number(updatedSpins?.balance ?? response?.spinsGranted ?? spins + 1));
      if (updatedSummary) {
        setPeaches(Number(updatedSummary.balance ?? 0));
        setSpinExchangeCost(Number(updatedSummary.spinExchangeCost ?? spinExchangeCost));
      } else {
        setPeaches((current) => Math.max(0, current - spinExchangeCost));
      }
    } catch (err) {
      setSpinError(err instanceof Error ? err.message : 'Không thể đổi đào sang lượt quay.');
    } finally {
      setConverting(false);
    }
  }

  return (
    <PageShell>
      <WheelProductHeader spins={spins} peaches={peaches} />
      <Container maxWidth="md" sx={{ pt: { xs: 1, sm: 1.5 }, pb: { xs: 12, sm: 13 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: { xs: -20, sm: -32 },
            pointerEvents: 'none',
            opacity: 0.18,
            background:
              'radial-gradient(circle at 18% 18%, rgba(123,174,255,0.18), transparent 24%), radial-gradient(circle at 82% 16%, rgba(86,135,255,0.14), transparent 20%), radial-gradient(circle at 50% 50%, rgba(23,56,178,0.10), transparent 44%)',
            filter: 'blur(6px)',
          }}
        />

        <Stack spacing={1.5} sx={{ position: 'relative', alignItems: 'center' }}>
          <Box sx={{ width: 'min(92vw, 560px)', pt: { xs: 1.25, sm: 2 }, pb: 0.35 }}>
            <Stack spacing={0.65}>
              <Typography
                component="h1"
                sx={{
                  color: '#f7fbff',
                  fontSize: { xs: '1.8rem', sm: '2.2rem' },
                  lineHeight: 1.05,
                  fontWeight: 950,
                  letterSpacing: '-0.055em',
                }}
              >
                Vòng Quay May Mắn
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.64)', fontSize: { xs: '0.92rem', sm: '1rem' }, lineHeight: 1.35 }}>
                Thử vận may của bạn, biết đâu nhận được quà xịn.
              </Typography>
            </Stack>
          </Box>

          {debugSpinMode ? (
            <Chip
              size="small"
              label="DEBUG SPIN"
              sx={{
                alignSelf: 'flex-end',
                bgcolor: 'rgba(255,200,102,0.16)',
                color: '#ffe7bc',
                border: '1px solid rgba(255,200,102,0.22)',
                fontWeight: 800,
              }}
            />
          ) : null}

          <WheelHistoryTicker items={history} />

          <WheelRenderer
            prizes={wheelGroupPrizes}
            spinning={spinning}
            phase={spinPhase}
            rotation={rotation}
            noSpins={!loading && !debugSpinMode && spins <= 0}
          />

          <Box
            sx={{
              width: 'min(92vw, 560px)',
              mt: { xs: -0.5, sm: -1 },
            }}
          >
            <Button
              onClick={handleSpin}
              disabled={!canSpin}
              variant="contained"
              sx={{
                width: '100%',
                minHeight: { xs: 64, sm: 70 },
                px: { xs: 2.25, sm: 3 },
                borderRadius: 999,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1.5,
                fontWeight: 950,
                fontSize: { xs: '1rem', sm: '1.08rem' },
                letterSpacing: '0.04em',
                color: '#f7fbff',
                background: 'linear-gradient(180deg, rgba(58,111,255,1) 0%, rgba(18,45,154,1) 100%)',
                boxShadow: '0 16px 30px rgba(33,69,191,0.28)',
                '&:hover': { background: 'linear-gradient(180deg, rgba(82,133,255,1) 0%, rgba(18,45,154,1) 100%)' },
                '&.Mui-disabled': { color: 'rgba(228,237,255,0.52)', background: 'linear-gradient(180deg, rgba(52,81,155,0.82), rgba(24,38,92,0.9))' },
              }}
            >
              <Box component="span">{spinning ? 'ĐANG QUAY...' : canSpin ? 'QUAY NGAY' : debugSpinMode ? 'DEBUG READY' : 'HẾT LƯỢT QUAY'}</Box>
              <Chip
                label={`${spins} lượt`}
                size="small"
                sx={{
                  height: 34,
                  bgcolor: 'rgba(5,19,68,0.34)',
                  color: '#dbeafe',
                  border: '1px solid rgba(196,220,255,0.28)',
                  fontWeight: 950,
                  '& .MuiChip-label': { px: 1.25 },
                }}
              />
            </Button>
          </Box>

          <Box
            sx={{
              width: 'min(92vw, 560px)',
              p: { xs: 1.35, sm: 1.6 },
              borderRadius: 2.5,
              bgcolor: 'rgba(7,16,35,0.78)',
              border: '1px solid rgba(255,209,102,0.22)',
              boxShadow: '0 16px 34px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <Stack spacing={1.05}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box>
                  <Typography sx={{ color: '#fff4cf', fontWeight: 950, fontSize: '0.98rem', letterSpacing: '-0.02em' }}>Đổi đào lấy lượt</Typography>
                  <Typography sx={{ color: 'rgba(226,234,255,0.56)', fontSize: '0.76rem' }}>Nạp thêm lượt khi ví quay về 0.</Typography>
                </Box>
                <Typography sx={{ color: '#FFD166', fontWeight: 950, fontSize: '1rem', whiteSpace: 'nowrap' }}>{peaches} 🍑</Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Box sx={{ flex: 1, px: 1.15, py: 0.85, borderRadius: 1.5, bgcolor: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.13)' }}>
                  <Typography sx={{ color: '#ffe7a4', fontWeight: 900, fontSize: '0.84rem' }}>{spinExchangeCost} đào = 1 lượt quay</Typography>
                </Box>
                <Button
                  onClick={handleConvertSpin}
                  disabled={!token || converting || spinning || peaches < spinExchangeCost}
                  variant="outlined"
                  sx={{ borderRadius: 999, px: 2.1, py: 0.85, color: '#FFD166', borderColor: 'rgba(255,209,102,0.42)', fontWeight: 950, whiteSpace: 'nowrap', '&:hover': { borderColor: '#FFD166', bgcolor: 'rgba(255,209,102,0.08)' } }}
                >
                  {converting ? 'ĐANG ĐỔI...' : 'ĐỔI 1 LƯỢT'}
                </Button>
              </Stack>
            </Stack>
          </Box>

          {spinError ? (
            <Typography sx={{ color: '#fecaca', fontSize: '0.82rem', textAlign: 'center', maxWidth: 360 }}>
              {spinError}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ justifyContent: 'center' }}>
            <Button
              onClick={() => router.push('/my-rewards')}
              variant="outlined"
              sx={{
                minWidth: { xs: 150, sm: 180 },
                px: 2.2,
                py: 1.05,
                borderRadius: 999,
                fontWeight: 900,
                color: '#dbeafe',
                borderColor: 'rgba(123,174,255,0.34)',
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': {
                  borderColor: 'rgba(123,174,255,0.52)',
                  bgcolor: 'rgba(123,174,255,0.08)',
                },
              }}
            >
              Quà của tôi
            </Button>
            <Button
              onClick={() => router.push('/my-rewards')}
              variant="text"
              sx={{
                minWidth: { xs: 150, sm: 180 },
                px: 2.2,
                py: 1.05,
                borderRadius: 999,
                fontWeight: 800,
                color: 'rgba(226,234,255,0.82)',
              }}
            >
              Xem inbox quà
            </Button>
          </Stack>

          <Box sx={{ width: 'min(92vw, 560px)', display: 'grid', gap: 1.5, mt: 1.5 }}>
            <WheelRewardRail prizes={effectivePrizes} />
            <WheelHistoryRail items={history} />
          </Box>
        </Stack>
      </Container>

      <WheelProductNav />

      <WheelResultSheet
        open={resultOpen}
        result={lastResult}
        onClose={() => setResultOpen(false)}
        onViewRewards={() => {
          setResultOpen(false);
          router.push('/my-rewards');
        }}
        onSpinAgain={() => {
          setResultOpen(false);
          window.setTimeout(() => void handleSpin(), 120);
        }}
        canSpinAgain={canSpin}
      />
    </PageShell>
  );
}

export default function WheelPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: '100vh', bgcolor: '#081222' }} />}>
      <WheelPageContent />
    </Suspense>
  );
}
