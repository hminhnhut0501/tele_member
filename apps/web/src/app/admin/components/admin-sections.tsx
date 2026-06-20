'use client';

import {
  Alert,
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AuditTable, TransactionsTable, UsersTable } from './admin-tables';

export function OverviewSection({ users, transactions, rewards, campaigns }: any) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      <Card><CardContent><Typography color="text.secondary">Users</Typography><Typography variant="h4" fontWeight={900}>{users.length}</Typography></CardContent></Card>
      <Card><CardContent><Typography color="text.secondary">Transactions</Typography><Typography variant="h4" fontWeight={900}>{transactions.length}</Typography></CardContent></Card>
      <Card><CardContent><Typography color="text.secondary">Rewards</Typography><Typography variant="h4" fontWeight={900}>{rewards.length}</Typography></CardContent></Card>
      <Card><CardContent><Typography color="text.secondary">Campaigns</Typography><Typography variant="h4" fontWeight={900}>{campaigns.length}</Typography></CardContent></Card>
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
      <Card sx={{ borderRadius: 2 }}>
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
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={900}>Import Codes</Typography>
            <TextField label="Reward ID" value={props.importRewardId} onChange={(e) => props.setImportRewardId(e.target.value)} />
            <TextField label="Codes" value={props.importCodesText} onChange={(e) => props.setImportCodesText(e.target.value)} multiline minRows={5} />
            <Button variant="outlined" onClick={props.handleImportCodes}>Import codes</Button>
          </Stack>
        </CardContent>
      </Card>

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
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={900}>Wheel Campaigns</Typography>
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
      </Card>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={900}>Create Prize</Typography>
            <TextField label="Campaign ID" value={props.prizeCampaignId} onChange={(e) => props.setPrizeCampaignId(e.target.value)} />
            <TextField label="Prize name" value={props.prizeName} onChange={(e) => props.setPrizeName(e.target.value)} />
            <TextField label="Prize type" value={props.prizeType} onChange={(e) => props.setPrizeType(e.target.value)} />
            <TextField label="Weight" type="number" value={props.prizeWeight} onChange={(e) => props.setPrizeWeight(Number(e.target.value))} />
            <Button variant="outlined" onClick={props.handleCreatePrize}>Create prize</Button>
          </Stack>
        </CardContent>
      </Card>

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
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={900}>Settings & Diagnostics</Typography>
            <Typography variant="body2" color="text.secondary">Debug env và identity Telegram bot.</Typography>
          </Box>
          <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading} sx={{ alignSelf: 'flex-start' }}>
            {debugLoading ? 'Loading...' : 'Debug Env'}
          </Button>
          {debugEnv ? <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(2,6,23,0.04)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(debugEnv, null, 2)}</Box> : null}
          {botInfo ? <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 1, bgcolor: 'rgba(15,118,110,0.06)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(botInfo, null, 2)}</Box> : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
