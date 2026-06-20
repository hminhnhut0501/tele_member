'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Fade,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';
import { AppSection, HeroChip, PageShell } from '../shared-ui';

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
    <PageShell>
      <Container maxWidth="sm" sx={{ py: 3, position: 'relative' }}>
        <Stack spacing={2}>
          <Fade in timeout={350}>
            <AppSection
              title="Quà đã nhận"
              subtitle="Theo dõi voucher, VIP code và các phần thưởng bạn đã đổi."
              accent="amber"
              action={<HeroChip label="My Rewards" color="warning" />}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${items.length} mục`} />
                <Chip label="Code hiển thị khi có" />
                <Chip label="Lịch sử đổi thưởng" />
              </Stack>
            </AppSection>
          </Fade>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack spacing={1.5}>
            {loading ? (
              [1, 2, 3].map((index) => (
                <AppSection key={index} title="" subtitle="" accent="amber" compact>
                  <Stack spacing={1}>
                    <Skeleton width="55%" height={28} />
                    <Skeleton width="70%" />
                    <Skeleton width="40%" />
                  </Stack>
                </AppSection>
              ))
            ) : items.length ? (
              items.map((item) => (
                <AppSection
                  key={item.id}
                  title={item.rewards?.name ?? 'Reward'}
                  subtitle={item.rewards?.type ?? 'Unknown'}
                  accent="amber"
                  action={<Chip label={item.status} color="secondary" variant="outlined" size="small" />}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`${item.point_cost} điểm`} />
                      <Chip label={new Date(item.created_at).toLocaleString('vi-VN')} variant="outlined" />
                    </Stack>

                    <Divider />

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
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
                </AppSection>
              ))
            ) : (
              <AppSection title="Chưa có quà nào" subtitle="Khi bạn đổi điểm lấy reward, lịch sử và code sẽ xuất hiện ở đây." accent="violet">
                <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                  <Typography variant="h6" fontWeight={800}>
                    Chưa có quà nào
                  </Typography>
                  <Typography color="text.secondary">Khi bạn đổi điểm lấy reward, lịch sử và code sẽ xuất hiện ở đây.</Typography>
                </Stack>
              </AppSection>
            )}
          </Stack>
        </Stack>
      </Container>
    </PageShell>
  );
}
