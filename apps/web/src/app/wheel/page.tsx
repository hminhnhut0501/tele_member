'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Container,
  Skeleton,
  Stack,
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';
import { AppSection, HeroChip, PageShell, SectionButton } from '../shared-ui';
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
      <Container maxWidth="sm" sx={{ py: 3, position: 'relative' }}>
        <Stack spacing={2}>
          <AppSection
            title="Vòng quay may mắn"
            subtitle="Dùng lượt quay để nhận điểm, code, spin ticket hoặc phần thưởng đặc biệt."
            accent="amber"
            action={<HeroChip label="Lucky Wheel" color="info" />}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${spins} lượt quay`}
                sx={{
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#92400e',
                  fontWeight: 800,
                  border: '1px solid rgba(245, 158, 11, 0.18)',
                }}
              />
              <Chip
                label={campaign?.is_active ? 'Campaign đang chạy' : 'Chưa có campaign active'}
                sx={{
                  bgcolor: campaign?.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                  color: campaign?.is_active ? '#065f46' : '#334155',
                  fontWeight: 800,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              />
            </Stack>
          </AppSection>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {result ? <Alert severity="success">Trúng: {result.prize?.name ?? 'Không trúng'}</Alert> : null}

          {loading ? (
            <AppSection title="Đang tải wheel..." subtitle="Dữ liệu campaign và prize đang được đồng bộ." accent="cyan" compact>
              <Stack spacing={1.5}>
                <Skeleton width="60%" height={30} />
                <Skeleton width="40%" />
                <Skeleton height={220} sx={{ borderRadius: 4 }} />
                <Skeleton height={44} />
              </Stack>
            </AppSection>
          ) : (
            <>
              <LuckyWheelShowcase
                prizes={prizes}
                spins={spins}
                spinning={spinning}
                rotation={rotation}
                resultName={result?.prize?.name}
                campaignName={campaign?.name}
                campaignDescription={campaign?.description}
                onSpin={spin}
                disabled={!campaign}
              />

              <AppSection title="Danh sách giải" subtitle="Toàn bộ giải thưởng trong campaign hiện tại." accent="violet">
                <Stack spacing={1}>
                  {prizes.length ? (
                    prizes.map((prize) => (
                      <Box
                        key={prize.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'rgba(37,99,235,0.03)',
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Box>
                            <Typography fontWeight={800}>{prize.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {prize.type}
                            </Typography>
                          </Box>
                          <Chip label={`x${prize.weight}`} size="small" />
                        </Stack>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">Chưa có prize nào cho campaign này.</Typography>
                  )}
                </Stack>
              </AppSection>
            </>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}
