'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
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

export default function RewardsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const client = apiClient(token);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    client.getRewards().then((data) => setRewards(data.rewards ?? [])).catch((err) => setError(String(err)));
  }, [token]);

  async function redeem(id: string) {
    try {
      setError('');
      const result = await client.redeemReward(id);
      setMessage(result.code ? `Đổi thành công. Code: ${result.code}` : 'Đổi thành công');
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>Reward Store</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {message ? <Alert severity="success">{message}</Alert> : null}
        {rewards.map((reward) => (
          <Card key={reward.id}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">{reward.name}</Typography>
                <Typography color="text.secondary">{reward.description ?? 'Không có mô tả'}</Typography>
                <Typography>Giá: {reward.point_cost}</Typography>
                <Typography>Tồn kho: {reward.stock ?? 'Không giới hạn'}</Typography>
                <Button variant="contained" onClick={() => redeem(reward.id)}>Đổi</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
