'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AuditTable, TransactionsTable, UsersTable } from './admin-tables';
import { MetricCard, AppSection } from '../../shared-ui';

export function OverviewSection({ users, transactions, rewards, campaigns }: any) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      <MetricCard label="Users" value={String(users.length)} note="Tài khoản đang hoạt động" accent="blue" />
      <MetricCard label="Transactions" value={String(transactions.length)} note="Lịch sử giao dịch" accent="cyan" />
      <MetricCard label="Rewards" value={String(rewards.length)} note="Phần thưởng đã tạo" accent="emerald" />
      <MetricCard label="Campaigns" value={String(campaigns.length)} note="Wheel campaigns" accent="violet" />
    </Box>
  );
}

export function UsersSection(props: any) {
  return (
    <UsersTable
      users={props.users}
      search={props.search}
      onSearchChange={props.setSearch}
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
      page={props.page}
      pageSize={props.pageSize}
      onPageChange={props.setPage}
    />
  );
}

export function AuditSection({ auditLogs, handleDebugEnv }: any) {
  return <AuditTable logs={auditLogs} onRefresh={handleDebugEnv} />;
}

export function RewardsSection(props: any) {
  return (
    <Stack spacing={2}>
      <AppSection title="Rewards" subtitle="Tạo, sửa, import code và quản lý tồn kho." accent="emerald">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>Rewards</Typography>
                <Typography variant="body2" color="text.secondary">Tạo, sửa, import code và quản lý tồn kho.</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <TextField size="small" label="Reward name" value={props.rewardName} onChange={(e) => props.setRewardName(e.target.value)} />
                <TextField size="small" label="Type" value={props.rewardType} onChange={(e) => props.setRewardType(e.target.value)} />
                <TextField size="small" label="Point cost" type="number" value={props.rewardPointCost} onChange={(e) => props.setRewardPointCost(Number(e.target.value))} />
                <Button variant="contained" onClick={props.handleCreateReward}>Create</Button>
              </Stack>
            </Stack>
            <Divider />
            <Stack spacing={1}>
              {props.rewards.map((reward: any) => (
                <Box key={reward.id} sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Typography fontWeight={800}>{reward.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{reward.type} | cost {reward.point_cost} | stock {reward.stock ?? '∞'} | {reward.is_active ? 'Active' : 'Inactive'}</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => {
                    props.setEditingReward(reward);
                    props.setEditRewardName(reward.name);
                    props.setEditRewardType(reward.type);
                    props.setEditRewardPointCost(reward.point_cost);
                    props.setEditRewardStock(reward.stock === null ? '' : String(reward.stock));
                  }}>Edit</Button>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Import Codes" subtitle="Nạp mã reward nhanh từ text list." accent="blue">
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Reward ID" value={props.importRewardId} onChange={(e) => props.setImportRewardId(e.target.value)} />
            <TextField label="Codes" value={props.importCodesText} onChange={(e) => props.setImportCodesText(e.target.value)} multiline minRows={5} />
            <Button variant="outlined" onClick={props.handleImportCodes}>Import codes</Button>
          </Stack>
        </CardContent>
      </AppSection>

      <Dialog open={Boolean(props.editingReward)} onClose={() => props.setEditingReward(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Reward</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={props.editRewardName} onChange={(e) => props.setEditRewardName(e.target.value)} />
            <TextField label="Type" value={props.editRewardType} onChange={(e) => props.setEditRewardType(e.target.value)} />
            <TextField label="Point cost" type="number" value={props.editRewardPointCost} onChange={(e) => props.setEditRewardPointCost(Number(e.target.value))} />
            <TextField label="Stock" value={props.editRewardStock} onChange={(e) => props.setEditRewardStock(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingReward(null)}>Cancel</Button>
          <Button variant="contained" onClick={props.handleUpdateReward}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export function WheelSection(props: any) {
  return (
    <Stack spacing={2}>
      <AppSection title="Wheel Campaigns" subtitle="Quản lý campaign và danh sách prize." accent="violet">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Campaign name" value={props.campaignName} onChange={(e) => props.setCampaignName(e.target.value)} />
              <Button variant="contained" onClick={props.handleCreateCampaign}>Create campaign</Button>
            </Stack>
            <Stack spacing={1}>
              {props.campaigns.map((campaign: any) => (
                <Box key={campaign.id} sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Typography fontWeight={800}>{campaign.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{campaign.is_active ? 'Active' : 'Inactive'}</Typography>
                  <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => {
                    props.setEditingCampaign(campaign);
                    props.setEditCampaignName(campaign.name);
                    props.setEditCampaignDescription(campaign.description ?? '');
                    props.setEditCampaignActive(Boolean(campaign.is_active));
                  }}>Edit</Button>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Create Prize" subtitle="Thêm prize vào campaign đang quản lý." accent="amber">
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Campaign ID" value={props.prizeCampaignId} onChange={(e) => props.setPrizeCampaignId(e.target.value)} />
            <TextField label="Prize name" value={props.prizeName} onChange={(e) => props.setPrizeName(e.target.value)} />
            <TextField label="Prize type" value={props.prizeType} onChange={(e) => props.setPrizeType(e.target.value)} />
            <TextField label="Weight" type="number" value={props.prizeWeight} onChange={(e) => props.setPrizeWeight(Number(e.target.value))} />
            <Button variant="outlined" onClick={props.handleCreatePrize}>Create prize</Button>
          </Stack>
        </CardContent>
      </AppSection>

      <Dialog open={Boolean(props.editingCampaign)} onClose={() => props.setEditingCampaign(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Wheel Campaign</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={props.editCampaignName} onChange={(e) => props.setEditCampaignName(e.target.value)} />
            <TextField label="Description" value={props.editCampaignDescription} onChange={(e) => props.setEditCampaignDescription(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select label="Active" value={props.editCampaignActive ? 'true' : 'false'} onChange={(e) => props.setEditCampaignActive(e.target.value === 'true')}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingCampaign(null)}>Cancel</Button>
          <Button variant="contained" onClick={props.handleUpdateCampaign}>Save</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export function SettingsSection({ debugEnv, botInfo, debugLoading, handleDebugEnv }: any) {
  return (
    <AppSection title="Settings & Diagnostics" subtitle="Debug env và identity Telegram bot." accent="blue">
      <CardContent>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading} sx={{ alignSelf: 'flex-start' }}>
            {debugLoading ? 'Loading...' : 'Debug Env'}
          </Button>
          {debugEnv ? <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(2,6,23,0.04)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(debugEnv, null, 2)}</Box> : null}
          {botInfo ? <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(15,118,110,0.06)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(botInfo, null, 2)}</Box> : null}
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
    <Dialog open={Boolean(open && user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'points' ? 'Add points' : 'Add spins'} {user ? `• ${user.firstName ?? ''} ${user.lastName ?? ''}` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ToggleButtonGroup exclusive value={mode} onChange={(_, value) => value && onModeChange(value)} size="small">
            <ToggleButton value="points">Points</ToggleButton>
            <ToggleButton value="spins">Spins</ToggleButton>
          </ToggleButtonGroup>
          <TextField label="Amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
