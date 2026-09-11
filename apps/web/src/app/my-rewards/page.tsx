'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Chip, Container, Skeleton, Stack, Tab, Tabs, Typography } from '@mui/material';
import { normalizeRewardInboxResponse, normalizeRewardRedemptionsResponse } from '@tele-member/shared';
import { apiClient } from '../../lib/api';
import { PeachCoinIcon } from '../wheel/wheel-icons';
import { PageShell } from '../shared-ui';

function shortDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function cleanText(value: unknown) {
  return String(value ?? '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

function rewardTitle(item: any) {
  const kind = String(item.kind ?? item.rewards?.type ?? '').toUpperCase();
  const raw = cleanText(item.title ?? item.rewards?.name ?? 'Phần thưởng');
  if (kind === 'POINT') {
    const amount = Number(item.payload?.points ?? item.payload?.point_amount ?? raw.replace(/[^0-9]/g, '')) || 0;
    return amount ? `+${amount} đào` : raw || 'Đào';
  }
  if (kind === 'SPIN_TICKET' || kind === 'SPIN') return '+1 lượt quay';
  return raw || 'Phần thưởng';
}

function kindLabel(value: unknown) {
  const kind = String(value ?? '').toUpperCase();
  if (kind === 'POINT') return 'Đào';
  if (kind === 'SPIN_TICKET' || kind === 'SPIN') return 'Lượt quay';
  if (kind === 'VIP_CODE') return 'VIP code';
  if (kind === 'VOUCHER') return 'Voucher';
  return kind ? kind.toLowerCase() : 'Quà';
}

function statusLabel(item: any) {
  if (item.claimable) return 'Có thể nhận';
  if (item.status === 'claimed') return 'Đã nhận';
  if (item.status === 'delivered') return 'Đã giao';
  if (item.status === 'new') return 'Mới';
  return 'Đang chờ';
}

function statusTone(item: any) {
  if (item.claimable || item.status === 'new') return { color: '#dbeafe', bgcolor: 'rgba(59,130,246,0.16)', border: 'rgba(59,130,246,0.24)' };
  if (item.status === 'claimed' || item.status === 'delivered') return { color: '#d1fae5', bgcolor: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.22)' };
  return { color: '#e2e8f0', bgcolor: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' };
}

function CompactRow({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, px: { xs: 1.15, sm: 1.4 }, py: 1.05, borderRadius: 2, bgcolor: 'rgba(10,20,42,0.72)', border: '1px solid rgba(117,161,239,0.14)' }}>
      <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', flex: '0 0 auto', borderRadius: '50%', bgcolor: 'rgba(76,130,232,0.14)', border: '1px solid rgba(117,161,239,0.18)' }}>
        <PeachCoinIcon size={32} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>{children}</Box>
      {action}
    </Box>
  );
}

function LoadingRows() {
  return (
    <Stack spacing={0.9}>
      {[1, 2, 3].map((index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.2, borderRadius: 2, bgcolor: 'rgba(10,20,42,0.72)', border: '1px solid rgba(117,161,239,0.12)' }}>
          <Skeleton variant="circular" width={42} height={42} />
          <Box sx={{ flex: 1 }}><Skeleton width="45%" /><Skeleton width="65%" /></Box>
          <Skeleton width={60} />
        </Box>
      ))}
    </Stack>
  );
}

export default function MyRewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inbox' | 'rewards'>('inbox');
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
        setItems(normalizeRewardRedemptionsResponse(rewardData).redemptions);
        setInbox(normalizeRewardInboxResponse(inboxData).inbox);
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
      <Container maxWidth="sm" sx={{ py: { xs: 1.5, sm: 2.5 }, position: 'relative' }}>
        <Stack spacing={1.25}>
          <Box sx={{ px: { xs: 0.5, sm: 0.75 }, pt: 0.5 }}>
            <Typography component="h1" sx={{ color: '#f7fbff', fontSize: { xs: '1.8rem', sm: '2.15rem' }, lineHeight: 1.05, fontWeight: 950, letterSpacing: '-0.055em' }}>Quà đã nhận</Typography>
            <Typography sx={{ mt: 0.45, color: 'rgba(226,234,255,0.62)', fontSize: '0.88rem' }}>Voucher, code và phần thưởng từ vòng quay.</Typography>
          </Box>

          <Box sx={{ px: 0.35, borderBottom: '1px solid rgba(117,161,239,0.16)' }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="fullWidth"
              sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, color: 'rgba(226,234,255,0.54)', fontWeight: 900, fontSize: '0.78rem' }, '& .Mui-selected': { color: '#8db9ff' }, '& .MuiTabs-indicator': { height: 3, borderRadius: 999, bgcolor: '#4d86ff' } }}
            >
              <Tab value="inbox" label={`Inbox ${inbox.length}`} />
              <Tab value="rewards" label={`Đã đổi ${items.length}`} />
            </Tabs>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          {loading ? <LoadingRows /> : activeTab === 'inbox' ? (
            inbox.length ? (
              <Stack spacing={0.9}>
                {inbox.map((item) => {
                  const tone = statusTone(item);
                  return (
                    <CompactRow key={item.id} action={<Chip label={statusLabel(item)} size="small" sx={{ flex: '0 0 auto', height: 28, color: tone.color, bgcolor: tone.bgcolor, border: `1px solid ${tone.border}`, fontWeight: 850, '& .MuiChip-label': { px: 1 } }} />}>
                      <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
                        <Typography noWrap sx={{ color: '#f4f8ff', fontWeight: 900, fontSize: '0.92rem' }}>{rewardTitle(item)}</Typography>
                        <Typography sx={{ color: 'rgba(226,234,255,0.42)', fontSize: '0.72rem', flex: '0 0 auto' }}>• {shortDate(item.createdAt)}</Typography>
                      </Stack>
                      <Typography noWrap sx={{ mt: 0.22, color: 'rgba(226,234,255,0.52)', fontSize: '0.72rem' }}>{kindLabel(item.kind)} · {String(item.sourceType ?? 'wheel').toLowerCase()}</Typography>
                    </CompactRow>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', borderRadius: 2.5, border: '1px dashed rgba(117,161,239,0.2)', bgcolor: 'rgba(10,20,42,0.5)' }}>
                <Typography sx={{ color: '#eef4ff', fontWeight: 900 }}>Inbox đang trống</Typography>
                <Typography sx={{ mt: 0.4, color: 'rgba(226,234,255,0.56)', fontSize: '0.82rem' }}>Phần thưởng nhận được sẽ xuất hiện ở đây.</Typography>
              </Box>
            )
          ) : items.length ? (
            <Stack spacing={0.9}>
              {items.map((item) => (
                <CompactRow key={item.id} action={<Chip label={String(item.status ?? 'Đã đổi').toLowerCase()} size="small" sx={{ height: 28, color: '#fff2c0', bgcolor: 'rgba(255,214,102,0.12)', border: '1px solid rgba(255,214,102,0.2)', fontWeight: 850, '& .MuiChip-label': { px: 1 } }} />}>
                  <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
                    <Typography noWrap sx={{ color: '#f4f8ff', fontWeight: 900, fontSize: '0.92rem' }}>{cleanText(item.rewards?.name ?? 'Reward')}</Typography>
                    <Typography sx={{ color: 'rgba(226,234,255,0.42)', fontSize: '0.72rem', flex: '0 0 auto' }}>• {shortDate(item.createdAt)}</Typography>
                  </Stack>
                  <Typography noWrap sx={{ mt: 0.22, color: 'rgba(226,234,255,0.52)', fontSize: '0.72rem' }}>{kindLabel(item.rewards?.type)}{item.rewardCodes?.code ? ` · ${item.rewardCodes.code}` : ''}</Typography>
                </CompactRow>
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', borderRadius: 2.5, border: '1px dashed rgba(117,161,239,0.2)', bgcolor: 'rgba(10,20,42,0.5)' }}>
              <Typography sx={{ color: '#eef4ff', fontWeight: 900 }}>Chưa có lượt đổi quà</Typography>
              <Typography sx={{ mt: 0.4, color: 'rgba(226,234,255,0.56)', fontSize: '0.82rem' }}>Các phần quà đã đổi sẽ xuất hiện ở đây.</Typography>
            </Box>
          )}
        </Stack>
      </Container>
    </PageShell>
  );
}
