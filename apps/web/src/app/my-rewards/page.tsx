'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
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

export default function MyRewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    client
      .getMyRewards()
      .then((data) => {
        if (cancelled) return;
        setItems(data.rewards ?? []);
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

  return (
    <Container maxWidth="sm" sx={{ py: 3, position: 'relative' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at top right, rgba(245,158,11,0.10), transparent 28%), radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,247,251,0.98))',
          borderRadius: 6,
        }}
      />
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={350}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', background: 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,0.94))' }}>
            <CardContent>
              <Stack spacing={1.25}>
                <Chip label="My Rewards" color="warning" size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h4" fontWeight={900}>
                  Quà đã nhận
                </Typography>
                <Typography color="text.secondary">
                  Theo dõi voucher, VIP code và các phần thưởng bạn đã đổi.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${items.length} mục`} />
                  <Chip label="Code hiển thị khi có" />
                  <Chip label="Lịch sử đổi thưởng" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack spacing={1.5}>
          {loading ? (
            [1, 2, 3].map((index) => (
              <Card key={index}>
                <CardContent>
                  <Stack spacing={1}>
                    <Skeleton width="55%" height={28} />
                    <Skeleton width="70%" />
                    <Skeleton width="40%" />
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : items.length ? (
            items.map((item) => (
              <Card
                key={item.id}
                sx={{
                  borderRadius: 4,
                  boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: 8,
                    background: 'linear-gradient(90deg, #F59E0B 0%, #F97316 100%)',
                  }}
                />
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={800} noWrap>
                          {item.rewards?.name ?? 'Reward'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.rewards?.type ?? 'Unknown'}
                        </Typography>
                      </Box>
                      <Chip label={item.status} color="secondary" variant="outlined" size="small" />
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`${item.point_cost} điểm`} />
                      <Chip label={new Date(item.created_at).toLocaleString('vi-VN')} variant="outlined" />
                    </Stack>

                    <Divider />

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(15,118,110,0.05)',
                        border: '1px solid rgba(15,118,110,0.10)',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Code / voucher
                      </Typography>
                      <Typography fontWeight={800} sx={{ letterSpacing: 0.4, mt: 0.5 }}>
                        {item.reward_codes?.code ?? 'Sẽ hiển thị khi có mã'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card sx={{ borderRadius: 4, borderStyle: 'dashed' }}>
              <CardContent>
                <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Chưa có quà nào
                  </Typography>
                  <Typography color="text.secondary">
                    Khi bạn đổi điểm lấy reward, lịch sử và code sẽ xuất hiện ở đây.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
