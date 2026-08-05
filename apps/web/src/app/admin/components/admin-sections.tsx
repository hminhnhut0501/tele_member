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

function getWheelPreset(count: number) {
  if (count === 5) return 'five';
  if (count === 6) return 'six';
  if (count === 8) return 'eight';
  if (count >= 10) return 'tenPlus';
  return 'custom';
}

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
                <TextField size="small" label="🍑 cost" type="number" value={props.rewardPointCost} onChange={(e) => props.setRewardPointCost(Number(e.target.value))} />
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
            <TextField label="🍑 cost" type="number" value={props.editRewardPointCost} onChange={(e) => props.setEditRewardPointCost(Number(e.target.value))} />
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
  const previewPrizes = props.wheelPreview?.prizes ?? props.wheelPrizes;
  const previewPreset = getWheelPreset(previewPrizes.length);
  return (
    <Stack spacing={2}>
      <AppSection title="Wheel Campaigns" subtitle="Quản lý campaign và danh sách prize." accent="violet">
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Campaign name" value={props.campaignName} onChange={(e) => props.setCampaignName(e.target.value)} />
              <Button variant="contained" onClick={props.handleCreateCampaign}>Create campaign</Button>
            </Stack>
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
              {props.campaigns.map((campaign: any) => (
                <Box key={campaign.id} sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                    <Box>
                      <Typography fontWeight={800}>{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{campaign.description ?? 'No description'} • {campaign.is_active ? 'Active' : 'Inactive'}</Typography>
                    </Box>
                    <Button size="small" variant="outlined" onClick={() => {
                      props.setEditingCampaign(campaign);
                      props.setEditCampaignName(campaign.name);
                      props.setEditCampaignDescription(campaign.description ?? '');
                      props.setEditCampaignActive(Boolean(campaign.is_active));
                    }}>Edit</Button>
                  </Stack>
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Glyph / Emoji" value={props.prizeGlyph} onChange={(e) => props.setPrizeGlyph(e.target.value)} />
              <TextField fullWidth label="Emoji count" type="number" value={props.prizeEmojiCount} onChange={(e) => props.setPrizeEmojiCount(Number(e.target.value))} />
              <TextField fullWidth label="Wheel label" value={props.prizeWheelLabel} onChange={(e) => props.setPrizeWheelLabel(e.target.value)} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Wheel render mode</InputLabel>
              <Select label="Wheel render mode" value={props.prizeRenderMode} onChange={(e) => props.setPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Emoji only</MenuItem>
                <MenuItem value="label-only">Label only</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Delivery mode</InputLabel>
                <Select label="Delivery mode" value={props.prizeDeliveryMode} onChange={(e) => props.setPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="inbox">Inbox</MenuItem>
                  <MenuItem value="claim_required">Claim required</MenuItem>
                  <MenuItem value="external_code">External code</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Delivery target</InputLabel>
                <Select label="Delivery target" value={props.prizeDeliveryTarget} onChange={(e) => props.setPrizeDeliveryTarget(e.target.value)}>
                  <MenuItem value="point_wallet">Peach wallet</MenuItem>
                  <MenuItem value="spin_wallet">Spin wallet</MenuItem>
                  <MenuItem value="reward_inbox">Reward inbox</MenuItem>
                  <MenuItem value="code_pool">Code pool</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Rail label" value={props.prizeRailLabel} onChange={(e) => props.setPrizeRailLabel(e.target.value)} />
            <TextField label="Description" value={props.prizeDescription} onChange={(e) => props.setPrizeDescription(e.target.value)} multiline minRows={2} />
            <Button variant="outlined" onClick={props.handleCreatePrize}>Create prize</Button>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Prize board" subtitle="Sửa nhanh glyph, label và weight cho segment." accent="blue">
        <CardContent>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Campaign hiện tại: <b>{props.selectedWheelCampaignId || '—'}</b>
              </Typography>
              <Chip label={`${props.wheelPrizes.length} prizes`} size="small" />
            </Stack>
            {props.wheelPrizes.map((prize: any) => (
              <Box key={prize.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
                  <Box>
                    <Typography fontWeight={800}>
                      {String(prize.metadata?.glyph ?? prize.metadata?.wheelGlyph ?? prize.metadata?.icon ?? prize.metadata?.emoji ?? '✦')} {prize.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prize.type} • weight {prize.weight} • stock {prize.stock ?? '∞'} • {prize.is_active ? 'Active' : 'Inactive'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {String(prize.metadata?.wheelLabel ?? prize.name)} / {String(prize.metadata?.railLabel ?? prize.name)} / {String(prize.metadata?.deliveryMode ?? 'immediate')} / {String(prize.metadata?.deliveryTarget ?? 'reward_inbox')} / {String(prize.metadata?.wheelRenderMode ?? prize.metadata?.renderMode ?? prize.metadata?.labelMode ?? 'emoji-only')}
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
                      props.setEditPrizeActive(Boolean(prize.is_active));
                    }}
                  >
                    Edit
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Recent wins" subtitle="Lịch sử trúng gần đây để kiểm tra phân bổ." accent="emerald">
        <CardContent>
          <Stack spacing={1}>
            {props.wheelSpins.slice(0, 10).map((spin: any) => (
              <Box key={spin.id} sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                <Typography fontWeight={800}>{spin.users?.first_name ?? spin.users?.username ?? spin.user_id}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {spin.wheel_prizes?.name ?? 'Không trúng'} • {new Date(spin.created_at).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Probability preview" subtitle="Xác suất theo weight và trạng thái active của campaign đang chọn." accent="violet">
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Total weight: <b>{props.wheelPreview?.totalWeight ?? 0}</b>
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Chip label={`${previewPrizes.length} prizes`} size="small" />
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
                    <Box
                      key={prize.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: '#fff',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: slotTone,
                              color: '#fff',
                              fontSize: '1rem',
                              fontWeight: 900,
                              flex: '0 0 auto',
                            }}
                          >
                            {glyph}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} noWrap>
                              {prize.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {prize.type} • weight {prize.weight} • chance {Number(prize.chance ?? 0).toFixed(2)}%
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip label={renderMode} size="small" variant="outlined" />
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        <Chip label={String(prize.deliveryMode ?? prize.metadata?.deliveryMode ?? 'immediate')} size="small" variant="outlined" />
                        <Chip label={String(prize.deliveryTarget ?? prize.metadata?.deliveryTarget ?? 'reward_inbox')} size="small" variant="outlined" />
                        <Chip label={`slot ${index + 1}`} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Stack>
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

      <Dialog open={Boolean(props.editingPrize)} onClose={() => props.setEditingPrize(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Prize</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={props.editPrizeName} onChange={(e) => props.setEditPrizeName(e.target.value)} />
            <TextField label="Type" value={props.editPrizeType} onChange={(e) => props.setEditPrizeType(e.target.value)} />
            <TextField label="Weight" type="number" value={props.editPrizeWeight} onChange={(e) => props.setEditPrizeWeight(Number(e.target.value))} />
            <TextField label="Stock" value={props.editPrizeStock} onChange={(e) => props.setEditPrizeStock(e.target.value)} />
            <TextField label="Glyph / Emoji" value={props.editPrizeGlyph} onChange={(e) => props.setEditPrizeGlyph(e.target.value)} />
            <TextField label="Emoji count" type="number" value={props.editPrizeEmojiCount} onChange={(e) => props.setEditPrizeEmojiCount(Number(e.target.value))} />
            <FormControl fullWidth>
              <InputLabel>Wheel render mode</InputLabel>
              <Select label="Wheel render mode" value={props.editPrizeRenderMode} onChange={(e) => props.setEditPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Emoji only</MenuItem>
                <MenuItem value="label-only">Label only</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Delivery mode</InputLabel>
                <Select label="Delivery mode" value={props.editPrizeDeliveryMode} onChange={(e) => props.setEditPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Immediate</MenuItem>
                  <MenuItem value="inbox">Inbox</MenuItem>
                  <MenuItem value="claim_required">Claim required</MenuItem>
                  <MenuItem value="external_code">External code</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Delivery target</InputLabel>
                <Select label="Delivery target" value={props.editPrizeDeliveryTarget} onChange={(e) => props.setEditPrizeDeliveryTarget(e.target.value)}>
                  <MenuItem value="point_wallet">Peach wallet</MenuItem>
                  <MenuItem value="spin_wallet">Spin wallet</MenuItem>
                  <MenuItem value="reward_inbox">Reward inbox</MenuItem>
                  <MenuItem value="code_pool">Code pool</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField label="Wheel label" value={props.editPrizeWheelLabel} onChange={(e) => props.setEditPrizeWheelLabel(e.target.value)} />
            <TextField label="Rail label" value={props.editPrizeRailLabel} onChange={(e) => props.setEditPrizeRailLabel(e.target.value)} />
            <TextField label="Description" value={props.editPrizeDescription} onChange={(e) => props.setEditPrizeDescription(e.target.value)} multiline minRows={2} />
            <FormControl fullWidth>
              <InputLabel>Active</InputLabel>
              <Select label="Active" value={props.editPrizeActive ? 'true' : 'false'} onChange={(e) => props.setEditPrizeActive(e.target.value === 'true')}>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingPrize(null)}>Cancel</Button>
          <Button variant="contained" onClick={props.handleUpdatePrize}>Save</Button>
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
        {mode === 'points' ? 'Add 🍑' : 'Add spins'} {user ? `• ${user.firstName ?? ''} ${user.lastName ?? ''}` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ToggleButtonGroup exclusive value={mode} onChange={(_, value) => value && onModeChange(value)} size="small">
            <ToggleButton value="points">🍑</ToggleButton>
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
