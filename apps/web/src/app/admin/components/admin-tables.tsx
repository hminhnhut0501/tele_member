'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

async function copyText(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export type AdminUser = {
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

export type AdminTransaction = {
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

export type AdminAuditLog = {
  id: string;
  actorEmail: string;
  action: string;
  targetTelegramId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

function TableActionBar({
  count,
  onClear,
  primary,
  secondary,
}: {
  count: number;
  onClear: () => void;
  primary?: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'start', md: 'center' }}
      spacing={1.5}
    >
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
        <Chip label={`${count} đã chọn`} size="small" color="primary" variant="outlined" />
        {secondary}
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
        {primary}
        <Button size="small" variant="text" onClick={onClear} disabled={count === 0}>
          Bỏ chọn
        </Button>
      </Stack>
    </Stack>
  );
}

export function UsersTable({
  users,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  page,
  pageSize,
  onPageChange,
  onRowClick,
  onAddPoints,
  onAddSpins,
}: {
  users: AdminUser[];
  search: string;
  onSearchChange: (value: string) => void;
  filter: 'all' | 'has_username' | 'high_balance' | 'missing_checkin';
  onFilterChange: (value: 'all' | 'has_username' | 'high_balance' | 'missing_checkin') => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (user: AdminUser) => void;
  onAddPoints: (user: AdminUser) => void;
  onAddSpins: (user: AdminUser) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.toLowerCase();
      const username = String(user.username ?? '').toLowerCase();
      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        username.includes(term) ||
        String(user.telegramId).includes(term);
      if (!matchesSearch) return false;
      if (filter === 'has_username') return Boolean(user.username);
      if (filter === 'high_balance') return Number(user.balance ?? 0) >= 50;
      if (filter === 'missing_checkin') return !user.lastCheckinDate;
      return true;
    });
  }, [filter, search, users]);

  const selectedUsers = useMemo(() => filtered.filter((user) => selectedIds.includes(user.id)), [filtered, selectedIds]);
  const allSelected = filtered.length > 0 && selectedIds.length > 0 && filtered.every((user) => selectedIds.includes(user.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 1.25 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Người dùng</Typography>
              <Typography variant="body2" color="text.secondary">Bảng sạch, có lọc và thao tác nhanh theo từng người dùng.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
              <Chip label={`${filtered.length} người dùng`} size="small" color="primary" variant="outlined" />
              <Button size="small" variant="text" onClick={() => { onSearchChange(''); onFilterChange('all'); setSelectedIds([]); }}>
                Xóa bộ lọc
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'has_username', label: 'Có username' },
              { value: 'high_balance', label: '🍑 cao' },
              { value: 'missing_checkin', label: 'Chưa check-in' },
            ].map((item) => (
              <Chip
                key={item.value}
                clickable
                label={item.label}
                color={filter === item.value ? 'primary' : 'default'}
                variant={filter === item.value ? 'filled' : 'outlined'}
                onClick={() => onFilterChange(item.value as any)}
              />
            ))}
            <TextField
              size="small"
              label="Tìm người dùng"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 300 }, ml: { xs: 0, md: 'auto' } }}
            />
          </Stack>

          {(selectedIds.length > 0) ? (
            <Box sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(37,99,235,0.04)' }}>
              <TableActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                secondary={<Chip label={`${selectedUsers.length} trong bộ lọc`} size="small" variant="outlined" />}
                primary={
                  <>
                    <Button size="small" variant="outlined" onClick={() => selectedUsers.forEach(onAddPoints)}>
                      Cộng 🍑 hàng loạt
                    </Button>
                    <Button size="small" variant="outlined" onClick={() => selectedUsers.forEach(onAddSpins)}>
                      Cộng lượt quay hàng loạt
                    </Button>
                  </>
                }
              />
            </Box>
          ) : null}

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 820, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(_, checked) => setSelectedIds(checked ? filtered.map((user) => user.id) : [])}
                    />
                  </TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>ID Telegram</TableCell>
                  <TableCell>🍑</TableCell>
                  <TableCell>Check-in gần nhất</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length ? filtered.map((user) => {
                  const checked = selectedIds.includes(user.id);
                  return (
                    <TableRow key={user.id} hover selected={checked} sx={{ '&:hover': { bgcolor: 'rgba(37,99,235,0.03)' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={checked} onChange={(_, next) => setSelectedIds((current) => next ? [...current, user.id] : current.filter((id) => id !== user.id))} />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.15}>
                          <Typography fontWeight={800}>{user.firstName ?? ''} {user.lastName ?? ''}</Typography>
                          <Typography variant="body2" color="text.secondary">@{user.username ?? '-'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{user.telegramId}</TableCell>
                      <TableCell>
                        <Chip label={user.balance} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{formatDateTime(user.lastCheckinDate)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                          <Button size="small" variant="outlined" onClick={() => onAddPoints(user)}>Cộng 🍑</Button>
                          <Button size="small" variant="outlined" onClick={() => onAddSpins(user)}>Cộng lượt quay</Button>
                          <Button size="small" variant="contained" onClick={() => onRowClick(user)}>Xem</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        Chưa có người dùng phù hợp với bộ lọc hiện tại.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={-1}
            page={page}
            onPageChange={(_, next) => onPageChange(next)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function TransactionsTable({
  transactions,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  page,
  pageSize,
  onPageChange,
}: {
  transactions: AdminTransaction[];
  search: string;
  onSearchChange: (value: string) => void;
  filter: 'all' | 'points' | 'spins' | 'negative';
  onFilterChange: (value: 'all' | 'points' | 'spins' | 'negative') => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return transactions.filter((tx) => {
      const fullName = `${tx.firstName ?? ''} ${tx.lastName ?? ''}`.toLowerCase();
      const username = String(tx.username ?? '').toLowerCase();
      const reason = String(tx.reason ?? '').toLowerCase();
      const type = String(tx.type ?? '').toLowerCase();
      const matchesSearch =
        !term ||
        fullName.includes(term) ||
        username.includes(term) ||
        reason.includes(term) ||
        type.includes(term) ||
        String(tx.telegramId).includes(term);
      if (!matchesSearch) return false;
      if (filter === 'points') return type.includes('point') || reason.includes('point') || reason.includes('🍑');
      if (filter === 'spins') return type.includes('spin') || reason.includes('spin');
      if (filter === 'negative') return Number(tx.amount ?? 0) < 0;
      return true;
    });
  }, [filter, search, transactions]);

  const selectedRows = useMemo(() => filtered.filter((tx) => selectedIds.includes(tx.id)), [filtered, selectedIds]);
  const allSelected = filtered.length > 0 && selectedIds.length > 0 && filtered.every((tx) => selectedIds.includes(tx.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 1.25 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Giao dịch</Typography>
              <Typography variant="body2" color="text.secondary">Theo dõi cộng trừ 🍑 và lượt quay theo thời gian.</Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end" useFlexGap>
              <Chip label={`${filtered.length} giao dịch`} size="small" color="primary" variant="outlined" />
              <Button size="small" variant="text" onClick={() => { onSearchChange(''); onFilterChange('all'); setSelectedIds([]); }}>
                Xóa bộ lọc
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'points', label: '🍑' },
              { value: 'spins', label: 'Lượt quay' },
              { value: 'negative', label: 'Trừ' },
            ].map((item) => (
              <Chip
                key={item.value}
                clickable
                label={item.label}
                color={filter === item.value ? 'primary' : 'default'}
                variant={filter === item.value ? 'filled' : 'outlined'}
                onClick={() => onFilterChange(item.value as any)}
              />
            ))}
            <TextField
              size="small"
              label="Tìm giao dịch"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ minWidth: { xs: '100%', md: 300 }, ml: { xs: 0, md: 'auto' } }}
            />
          </Stack>

          {(selectedIds.length > 0) ? (
            <Box sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(37,99,235,0.04)' }}>
              <TableActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                secondary={<Chip label={`${selectedRows.length} trong bộ lọc`} size="small" variant="outlined" />}
                primary={
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        const text = selectedRows.map((row) => [
                          `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
                          row.telegramId,
                          row.amount,
                          row.type,
                          row.reason,
                        ].join('\t')).join('\n');
                        await copyText(text);
                      }}
                    >
                      Sao chép
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const header = ['Tên', 'ID Telegram', 'Số lượng', 'Loại', 'Lý do'];
                        const rows = selectedRows.map((row) => [
                          `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim(),
                          row.telegramId,
                          String(row.amount),
                          row.type,
                          row.reason,
                        ]);
                        const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
                        downloadText(`giao-dich-da-chon-${Date.now()}.csv`, csv);
                      }}
                    >
                      Xuất CSV
                    </Button>
                  </>
                }
              />
            </Box>
          ) : null}

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(_, checked) => setSelectedIds(checked ? filtered.map((tx) => tx.id) : [])}
                    />
                  </TableCell>
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Lý do</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length ? filtered.map((tx) => {
                  const checked = selectedIds.includes(tx.id);
                  return (
                    <TableRow key={tx.id} hover selected={checked} sx={{ '&:hover': { bgcolor: 'rgba(37,99,235,0.03)' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={checked} onChange={(_, next) => setSelectedIds((current) => next ? [...current, tx.id] : current.filter((id) => id !== tx.id))} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={800}>{tx.firstName ?? ''} {tx.lastName ?? ''}</Typography>
                        <Typography variant="body2" color="text.secondary">@{tx.username ?? '-'} | {tx.telegramId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tx.amount > 0 ? `+${tx.amount}` : tx.amount} size="small" color={tx.amount > 0 ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell><Chip label={tx.type} size="small" variant="outlined" /></TableCell>
                      <TableCell>{tx.reason}</TableCell>
                      <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        Chưa có giao dịch nào trong trang này.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={-1}
            page={page}
            onPageChange={(_, next) => onPageChange(next)}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[pageSize]}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function AuditTable({
  logs,
  onRefresh,
  filter,
  onFilterChange,
}: {
  logs: AdminAuditLog[];
  onRefresh?: () => void;
  filter: 'all' | 'create' | 'update' | 'import' | 'debug';
  onFilterChange: (value: 'all' | 'create' | 'update' | 'import' | 'debug') => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const action = String(log.action ?? '').toLowerCase();
      if (filter === 'create') return action.includes('create') || action.includes('tạo');
      if (filter === 'update') return action.includes('update') || action.includes('sửa') || action.includes('lưu');
      if (filter === 'import') return action.includes('import') || action.includes('nhập');
      if (filter === 'debug') return action.includes('debug') || action.includes('env');
      return true;
    });
  }, [filter, logs]);

  const selectedLogs = useMemo(() => filtered.filter((log) => selectedIds.includes(log.id)), [filtered, selectedIds]);
  const allSelected = filtered.length > 0 && selectedIds.length > 0 && filtered.every((log) => selectedIds.includes(log.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  return (
    <Card sx={{ overflow: 'hidden', borderRadius: 1.25 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>Nhật ký</Typography>
              <Typography variant="body2" color="text.secondary">Ghi nhận các thao tác quản trị gần nhất.</Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end" useFlexGap>
              <Chip label={`${filtered.length} mục`} size="small" color="primary" variant="outlined" />
              {onRefresh ? <Button variant="outlined" onClick={onRefresh}>Làm mới</Button> : null}
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'create', label: 'Tạo mới' },
              { value: 'update', label: 'Cập nhật' },
              { value: 'import', label: 'Nhập mã' },
              { value: 'debug', label: 'Chẩn đoán' },
            ].map((item) => (
              <Chip
                key={item.value}
                clickable
                label={item.label}
                color={filter === item.value ? 'primary' : 'default'}
                variant={filter === item.value ? 'filled' : 'outlined'}
                onClick={() => onFilterChange(item.value as any)}
              />
            ))}
          </Stack>

          {(selectedIds.length > 0) ? (
            <Box sx={{ p: 1.5, borderRadius: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(37,99,235,0.04)' }}>
              <TableActionBar
                count={selectedIds.length}
                onClear={() => setSelectedIds([])}
                secondary={<Chip label={`${selectedLogs.length} trong bộ lọc`} size="small" variant="outlined" />}
                primary={
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        const text = selectedLogs.map((row) => [
                          row.action,
                          row.actorEmail,
                          row.targetTelegramId ?? '-',
                          formatDateTime(row.createdAt),
                        ].join('\t')).join('\n');
                        await copyText(text);
                      }}
                    >
                      Sao chép
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const header = ['Hành động', 'Người thực hiện', 'Đối tượng', 'Thời gian'];
                        const rows = selectedLogs.map((row) => [
                          row.action,
                          row.actorEmail,
                          row.targetTelegramId ?? '-',
                          formatDateTime(row.createdAt),
                        ]);
                        const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
                        downloadText(`nhat-ky-da-chon-${Date.now()}.csv`, csv);
                      }}
                    >
                      Xuất CSV
                    </Button>
                  </>
                }
              />
            </Box>
          ) : null}

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760, '& .MuiTableCell-root': { whiteSpace: 'nowrap' } }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(_, checked) => setSelectedIds(checked ? filtered.map((log) => log.id) : [])}
                    />
                  </TableCell>
                  <TableCell>Hành động</TableCell>
                  <TableCell>Người thực hiện</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Thời gian</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length ? filtered.map((log) => {
                  const checked = selectedIds.includes(log.id);
                  return (
                    <TableRow key={log.id} hover selected={checked} sx={{ '&:hover': { bgcolor: 'rgba(37,99,235,0.03)' } }}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={checked} onChange={(_, next) => setSelectedIds((current) => next ? [...current, log.id] : current.filter((id) => id !== log.id))} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>{log.action}</Typography>
                        <Typography variant="body2" color="text.secondary">{Object.keys(log.metadata ?? {}).length ? 'Có metadata' : 'Không có metadata'}</Typography>
                      </TableCell>
                      <TableCell>{log.actorEmail}</TableCell>
                      <TableCell>{log.targetTelegramId ?? '-'}</TableCell>
                      <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
                        Chưa có nhật ký nào.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
