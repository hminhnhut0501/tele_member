'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Container,
  Stack,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';
import { GameSection, HeroChip, PageShell, SectionButton } from '../shared-ui';
import { LuckyWheelShowcase } from './lucky-wheel-showcase';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [spins, setSpins] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const client = useMemo(() => apiClient(token), [token]);
  const fallbackCampaign = {
    name: 'Demo Lucky Wheel',
    description: 'Vòng quay demo để luôn hiển thị tốt trên desktop và mobile.',
    is_active: true,
  };
  const fallbackPrizes = [
    { id: 'demo-point-10', name: '+10 điểm', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '+25 điểm', type: 'POINT', weight: 2, metadata: { points: 25 } },
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
        setPrizes(wheel.prizes ?? []);
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
      const prizeIndex = prizes.findIndex((prize) => prize.id === prizeId);
      if (prizeIndex >= 0) {
        const segmentAngle = 360 / Math.max(prizes.length, 1);
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
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3 }, position: 'relative' }}>
        <Stack spacing={2}>
          <GameSection
            title="Vòng quay may mắn"
            subtitle="Dùng lượt quay để nhận điểm, code, spin ticket hoặc phần thưởng đặc biệt."
            action={<HeroChip label="Lucky Wheel" color="info" />}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${spins} lượt quay`}
                sx={{
                  bgcolor: 'rgba(59,130,246,0.14)',
                  color: '#dbeafe',
                  fontWeight: 800,
                  border: '1px solid rgba(59,130,246,0.18)',
                }}
              />
              <Chip
                label={campaign?.is_active ? 'Campaign đang chạy' : 'Chưa có campaign active'}
                sx={{
                  bgcolor: campaign?.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                  color: campaign?.is_active ? '#bbf7d0' : '#e2e8f0',
                  fontWeight: 800,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              />
            </Stack>
          </GameSection>

          {error ? (
            <Alert
              severity="error"
              sx={{
                bgcolor: 'rgba(127,29,29,0.68)',
                color: '#fee2e2',
                border: '1px solid rgba(248,113,113,0.24)',
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
                bgcolor: 'rgba(6,78,59,0.72)',
                color: '#d1fae5',
                border: '1px solid rgba(52,211,153,0.22)',
                '& .MuiAlert-icon': { color: '#6ee7b7' },
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
            disabled={!campaign || loading}
          />

          <GameSection title="Danh sách giải" subtitle="Toàn bộ giải thưởng trong campaign hiện tại.">
            <Stack spacing={1}>
              {displayPrizes.length ? (
                displayPrizes.map((prize) => (
                  <Box
                    key={prize.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid rgba(96,165,250,0.14)',
                      bgcolor: 'rgba(59,130,246,0.06)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography fontWeight={900} sx={{ color: '#f5f9ff' }}>{prize.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(229,239,255,0.68)' }}>
                          {prize.type}
                        </Typography>
                      </Box>
                      <Chip label={`x${prize.weight}`} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.16)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.2)' }} />
                    </Stack>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: 'rgba(229,239,255,0.68)' }}>Chưa có prize nào cho campaign này.</Typography>
              )}
            </Stack>
          </GameSection>

          {loading ? (
            <Typography sx={{ color: 'rgba(229,239,255,0.62)', textAlign: 'center', fontSize: '0.88rem' }}>
              Đang đồng bộ dữ liệu thật, wheel demo vẫn hiển thị để không bị trống trên mobile.
            </Typography>
          ) : null}
        </Stack>
      </Container>
    </PageShell>
  );
}
