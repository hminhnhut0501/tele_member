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
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('manual_adjustment');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [debugEnv, setDebugEnv] = useState<any>(null);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const pageSize = 20;
  const client = apiClient(token);

  useEffect(() => {
    const saved = window.localStorage.getItem('tele-member-admin-token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    client
      .getUsers(search, page * pageSize, pageSize)
      .then((data) => setUsers(data.users ?? data))
      .catch((err) => setError(String(err)));
    client
      .getTransactions(search, page * pageSize, pageSize)
      .then((data) => setTransactions(data.transactions ?? data))
      .catch((err) => setError(String(err)));
    client
      .getAuditLogs(page * pageSize, pageSize)
      .then((data) => setAuditLogs(data.logs ?? data))
      .catch((err) => setError(String(err)));
  }, [token, search, page]);

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
      const updated = await client.getUsers(search, page * pageSize, pageSize);
      const refreshed = await client.getTransactions(search, page * pageSize, pageSize);
      const logs = await client.getAuditLogs(page * pageSize, pageSize);
      setUsers(updated.users ?? updated);
      setTransactions(refreshed.transactions ?? refreshed);
      setAuditLogs(logs.logs ?? logs);
      setError('');
    } catch (err) {
      setError('Cập nhật điểm thất bại');
    }
  }

  async function handleDebugEnv() {
    if (!token) return;
    try {
      setDebugLoading(true);
      setError('');
      const [envData, botData] = await Promise.all([client.getDebugEnv(), client.getTelegramBotInfo()]);
      setDebugEnv(envData);
      setBotInfo(botData);
    } catch {
      setError('Không thể tải debug env');
    } finally {
      setDebugLoading(false);
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
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField fullWidth label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button variant="outlined" onClick={() => setPage((value) => Math.max(0, value - 1))}>
            Prev
          </Button>
          <Button variant="outlined" onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
          <Button variant="contained" color="secondary" onClick={handleDebugEnv} disabled={debugLoading}>
            {debugLoading ? 'Loading...' : 'Debug Env'}
          </Button>
        </Stack>
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
        <Card>
          <CardContent>
            <Typography variant="h6">Audit Logs</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              {auditLogs.map((log) => (
                <Box key={log.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography fontWeight={700}>
                    {log.action} - {log.actorEmail}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {log.targetTelegramId ?? '-'} | {log.createdAt}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Debug Env</Typography>
            <Divider sx={{ my: 2 }} />
            {debugEnv ? (
              <Stack spacing={2}>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(2,6,23,0.04)',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(debugEnv, null, 2)}
                </Box>
                {botInfo ? (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,118,110,0.06)',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(botInfo, null, 2)}
                  </Box>
                ) : null}
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Bấm <strong>Debug Env</strong> để xem fingerprint môi trường đang chạy trên Render.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
