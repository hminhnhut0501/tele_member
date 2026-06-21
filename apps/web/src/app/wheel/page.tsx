'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';
import { GameSection, PageShell } from '../shared-ui';
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
    description: 'Minimal game UI để hiển thị ổn định trên desktop và mobile.',
    is_active: true,
  };

  const fallbackPrizes: WheelPrize[] = [
    { id: 'demo-point-10', name: '10 điểm', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25 điểm', type: 'POINT', weight: 2, metadata: { points: 25 } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
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
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, position: 'relative' }}>
        <Stack spacing={2.25}>
          <GameSection
            title="Vòng quay may mắn"
            subtitle="Một game panel tối giản, hiện đại, thiên về trải nghiệm reveal hơn là casino wheel."
            action={<Chip label="Lucky Wheel" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)', fontWeight: 800 }} />}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${spins} spins`} sx={{ bgcolor: 'rgba(37,99,235,0.16)', color: '#e0f2fe', border: '1px solid rgba(96,165,250,0.18)', fontWeight: 800 }} />
              <Chip
                label={displayCampaign.is_active ? 'Campaign active' : 'Campaign inactive'}
                sx={{
                  bgcolor: displayCampaign.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                  color: displayCampaign.is_active ? '#bbf7d0' : '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontWeight: 800,
                }}
              />
            </Stack>
          </GameSection>

          {error ? (
            <Alert
              severity="error"
              sx={{
                bgcolor: 'rgba(127,29,29,0.60)',
                color: '#fee2e2',
                border: '1px solid rgba(248,113,113,0.22)',
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
                bgcolor: 'rgba(6,78,59,0.62)',
                color: '#d1fae5',
                border: '1px solid rgba(52,211,153,0.22)',
                '& .MuiAlert-icon': { color: '#6ee7b7' },
              }}
            >
              Trúng: {result.prize?.name ?? 'Không trúng'}
            </Alert>
          ) : null}

          <Box sx={{ position: 'relative' }}>
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
            {loading ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  pointerEvents: 'none',
                  backdropFilter: 'blur(1px)',
                }}
              >
                <Typography sx={{ color: 'rgba(229,239,255,0.72)', fontSize: '0.9rem' }}>
                  Loading data...
                </Typography>
              </Box>
            ) : null}
          </Box>

          <GameSection title="Prize rail" subtitle="Danh sách giải ngắn gọn, không tranh spotlight với wheel.">
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {displayPrizes.map((prize) => (
                <Chip
                  key={prize.id}
                  label={prize.name}
                  sx={{
                    bgcolor: 'rgba(59,130,246,0.10)',
                    color: '#eff6ff',
                    border: '1px solid rgba(96,165,250,0.16)',
                    fontWeight: 700,
                    mb: 1,
                  }}
                />
              ))}
            </Stack>
          </GameSection>
        </Stack>
      </Container>
    </PageShell>
  );
}
