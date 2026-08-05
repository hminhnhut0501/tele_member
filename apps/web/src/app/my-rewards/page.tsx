'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Tab,
  Tabs,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';
import { GameSection, HeroChip, PageShell } from '../shared-ui';

export default function MyRewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rewards' | 'inbox'>('inbox');
  const client = useMemo(() => apiClient(token), [token]);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([client.getMyRewards(), client.getMyInbox()])
      .then(([rewardData, inboxData]) => {
        if (cancelled) return;
        setItems(rewardData.rewards ?? []);
        setInbox(inboxData.inbox ?? []);
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
          <GameSection
            title="Quà đã nhận"
            subtitle="Theo dõi voucher, VIP code, wheel wins và mọi quà đã đi vào inbox."
            action={<HeroChip label="My Rewards" color="warning" />}
          >
            <Stack spacing={1.5}>
              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                sx={{
                  '& .MuiTab-root': { color: 'rgba(226,234,255,0.72)', fontWeight: 800 },
                  '& .Mui-selected': { color: '#f7fbff' },
                }}
              >
                <Tab value="inbox" label={`Inbox (${inbox.length})`} />
                <Tab value="rewards" label={`Redemptions (${items.length})`} />
              </Tabs>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${items.length} đổi thưởng`} sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff2c0', border: '1px solid rgba(255,214,102,0.18)' }} />
                <Chip label={`${inbox.length} quà trong inbox`} sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)' }} />
                <Chip label="Code hiển thị khi có" sx={{ bgcolor: 'rgba(16,185,129,0.14)', color: '#d1fae5', border: '1px solid rgba(16,185,129,0.18)' }} />
              </Stack>
            </Stack>
          </GameSection>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {activeTab === 'rewards' ? (
            <Stack spacing={1.5}>
              {loading ? (
                [1, 2, 3].map((index) => (
                  <GameSection key={index} title="" subtitle="">
                    <Stack spacing={1}>
                      <Skeleton width="55%" height={28} />
                      <Skeleton width="70%" />
                      <Skeleton width="40%" />
                    </Stack>
                  </GameSection>
                ))
              ) : items.length ? (
                items.map((item) => (
                  <GameSection
                    key={item.id}
                    title={item.rewards?.name ?? 'Reward'}
                    subtitle={item.rewards?.type ?? 'Unknown'}
                    action={<Chip label={item.status} size="small" sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff2c0', border: '1px solid rgba(255,214,102,0.18)' }} />}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={`${item.point_cost} điểm`} sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff2c0', border: '1px solid rgba(255,214,102,0.18)' }} />
                        <Chip label={new Date(item.created_at).toLocaleString('vi-VN')} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#d7e3d8', border: '1px solid rgba(255,255,255,0.08)' }} />
                      </Stack>

                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,214,102,0.07)',
                          border: '1px solid rgba(255,214,102,0.14)',
                        }}
                      >
                        <Typography variant="body2" sx={{ color: 'rgba(247,245,235,0.72)' }}>
                          Code / voucher
                        </Typography>
                        <Typography fontWeight={900} sx={{ letterSpacing: 0.4, mt: 0.5, color: '#fff6db' }}>
                          {item.reward_codes?.code ?? 'Sẽ hiển thị khi có mã'}
                        </Typography>
                      </Box>
                    </Stack>
                  </GameSection>
                ))
              ) : (
                <GameSection title="Chưa có quà nào" subtitle="Khi bạn đổi điểm lấy reward, lịch sử và code sẽ xuất hiện ở đây.">
                  <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#fff6db' }}>
                      Chưa có quà nào
                    </Typography>
                    <Typography sx={{ color: 'rgba(247,245,235,0.72)' }}>Khi bạn đổi điểm lấy reward, lịch sử và code sẽ xuất hiện ở đây.</Typography>
                  </Stack>
                </GameSection>
              )}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {loading ? (
                [1, 2, 3].map((index) => (
                  <GameSection key={index} title="" subtitle="">
                    <Stack spacing={1}>
                      <Skeleton width="55%" height={28} />
                      <Skeleton width="70%" />
                      <Skeleton width="40%" />
                    </Stack>
                  </GameSection>
                ))
              ) : inbox.length ? (
                inbox.map((item) => {
                  const glyph = String(item.payload?.glyph ?? item.payload?.token ?? item.payload?.emoji ?? (item.kind === 'POINT' ? '⭐' : item.kind === 'SPIN_TICKET' ? '🎞' : item.kind === 'VOUCHER' ? '🎁' : item.kind === 'VIP_CODE' ? '👑' : item.kind === 'NOTHING' ? '😢' : '✦'));
                  const detail = String(item.subtitle ?? item.payload?.prizeName ?? item.payload?.rewardName ?? item.payload?.description ?? 'Sẵn sàng');
                  return (
                    <GameSection
                      key={item.id}
                      title={`${glyph} ${item.title}`}
                      subtitle={detail}
                      action={<Chip label={item.status} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.14)', color: '#dbeafe', border: '1px solid rgba(59,130,246,0.18)' }} />}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip label={item.source_type} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#d7e3d8', border: '1px solid rgba(255,255,255,0.08)' }} />
                          <Chip label={item.kind} sx={{ bgcolor: 'rgba(255,214,102,0.15)', color: '#fff2c0', border: '1px solid rgba(255,214,102,0.18)' }} />
                          <Chip label={new Date(item.created_at).toLocaleString('vi-VN')} sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: '#d7e3d8', border: '1px solid rgba(255,255,255,0.08)' }} />
                        </Stack>

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: 'rgba(59,130,246,0.08)',
                            border: '1px solid rgba(59,130,246,0.14)',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'rgba(247,245,235,0.72)' }}>
                            Trạng thái
                          </Typography>
                          <Typography fontWeight={900} sx={{ letterSpacing: 0.2, mt: 0.5, color: '#fff6db' }}>
                            {item.claimable ? 'Có thể nhận / claim' : item.status === 'claimed' ? 'Đã nhận' : item.status === 'delivered' ? 'Đã giao' : 'Đang chờ'}
                          </Typography>
                        </Box>

                        {item.claim_url ? (
                          <Button variant="contained" href={item.claim_url} target="_blank" rel="noreferrer">
                            Mở quà
                          </Button>
                        ) : null}
                      </Stack>
                    </GameSection>
                  );
                })
              ) : (
                <GameSection title="Inbox trống" subtitle="Quà từ wheel hoặc reward sẽ vào đây sau khi được giao.">
                  <Stack spacing={1} alignItems="center" textAlign="center" sx={{ py: 3 }}>
                    <Typography variant="h6" fontWeight={900} sx={{ color: '#fff6db' }}>
                      Inbox trống
                    </Typography>
                    <Typography sx={{ color: 'rgba(247,245,235,0.72)' }}>Quà từ wheel hoặc reward sẽ vào đây sau khi được giao.</Typography>
                  </Stack>
                </GameSection>
              )}
            </Stack>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}
