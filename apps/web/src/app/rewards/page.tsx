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
import { GameSection, HeroChip, PageShell, SectionButton } from '../shared-ui';

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
    <PageShell>
      <Container maxWidth="sm" sx={{ py: 3, position: 'relative' }}>
        <Stack spacing={2}>
          <GameSection
            title="Đổi điểm lấy quà"
            subtitle="Chọn phần thưởng phù hợp, kiểm tra tồn kho và đổi ngay trong một chạm."
            action={<HeroChip label="Reward Store" color="success" />}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`${rewards.filter((reward) => reward.is_active).length} món active`} sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff2c0', border: '1px solid rgba(255,214,102,0.18)' }} />
              <Chip label="Voucher" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)' }} />
              <Chip label="VIP Code" sx={{ bgcolor: 'rgba(168,85,247,0.14)', color: '#f3e8ff', border: '1px solid rgba(168,85,247,0.18)' }} />
              <Chip label="Spin Ticket" sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#d1fae5', border: '1px solid rgba(16,185,129,0.18)' }} />
            </Stack>
          </GameSection>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {message ? <Alert severity="success">{message}</Alert> : null}

          <Stack spacing={1.5}>
            {loading ? (
              [1, 2, 3].map((index) => (
                <GameSection key={index} title="Đang tải reward..." subtitle="Danh sách đang được đồng bộ.">
                  <Stack spacing={1.2}>
                    <Skeleton width="45%" height={28} />
                    <Skeleton width="80%" />
                    <Skeleton width="70%" />
                    <Skeleton height={44} />
                  </Stack>
                </GameSection>
              ))
            ) : rewards.length ? (
              rewards.map((reward) => {
                const isDisabled = !reward.is_active || reward.stock === 0;
                return (
                  <GameSection
                    key={reward.id}
                    title={reward.name}
                    subtitle={reward.description ?? 'Không có mô tả'}
                    action={<Chip label={reward.type} size="small" sx={{ bgcolor: reward.is_active ? 'rgba(255,214,102,0.15)' : 'rgba(148,163,184,0.16)', color: reward.is_active ? '#fff2c0' : '#e2e8f0', border: '1px solid rgba(255,255,255,0.08)' }} />}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={900} noWrap sx={{ color: '#fff6db' }}>
                            {reward.name}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={`${reward.point_cost} điểm`} sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff1bf', border: '1px solid rgba(255,214,102,0.18)' }} />
                        <Chip label={stockLabel(reward.stock)} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#d7e3d8', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </Stack>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                      <Stack direction="row" spacing={1}>
                        <SectionButton
                          fullWidth
                          variant="contained"
                          disabled={isDisabled || redeemingId === reward.id}
                          onClick={() => redeem(reward.id)}
                        >
                          {redeemingId === reward.id ? 'Đang đổi...' : isDisabled ? 'Hết hàng / Tắt' : 'Đổi ngay'}
                        </SectionButton>
                      </Stack>
                    </Stack>
                  </GameSection>
                );
              })
            ) : (
              <GameSection title="Chưa có phần thưởng" subtitle="Admin chưa tạo reward active. Khi có hàng, danh sách sẽ hiện ở đây.">
                <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                  <Typography variant="h6" fontWeight={900} sx={{ color: '#fff6db' }}>
                    Danh sách đang trống
                  </Typography>
                  <Typography sx={{ color: 'rgba(247,245,235,0.72)' }}>Admin chưa tạo reward active. Khi có hàng, danh sách sẽ hiện ở đây.</Typography>
                </Stack>
              </GameSection>
            )}
          </Stack>
        </Stack>
      </Container>
    </PageShell>
  );
}
