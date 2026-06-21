'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { PageShell } from '../shared-ui';
import { LuckyWheelShowcase } from './lucky-wheel-showcase';

type WheelPrize = {
  id: string;
  name: string;
  type: string;
  weight: number;
  metadata?: Record<string, unknown> | null;
};

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [spins, setSpins] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const client = useMemo(() => apiClient(token), [token]);

  const fallbackCampaign = {
    name: 'Demo Wheel',
    description: 'Minimal premium game panel cho Telegram.',
    is_active: true,
  };
  const fallbackPrizes: WheelPrize[] = [
    { id: 'demo-point-10', name: '10đ', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25đ', type: 'POINT', weight: 2, metadata: { points: 25 } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
    { id: 'demo-point-5', name: '5đ', type: 'POINT', weight: 4, metadata: { points: 5 } },
  ];

  const displayCampaign = campaign ?? fallbackCampaign;
  const displayPrizes = prizes.length ? prizes : fallbackPrizes;

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([client.getWheelCurrent(), client.getMySpins()])
      .then(([wheel, spinData]) => {
        if (cancelled) return;
        setCampaign(wheel.campaign);
        setPrizes((wheel.prizes ?? []) as WheelPrize[]);
        setSpins(spinData.balance ?? 0);
      })
      .catch((err) => {
        if (!cancelled) setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, token]);

  async function spin() {
    try {
      setError('');
      setResult(null);
      setSpinning(true);
      setRotation((value) => value + 1440 + Math.floor(Math.random() * 720));
      const data = await client.spinWheel();
      setResult(data);
      const prizeId = data?.prize?.id;
      const prizeIndex = displayPrizes.findIndex((prize) => prize.id === prizeId);
      if (prizeIndex >= 0) {
        const segmentAngle = 360 / Math.max(displayPrizes.length, 1);
        const finalAngle = 360 - (prizeIndex * segmentAngle + segmentAngle / 2);
        setRotation((value) => value + finalAngle);
      }
      const spinData = await client.getMySpins();
      setSpins(spinData.balance ?? 0);
    } catch (err) {
      setError(String(err));
    } finally {
      setSpinning(false);
    }
  }

  return (
    <PageShell>
      <Container maxWidth="lg" sx={{ py: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.24,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(circle at center, black 0%, black 65%, transparent 100%)',
          }}
        />

        <Stack spacing={2.25} sx={{ position: 'relative' }}>
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.6, sm: 2 },
              borderRadius: { xs: 4, sm: 5 },
              border: '1px solid rgba(132, 203, 139, 0.12)',
              background:
                'linear-gradient(180deg, rgba(7,23,14,0.86) 0%, rgba(8,19,16,0.78) 100%)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    color: '#f7f4e8',
                    fontWeight: 900,
                    letterSpacing: '-0.05em',
                    fontSize: { xs: '2rem', sm: '2.55rem' },
                    lineHeight: 0.92,
                  }}
                >
                  {displayCampaign.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    maxWidth: 680,
                    color: 'rgba(240, 241, 230, 0.72)',
                    fontSize: { xs: '0.96rem', sm: '1.05rem' },
                    lineHeight: 1.48,
                  }}
                >
                  {displayCampaign.description}
                </Typography>
              </Box>

              <Chip
                label={`${spins} spins`}
                sx={{
                  bgcolor: 'rgba(234, 193, 94, 0.14)',
                  color: '#f8edc7',
                  border: '1px solid rgba(234,193,94,0.18)',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <Chip label="Dark green lobby" sx={{ bgcolor: 'rgba(90, 153, 96, 0.12)', color: '#d7f0da', border: '1px solid rgba(90,153,96,0.16)' }} />
              <Chip label="Bronze accent" sx={{ bgcolor: 'rgba(234,193,94,0.12)', color: '#f7e6b2', border: '1px solid rgba(234,193,94,0.16)' }} />
              <Chip label={`${displayPrizes.length} prizes`} sx={{ bgcolor: 'rgba(59,130,246,0.10)', color: '#dbeafe', border: '1px solid rgba(96,165,250,0.12)' }} />
            </Stack>
          </Box>

          {error ? (
            <Alert
              severity="error"
              sx={{
                bgcolor: 'rgba(119, 29, 29, 0.66)',
                color: '#fdeaea',
                border: '1px solid rgba(248,113,113,0.18)',
                '& .MuiAlert-icon': { color: '#fca5a5' },
              }}
            >
              {error}
            </Alert>
          ) : null}

          {result ? (
            <Alert
              severity="success"
              sx={{
                bgcolor: 'rgba(7, 79, 55, 0.64)',
                color: '#dcfce7',
                border: '1px solid rgba(74,222,128,0.18)',
                '& .MuiAlert-icon': { color: '#86efac' },
              }}
            >
              Trúng: {result.prize?.name ?? 'Không trúng'}
            </Alert>
          ) : null}

          <LuckyWheelShowcase
            prizes={displayPrizes}
            spins={spins}
            spinning={spinning}
            rotation={rotation}
            resultName={result?.prize?.name}
            campaignName={displayCampaign.name}
            campaignDescription={displayCampaign.description}
            onSpin={spin}
            disabled={loading}
          />

          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: { xs: 1.6, sm: 2 },
              borderRadius: { xs: 4, sm: 5 },
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(8,19,16,0.54)',
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1.6 }}
            >
              <Typography
                sx={{
                  color: '#e8efe1',
                  fontWeight: 900,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  fontSize: '0.82rem',
                }}
              >
                Phần thưởng
              </Typography>
              <Typography sx={{ color: '#d0efd3', fontWeight: 800, letterSpacing: '0.12em' }}>
                {displayPrizes.length} items
              </Typography>
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2 }} />
            <Stack spacing={1.3}>
              {displayPrizes.map((prize, index) => (
                <Box
                  key={prize.id}
                  sx={{
                    px: { xs: 1.4, sm: 1.6 },
                    py: { xs: 1.2, sm: 1.35 },
                    borderRadius: 3,
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          bgcolor:
                            index % 3 === 0 ? '#f6e08a' : index % 3 === 1 ? '#77b3ff' : '#ff6a4d',
                          boxShadow: '0 0 0 4px rgba(255,255,255,0.02)',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: '#f7f4e8',
                            fontWeight: 800,
                            fontSize: { xs: '1rem', sm: '1.06rem' },
                            lineHeight: 1.15,
                          }}
                        >
                          {prize.name}
                        </Typography>
                        <Typography sx={{ color: 'rgba(224, 227, 214, 0.58)', fontSize: '0.82rem', mt: 0.3 }}>
                          {prize.type}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={`x${prize.weight}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.04)',
                        color: '#d9e5d6',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageShell>
  );
}
