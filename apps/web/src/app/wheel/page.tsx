'use client';

import { useEffect, useState } from 'react';
import { Alert, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material';
import { apiClient } from '../../lib/api';

export default function WheelPage() {
  const [token, setToken] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [spins, setSpins] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const client = apiClient(token);

  useEffect(() => {
    setToken(window.localStorage.getItem('tele-member-token'));
  }, []);

  useEffect(() => {
    if (!token) return;
    Promise.all([client.getWheelCurrent(), client.getMySpins()])
      .then(([wheel, spinData]) => {
        setCampaign(wheel.campaign);
        setPrizes(wheel.prizes ?? []);
        setSpins(spinData.balance ?? 0);
      })
      .catch((err) => setError(String(err)));
  }, [token]);

  async function spin() {
    try {
      setError('');
      const data = await client.spinWheel();
      setResult(data);
      const spinData = await client.getMySpins();
      setSpins(spinData.balance ?? 0);
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={800}>Lucky Wheel</Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {result ? <Alert severity="success">Trúng: {result.prize?.name ?? 'Không trúng'}</Alert> : null}
        <Card>
          <CardContent>
            <Typography variant="h6">{campaign?.name ?? 'Chưa có campaign'}</Typography>
            <Typography color="text.secondary">Lượt quay: {spins}</Typography>
            <Button sx={{ mt: 2 }} variant="contained" disabled={!spins || !campaign} onClick={spin}>
              Quay ngay
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Giải thưởng</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {prizes.map((prize) => (
                <Typography key={prize.id} variant="body2">{prize.name} - weight {prize.weight}</Typography>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
