'use client';

import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AuditTable, TransactionsTable, UsersTable } from './admin-tables';
import { AppSection, MetricCard } from '../../shared-ui';

const dialogPaperSx = {
  borderRadius: 1.5,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 24px 64px rgba(15,23,42,0.14)',
  overflow: 'hidden',
  '& .MuiDialogTitle-root': {
    px: 2.5,
    py: 2,
    fontWeight: 900,
    letterSpacing: '-0.02em',
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: '#f8fafc',
  },
  '& .MuiDialogContent-root': {
    p: 2.5,
    bgcolor: '#ffffff',
  },
  '& .MuiDialogActions-root': {
    px: 2.5,
    py: 2,
    bgcolor: '#f8fafc',
    borderTop: '1px solid',
    borderColor: 'divider',
  },
} as const;

function AdminDialog({
  open,
  onClose,
  title,
  subtitle,
  badge,
  primaryAction,
  secondaryAction,
  maxWidth = 'sm',
  children,
  actions,
  ...rest
}: any) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ sx: { ...dialogPaperSx, ...(rest.PaperProps?.sx ?? {}) } }}
      {...rest}
    >
      <Box sx={{ px: 2.5, py: 2, bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              {badge ? <Chip label={badge} size="small" color="primary" sx={{ mb: 1 }} /> : null}
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>{title}</Typography>
              {subtitle ? <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography> : null}
            </Box>
            {secondaryAction || primaryAction ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" alignItems="center">
                {secondaryAction ? <Box>{secondaryAction}</Box> : null}
                {primaryAction ? <Box>{primaryAction}</Box> : null}
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Box>
      <DialogContent sx={{ p: 2.5, bgcolor: '#ffffff' }}>{children}</DialogContent>
      <DialogActions sx={{ px: 2.5, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid', borderColor: 'divider' }}>
        {actions}
      </DialogActions>
    </Dialog>
  );
}

function getWheelPreset(count: number) {
  if (count === 5) return '5 ô';
  if (count === 6) return '6 ô';
  if (count === 8) return '8 ô';
  if (count >= 10) return '10+ ô';
  return 'tùy chỉnh';
}

function renderModeLabel(value: string) {
  if (value === 'emoji-only') return 'Chỉ biểu tượng';
  if (value === 'label-only') return 'Chỉ nhãn';
  if (value === 'mixed') return 'Kết hợp';
  return value;
}

function deliveryModeLabel(value: string) {
  if (value === 'immediate') return 'Giao ngay';
  if (value === 'inbox') return 'Đưa vào hộp quà';
  if (value === 'claim_required') return 'Cần nhận thủ công';
  if (value === 'external_code') return 'Mã bên ngoài';
  return value;
}

function deliveryTargetLabel(value: string) {
  if (value === 'point_wallet') return 'Ví 🍑';
  if (value === 'spin_wallet') return 'Ví lượt quay';
  if (value === 'reward_inbox') return 'Hộp quà';
  if (value === 'code_pool') return 'Kho mã';
  if (value === 'manual') return 'Thủ công';
  return value;
}

function policyScopeLabel(value: string) {
  if (value === 'currency') return 'Đào';
  if (value === 'reward') return 'Quà đổi';
  if (value === 'delivery') return 'Giao quà';
  if (value === 'wheel') return 'Vòng quay';
  if (value === 'feature_flag') return 'Feature flag';
  return 'Hệ thống';
}

function policyStatusLabel(value: string) {
  if (value === 'published') return 'Đã xuất bản';
  if (value === 'archived') return 'Đã lưu trữ';
  return 'Nháp';
}

export function OverviewSection({ users, transactions, rewards, campaigns }: any) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
      <MetricCard label="Người dùng" value={String(users.length)} note="Tài khoản đang hoạt động" accent="blue" />
      <MetricCard label="Giao dịch" value={String(transactions.length)} note="Lịch sử giao dịch" accent="cyan" />
      <MetricCard label="Quà đổi" value={String(rewards.length)} note="Phần thưởng đã tạo" accent="emerald" />
      <MetricCard label="Chiến dịch" value={String(campaigns.length)} note="Chiến dịch vòng quay" accent="violet" />
    </Box>
  );
}

export function UsersSection(props: any) {
  return (
    <UsersTable
      users={props.users}
      search={props.search}
      onSearchChange={props.setSearch}
      filter={props.userFilter}
      onFilterChange={props.setUserFilter}
      page={props.page}
      pageSize={props.pageSize}
      onPageChange={props.setPage}
      onRowClick={(user) => {
        props.setTelegramId(user.telegramId);
        props.setActiveSection('settings');
      }}
      onAddPoints={(user) => props.openUserAdjust(user, 'points')}
      onAddSpins={(user) => props.openUserAdjust(user, 'spins')}
    />
  );
}

export function TransactionsSection(props: any) {
  return (
    <TransactionsTable
      transactions={props.transactions}
      search={props.search}
      onSearchChange={props.setSearch}
      filter={props.transactionFilter}
      onFilterChange={props.setTransactionFilter}
      page={props.page}
      pageSize={props.pageSize}
      onPageChange={props.setPage}
    />
  );
}

export function AuditSection({ auditLogs, handleDebugEnv, auditFilter, setAuditFilter }: any) {
  return <AuditTable logs={auditLogs} onRefresh={handleDebugEnv} filter={auditFilter} onFilterChange={setAuditFilter} />;
}

function flagLabel(value: unknown) {
  return value ? 'Bật' : 'Tắt';
}

export function FeatureFlagsSection({ featureFlagsLive, policies, openPolicyEditor, refreshPolicies }: any) {
  const featurePolicy = policies.find((policy: any) => policy.policyKey === 'feature_flags') ?? null;
  const published = featurePolicy?.publishedData ?? {};
  const draft = featurePolicy?.draftData ?? {};
  const keys = Array.from(new Set([...Object.keys(published ?? {}), ...Object.keys(draft ?? {}), ...Object.keys(featureFlagsLive ?? {})]));

  return (
    <Stack spacing={2}>
      <AppSection
        title="Cờ tính năng"
        subtitle="Bật/tắt nhanh những phần cần mở theo từng giai đoạn mà không hardcode vào backend."
        accent="violet"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <Button variant="outlined" onClick={refreshPolicies}>Làm mới</Button>
            <Button variant="contained" onClick={() => featurePolicy && openPolicyEditor(featurePolicy)}>Sửa & xuất bản</Button>
          </Stack>
        }
      >
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <MetricCard label="Policy live" value={featurePolicy ? policyStatusLabel(featurePolicy.status) : 'Chưa có'} note={`Scope: ${policyScopeLabel(featurePolicy?.scope ?? 'feature_flag')}`} accent="violet" />
              <MetricCard label="Flag bật" value={String(Object.values(featureFlagsLive ?? {}).filter(Boolean).length)} note="Trạng thái runtime" accent="emerald" />
              <MetricCard label="Flag tổng" value={String(keys.length)} note="Nháp + published" accent="blue" />
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {keys.length ? keys.map((key) => (
                <Chip
                  key={key}
                  label={`${key}: ${flagLabel((featureFlagsLive as any)?.[key] ?? published?.[key] ?? draft?.[key])}`}
                  color={Boolean((featureFlagsLive as any)?.[key] ?? published?.[key] ?? draft?.[key]) ? 'success' : 'default'}
                  variant={Boolean((featureFlagsLive as any)?.[key] ?? published?.[key] ?? draft?.[key]) ? 'filled' : 'outlined'}
                />
              )) : (
                <Typography color="text.secondary">Chưa có cờ tính năng nào.</Typography>
              )}
            </Stack>

            <Box sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
              <Typography fontWeight={800} sx={{ mb: 1 }}>Luồng publish</Typography>
              <Typography variant="body2" color="text.secondary">
                1) Sửa nháp trong policy center. 2) Xem preview trước khi publish. 3) Xuất bản để runtime đọc từ <code>feature_flags</code>.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </AppSection>
    </Stack>
  );
}

function opsStatusLabel(value: string) {
  if (value === 'ok') return 'Ổn định';
  if (value === 'degraded') return 'Suy giảm';
  if (value === 'down') return 'Lỗi';
  return value;
}

function opsSeverityColor(value: string) {
  if (value === 'critical') return 'error';
  if (value === 'error') return 'error';
  if (value === 'warning') return 'warning';
  return 'default';
}

export function OpsSection({
  opsSummary,
  opsEvents,
  opsSeverity,
  setOpsSeverity,
  opsCategory,
  setOpsCategory,
  opsSource,
  setOpsSource,
  opsLoading,
  handleRefreshOps,
}: any) {
  const summary = opsSummary ?? {
    apiStatus: 'ok',
    databaseStatus: 'ok',
    totalUsers: 0,
    activeUsers24h: 0,
    totalRewards: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingInboxItems: 0,
    failedDeliveries24h: 0,
    webhookErrors24h: 0,
    recentErrors: 0,
    uptimeSeconds: 0,
    lastCheckedAt: new Date().toISOString(),
  };

  return (
    <Stack spacing={2}>
      <AppSection
        title="Vận hành & giám sát"
        subtitle="Theo dõi trạng thái API, cơ sở dữ liệu, lỗi webhook và các sự kiện vận hành gần nhất."
        accent="cyan"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <Button variant="outlined" onClick={handleRefreshOps} disabled={opsLoading}>
              {opsLoading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </Stack>
        }
      >
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              <MetricCard label="API" value={opsStatusLabel(summary.apiStatus)} note={`Webhook lỗi ${summary.webhookErrors24h}`} accent="blue" />
              <MetricCard label="CSDL" value={opsStatusLabel(summary.databaseStatus)} note={`Lỗi giao quà ${summary.failedDeliveries24h}`} accent="emerald" />
              <MetricCard label="Người dùng" value={String(summary.totalUsers)} note={`Hoạt động 24h: ${summary.activeUsers24h}`} accent="cyan" />
              <MetricCard label="Hộp quà" value={String(summary.pendingInboxItems)} note={`Quà / chiến dịch: ${summary.totalRewards} / ${summary.totalCampaigns}`} accent="violet" />
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
              <TextField fullWidth label="Lọc category" value={opsCategory} onChange={(e) => setOpsCategory(e.target.value)} />
              <TextField fullWidth label="Lọc source" value={opsSource} onChange={(e) => setOpsSource(e.target.value)} />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Mức độ</InputLabel>
                <Select label="Mức độ" value={opsSeverity} onChange={(e) => setOpsSeverity(e.target.value)}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={1}>
              {opsEvents.length ? opsEvents.map((event: any) => (
                <Box key={event.id} sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} alignItems={{ xs: 'start', md: 'center' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" sx={{ mb: 0.5 }}>
                        <Chip label={event.severity} size="small" color={opsSeverityColor(event.severity)} />
                        <Chip label={event.category} size="small" variant="outlined" />
                        <Chip label={event.source} size="small" variant="outlined" />
                      </Stack>
                      <Typography fontWeight={900}>{event.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{event.message}</Typography>
                    </Box>
                    <Chip label={new Date(event.createdAt).toLocaleString('vi-VN')} size="small" variant="outlined" />
                  </Stack>
                </Box>
              )) : (
                <Typography color="text.secondary">Chưa có sự kiện vận hành nào.</Typography>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>
    </Stack>
  );
}

export function PolicySection(props: any) {
  const selectedPolicy = props.policies.find((policy: any) => policy.policyKey === props.selectedPolicyKey) ?? props.policies[0] ?? null;
  const versions = props.policyVersions ?? [];

  return (
    <Stack spacing={2}>
      <AppSection
        title="Trung tâm chính sách"
        subtitle="Quản lý quy tắc vận hành, bản nháp và bản đã xuất bản."
        accent="violet"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <Button variant="outlined" onClick={props.refreshPolicies}>
              Làm mới
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                const next = selectedPolicy ?? props.policies[0];
                if (next) props.openPolicyEditor(next);
              }}
            >
              Sửa policy
            </Button>
          </Stack>
        }
      >
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {props.policies.map((policy: any) => (
                <Chip
                  key={policy.id}
                  label={policy.title}
                  clickable
                  onClick={() => {
                    props.setSelectedPolicyKey(policy.policyKey);
                    props.openPolicyEditor(policy);
                  }}
                  color={props.selectedPolicyKey === policy.policyKey ? 'primary' : 'default'}
                  variant={props.selectedPolicyKey === policy.policyKey ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>

            <Box
              sx={{
                p: 2,
                borderRadius: 1.25,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: '#fff',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
              }}
            >
              {selectedPolicy ? (
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap">
                    <Box>
                      <Typography fontWeight={900}>{selectedPolicy.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedPolicy.policyKey} • {policyScopeLabel(selectedPolicy.scope)} • {policyStatusLabel(selectedPolicy.status)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                      <Chip label={`ver ${selectedPolicy.currentVersion}`} size="small" />
                      <Chip label={`pub ${selectedPolicy.publishedVersion}`} size="small" variant="outlined" />
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPolicy.description ?? 'Không có mô tả'}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1 }}>
                    <MetricCard label="Nháp" value={String(Object.keys(selectedPolicy.draftData ?? {}).length)} note="Khóa dữ liệu" accent="violet" />
                    <MetricCard label="Đã xuất bản" value={String(Object.keys(selectedPolicy.publishedData ?? {}).length)} note="Khóa dữ liệu" accent="blue" />
                    <MetricCard label="Phiên bản" value={String(selectedPolicy.currentVersion ?? 0)} note="Bản hiện tại" accent="cyan" />
                    <MetricCard label="Lịch sử" value={String(versions.length)} note="Bản ghi version" accent="emerald" />
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">Chưa có policy nào.</Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Lịch sử policy" subtitle="Theo dõi các lần lưu và xuất bản gần nhất." accent="blue">
        <CardContent>
          <Stack spacing={1}>
            {versions.length ? versions.map((version: any) => (
              <Box key={version.id} sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                  <Box>
                    <Typography fontWeight={800}>Phiên bản {version.version}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {policyStatusLabel(version.status)}{version.note ? ` • ${version.note}` : ''}
                    </Typography>
                  </Box>
                  <Chip label={new Date(version.createdAt).toLocaleString('vi-VN')} size="small" variant="outlined" />
                </Stack>
              </Box>
            )) : (
              <Typography color="text.secondary">Chưa có lịch sử version.</Typography>
            )}
          </Stack>
        </CardContent>
      </AppSection>

      <AdminDialog
        open={Boolean(props.policyEditorOpen)}
        onClose={() => props.setPolicyEditorOpen(false)}
        maxWidth="md"
        title={props.editingPolicy ? `Sửa policy: ${props.editingPolicy.title}` : 'Sửa policy'}
        subtitle="Chỉnh thông tin policy, dữ liệu JSON nháp và xuất bản khi đã sẵn sàng."
        badge="Chính sách"
        primaryAction={<Button variant="contained" onClick={() => props.handleSavePolicy(true)}>Xuất bản</Button>}
        secondaryAction={<Button variant="outlined" onClick={() => props.handleSavePolicy(false)}>Lưu nháp</Button>}
        actions={
          <>
            <Button onClick={() => props.setPolicyEditorOpen(false)}>Đóng</Button>
          </>
        }
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField fullWidth label="Mã policy" value={props.editingPolicy?.policyKey ?? ''} InputProps={{ readOnly: true }} />
            <FormControl fullWidth>
              <InputLabel>Nhóm</InputLabel>
              <Select label="Nhóm" value={props.policyScope} onChange={(e) => props.setPolicyScope(e.target.value)}>
                <MenuItem value="system">Hệ thống</MenuItem>
                <MenuItem value="currency">Đào</MenuItem>
                <MenuItem value="reward">Quà đổi</MenuItem>
                <MenuItem value="delivery">Giao quà</MenuItem>
                <MenuItem value="wheel">Vòng quay</MenuItem>
                <MenuItem value="feature_flag">Feature flag</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField label="Tiêu đề" value={props.policyTitle} onChange={(e) => props.setPolicyTitle(e.target.value)} />
          <TextField label="Mô tả" value={props.policyDescription} onChange={(e) => props.setPolicyDescription(e.target.value)} multiline minRows={2} />
          <TextField
            label="Dữ liệu JSON"
            value={props.policyDataText}
            onChange={(e) => props.setPolicyDataText(e.target.value)}
            multiline
            minRows={12}
            sx={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
          />
          <TextField label="Ghi chú version" value={props.policyNote} onChange={(e) => props.setPolicyNote(e.target.value)} />
        </Stack>
      </AdminDialog>
    </Stack>
  );
}

export function RewardsSection(props: any) {
  return (
    <Stack spacing={2}>
      <AppSection
        title="Quà đổi"
        subtitle="Tạo, sửa, nhập mã và quản lý tồn kho."
        accent="emerald"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => props.setImportCodesOpen(true)}>
              Nhập mã
            </Button>
            <Button variant="contained" onClick={() => props.setCreateRewardOpen(true)}>
              Thêm mới
            </Button>
          </Stack>
        }
      >
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={1.25}>
            {props.rewards.map((reward: any) => {
              const pointCost = reward.pointCost ?? 0;
              const stock = reward.stock ?? null;
              const isActive = reward.isActive ?? true;
              return (
                <Box
                  key={reward.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#fff',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <Typography fontWeight={800}>{reward.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reward.type} | giá {pointCost} 🍑 | tồn kho {stock ?? '∞'} | {isActive ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      props.setEditingReward(reward);
                      props.setEditRewardName(reward.name);
                      props.setEditRewardType(reward.type);
                      props.setEditRewardPointCost(pointCost);
                      props.setEditRewardStock(stock === null ? '' : String(stock));
                    }}
                  >
                    Sửa
                  </Button>
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </AppSection>

      <AdminDialog
        open={Boolean(props.editingReward)}
        onClose={() => props.setEditingReward(null)}
        title="Sửa quà đổi"
        subtitle="Cập nhật tên, loại, giá 🍑 và tồn kho."
        badge="Quà đổi"
        actions={
          <>
            <Button onClick={() => props.setEditingReward(null)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleUpdateReward}>Lưu</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên quà" value={props.editRewardName} onChange={(e) => props.setEditRewardName(e.target.value)} />
            <TextField label="Loại quà" value={props.editRewardType} onChange={(e) => props.setEditRewardType(e.target.value)} />
            <TextField label="Giá 🍑" type="number" value={props.editRewardPointCost} onChange={(e) => props.setEditRewardPointCost(Number(e.target.value))} />
            <TextField label="Tồn kho" value={props.editRewardStock} onChange={(e) => props.setEditRewardStock(e.target.value)} />
          </Stack>
      </AdminDialog>

      <AdminDialog
        open={Boolean(props.createRewardOpen)}
        onClose={() => props.setCreateRewardOpen(false)}
        title="Thêm quà đổi"
        subtitle="Tạo quà mới cho mini app và admin đổi đào."
        badge="Quà đổi"
        actions={
          <>
            <Button onClick={() => props.setCreateRewardOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleCreateReward}>Tạo mới</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên quà" value={props.rewardName} onChange={(e) => props.setRewardName(e.target.value)} />
            <TextField label="Loại quà" value={props.rewardType} onChange={(e) => props.setRewardType(e.target.value)} />
            <TextField label="Giá 🍑" type="number" value={props.rewardPointCost} onChange={(e) => props.setRewardPointCost(Number(e.target.value))} />
          </Stack>
      </AdminDialog>

      <AdminDialog
        open={Boolean(props.importCodesOpen)}
        onClose={() => props.setImportCodesOpen(false)}
        title="Nhập mã quà"
        subtitle="Dán danh sách mã theo từng dòng để nạp nhanh vào kho."
        badge="Kho mã"
        actions={
          <>
            <Button onClick={() => props.setImportCodesOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleImportCodes}>Nhập mã</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="ID quà" value={props.importRewardId} onChange={(e) => props.setImportRewardId(e.target.value)} />
            <TextField label="Danh sách mã" placeholder="Mỗi dòng một mã" value={props.importCodesText} onChange={(e) => props.setImportCodesText(e.target.value)} multiline minRows={5} />
          </Stack>
      </AdminDialog>
    </Stack>
  );
}

export function WheelSection(props: any) {
  const previewPrizes = props.wheelPreview?.prizes ?? props.wheelPrizes;
  const previewPreset = getWheelPreset(previewPrizes.length);

  return (
    <Stack spacing={2}>
      <AppSection
        title="Chiến dịch vòng quay"
        subtitle="Quản lý chiến dịch và danh sách phần thưởng."
        accent="violet"
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            <Button variant="outlined" onClick={() => props.setCreateCampaignOpen(true)}>
              Thêm chiến dịch
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                if (!props.selectedWheelCampaignId && props.campaigns[0]?.id) {
                  props.setSelectedWheelCampaignId(props.campaigns[0].id);
                  props.setPrizeCampaignId(props.campaigns[0].id);
                }
                props.setCreatePrizeOpen(true);
              }}
            >
              Thêm phần thưởng
            </Button>
          </Stack>
        }
      >
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {props.campaigns.map((campaign: any) => (
                <Chip
                  key={campaign.id}
                label={campaign.name}
                  clickable
                  onClick={() => {
                    props.setSelectedWheelCampaignId(campaign.id);
                    props.setPrizeCampaignId(campaign.id);
                  }}
                  color={props.selectedWheelCampaignId === campaign.id ? 'primary' : 'default'}
                  variant={props.selectedWheelCampaignId === campaign.id ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
            {props.campaigns.map((campaign: any) => {
              const isActive = campaign.isActive ?? true;
              return (
                <Box
                  key={campaign.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 1.25,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#fff',
                    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                    <Box>
                      <Typography fontWeight={800}>{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.description ?? 'Chưa có mô tả'} • {isActive ? 'Đang bật' : 'Đang tắt'}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        props.setEditingCampaign(campaign);
                        props.setEditCampaignName(campaign.name);
                        props.setEditCampaignDescription(campaign.description ?? '');
                        props.setEditCampaignActive(Boolean(isActive));
                      }}
                    >
                      Sửa
                    </Button>
                  </Stack>
                </Box>
              );
            })}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Bảng phần thưởng" subtitle="Sửa nhanh emoji, nhãn và trọng số cho từng lát." accent="blue">
        <CardContent>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Chiến dịch hiện tại: <b>{props.selectedWheelCampaignId || '—'}</b>
              </Typography>
              <Chip label={`${props.wheelPrizes.length} quà`} size="small" />
            </Stack>

            <Divider />

            <Stack spacing={1}>
              {props.wheelPrizes.map((prize: any) => {
                const isActive = prize.isActive ?? true;
                return (
                  <Box key={prize.id} sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
                      <Box>
                        <Typography fontWeight={800}>
                          {String(prize.metadata?.glyph ?? prize.metadata?.wheelGlyph ?? prize.metadata?.icon ?? prize.metadata?.emoji ?? '✦')} {prize.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {prize.type} • trọng số {prize.weight} • tồn kho {prize.stock ?? '∞'} • {isActive ? 'Đang bật' : 'Đang tắt'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {String(prize.metadata?.wheelLabel ?? prize.name)} / {String(prize.metadata?.railLabel ?? prize.name)} / {deliveryModeLabel(String(prize.metadata?.deliveryMode ?? 'immediate'))} / {deliveryTargetLabel(String(prize.metadata?.deliveryTarget ?? 'reward_inbox'))} / {renderModeLabel(String(prize.metadata?.wheelRenderMode ?? prize.metadata?.renderMode ?? prize.metadata?.labelMode ?? 'emoji-only'))}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          props.setEditingPrize(prize);
                          props.setEditPrizeName(prize.name);
                          props.setEditPrizeType(prize.type);
                          props.setEditPrizeWeight(prize.weight);
                          props.setEditPrizeStock(prize.stock === null ? '' : String(prize.stock));
                          props.setEditPrizeGlyph(String(prize.metadata?.glyph ?? prize.metadata?.wheelGlyph ?? prize.metadata?.icon ?? prize.metadata?.emoji ?? '⭐'));
                          props.setEditPrizeEmojiCount(Number(prize.metadata?.emojiCount ?? 1));
                          props.setEditPrizeRenderMode(String(prize.metadata?.wheelRenderMode ?? prize.metadata?.renderMode ?? prize.metadata?.labelMode ?? 'emoji-only'));
                          props.setEditPrizeDeliveryMode(String(prize.metadata?.deliveryMode ?? 'immediate'));
                          props.setEditPrizeDeliveryTarget(String(prize.metadata?.deliveryTarget ?? 'point_wallet'));
                          props.setEditPrizeWheelLabel(String(prize.metadata?.wheelLabel ?? ''));
                          props.setEditPrizeRailLabel(String(prize.metadata?.railLabel ?? ''));
                          props.setEditPrizeDescription(String(prize.metadata?.description ?? ''));
                          props.setEditPrizeActive(Boolean(isActive));
                        }}
                      >
                        Sửa
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Lịch sử trúng" subtitle="Theo dõi các lượt quay gần đây." accent="emerald">
        <CardContent>
          <Stack spacing={1}>
              {props.wheelSpins.slice(0, 10).map((spin: any) => (
                <Box key={spin.id} sx={{ p: 1.25, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Typography fontWeight={800}>{spin.displayName ?? spin.username ?? spin.userId}</Typography>
                  <Typography variant="body2" color="text.secondary">
                  {spin.prizeName ?? spin.resultLabel ?? 'Không trúng'} • {new Date(spin.createdAt).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              ))}
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Xem trước xác suất" subtitle="Xác suất theo trọng số và trạng thái đang bật của chiến dịch đang chọn." accent="violet">
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Tổng trọng số: <b>{props.wheelPreview?.totalWeight ?? 0}</b>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Chip label={`${previewPrizes.length} phần thưởng`} size="small" />
                <Chip label={`preset: ${previewPreset}`} size="small" variant="outlined" />
              </Stack>
            </Stack>
            <Stack spacing={1}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
                {previewPrizes.map((prize: any, index: number) => {
                  const renderMode = String(prize.renderMode ?? prize.metadata?.wheelRenderMode ?? prize.metadata?.renderMode ?? prize.metadata?.labelMode ?? 'emoji-only');
                  const glyph = String(prize.glyph ?? prize.metadata?.glyph ?? '✦');
                  const slotTone = ['#2f64e4', '#4b7bff', '#7aaaff', '#1f3d9b'][index % 4];
                  return (
                    <Box key={prize.id} sx={{ p: 1.25, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box sx={{ width: 36, height: 36, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: slotTone, color: '#fff', fontSize: '1rem', fontWeight: 900, flex: '0 0 auto' }}>
                            {glyph}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} noWrap>{prize.name}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>{prize.type} • trọng số {prize.weight} • tỷ lệ {Number(prize.chance ?? 0).toFixed(2)}%</Typography>
                          </Box>
                        </Stack>
                        <Chip label={renderMode} size="small" variant="outlined" />
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        <Chip label={String(prize.deliveryMode ?? prize.metadata?.deliveryMode ?? 'immediate')} size="small" variant="outlined" />
                        <Chip label={String(prize.deliveryTarget ?? prize.metadata?.deliveryTarget ?? 'reward_inbox')} size="small" variant="outlined" />
                        <Chip label={`ô ${index + 1}`} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AdminDialog
        open={Boolean(props.editingCampaign)}
        onClose={() => props.setEditingCampaign(null)}
        title="Sửa chiến dịch vòng quay"
        subtitle="Đổi tên, mô tả và trạng thái chiến dịch đang chọn."
        badge="Chiến dịch"
        actions={
          <>
            <Button onClick={() => props.setEditingCampaign(null)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleUpdateCampaign}>Lưu</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên chiến dịch" value={props.editCampaignName} onChange={(e) => props.setEditCampaignName(e.target.value)} />
            <TextField label="Mô tả chiến dịch" value={props.editCampaignDescription} onChange={(e) => props.setEditCampaignDescription(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={props.editCampaignActive ? 'true' : 'false'} onChange={(e) => props.setEditCampaignActive(e.target.value === 'true')}>
                <MenuItem value="true">Đang bật</MenuItem>
                <MenuItem value="false">Đang tắt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
      </AdminDialog>

      <AdminDialog
        open={Boolean(props.createCampaignOpen)}
        onClose={() => props.setCreateCampaignOpen(false)}
        title="Thêm chiến dịch"
        subtitle="Tạo chiến dịch vòng quay mới."
        badge="Chiến dịch"
        actions={
          <>
            <Button onClick={() => props.setCreateCampaignOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleCreateCampaign}>Tạo chiến dịch</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên chiến dịch" value={props.campaignName} onChange={(e) => props.setCampaignName(e.target.value)} />
          </Stack>
      </AdminDialog>

      <AdminDialog
        open={Boolean(props.createPrizeOpen)}
        onClose={() => props.setCreatePrizeOpen(false)}
        title="Thêm phần thưởng"
        subtitle="Thiết lập emoji, nhãn, hiển thị và cách giao quà."
        badge="Phần thưởng"
        actions={
          <>
            <Button onClick={() => props.setCreatePrizeOpen(false)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleCreatePrize}>Tạo phần thưởng</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Mã chiến dịch" value={props.prizeCampaignId} onChange={(e) => props.setPrizeCampaignId(e.target.value)} />
            <TextField label="Tên phần thưởng" value={props.prizeName} onChange={(e) => props.setPrizeName(e.target.value)} />
            <TextField label="Loại phần thưởng" value={props.prizeType} onChange={(e) => props.setPrizeType(e.target.value)} />
            <TextField label="Trọng số" type="number" value={props.prizeWeight} onChange={(e) => props.setPrizeWeight(Number(e.target.value))} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Emoji / biểu tượng" placeholder="Ví dụ: 🍑" value={props.prizeGlyph} onChange={(e) => props.setPrizeGlyph(e.target.value)} />
              <TextField fullWidth label="Số emoji" type="number" value={props.prizeEmojiCount} onChange={(e) => props.setPrizeEmojiCount(Number(e.target.value))} />
              <TextField fullWidth label="Nhãn vòng quay" placeholder="Hiển thị trên vòng" value={props.prizeWheelLabel} onChange={(e) => props.setPrizeWheelLabel(e.target.value)} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Chế độ hiển thị</InputLabel>
              <Select label="Chế độ hiển thị" value={props.prizeRenderMode} onChange={(e) => props.setPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Chỉ biểu tượng</MenuItem>
                <MenuItem value="label-only">Chỉ nhãn</MenuItem>
                <MenuItem value="mixed">Kết hợp</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Cách giao quà</InputLabel>
                <Select label="Cách giao quà" value={props.prizeDeliveryMode} onChange={(e) => props.setPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Giao ngay</MenuItem>
                  <MenuItem value="inbox">Đưa vào hộp quà</MenuItem>
                  <MenuItem value="claim_required">Cần nhận thủ công</MenuItem>
                  <MenuItem value="external_code">Mã bên ngoài</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Đích giao quà</InputLabel>
                <Select label="Đích giao quà" value={props.prizeDeliveryTarget} onChange={(e) => props.setPrizeDeliveryTarget(e.target.value)}>
                  <MenuItem value="point_wallet">Ví 🍑</MenuItem>
                  <MenuItem value="spin_wallet">Ví lượt quay</MenuItem>
                  <MenuItem value="reward_inbox">Hộp quà</MenuItem>
                  <MenuItem value="code_pool">Kho mã</MenuItem>
                  <MenuItem value="manual">Thủ công</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Nhãn danh sách" placeholder="Hiển thị ở rail bên dưới" value={props.prizeRailLabel} onChange={(e) => props.setPrizeRailLabel(e.target.value)} />
            <TextField label="Mô tả" placeholder="Mô tả ngắn cho admin" value={props.prizeDescription} onChange={(e) => props.setPrizeDescription(e.target.value)} multiline minRows={2} />
          </Stack>
      </AdminDialog>

      <AdminDialog
        open={Boolean(props.editingPrize)}
        onClose={() => props.setEditingPrize(null)}
        title="Sửa phần thưởng"
        subtitle="Chỉnh emoji, nhãn, cách giao và trạng thái phần thưởng."
        badge="Phần thưởng"
        actions={
          <>
            <Button onClick={() => props.setEditingPrize(null)}>Hủy</Button>
            <Button variant="contained" onClick={props.handleUpdatePrize}>Lưu</Button>
          </>
        }
      >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên phần thưởng" value={props.editPrizeName} onChange={(e) => props.setEditPrizeName(e.target.value)} />
            <TextField label="Loại phần thưởng" value={props.editPrizeType} onChange={(e) => props.setEditPrizeType(e.target.value)} />
            <TextField label="Trọng số" type="number" value={props.editPrizeWeight} onChange={(e) => props.setEditPrizeWeight(Number(e.target.value))} />
            <TextField label="Tồn kho" value={props.editPrizeStock} onChange={(e) => props.setEditPrizeStock(e.target.value)} />
            <TextField label="Emoji / biểu tượng" placeholder="Ví dụ: 🍑" value={props.editPrizeGlyph} onChange={(e) => props.setEditPrizeGlyph(e.target.value)} />
            <TextField label="Số emoji" type="number" value={props.editPrizeEmojiCount} onChange={(e) => props.setEditPrizeEmojiCount(Number(e.target.value))} />
            <FormControl fullWidth>
              <InputLabel>Chế độ hiển thị</InputLabel>
                <Select label="Chế độ hiển thị" value={props.editPrizeRenderMode} onChange={(e) => props.setEditPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Chỉ biểu tượng</MenuItem>
                <MenuItem value="label-only">Chỉ nhãn</MenuItem>
                <MenuItem value="mixed">Kết hợp</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Cách giao quà</InputLabel>
                <Select label="Cách giao quà" value={props.editPrizeDeliveryMode} onChange={(e) => props.setEditPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Giao ngay</MenuItem>
                  <MenuItem value="inbox">Đưa vào hộp quà</MenuItem>
                  <MenuItem value="claim_required">Cần nhận thủ công</MenuItem>
                  <MenuItem value="external_code">Mã bên ngoài</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Đích giao quà</InputLabel>
                <Select label="Đích giao quà" value={props.editPrizeDeliveryTarget} onChange={(e) => props.setEditPrizeDeliveryTarget(e.target.value)}>
                  <MenuItem value="point_wallet">Ví 🍑</MenuItem>
                  <MenuItem value="spin_wallet">Ví lượt quay</MenuItem>
                  <MenuItem value="reward_inbox">Hộp quà</MenuItem>
                  <MenuItem value="code_pool">Kho mã</MenuItem>
                  <MenuItem value="manual">Thủ công</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Nhãn vòng quay" placeholder="Hiển thị trên vòng quay" value={props.editPrizeWheelLabel} onChange={(e) => props.setEditPrizeWheelLabel(e.target.value)} />
            <TextField label="Nhãn danh sách" placeholder="Hiển thị ở rail bên dưới" value={props.editPrizeRailLabel} onChange={(e) => props.setEditPrizeRailLabel(e.target.value)} />
            <TextField label="Mô tả" placeholder="Mô tả ngắn cho admin" value={props.editPrizeDescription} onChange={(e) => props.setEditPrizeDescription(e.target.value)} multiline minRows={2} />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={props.editPrizeActive ? 'true' : 'false'} onChange={(e) => props.setEditPrizeActive(e.target.value === 'true')}>
                <MenuItem value="true">Đang bật</MenuItem>
                <MenuItem value="false">Đang tắt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
      </AdminDialog>
    </Stack>
  );
}

export function SettingsSection({ debugEnv, botInfo, debugLoading, handleDebugEnv }: any) {
  return (
    <AppSection title="Cài đặt & chẩn đoán" subtitle="Xem cấu hình hệ thống và định danh bot Telegram." accent="blue">
      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading} sx={{ alignSelf: 'flex-start' }}>
            {debugLoading ? 'Đang tải...' : 'Chẩn đoán biến môi trường'}
          </Button>
          {debugEnv ? (
            <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(2,6,23,0.04)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(debugEnv, null, 2)}
            </Box>
          ) : null}
          {botInfo ? (
            <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(15,118,110,0.06)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(botInfo, null, 2)}
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </AppSection>
  );
}

export function UserAdjustDialog({
  open,
  user,
  mode,
  amount,
  setAmount,
  reason,
  setReason,
  onModeChange,
  onClose,
  onSubmit,
}: any) {
  return (
    <AdminDialog
      open={Boolean(open && user)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      title={mode === 'points' ? 'Cộng 🍑' : 'Cộng lượt quay'}
      subtitle={user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || `@${user.username ?? user.telegramId}` : 'Chọn người dùng để điều chỉnh'}
      badge="Điều chỉnh"
      actions={
        <>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="contained" onClick={onSubmit}>Lưu</Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <ToggleButtonGroup exclusive value={mode} onChange={(_, value) => value && onModeChange(value)} size="small">
          <ToggleButton value="points">🍑</ToggleButton>
          <ToggleButton value="spins">Lượt quay</ToggleButton>
        </ToggleButtonGroup>
        <TextField label="Số lượng" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        <TextField label="Lý do" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Stack>
    </AdminDialog>
  );
}
