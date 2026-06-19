'use client';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '../../lib/api';

type AdminUser = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  balance: number;
  lastCheckinDate: string | null;
};

type AdminTransaction = {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  amount: number;
  type: string;
  reason: string;
  createdAt: string;
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('manual_adjustment');
  const client = apiClient(token);

  useEffect(() => {
    const saved = window.localStorage.getItem('tele-member-admin-token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    client
      .getUsers('')
      .then((data) => setUsers(data.users ?? data))
      .catch((err) => setError(String(err)));
    client
      .getTransactions('')
      .then((data) => setTransactions(data.transactions ?? data))
      .catch((err) => setError(String(err)));
  }, [token]);

  async function handleLogin() {
    try {
      setError('');
      const data = await client.login(email, password);
      setToken(data.token);
      window.localStorage.setItem('tele-member-admin-token', data.token);
    } catch (err) {
      setError('Đăng nhập thất bại');
    }
  }

  async function handleAdjust() {
    try {
      await client.adjust({ telegramId, amount: Number(amount), reason });
      const updated = await client.getUsers('');
      const refreshed = await client.getTransactions('');
      setUsers(updated.users ?? updated);
      setTransactions(refreshed.transactions ?? refreshed);
      setError('');
    } catch (err) {
      setError('Cập nhật điểm thất bại');
    }
  }

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h4" fontWeight={800}>
                Admin Login
              </Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="contained" onClick={handleLogin}>
                Login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={800}>
          Admin Control Panel
        </Typography>
        {error ? <Alert severity="warning">{error}</Alert> : null}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Cộng / Trừ Điểm</Typography>
                <TextField label="Telegram ID" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Button variant="contained" onClick={handleAdjust}>
                  Submit
                </Button>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">Summary</Typography>
              <Typography>Users: {users.length}</Typography>
              <Typography>Transactions: {transactions.length}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Card>
          <CardContent>
            <Typography variant="h6">Users</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {users.map((user) => (
                <Box key={user.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography fontWeight={700}>
                    {user.firstName ?? ''} {user.lastName ?? ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{user.username ?? '-'} | {user.telegramId} | Balance: {user.balance}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Transactions</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {transactions.map((tx) => (
                <Box key={tx.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography fontWeight={700}>
                    {tx.type.toUpperCase()} {tx.amount} - {tx.reason}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tx.telegramId} | @{tx.username ?? '-'} | {tx.createdAt}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

