'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';
import { AppSection, HeroChip, PageShell, SectionButton } from '../shared-ui';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [spins, setSpins] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
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
      const data = await client.spinWheel();
      setResult(data);
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
            accent="blue"
            action={<HeroChip label="Lucky Wheel" color="info" />}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${spins} lượt quay`} color="secondary" />
              <Chip label={campaign?.is_active ? 'Campaign đang chạy' : 'Chưa có campaign active'} />
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
              <AppSection
                title={campaign?.name ?? 'Chưa có campaign'}
                subtitle={campaign?.description ?? 'Admin chưa kích hoạt campaign hiện tại.'}
                accent="blue"
                action={<Chip label={`${spins} spins`} color="secondary" />}
              >
                <Stack spacing={2}>
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      background:
                        'conic-gradient(from 180deg, #2563eb 0deg, #06b6d4 72deg, #10b981 144deg, #f59e0b 216deg, #f43f5e 288deg, #2563eb 360deg)',
                      p: '10px',
                      mx: 'auto',
                      width: '100%',
                      maxWidth: 320,
                      boxShadow: 'inset 0 0 0 12px rgba(255,255,255,0.95), 0 24px 54px rgba(15, 23, 42, 0.14)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.96)',
                        display: 'grid',
                        placeItems: 'center',
                        textAlign: 'center',
                        p: 3,
                      }}
                    >
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="overline" color="text.secondary">
                          SPIN WHEEL
                        </Typography>
                        <Typography variant="h5" fontWeight={900}>
                          {spinning ? 'Đang quay...' : 'Sẵn sàng'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lượt quay hiện có: {spins}
                        </Typography>
                        <SectionButton
                          variant="contained"
                          disabled={!spins || !campaign || spinning}
                          onClick={spin}
                          sx={{ mt: 1, px: 3, py: 1.2 }}
                        >
                          {spinning ? 'Đang xử lý...' : 'Quay ngay'}
                        </SectionButton>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              </AppSection>

              <AppSection title="Danh sách giải" subtitle="Toàn bộ giải thưởng trong campaign hiện tại." accent="violet">
                <Divider sx={{ my: 2 }} />
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
