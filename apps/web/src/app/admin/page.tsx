'use client';

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
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
import { useAdminDashboard } from './use-admin-dashboard';
import {
  AuditSection,
  OverviewSection,
  RewardsSection,
  SettingsSection,
  TransactionsSection,
  UsersSection,
  WheelSection,
} from './components/admin-sections';

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
    <Card sx={{ borderRadius: 4, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.08)', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,247,251,0.98))' }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="h4" fontWeight={900}>{value}</Typography>
          {helper ? <Typography variant="caption" color="text.secondary">{helper}</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const admin = useAdminDashboard();

  if (!admin.token) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 5, boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
          <CardContent>
            <Stack spacing={2}>
              <Chip label="Admin Login" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" fontWeight={900}>Sign in to Admin CP</Typography>
              <Typography color="text.secondary">
                Quản lý users, reward store, code import, wheel campaign và audit logs trong một khung dashboard thống nhất.
              </Typography>
              {admin.error ? <Alert severity="error">{admin.error}</Alert> : null}
              <TextField label="Email" value={admin.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => admin.setEmail(e.target.value)} />
              <TextField label="Password" type="password" value={admin.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => admin.setPassword(e.target.value)} />
              <Button variant="contained" onClick={admin.login} sx={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}>Login</Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F3F6FB', background: 'radial-gradient(circle at top left, rgba(15,118,110,0.10), transparent 24%), radial-gradient(circle at top right, rgba(245,158,11,0.10), transparent 22%), #F3F6FB' }}>
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'rgba(10, 20, 35, 0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Avatar sx={{ bgcolor: '#14B8A6', fontWeight: 900 }}>TM</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} color="common.white" noWrap>Tele Member Admin CP</Typography>
            <Typography variant="caption" color="rgba(255,255,255,0.72)" noWrap>Rewards, Wheel, Wallet, Audit and more</Typography>
          </Box>
          <Chip label={admin.token ? 'Online' : 'Offline'} color="success" size="small" />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,247,251,0.98))' } }}>
        <Toolbar />
        <Box sx={{ px: 2, py: 2 }}>
          <Card sx={{ borderRadius: 4, mb: 2, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.06)' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Workspace</Typography>
              <Typography variant="h6" fontWeight={900}>Control Center</Typography>
              <Typography variant="body2" color="text.secondary">Chuẩn bị sẵn để mở rộng thêm module sau này.</Typography>
            </CardContent>
          </Card>
          <List disablePadding>
            {NAV_ITEMS.map((item) => (
              <ListItemButton key={item.key} selected={admin.activeSection === item.key} onClick={() => admin.setActiveSection(item.key)} sx={{ borderRadius: 3, mb: 0.5, '&.Mui-selected': { bgcolor: 'rgba(20,184,166,0.12)', color: '#0F766E', '& .MuiListItemIcon-root': { color: '#0F766E' } } }}>
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
            {admin.error ? <Alert severity="warning">{admin.error}</Alert> : null}
            <Card sx={{ borderRadius: 5, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Chip label="Admin Dashboard" color="primary" sx={{ mb: 1 }} />
                    <Typography variant="h4" fontWeight={900}>Khung quản trị chuyên nghiệp</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720, mt: 0.5 }}>
                      Sidebar điều hướng, tabs theo module, và các khối quản lý tách riêng để dễ mở rộng về sau.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="start" justifyContent="flex-end">
                    <Button variant="outlined" onClick={admin.refreshDebug} disabled={admin.debugLoading}>{admin.debugLoading ? 'Loading...' : 'Debug Env'}</Button>
                    <Chip label={`Users ${admin.users.length}`} />
                    <Chip label={`Rewards ${admin.rewards.length}`} />
                    <Chip label={`Campaigns ${admin.campaigns.length}`} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 5, boxShadow: '0 18px 50px rgba(15,23,42,0.06)' }}>
              <CardContent sx={{ pb: 1 }}>
                <Tabs value={admin.activeSection} onChange={(_, value) => admin.setActiveSection(value)} variant="scrollable" scrollButtons="auto">
                  {NAV_ITEMS.map((item) => <Tab key={item.key} value={item.key} label={item.label} />)}
                </Tabs>
              </CardContent>
            </Card>

            {admin.activeSection === 'overview' ? <OverviewSection users={admin.users} transactions={admin.transactions} rewards={admin.rewards} campaigns={admin.campaigns} /> : null}
            {admin.activeSection === 'users' ? <UsersSection {...admin} /> : null}
            {admin.activeSection === 'transactions' ? <TransactionsSection {...admin} /> : null}
            {admin.activeSection === 'audit' ? <AuditSection auditLogs={admin.auditLogs} handleDebugEnv={admin.refreshDebug} /> : null}
            {admin.activeSection === 'rewards' ? <RewardsSection {...admin} /> : null}
            {admin.activeSection === 'wheel' ? <WheelSection {...admin} /> : null}
            {admin.activeSection === 'settings' ? <SettingsSection debugEnv={admin.debugEnv} botInfo={admin.botInfo} debugLoading={admin.debugLoading} handleDebugEnv={admin.refreshDebug} /> : null}

            <Box sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Designed to scale: sidebar + tabs + section cards make it easy to add new modules later.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
