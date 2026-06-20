'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardContent, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import { apiClient } from '../lib/api';

type Summary = {
  telegramId: string;
  balance: number;
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
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography>Đang đăng nhập Telegram...</Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>
          Tele Member
        </Typography>
        <Chip label={`Telegram ID: ${summary?.telegramId ?? '-'}`} />
        <Card>
          <CardContent>
            <Typography color="text.secondary">Điểm hiện tại</Typography>
            <Typography variant="h2" fontWeight={800}>
              {summary?.balance ?? 0}
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
                      <Typography fontWeight={700}>
                        {tx.type.toUpperCase()} {tx.amount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {tx.reason} | {tx.createdAt}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography color="text.secondary">Chưa có giao dịch.</Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
