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

type Reward = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  point_cost: number;
  stock: number | null;
  is_active: boolean;
};

function stockLabel(stock: number | null) {
  if (stock === null) return 'Không giới hạn';
  if (stock <= 0) return 'Hết hàng';
  return `${stock} còn lại`;
}

export default function RewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    client
      .getRewards()
      .then((data) => {
        if (cancelled) return;
        setRewards(data.rewards ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client, token]);

  async function redeem(id: string) {
    try {
      setError('');
      setMessage('');
      setRedeemingId(id);
      const result = await client.redeemReward(id);
      setMessage(result.code ? `Đổi thành công. Code: ${result.code}` : 'Đổi thành công');
      const refreshed = await client.getRewards();
      setRewards(refreshed.rewards ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setRedeemingId(null);
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
            'radial-gradient(circle at top left, rgba(15,118,110,0.18), transparent 32%), radial-gradient(circle at top right, rgba(245,158,11,0.14), transparent 24%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(246,247,251,0.98))',
          borderRadius: 6,
        }}
      />
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={350}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', background: 'linear-gradient(135deg, rgba(15,118,110,0.10), rgba(255,255,255,0.94))' }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Chip label="Reward Store" color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="h4" fontWeight={900}>
                  Đổi điểm lấy quà
                </Typography>
                <Typography color="text.secondary">
                  Chọn phần thưởng phù hợp, kiểm tra tồn kho và đổi ngay trong một chạm.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${rewards.filter((reward) => reward.is_active).length} món active`} />
                  <Chip label="Voucher" />
                  <Chip label="VIP Code" />
                  <Chip label="Spin Ticket" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}

        <Stack spacing={1.5}>
          {loading ? (
            [1, 2, 3].map((index) => (
              <Card key={index}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Skeleton width="45%" height={28} />
                    <Skeleton width="80%" />
                    <Skeleton width="70%" />
                    <Skeleton height={44} />
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : rewards.length ? (
            rewards.map((reward) => {
              const isDisabled = !reward.is_active || reward.stock === 0;
              return (
                <Card
                  key={reward.id}
                  sx={{
                    borderRadius: 4,
                    boxShadow: '0 16px 44px rgba(15, 23, 42, 0.08)',
                    border: '1px solid',
                    borderColor: 'rgba(15,118,110,0.08)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: 8,
                      background: isDisabled
                        ? 'linear-gradient(90deg, #cbd5e1 0%, #94a3b8 100%)'
                        : 'linear-gradient(90deg, #0F766E 0%, #14B8A6 100%)',
                    }}
                  />
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={800} noWrap>
                            {reward.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {reward.description ?? 'Không có mô tả'}
                          </Typography>
                        </Box>
                        <Chip
                          label={reward.type}
                          size="small"
                          color={reward.is_active ? 'primary' : 'default'}
                          variant={reward.is_active ? 'filled' : 'outlined'}
                        />
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={`${reward.point_cost} điểm`} color="secondary" />
                        <Chip label={stockLabel(reward.stock)} variant="outlined" />
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="contained"
                          disabled={isDisabled || redeemingId === reward.id}
                          onClick={() => redeem(reward.id)}
                          sx={{
                            background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
                            boxShadow: '0 14px 30px rgba(20,184,166,0.25)',
                          }}
                        >
                          {redeemingId === reward.id ? 'Đang đổi...' : isDisabled ? 'Hết hàng / Tắt' : 'Đổi ngay'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card sx={{ borderRadius: 4, borderStyle: 'dashed' }}>
              <CardContent>
                <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Chưa có phần thưởng
                  </Typography>
                  <Typography color="text.secondary">
                    Admin chưa tạo reward active. Khi có hàng, danh sách sẽ hiện ở đây.
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
