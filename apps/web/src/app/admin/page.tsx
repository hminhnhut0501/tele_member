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
import PolicyRoundedIcon from '@mui/icons-material/PolicyRounded';
import { useAdminDashboard } from './use-admin-dashboard';
import {
  AuditSection,
  OverviewSection,
  PolicySection,
  RewardsSection,
  SettingsSection,
  UserAdjustDialog,
  TransactionsSection,
  UsersSection,
  WheelSection,
} from './components/admin-sections';
import { MetricCard } from '../shared-ui';

type SectionKey = 'overview' | 'users' | 'transactions' | 'audit' | 'rewards' | 'wheel' | 'policies' | 'settings';

const NAV_ITEMS: Array<{ key: SectionKey; label: string; icon: React.ReactNode }> = [
  { key: 'overview', label: 'Tổng quan', icon: <DashboardRoundedIcon /> },
  { key: 'users', label: 'Người dùng', icon: <PeopleAltRoundedIcon /> },
  { key: 'transactions', label: 'Giao dịch', icon: <ReceiptLongRoundedIcon /> },
  { key: 'audit', label: 'Nhật ký', icon: <FactCheckRoundedIcon /> },
  { key: 'rewards', label: 'Quà đổi', icon: <Inventory2RoundedIcon /> },
  { key: 'wheel', label: 'Vòng quay', icon: <CasinoRoundedIcon /> },
  { key: 'policies', label: 'Chính sách', icon: <PolicyRoundedIcon /> },
  { key: 'settings', label: 'Cài đặt', icon: <SettingsRoundedIcon /> },
];

const DRAWER_WIDTH = 272;

export default function AdminPage() {
  const admin = useAdminDashboard();

  if (!admin.token) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
          <CardContent>
            <Stack spacing={2}>
              <Chip label="Đăng nhập quản trị" color="primary" sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="h4" fontWeight={900}>Đăng nhập vào bảng quản trị</Typography>
              <Typography color="text.secondary">
                Quản lý người dùng, quà đổi, nhập mã, chiến dịch vòng quay và nhật ký trong một khung dashboard thống nhất.
              </Typography>
              {admin.error ? <Alert severity="error">{admin.error}</Alert> : null}
              <TextField label="Email quản trị" value={admin.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => admin.setEmail(e.target.value)} />
              <TextField label="Mật khẩu" type="password" value={admin.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => admin.setPassword(e.target.value)} />
              <Button variant="contained" onClick={admin.login} sx={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}>Đăng nhập</Button>
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
        bgcolor: '#f6f8fc',
        backgroundImage:
          'radial-gradient(circle at top left, rgba(37,99,235,0.08) 0%, transparent 28%), radial-gradient(circle at top right, rgba(124,58,237,0.06) 0%, transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
      }}
    >
      <CssBaseline />
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'rgba(255,255,255,0.965)', color: 'text.primary', backdropFilter: 'blur(18px)', borderBottom: '1px solid', borderColor: 'rgba(15,23,42,0.08)', boxShadow: '0 1px 0 rgba(15,23,42,0.02)' }}>
        <Toolbar sx={{ gap: 1.25, minHeight: 70, px: { xs: 2, md: 2.5 } }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563eb', fontSize: '0.9rem', fontWeight: 900 }}>TM</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary" noWrap sx={{ letterSpacing: '-0.015em' }}>Tele Member · Quản trị</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>Quà đổi, vòng quay, ví, nhật ký và chẩn đoán hệ thống</Typography>
          </Box>
          <Chip label={admin.token ? 'Đang hoạt động' : 'Ngoại tuyến'} color="success" size="small" />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', borderRight: '1px solid rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, #0c1322 0%, #131c2c 60%, #17243a 100%)', color: '#cbd5e1' } }}>
        <Toolbar sx={{ minHeight: 70 }} />
        <Box sx={{ px: 1.5, py: 1.5 }}>
          <Card sx={{ borderRadius: 2, mb: 1.75, boxShadow: '0 12px 36px rgba(15, 23, 42, 0.18)', bgcolor: 'rgba(255,255,255,0.05)', color: 'inherit', border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent>
              <Stack spacing={0.85}>
                <Typography variant="overline" sx={{ color: 'rgba(148,163,184,0.82)', letterSpacing: '0.12em', lineHeight: 1.2 }}>Khu vực làm việc</Typography>
                <Typography variant="h6" fontWeight={900} sx={{ color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.05 }}>Trung tâm điều khiển</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(203,213,225,0.76)', lineHeight: 1.45 }}>Dựng theo khung gọn, sẵn sàng mở rộng module mới mà không phá layout.</Typography>
                <Stack direction="row" spacing={1} sx={{ pt: 0.5 }} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label="Việt hóa 100%" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)' }} variant="outlined" />
                  <Chip size="small" label="Spacing chặt" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: '#e2e8f0', borderColor: 'rgba(255,255,255,0.1)' }} variant="outlined" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
          <List disablePadding>
            {NAV_ITEMS.map((item) => (
              <ListItemButton key={item.key} selected={admin.activeSection === item.key} onClick={() => admin.setActiveSection(item.key)} sx={{ borderRadius: 1.5, mb: 0.5, px: 1.35, py: 1, color: 'inherit', '& .MuiListItemIcon-root': { color: 'rgba(203,213,225,0.72)', minWidth: 32 }, '& .MuiListItemText-primary': { fontWeight: 650, letterSpacing: '-0.01em' }, '&.Mui-selected': { bgcolor: 'rgba(37,99,235,0.20)', color: '#eff6ff', '& .MuiListItemIcon-root': { color: '#93c5fd' } }, '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' } }}>
                <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ ml: `${DRAWER_WIDTH}px`, pt: 8.5, pb: 4 }}>
        <Container maxWidth="xl">
          <Stack spacing={2.25}>
            {admin.error ? <Alert severity="warning">{admin.error}</Alert> : null}
            {admin.notice ? <Alert severity="success">{admin.notice}</Alert> : null}
            <Card sx={{ borderRadius: 2.25, boxShadow: '0 16px 48px rgba(15,23,42,0.06)', border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Chip label="Bảng quản trị" color="primary" sx={{ mb: 1, fontWeight: 800, px: 0.5 }} />
                    <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.035em', lineHeight: 1.05 }}>Khung quản trị chuyên nghiệp</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 720, mt: 0.75, lineHeight: 1.45 }}>
                      Thanh điều hướng, khối quản lý tách riêng, popup thêm/sửa gọn gàng để thao tác nhanh và dễ mở rộng về sau.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="start" justifyContent="flex-end">
                    <Button variant="outlined" onClick={admin.refreshDebug} disabled={admin.debugLoading}>{admin.debugLoading ? 'Đang tải...' : 'Chẩn đoán biến môi trường'}</Button>
                    <Chip label={`Người dùng ${admin.users.length}`} />
                    <Chip label={`Quà đổi ${admin.rewards.length}`} />
                    <Chip label={`Chiến dịch ${admin.campaigns.length}`} />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {admin.activeSection === 'overview' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                <MetricCard label="Người dùng" value={String(admin.users.length)} note="Tài khoản đang quản lý" accent="blue" />
                <MetricCard label="Giao dịch" value={String(admin.transactions.length)} note="Lịch sử giao dịch" accent="cyan" />
                <MetricCard label="Quà đổi" value={String(admin.rewards.length)} note="Phần thưởng đã tạo" accent="emerald" />
                <MetricCard label="Chiến dịch" value={String(admin.campaigns.length)} note="Chiến dịch vòng quay" accent="violet" />
              </Box>
            ) : null}

            {admin.activeSection === 'overview' ? <OverviewSection users={admin.users} transactions={admin.transactions} rewards={admin.rewards} campaigns={admin.campaigns} /> : null}
            {admin.activeSection === 'users' ? <UsersSection {...admin} /> : null}
            {admin.activeSection === 'transactions' ? <TransactionsSection {...admin} /> : null}
            {admin.activeSection === 'audit' ? <AuditSection auditLogs={admin.auditLogs} handleDebugEnv={admin.refreshDebug} auditFilter={admin.auditFilter} setAuditFilter={admin.setAuditFilter} /> : null}
            {admin.activeSection === 'rewards' ? <RewardsSection {...admin} /> : null}
            {admin.activeSection === 'wheel' ? <WheelSection {...admin} /> : null}
            {admin.activeSection === 'policies' ? (
              <PolicySection
                policies={admin.policies}
                policyVersions={admin.policyVersions}
                selectedPolicyKey={admin.selectedPolicyKey}
                setSelectedPolicyKey={admin.setSelectedPolicyKey}
                policyEditorOpen={admin.policyEditorOpen}
                setPolicyEditorOpen={admin.setPolicyEditorOpen}
                editingPolicy={admin.editingPolicy}
                setEditingPolicy={admin.setEditingPolicy}
                policyScope={admin.policyScope}
                setPolicyScope={admin.setPolicyScope}
                policyTitle={admin.policyTitle}
                setPolicyTitle={admin.setPolicyTitle}
                policyDescription={admin.policyDescription}
                setPolicyDescription={admin.setPolicyDescription}
                policyDataText={admin.policyDataText}
                setPolicyDataText={admin.setPolicyDataText}
                policyNote={admin.policyNote}
                setPolicyNote={admin.setPolicyNote}
                openPolicyEditor={admin.openPolicyEditor}
                handleSavePolicy={admin.handleSavePolicy}
                refreshPolicies={admin.refreshPolicies}
              />
            ) : null}
            {admin.activeSection === 'settings' ? <SettingsSection debugEnv={admin.debugEnv} botInfo={admin.botInfo} debugLoading={admin.debugLoading} handleDebugEnv={admin.refreshDebug} /> : null}

            <UserAdjustDialog
              open={Boolean(admin.selectedUser)}
              user={admin.selectedUser}
              mode={admin.adjustMode}
              amount={admin.adjustAmount}
              setAmount={admin.setAdjustAmount}
              reason={admin.adjustReason}
              setReason={admin.setAdjustReason}
              onModeChange={admin.setAdjustMode}
              onClose={() => admin.setSelectedUser(null)}
              onSubmit={admin.submitUserAdjust}
            />

            <Box sx={{ py: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Thiết kế để mở rộng: sidebar + thẻ nội dung + popup thao tác giúp thêm module mới rất dễ.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
