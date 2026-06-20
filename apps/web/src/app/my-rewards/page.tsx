'use client';

import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';

export default function MyRewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState('');
  const client = apiClient(token);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    client.getMyRewards().then((data) => setItems(data.rewards ?? [])).catch((err) => setError(String(err)));
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>My Rewards</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <Typography fontWeight={700}>{item.rewards?.name ?? 'Reward'}</Typography>
              <Typography variant="body2" color="text.secondary">Status: {item.status}</Typography>
              <Typography variant="body2">Code: {item.reward_codes?.code ?? '-'}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
