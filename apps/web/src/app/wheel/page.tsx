'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { WheelDial } from './wheel-dial';
import { getWheelDefaultOutcomeLabel, getWheelFallbackCampaign, type WheelCampaign, type WheelPrize } from './wheel-model';
import { buildWheelRenderContract } from './wheel-contract';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<WheelCampaign | null>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [spins, setSpins] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'settling'>('idle');
  const [rotation, setRotation] = useState(0);

  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([client.getWheelCurrent(), client.getMySpins()])
      .then(([wheel, spinData]) => {
        if (cancelled) return;
        setCampaign((wheel?.campaign ?? null) as WheelCampaign | null);
        setPrizes(((wheel?.prizes ?? []) as WheelPrize[]) ?? []);
        setSpins(Number(spinData?.balance ?? 0));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, token]);

  const displayCampaign = campaign ?? getWheelFallbackCampaign();
  const renderContract = buildWheelRenderContract(prizes);
  const segments = renderContract.segments;

  async function handleSpin() {
    if (spinning) return;
    try {
      setError('');
      setResult(null);
      setSpinning(true);
      setSpinPhase('spinning');

      const spinStart = rotation + 1440 + Math.floor(Math.random() * 360);
      setRotation(spinStart);

      const data = await client.spinWheel();
      setResult(data);

      const prizeId = data?.prize?.id;
      const prizeIndex = segments.findIndex((segment) => segment.id === prizeId);
      if (prizeIndex >= 0) {
        const segmentAngle = 360 / Math.max(segments.length, 1);
        const target = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
        const finalRotation = spinStart + target;
        setSpinPhase('settling');
        setRotation(finalRotation + 10);
        window.setTimeout(() => setRotation(finalRotation - 3), 180);
        window.setTimeout(() => setRotation(finalRotation), 360);
        window.setTimeout(() => setSpinPhase('idle'), 620);
      }

      const updatedSpins = await client.getMySpins();
      setSpins(Number(updatedSpins?.balance ?? 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSpinPhase('idle');
    } finally {
      setSpinning(false);
    }
  }

  return (
    <PageShell>
      <Container maxWidth="xl" sx={{ py: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.22,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 68%, transparent 100%)',
          }}
        />

        <Stack spacing={2.25} sx={{ position: 'relative' }}>
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 2, sm: 2.5 },
              borderRadius: { xs: 4, sm: 5 },
              border: '1px solid rgba(105, 147, 255, 0.14)',
              background:
                'radial-gradient(circle at 18% 20%, rgba(47,84,183,0.24), transparent 18%), radial-gradient(circle at 82% 18%, rgba(255,212,111,0.12), transparent 20%), linear-gradient(180deg, rgba(10,18,36,0.94) 0%, rgba(7,11,21,0.98) 100%)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                  <Chip label="Game lobby" sx={{ bgcolor: 'rgba(96,147,255,0.12)', color: '#dfe9ff', border: '1px solid rgba(96,147,255,0.18)' }} />
                  <Chip label="Blue / bronze" sx={{ bgcolor: 'rgba(255,208,101,0.10)', color: '#f7e6b5', border: '1px solid rgba(255,208,101,0.16)' }} />
                  <Chip label={loading ? 'Syncing' : 'Ready'} sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: '#edf3ff', border: '1px solid rgba(255,255,255,0.08)' }} />
                </Stack>

                <Typography sx={{ color: '#f7f2e7', fontWeight: 900, letterSpacing: '-0.06em', fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, lineHeight: 0.92 }}>
                  {displayCampaign.name}
                </Typography>
                <Typography sx={{ mt: 1, maxWidth: 760, color: 'rgba(231,238,255,0.72)', fontSize: { xs: '0.96rem', sm: '1.04rem' }, lineHeight: 1.55 }}>
                  {displayCampaign.description}
                </Typography>
              </Box>

              <Box sx={{ px: 2, py: 1.4, minWidth: { xs: '100%', sm: 220 }, borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.04)' }}>
                <Typography sx={{ color: 'rgba(230,238,255,0.68)', fontSize: '0.74rem', letterSpacing: '0.18em', fontWeight: 800 }}>
                  SPINS
                </Typography>
                <Typography sx={{ color: '#f8f3e6', fontWeight: 900, letterSpacing: '-0.05em', fontSize: { xs: '1.8rem', sm: '2rem' }, lineHeight: 1 }}>
                  {spins}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.35fr) minmax(320px, 0.65fr)' },
              gap: 2.25,
              alignItems: 'start',
            }}
          >
            <Box
              sx={{
                borderRadius: { xs: 4, sm: 5 },
                border: '1px solid rgba(103, 151, 255, 0.14)',
                background: 'linear-gradient(180deg, rgba(11,20,41,0.82), rgba(8,13,26,0.94))',
                overflow: 'hidden',
                p: { xs: 2, sm: 2.5 },
              }}
            >
              <Stack spacing={1.25} sx={{ mb: 1.5 }}>
                <Typography sx={{ color: '#f7f2e7', fontWeight: 900, letterSpacing: '-0.04em', fontSize: { xs: '1.4rem', sm: '1.7rem' }, lineHeight: 1 }}>
                  Lucky Wheel
                </Typography>
                <Typography sx={{ color: 'rgba(231,238,255,0.68)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Segment policy giữ label ngắn, còn chi tiết đầy đủ nằm ở rail phía dưới. Thêm prize mới không làm vỡ vòng quay.
                </Typography>
              </Stack>

              <WheelDial
                segments={segments}
                spins={spins}
                spinning={spinning}
                spinPhase={spinPhase}
                rotation={rotation}
                resultName={getWheelDefaultOutcomeLabel(result?.prize?.name)}
                onSpin={handleSpin}
                disabled={loading}
                chipLabelLimit={renderContract.chipLabelLimit}
                labelRadius={renderContract.labelRadius}
                wheelLabelScale={renderContract.wheelLabelScale}
                labelInset={renderContract.labelInset}
              />
            </Box>

            <Stack spacing={2}>
              <Box
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: { xs: 4, sm: 5 },
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(14,22,40,0.95), rgba(8,13,26,0.94))',
                }}
              >
                <Typography sx={{ color: '#e8eefc', fontWeight: 900, letterSpacing: '-0.03em', fontSize: '1.1rem' }}>
                  Contract notes
                </Typography>
                <Stack spacing={1} sx={{ mt: 1.5 }}>
                  <Typography sx={{ color: 'rgba(231,238,255,0.72)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                    Wheel label chỉ hiển thị token ngắn: số điểm, lượt quay, voucher, hoặc trạng thái không trúng.
                  </Typography>
                  <Typography sx={{ color: 'rgba(231,238,255,0.72)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                    Mô tả đầy đủ của mỗi prize nằm ở rail để wheel vẫn sạch khi danh sách phần thưởng tăng lên.
                  </Typography>
                  <Typography sx={{ color: 'rgba(231,238,255,0.72)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                    Nếu prize dài quá, contract tự rút gọn thay vì ép UI phải sửa vị trí từng chữ.
                  </Typography>
                </Stack>
              </Box>

              {error ? (
                <Alert severity="error" sx={{ bgcolor: 'rgba(91, 26, 35, 0.70)', color: '#fdeaea', border: '1px solid rgba(248,113,113,0.18)' }}>
                  {error}
                </Alert>
              ) : null}

              {result ? (
                <Alert severity="success" sx={{ bgcolor: 'rgba(8, 67, 59, 0.66)', color: '#dcfce7', border: '1px solid rgba(74,222,128,0.18)' }}>
                  Đã reveal: {result.prize?.name ?? 'Không trúng'}
                </Alert>
              ) : (
                <Box
                  sx={{
                    px: 2,
                    py: 2,
                    borderRadius: { xs: 4, sm: 5 },
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  }}
                >
                  <Typography sx={{ color: '#eef4ff', fontWeight: 800, fontSize: '0.96rem' }}>
                    {loading ? 'Đang đồng bộ wheel...' : 'Sẵn sàng quay'}
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: 'rgba(231,238,255,0.66)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {spins > 0 ? 'Bấm quay để reveal phần thưởng trên wheel.' : 'Bạn chưa có lượt quay nào.'}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: { xs: 4, sm: 5 },
                  border: '1px solid rgba(255,214,107,0.14)',
                  background: 'linear-gradient(180deg, rgba(255,214,107,0.08), rgba(18,24,37,0.85))',
                }}
              >
                <Typography sx={{ color: '#f7e6b5', fontWeight: 900, letterSpacing: '-0.03em', fontSize: '1.02rem' }}>
                  Reward rail
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  {segments.slice(0, 8).map((segment) => (
                    <Chip
                      key={segment.id}
                      label={segment.railLabel}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.04)',
                        color: '#ecf2ff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Stack>
                {segments.length > 8 ? (
                  <Typography sx={{ mt: 1.25, color: 'rgba(231,238,255,0.55)', fontSize: '0.85rem' }}>
                    +{segments.length - 8} reward nữa được giữ trong contract, không ép lên wheel.
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageShell>
  );
}
