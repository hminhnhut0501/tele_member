'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Stack, Typography } from '@mui/material';
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
    name: 'Demo Lucky Wheel',
    description: 'Dark lobby minimal game UI theo branding Hang Cú.',
    is_active: true,
  };

  const fallbackPrizes: WheelPrize[] = [
    { id: 'demo-point-10', name: '10đ', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25đ', type: 'POINT', weight: 2, metadata: { points: 25 } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
    { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: {} },
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
                'linear-gradient(180deg, rgba(7,23,14,0.88) 0%, rgba(8,19,16,0.80) 100%)',
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
                  color: '#f7e7b2',
                  border: '1px solid rgba(234,193,94,0.18)',
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
              <Chip label="Game lobby" sx={{ bgcolor: 'rgba(86, 136, 96, 0.12)', color: '#d8f0db', border: '1px solid rgba(86,136,96,0.16)' }} />
              <Chip label="Bronze accent" sx={{ bgcolor: 'rgba(234,193,94,0.12)', color: '#f7e7b2', border: '1px solid rgba(234,193,94,0.16)' }} />
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
        </Stack>
      </Container>
    </PageShell>
  );
}
