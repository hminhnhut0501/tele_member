'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
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
import { useMemo } from 'react';

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

export function UsersTable({
  users,
  search,
  onSearchChange,
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
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick: (user: AdminUser) => void;
  onAddPoints: (user: AdminUser) => void;
  onAddSpins: (user: AdminUser) => void;
}) {
  const filtered = useMemo(() => users, [users]);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Người dùng</Typography>
              <Typography variant="body2" color="text.secondary">Bảng có phân trang, tìm kiếm và thao tác nhanh.</Typography>
            </Box>
            <TextField size="small" label="Lọc người dùng" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Telegram ID</TableCell>
                <TableCell>Số dư</TableCell>
                <TableCell>Check-in gần nhất</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack>
                      <Typography fontWeight={800}>{user.firstName ?? ''} {user.lastName ?? ''}</Typography>
                      <Typography variant="body2" color="text.secondary">@{user.username ?? '-'}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.telegramId}</TableCell>
                  <TableCell><Chip label={user.balance} size="small" /></TableCell>
                  <TableCell>{user.lastCheckinDate ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => onAddPoints(user)}>Cộng 🍑</Button>
                      <Button size="small" variant="outlined" onClick={() => onAddSpins(user)}>Cộng lượt quay</Button>
                      <Button size="small" variant="contained" onClick={() => onRowClick(user)}>Xem</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
  page,
  pageSize,
  onPageChange,
}: {
  transactions: AdminTransaction[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight={900}>Giao dịch</Typography>
              <Typography variant="body2" color="text.secondary">Lọc theo lý do/loại và phân trang.</Typography>
            </Box>
            <TextField size="small" label="Tìm giao dịch" value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Thời gian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Typography fontWeight={800}>{tx.firstName ?? ''} {tx.lastName ?? ''}</Typography>
                    <Typography variant="body2" color="text.secondary">@{tx.username ?? '-'} | {tx.telegramId}</Typography>
                  </TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell><Chip label={tx.type} size="small" /></TableCell>
                  <TableCell>{tx.reason}</TableCell>
                  <TableCell>{tx.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
}: {
  logs: AdminAuditLog[];
  onRefresh?: () => void;
}) {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" fontWeight={900}>Nhật ký</Typography>
              <Typography variant="body2" color="text.secondary">Ghi nhận các hành động quản trị.</Typography>
            </Box>
            {onRefresh ? <Button variant="outlined" onClick={onRefresh}>Làm mới</Button> : null}
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hành động</TableCell>
                <TableCell>Người thực hiện</TableCell>
                <TableCell>Đối tượng</TableCell>
                <TableCell>Thời gian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.actorEmail}</TableCell>
                  <TableCell>{log.targetTelegramId ?? '-'}</TableCell>
                  <TableCell>{log.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </CardContent>
    </Card>
  );
}
