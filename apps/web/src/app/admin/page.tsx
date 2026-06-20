'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import AddCardRoundedIcon from '@mui/icons-material/AddCardRounded';
import { apiClient } from '../../lib/api';
import { AuditTable, TransactionsTable, UsersTable } from './components/admin-tables';

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

type SectionKey = 'overview' | 'users' | 'transactions' | 'audit' | 'rewards' | 'wheel' | 'settings';

const NAV_ITEMS: Array<{ key: SectionKey; label: string; icon: React.ReactNode }> = [
  { key: 'overview', label: 'Overview', icon: <DashboardRoundedIcon /> },
  { key: 'users', label: 'Users', icon: <PeopleAltRoundedIcon /> },
  { key: 'transactions', label: 'Transactions', icon: <ReceiptLongRoundedIcon /> },
  { key: 'audit', label: 'Audit Logs', icon: <FactCheckRoundedIcon /> },
  { key: 'rewards', label: 'Rewards', icon: <Inventory2RoundedIcon /> },
  { key: 'wheel', label: 'Lucky Wheel', icon: <CasinoRoundedIcon /> },
  { key: 'settings', label: 'Settings', icon: <SettingsRoundedIcon /> },
];

const DRAWER_WIDTH = 280;

function StatCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,247,251,0.98))',
      }}
    >
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            {value}
          </Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'start', md: 'center' }} justifyContent="space-between">
      <Box>
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [debugEnv, setDebugEnv] = useState<any>(null);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('manual_adjustment');
  const [rewardName, setRewardName] = useState('');
  const [rewardPointCost, setRewardPointCost] = useState(0);
  const [rewardType, setRewardType] = useState('VOUCHER');
  const [campaignName, setCampaignName] = useState('');
  const [importRewardId, setImportRewardId] = useState('');
  const [importCodesText, setImportCodesText] = useState('');
  const [prizeCampaignId, setPrizeCampaignId] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [prizeType, setPrizeType] = useState('POINT');
  const [prizeWeight, setPrizeWeight] = useState(1);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editRewardName, setEditRewardName] = useState('');
  const [editRewardType, setEditRewardType] = useState('VOUCHER');
  const [editRewardPointCost, setEditRewardPointCost] = useState(0);
  const [editRewardStock, setEditRewardStock] = useState<string>('');
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editCampaignDescription, setEditCampaignDescription] = useState('');
  const [editCampaignActive, setEditCampaignActive] = useState(false);
  const pageSize = 20;
  const client = useMemo(() => apiClient(token), [token]);

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
    client.adminGetRewards().then((data) => setRewards(data.rewards ?? [])).catch(() => {});
    client.adminGetWheelCampaigns().then((data) => setCampaigns(data.campaigns ?? [])).catch(() => {});
  }, [client, token, search, page]);

  async function handleLogin() {
    try {
      setError('');
      const data = await client.login(email, password);
      setToken(data.token);
      window.localStorage.setItem('tele-member-admin-token', data.token);
    } catch {
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
    } catch {
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

  async function handleCreateReward() {
    try {
      await client.adminCreateReward({
        name: rewardName,
        type: rewardType,
        pointCost: rewardPointCost,
        description: '',
        stock: null,
        isActive: true,
        metadata: {},
      });
      const data = await client.adminGetRewards();
      setRewards(data.rewards ?? []);
      setError('');
    } catch {
      setError('Tạo reward thất bại');
    }
  }

  async function handleCreateCampaign() {
    try {
      await client.adminCreateWheelCampaign({
        name: campaignName,
        isActive: false,
        metadata: {},
      });
      const data = await client.adminGetWheelCampaigns();
      setCampaigns(data.campaigns ?? []);
      setError('');
    } catch {
      setError('Tạo campaign thất bại');
    }
  }

  async function handleImportCodes() {
    try {
      const codes = importCodesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      await client.adminImportRewardCodes(importRewardId, codes);
      setError('');
    } catch {
      setError('Import code thất bại');
    }
  }

  async function handleCreatePrize() {
    try {
      if (!prizeCampaignId) throw new Error('Missing campaign');
      await client.adminCreateWheelPrize(prizeCampaignId, {
        name: prizeName,
        type: prizeType,
        weight: prizeWeight,
        stock: null,
        isActive: true,
        metadata: {},
      });
      setError('');
    } catch {
      setError('Tạo prize thất bại');
    }
  }

  async function handleUpdateReward() {
    if (!editingReward) return;
    try {
      await client.adminUpdateReward(editingReward.id, {
        name: editRewardName,
        type: editRewardType,
        pointCost: editRewardPointCost,
        stock: editRewardStock === '' ? null : Number(editRewardStock),
      });
      const data = await client.adminGetRewards();
      setRewards(data.rewards ?? []);
      setEditingReward(null);
      setError('');
    } catch {
      setError('Cập nhật reward thất bại');
    }
  }

  async function handleUpdateCampaign() {
    if (!editingCampaign) return;
    try {
      await client.adminUpdateWheelCampaign(editingCampaign.id, {
        name: editCampaignName,
        description: editCampaignDescription,
        isActive: editCampaignActive,
      });
      const data = await client.adminGetWheelCampaigns();
      setCampaigns(data.campaigns ?? []);
      setEditingCampaign(null);
      setError('');
    } catch {
      setError('Cập nhật campaign thất bại');
    }
  }

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 5, boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
          <CardContent>
            <Stack spacing={2}>
              <Chip label="Admin Login" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" fontWeight={900}>
                Sign in to Admin CP
              </Typography>
              <Typography color="text.secondary">
                Quản lý users, reward store, code import, wheel campaign và audit logs trong một khung dashboard thống nhất.
              </Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button
                variant="contained"
                onClick={handleLogin}
                sx={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}
              >
                Login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F3F6FB',
        background:
          'radial-gradient(circle at top left, rgba(15,118,110,0.10), transparent 24%), radial-gradient(circle at top right, rgba(245,158,11,0.10), transparent 22%), #F3F6FB',
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(10, 20, 35, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Avatar sx={{ bgcolor: '#14B8A6', fontWeight: 900 }}>TM</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} color="common.white" noWrap>
              Tele Member Admin CP
            </Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.72)" noWrap>
              Rewards, Wheel, Wallet, Audit and more
            </Typography>
          </Box>
          <Chip label={token ? 'Online' : 'Offline'} color="success" size="small" />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(15,23,42,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,247,251,0.98))',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, py: 2 }}>
          <Card sx={{ borderRadius: 4, mb: 2, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Workspace
              </Typography>
              <Typography variant="h6" fontWeight={900}>
                Control Center
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chuẩn bị sẵn để mở rộng thêm module sau này.
              </Typography>
            </CardContent>
          </Card>
          <List disablePadding>
            {NAV_ITEMS.map((item) => (
              <ListItemButton
                key={item.key}
                selected={activeSection === item.key}
                onClick={() => setActiveSection(item.key)}
                sx={{
                  borderRadius: 3,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(20,184,166,0.12)',
                    color: '#0F766E',
                    '& .MuiListItemIcon-root': { color: '#0F766E' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ ml: `${DRAWER_WIDTH}px`, pt: 10, pb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {error ? <Alert severity="warning">{error}</Alert> : null}

            <Card sx={{ borderRadius: 5, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Chip label="Admin Dashboard" color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h4" fontWeight={900}>
                      Khung quản trị chuyên nghiệp
                    </Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720, mt: 0.5 }}>
                      Sidebar điều hướng, tabs theo module, và các khối quản lý tách riêng để dễ mở rộng về sau.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="start" justifyContent="flex-end">
                    <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading}>
                      {debugLoading ? 'Loading...' : 'Debug Env'}
                    </Button>
                    <Chip label={`Users ${users.length}`} />
                    <Chip label={`Rewards ${rewards.length}`} />
                    <Chip label={`Campaigns ${campaigns.length}`} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 5, boxShadow: '0 18px 50px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ pb: 1 }}>
                <Tabs
                  value={activeSection}
                  onChange={(_, value) => setActiveSection(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {NAV_ITEMS.map((item) => (
                    <Tab key={item.key} value={item.key} label={item.label} />
                  ))}
                </Tabs>
              </CardContent>
            </Card>

            {activeSection === 'overview' ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <StatCard label="Users" value={String(users.length)} helper="Danh sách người dùng" />
                <StatCard label="Transactions" value={String(transactions.length)} helper="Point ledger hiện tại" />
                <StatCard label="Rewards" value={String(rewards.length)} helper="Reward store items" />
                <StatCard label="Campaigns" value={String(campaigns.length)} helper="Wheel campaign" />
              </Box>
            ) : null}

            {activeSection === 'users' ? (
              <UsersTable
                users={users}
                search={search}
                onSearchChange={setSearch}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onRowClick={(user) => {
                  setTelegramId(user.telegramId);
                  setActiveSection('settings');
                }}
              />
            ) : null}

            {activeSection === 'transactions' ? (
              <TransactionsTable
                transactions={transactions}
                search={search}
                onSearchChange={setSearch}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            ) : null}

            {activeSection === 'audit' ? <AuditTable logs={auditLogs} onRefresh={handleDebugEnv} /> : null}

            {activeSection === 'rewards' ? (
              <Stack spacing={2}>
                <Card sx={{ borderRadius: 5 }}>
                  <CardContent>
                    <SectionHeader title="Create Reward" description="Tạo reward mới cho store." />
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                        <TextField fullWidth label="Reward name" value={rewardName} onChange={(e) => setRewardName(e.target.value)} />
                        <TextField fullWidth label="Type" value={rewardType} onChange={(e) => setRewardType(e.target.value)} />
                        <TextField fullWidth label="Point cost" type="number" value={rewardPointCost} onChange={(e) => setRewardPointCost(Number(e.target.value))} />
                        <Button variant="contained" onClick={handleCreateReward}>Create</Button>
                      </Stack>
                      <Stack spacing={1}>
                        {rewards.map((reward) => (
                          <Box
                            key={reward.id}
                            sx={{
                              p: 1.75,
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: '#fff',
                            }}
                          >
                            <Typography fontWeight={800}>{reward.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reward.type} | cost {reward.point_cost} | stock {reward.stock ?? '∞'} | {reward.is_active ? 'Active' : 'Inactive'}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setEditingReward(reward);
                                  setEditRewardName(reward.name);
                                  setEditRewardType(reward.type);
                                  setEditRewardPointCost(reward.point_cost);
                                  setEditRewardStock(reward.stock === null ? '' : String(reward.stock));
                                }}
                              >
                                Edit
                              </Button>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 5 }}>
                  <CardContent>
                    <SectionHeader title="Import Codes" description="Dán nhiều mã, mỗi mã một dòng." />
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <TextField label="Reward ID" value={importRewardId} onChange={(e) => setImportRewardId(e.target.value)} />
                      <TextField
                        label="Codes"
                        value={importCodesText}
                        onChange={(e) => setImportCodesText(e.target.value)}
                        multiline
                        minRows={5}
                      />
                      <Button variant="outlined" onClick={handleImportCodes}>Import codes</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            ) : null}

            {activeSection === 'wheel' ? (
              <Stack spacing={2}>
                <Card sx={{ borderRadius: 5 }}>
                  <CardContent>
                    <SectionHeader title="Wheel Campaigns" description="Quản lý campaign active." />
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
                        <TextField fullWidth label="Campaign name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                        <Button variant="contained" onClick={handleCreateCampaign}>Create campaign</Button>
                      </Stack>
                      <Stack spacing={1}>
                        {campaigns.map((campaign) => (
                          <Box
                            key={campaign.id}
                            sx={{
                              p: 1.75,
                              borderRadius: 3,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: '#fff',
                            }}
                          >
                            <Typography fontWeight={800}>{campaign.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {campaign.is_active ? 'Active' : 'Inactive'}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => {
                                  setEditingCampaign(campaign);
                                  setEditCampaignName(campaign.name);
                                  setEditCampaignDescription(campaign.description ?? '');
                                  setEditCampaignActive(Boolean(campaign.is_active));
                                }}
                              >
                                Edit
                              </Button>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 5 }}>
                  <CardContent>
                    <SectionHeader title="Create Prize" description="Tạo prize theo campaign." />
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <TextField label="Campaign ID" value={prizeCampaignId} onChange={(e) => setPrizeCampaignId(e.target.value)} />
                      <TextField label="Prize name" value={prizeName} onChange={(e) => setPrizeName(e.target.value)} />
                      <TextField label="Prize type" value={prizeType} onChange={(e) => setPrizeType(e.target.value)} />
                      <TextField label="Weight" type="number" value={prizeWeight} onChange={(e) => setPrizeWeight(Number(e.target.value))} />
                      <Button variant="outlined" onClick={handleCreatePrize}>Create prize</Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            ) : null}

            {activeSection === 'settings' ? (
              <Card sx={{ borderRadius: 5 }}>
                <CardContent>
                  <SectionHeader title="Settings & Diagnostics" description="Debug env và identity Telegram bot." />
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading} sx={{ alignSelf: 'flex-start' }}>
                      {debugLoading ? 'Loading...' : 'Debug Env'}
                    </Button>
                    {debugEnv ? (
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          borderRadius: 3,
                          bgcolor: 'rgba(2,6,23,0.04)',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(debugEnv, null, 2)}
                      </Box>
                    ) : null}
                    {botInfo ? (
                      <Box
                        component="pre"
                        sx={{
                          m: 0,
                          p: 2,
                          borderRadius: 3,
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
                </CardContent>
              </Card>
            ) : null}

            <Box sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Designed to scale: sidebar + tabs + section cards make it easy to add new modules later.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      <Dialog open={Boolean(editingReward)} onClose={() => setEditingReward(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Reward</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={editRewardName} onChange={(e) => setEditRewardName(e.target.value)} />
            <TextField label="Type" value={editRewardType} onChange={(e) => setEditRewardType(e.target.value)} />
            <TextField label="Point cost" type="number" value={editRewardPointCost} onChange={(e) => setEditRewardPointCost(Number(e.target.value))} />
            <TextField label="Stock" value={editRewardStock} onChange={(e) => setEditRewardStock(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingReward(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateReward}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editingCampaign)} onClose={() => setEditingCampaign(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Wheel Campaign</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={editCampaignName} onChange={(e) => setEditCampaignName(e.target.value)} />
            <TextField label="Description" value={editCampaignDescription} onChange={(e) => setEditCampaignDescription(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select
                label="Active"
                value={editCampaignActive ? 'true' : 'false'}
                onChange={(e) => setEditCampaignActive(e.target.value === 'true')}
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCampaign(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateCampaign}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
