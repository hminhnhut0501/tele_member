'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { getDefaultWheelPrizes, type WheelPrize, type WheelSpinHistoryItem } from './wheel-model';
import { buildWheelPlan } from './wheel-plan';
import { getWheelStartRotation, getWheelTargetRotation } from './wheel-motion';
import { WheelRenderer } from './wheel-renderer';
import { WheelHistoryRail, WheelHistoryTicker, WheelRewardRail } from './wheel-rail';

export default function WheelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [history, setHistory] = useState<WheelSpinHistoryItem[]>([]);
  const [spins, setSpins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning'>('idle');
  const [rotation, setRotation] = useState(0);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastResult, setLastResult] = useState<{
    prizeName: string;
    prizeType: string;
    glyph: string;
    code: string | null;
    deliveryMode?: string | null;
    deliveryTarget?: string | null;
    status: 'won' | 'missed' | 'pending' | 'claimed';
    createdAt?: string | null;
  } | null>(null);
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

    Promise.all([client.getWheelCurrent(), client.getMySpins(), client.getWheelHistory()])
      .then(([wheel, spinData, historyData]) => {
        if (cancelled) return;
        setPrizes(((wheel?.prizes ?? []) as WheelPrize[]) ?? []);
        setSpins(Number(spinData?.balance ?? 0));
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
  const wheelSegments = useMemo(() => buildWheelPlan(effectivePrizes, false, false).segments, [effectivePrizes]);
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
    };
  }

  async function handleSpin() {
    if (spinning) return;
    spinTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    spinTimersRef.current = [];

    try {
      setSpinning(true);
      setResultOpen(false);
      setSpinPhase('spinning');

      const spinStart = getWheelStartRotation(rotation);
      setRotation(spinStart);
      window.requestAnimationFrame(() => setRotation(spinStart + 1080));

      const debugResult = debugSpinMode && (spins <= 0 || !token);
      const data = debugResult ? createDebugSpinResult() : await client.spinWheel();

      const prizeId = data?.prize?.id;
      const prizeName = String(data?.prize?.name ?? data?.prizeName ?? data?.resultLabel ?? (prizeId ? 'Đã trúng' : 'Không trúng'));
      const prizeType = String(data?.prize?.type ?? data?.prizeType ?? (prizeId ? 'CUSTOM' : 'NOTHING')).toUpperCase();
      const glyph = String(data?.prize?.glyph ?? data?.glyph ?? (prizeType === 'POINT' ? '🍑' : prizeType === 'SPIN_TICKET' ? '🎞' : prizeType === 'VOUCHER' ? '🎁' : prizeType === 'VIP_CODE' ? '👑' : prizeType === 'NOTHING' ? '😢' : '✦'));
      const code = data?.prize?.code ? String(data.prize.code) : data?.code ? String(data.code) : null;
      setLastResult({
        prizeName,
        prizeType,
        glyph,
        code,
        deliveryMode: data?.deliveryMode ?? null,
        deliveryTarget: data?.deliveryTarget ?? null,
        status: prizeId ? 'won' : 'missed',
        createdAt: new Date().toISOString(),
      });
      const targetRotation = getWheelTargetRotation(wheelSegments, prizeId);
      const finalRotation = spinStart + 1440 + targetRotation;

      if (!debugResult) {
        const updatedSpins = await client.getMySpins();
        setSpins(Number(updatedSpins?.balance ?? 0));
        const refreshedHistory = await client.getWheelHistory();
        setHistory(((refreshedHistory?.spins ?? []) as any[]) ?? []);
      }

      spinTimersRef.current.push(
        window.setTimeout(() => {
          setRotation(finalRotation);
        }, 5900),
      );
      spinTimersRef.current.push(
        window.setTimeout(() => {
          setSpinPhase('idle');
          setSpinning(false);
          setResultOpen(true);
        }, 6460),
      );
    } catch (err) {
      setSpinPhase('idle');
      setSpinning(false);
    } finally {
      if (spinTimersRef.current.length === 0) {
        setSpinning(false);
      }
    }
  }

  return (
    <PageShell>
      <Container maxWidth="md" sx={{ py: { xs: 1, sm: 1.5 }, position: 'relative' }}>
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              alignItems: 'center',
              width: 'min(92vw, 560px)',
              px: 1,
              py: 0.8,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Box sx={{ color: '#f2f7ff', fontWeight: 800, fontSize: '0.88rem' }}>
              Lượt quay: {spins}
            </Box>
            <Box sx={{ color: 'rgba(226,234,255,0.74)', fontSize: '0.84rem' }}>
              Blue lobby
            </Box>
            {debugSpinMode ? (
              <Chip
                size="small"
                label="DEBUG SPIN"
                sx={{
                  ml: 'auto',
                  bgcolor: 'rgba(255,200,102,0.16)',
                  color: '#ffe7bc',
                  border: '1px solid rgba(255,200,102,0.22)',
                  fontWeight: 800,
                }}
              />
            ) : null}
          </Box>

          <WheelHistoryTicker items={history} />

          <WheelRenderer prizes={effectivePrizes} spinning={spinning} phase={spinPhase} rotation={rotation} />

          <Button
            onClick={handleSpin}
            disabled={!canSpin}
            variant="contained"
            sx={{
              minWidth: { xs: 240, sm: 300 },
              mt: 0.5,
              px: { xs: 4.5, sm: 6 },
              py: { xs: 1.35, sm: 1.55 },
              borderRadius: 999,
              fontWeight: 900,
              fontSize: { xs: '1rem', sm: '1.04rem' },
              letterSpacing: '0.04em',
              color: '#f7fbff',
              background: 'linear-gradient(180deg, rgba(58,111,255,1) 0%, rgba(18,45,154,1) 100%)',
              boxShadow: '0 16px 30px rgba(33,69,191,0.26)',
              '&:hover': {
                background: 'linear-gradient(180deg, rgba(82,133,255,1) 0%, rgba(18,45,154,1) 100%)',
              },
            }}
          >
            {spinning ? 'ĐANG QUAY...' : canSpin ? 'QUAY NGAY' : debugSpinMode ? 'DEBUG READY' : 'HẾT LƯỢT QUAY'}
          </Button>

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

      <Dialog
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 1.5,
            border: '1px solid rgba(105, 147, 255, 0.14)',
            background: 'linear-gradient(180deg, rgba(7,14,30,0.98), rgba(12,21,44,0.98))',
            color: '#eef4ff',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(180deg, rgba(102,168,255,0.36), rgba(18,45,154,0.72))',
                border: '1px solid rgba(123,174,255,0.26)',
                fontSize: '1.3rem',
                flex: '0 0 auto',
              }}
            >
              {lastResult?.glyph ?? '✦'}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#f7fbff' }}>
                {lastResult?.status === 'won' ? 'Chúc mừng bạn!' : 'Chưa trúng'}
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.66)', fontSize: '0.84rem' }}>
                Kết quả vừa quay xong
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Stack spacing={1.5}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.25,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Typography sx={{ color: 'rgba(226,234,255,0.72)', fontSize: '0.8rem' }}>Phần quà</Typography>
              <Typography sx={{ fontWeight: 900, color: '#f7fbff', mt: 0.4 }}>
                {lastResult?.prizeName ?? 'Không trúng'}
              </Typography>
              <Typography sx={{ color: 'rgba(226,234,255,0.66)', fontSize: '0.84rem', mt: 0.25 }}>
                {lastResult?.prizeType ?? 'UNKNOWN'}
              </Typography>
            </Box>

            {lastResult?.code ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.25,
                  bgcolor: 'rgba(255,214,102,0.08)',
                  border: '1px solid rgba(255,214,102,0.16)',
                }}
              >
                <Typography sx={{ color: 'rgba(255,244,209,0.76)', fontSize: '0.8rem' }}>Mã nhận quà</Typography>
                <Typography sx={{ fontWeight: 900, color: '#fff2c0', letterSpacing: 0.5, mt: 0.4 }}>
                  {lastResult.code}
                </Typography>
              </Box>
            ) : null}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                p: 1.5,
                borderRadius: 1.25,
                bgcolor: 'rgba(102,168,255,0.08)',
                border: '1px solid rgba(102,168,255,0.16)',
              }}
            >
              <Box>
                <Typography sx={{ color: 'rgba(226,234,255,0.72)', fontSize: '0.8rem' }}>Giao qua</Typography>
                <Typography sx={{ fontWeight: 800, color: '#eef4ff', mt: 0.3 }}>
                  {lastResult?.deliveryMode ?? 'instant'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ color: 'rgba(226,234,255,0.72)', fontSize: '0.8rem' }}>Đích nhận</Typography>
                <Typography sx={{ fontWeight: 800, color: '#eef4ff', mt: 0.3 }}>
                  {lastResult?.deliveryTarget ?? 'reward_inbox'}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, pt: 1.25, gap: 1 }}>
          <Button
            onClick={() => {
              setResultOpen(false);
              router.push('/my-rewards');
            }}
            variant="contained"
            sx={{
              flex: 1,
              borderRadius: 999,
              fontWeight: 900,
              background: 'linear-gradient(180deg, rgba(58,111,255,1) 0%, rgba(18,45,154,1) 100%)',
            }}
          >
            Quà của tôi
          </Button>
          <Button
            onClick={() => setResultOpen(false)}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 999,
              fontWeight: 800,
              color: '#dbeafe',
              borderColor: 'rgba(123,174,255,0.24)',
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
