'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';

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
    <Container maxWidth="sm" sx={{ py: 3, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 26%), radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,247,251,0.98))',
          borderRadius: 6,
        }}
      />
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={350}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', background: 'linear-gradient(135deg, rgba(59,130,246,0.10), rgba(255,255,255,0.94))' }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Chip label="Lucky Wheel" color="info" size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h4" fontWeight={900}>
                  Vòng quay may mắn
                </Typography>
                <Typography color="text.secondary">
                  Dùng lượt quay để nhận điểm, code, spin ticket hoặc phần thưởng đặc biệt.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${spins} lượt quay`} color="secondary" />
                  <Chip label={campaign?.is_active ? 'Campaign đang chạy' : 'Chưa có campaign active'} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {result ? <Alert severity="success">Trúng: {result.prize?.name ?? 'Không trúng'}</Alert> : null}

        {loading ? (
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Skeleton width="60%" height={30} />
                <Skeleton width="40%" />
                <Skeleton height={220} sx={{ borderRadius: 4 }} />
                <Skeleton height={44} />
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card
              sx={{
                borderRadius: 5,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Box
                sx={{
                  height: 10,
                  background: 'linear-gradient(90deg, #3B82F6 0%, #14B8A6 50%, #F59E0B 100%)',
                }}
              />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={800}>
                        {campaign?.name ?? 'Chưa có campaign'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign?.description ?? 'Admin chưa kích hoạt campaign hiện tại.'}
                      </Typography>
                    </Box>
                    <Chip label={`${spins} spins`} color="secondary" />
                  </Stack>

                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      borderRadius: '50%',
                      background:
                        'conic-gradient(from 180deg, #0F766E 0deg, #14B8A6 72deg, #3B82F6 144deg, #F59E0B 216deg, #EC4899 288deg, #0F766E 360deg)',
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
                        <Button
                          variant="contained"
                          disabled={!spins || !campaign || spinning}
                          onClick={spin}
                          sx={{
                            mt: 1,
                            px: 3,
                            py: 1.2,
                            borderRadius: 999,
                            background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                            boxShadow: '0 14px 30px rgba(20,184,166,0.28)',
                          }}
                        >
                          {spinning ? 'Đang xử lý...' : 'Quay ngay'}
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>
                  Danh sách giải
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  {prizes.length ? (
                    prizes.map((prize) => (
                      <Box
                        key={prize.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'rgba(15,118,110,0.03)',
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
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}
