'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../lib/api';

type Summary = {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  balance: number;
  streak: number;
  lastCheckinAt: string | null;
  transactions: Array<{
    id: string;
    amount: number;
    reason: string;
    type: 'credit' | 'debit';
    createdAt: string;
  }>;
};

export default function MiniAppClient() {
  const client = useMemo(() => apiClient(), []);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [checkinMessage, setCheckinMessage] = useState('');

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;
        const initData = tg?.initData ?? '';
        if (!initData) {
          setError('Mở trong Telegram để đăng nhập.');
          setStatus('error');
          return;
        }

        tg?.ready?.();
        tg?.expand?.();

        const auth = await client.telegramLogin(initData);
        setToken(auth.token);

        const data = await fetchSummary(auth.token);
        setSummary(data);
        setStatus('ready');
      } catch (err) {
        setError('Không thể xác thực Telegram WebApp.');
        setStatus('error');
      }
    };

    void initTelegram();
  }, [client]);

  async function fetchSummary(authToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/summary`, {
      headers: { authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
      throw new Error('Failed to load summary');
    }
    return response.json();
  }

  async function handleCheckin() {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/checkin`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCheckinMessage(data.message ?? 'Done');
      const refreshed = await fetchSummary(token);
      setSummary(refreshed);
    } catch (err) {
      setError('Không thể điểm danh.');
    }
  }

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={2} direction="row" alignItems="center">
                <Skeleton variant="circular" width={56} height={56} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={28} />
                  <Skeleton width="35%" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton width="30%" />
              <Skeleton width="50%" height={72} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton width="40%" />
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 4 }}>
          <CardContent>
            <Stack spacing={2} alignItems="flex-start">
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={() => {
                  setError('');
                  setStatus('loading');
                  window.location.reload();
                }}
              >
                Thử lại
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={summary?.avatarUrl ?? undefined}
                sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700 }}
              >
                {(summary?.firstName?.[0] ?? summary?.username?.[0] ?? 'T').toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h5" fontWeight={800} noWrap>
                  {[summary?.firstName, summary?.lastName].filter(Boolean).join(' ') || summary?.username || 'Tele Member'}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`@${summary?.username ?? 'unknown'}`} />
                  <Chip size="small" label={`ID ${summary?.telegramId ?? '-'}`} />
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Box>
                <Typography color="text.secondary">Điểm hiện tại</Typography>
                <Typography variant="h2" fontWeight={800}>
                  {summary?.balance ?? 0}
                </Typography>
              </Box>
              <Box>
                <Typography color="text.secondary">Streak</Typography>
                <Typography variant="h2" fontWeight={800}>
                  {summary?.streak ?? 0}
                </Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Lần điểm danh gần nhất: {summary?.lastCheckinAt ? new Date(summary.lastCheckinAt).toLocaleString('vi-VN') : 'Chưa có'}
            </Typography>
          </CardContent>
        </Card>
        <Button variant="contained" size="large" onClick={handleCheckin}>
          Điểm danh hôm nay
        </Button>
        {checkinMessage ? <Alert severity="success">{checkinMessage}</Alert> : null}
        <Card>
          <CardContent>
            <Typography variant="h6">Lịch sử giao dịch</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {summary?.transactions?.length ? (
                summary.transactions.map((tx) => (
                  <Card key={tx.id} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                          <Typography fontWeight={700}>
                            {tx.type.toUpperCase()} {tx.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {tx.reason}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {tx.createdAt}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
                  <CardContent>
                    <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ py: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Chưa có giao dịch
                      </Typography>
                      <Typography color="text.secondary">
                        Khi bạn điểm danh hoặc nhận thưởng, lịch sử sẽ xuất hiện ở đây.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
