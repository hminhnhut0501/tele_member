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
  DialogTitle,
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

function getWheelPreset(count: number) {
  if (count === 5) return '5 ô';
  if (count === 6) return '6 ô';
  if (count === 8) return '8 ô';
  if (count >= 10) return '10+ ô';
  return 'tùy chỉnh';
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
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={1}>
              {props.rewards.map((reward: any) => (
                <Box key={reward.id} sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Typography fontWeight={800}>{reward.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reward.type} | cost {reward.point_cost} | tồn kho {reward.stock ?? '∞'} | {reward.is_active ? 'Đang bật' : 'Đang tắt'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                    onClick={() => {
                      props.setEditingReward(reward);
                      props.setEditRewardName(reward.name);
                      props.setEditRewardType(reward.type);
                      props.setEditRewardPointCost(reward.point_cost);
                      props.setEditRewardStock(reward.stock === null ? '' : String(reward.stock));
                    }}
                  >
                    Sửa
                  </Button>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <Dialog open={Boolean(props.editingReward)} onClose={() => props.setEditingReward(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa quà</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên" value={props.editRewardName} onChange={(e) => props.setEditRewardName(e.target.value)} />
            <TextField label="Loại" value={props.editRewardType} onChange={(e) => props.setEditRewardType(e.target.value)} />
            <TextField label="Chi phí 🍑" type="number" value={props.editRewardPointCost} onChange={(e) => props.setEditRewardPointCost(Number(e.target.value))} />
            <TextField label="Tồn kho" value={props.editRewardStock} onChange={(e) => props.setEditRewardStock(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingReward(null)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleUpdateReward}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(props.createRewardOpen)} onClose={() => props.setCreateRewardOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm quà đổi</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên quà" value={props.rewardName} onChange={(e) => props.setRewardName(e.target.value)} />
            <TextField label="Loại" value={props.rewardType} onChange={(e) => props.setRewardType(e.target.value)} />
            <TextField label="Chi phí 🍑" type="number" value={props.rewardPointCost} onChange={(e) => props.setRewardPointCost(Number(e.target.value))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setCreateRewardOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleCreateReward}>Tạo mới</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(props.importCodesOpen)} onClose={() => props.setImportCodesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nhập mã quà</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="ID quà" value={props.importRewardId} onChange={(e) => props.setImportRewardId(e.target.value)} />
            <TextField label="Danh sách mã" value={props.importCodesText} onChange={(e) => props.setImportCodesText(e.target.value)} multiline minRows={5} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setImportCodesOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleImportCodes}>Nhập mã</Button>
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
      <AppSection
        title="Chiến dịch vòng quay"
        subtitle="Quản lý campaign và danh sách phần thưởng."
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
        <CardContent>
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
              {props.campaigns.map((campaign: any) => (
                <Box key={campaign.id} sx={{ p: 1.75, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                    <Box>
                      <Typography fontWeight={800}>{campaign.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {campaign.description ?? 'Chưa có mô tả'} • {campaign.is_active ? 'Đang bật' : 'Đang tắt'}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        props.setEditingCampaign(campaign);
                        props.setEditCampaignName(campaign.name);
                        props.setEditCampaignDescription(campaign.description ?? '');
                        props.setEditCampaignActive(Boolean(campaign.is_active));
                      }}
                    >
                      Sửa
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Bảng phần thưởng" subtitle="Sửa nhanh emoji, nhãn và trọng số cho từng lát." accent="blue">
        <CardContent>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Campaign hiện tại: <b>{props.selectedWheelCampaignId || '—'}</b>
              </Typography>
              <Chip label={`${props.wheelPrizes.length} quà`} size="small" />
            </Stack>

            <Divider />

            <Stack spacing={1}>
              {props.wheelPrizes.map((prize: any) => (
                <Box key={prize.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ xs: 'start', md: 'center' }}>
                    <Box>
                      <Typography fontWeight={800}>
                        {String(prize.metadata?.glyph ?? prize.metadata?.wheelGlyph ?? prize.metadata?.icon ?? prize.metadata?.emoji ?? '✦')} {prize.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {prize.type} • trọng số {prize.weight} • tồn kho {prize.stock ?? '∞'} • {prize.is_active ? 'Đang bật' : 'Đang tắt'}
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
                      Sửa
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </AppSection>

      <AppSection title="Lịch sử trúng" subtitle="Theo dõi các lượt quay gần đây." accent="emerald">
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

      <AppSection title="Xem trước xác suất" subtitle="Xác suất theo trọng số và trạng thái đang bật của campaign đang chọn." accent="violet">
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
                    <Box key={prize.id} sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: '#fff' }}>
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

      <Dialog open={Boolean(props.editingCampaign)} onClose={() => props.setEditingCampaign(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa chiến dịch vòng quay</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên" value={props.editCampaignName} onChange={(e) => props.setEditCampaignName(e.target.value)} />
            <TextField label="Mô tả" value={props.editCampaignDescription} onChange={(e) => props.setEditCampaignDescription(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={props.editCampaignActive ? 'true' : 'false'} onChange={(e) => props.setEditCampaignActive(e.target.value === 'true')}>
                <MenuItem value="true">Đang bật</MenuItem>
                <MenuItem value="false">Đang tắt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingCampaign(null)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleUpdateCampaign}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(props.createCampaignOpen)} onClose={() => props.setCreateCampaignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm chiến dịch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên chiến dịch" value={props.campaignName} onChange={(e) => props.setCampaignName(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setCreateCampaignOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleCreateCampaign}>Tạo chiến dịch</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(props.createPrizeOpen)} onClose={() => props.setCreatePrizeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Thêm phần thưởng</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="ID chiến dịch" value={props.prizeCampaignId} onChange={(e) => props.setPrizeCampaignId(e.target.value)} />
            <TextField label="Tên phần thưởng" value={props.prizeName} onChange={(e) => props.setPrizeName(e.target.value)} />
            <TextField label="Loại phần thưởng" value={props.prizeType} onChange={(e) => props.setPrizeType(e.target.value)} />
            <TextField label="Trọng số" type="number" value={props.prizeWeight} onChange={(e) => props.setPrizeWeight(Number(e.target.value))} />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <TextField fullWidth label="Emoji / biểu tượng" value={props.prizeGlyph} onChange={(e) => props.setPrizeGlyph(e.target.value)} />
              <TextField fullWidth label="Số emoji" type="number" value={props.prizeEmojiCount} onChange={(e) => props.setPrizeEmojiCount(Number(e.target.value))} />
              <TextField fullWidth label="Nhãn vòng quay" value={props.prizeWheelLabel} onChange={(e) => props.setPrizeWheelLabel(e.target.value)} />
            </Stack>
            <FormControl fullWidth>
              <InputLabel>Chế độ hiển thị</InputLabel>
              <Select label="Chế độ hiển thị" value={props.prizeRenderMode} onChange={(e) => props.setPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Chỉ emoji</MenuItem>
                <MenuItem value="label-only">Chỉ nhãn</MenuItem>
                <MenuItem value="mixed">Kết hợp</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Cách giao quà</InputLabel>
                <Select label="Cách giao quà" value={props.prizeDeliveryMode} onChange={(e) => props.setPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Ngay lập tức</MenuItem>
                  <MenuItem value="inbox">Hộp quà</MenuItem>
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
            <TextField label="Nhãn danh sách" value={props.prizeRailLabel} onChange={(e) => props.setPrizeRailLabel(e.target.value)} />
            <TextField label="Mô tả" value={props.prizeDescription} onChange={(e) => props.setPrizeDescription(e.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setCreatePrizeOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleCreatePrize}>Tạo phần thưởng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(props.editingPrize)} onClose={() => props.setEditingPrize(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sửa phần thưởng</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Tên" value={props.editPrizeName} onChange={(e) => props.setEditPrizeName(e.target.value)} />
            <TextField label="Loại" value={props.editPrizeType} onChange={(e) => props.setEditPrizeType(e.target.value)} />
            <TextField label="Trọng số" type="number" value={props.editPrizeWeight} onChange={(e) => props.setEditPrizeWeight(Number(e.target.value))} />
            <TextField label="Tồn kho" value={props.editPrizeStock} onChange={(e) => props.setEditPrizeStock(e.target.value)} />
            <TextField label="Emoji / biểu tượng" value={props.editPrizeGlyph} onChange={(e) => props.setEditPrizeGlyph(e.target.value)} />
            <TextField label="Số emoji" type="number" value={props.editPrizeEmojiCount} onChange={(e) => props.setEditPrizeEmojiCount(Number(e.target.value))} />
            <FormControl fullWidth>
              <InputLabel>Chế độ hiển thị</InputLabel>
              <Select label="Chế độ hiển thị" value={props.editPrizeRenderMode} onChange={(e) => props.setEditPrizeRenderMode(e.target.value)}>
                <MenuItem value="emoji-only">Chỉ emoji</MenuItem>
                <MenuItem value="label-only">Chỉ nhãn</MenuItem>
                <MenuItem value="mixed">Kết hợp</MenuItem>
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
              <FormControl fullWidth>
                <InputLabel>Cách giao quà</InputLabel>
                <Select label="Cách giao quà" value={props.editPrizeDeliveryMode} onChange={(e) => props.setEditPrizeDeliveryMode(e.target.value)}>
                  <MenuItem value="immediate">Ngay lập tức</MenuItem>
                  <MenuItem value="inbox">Hộp quà</MenuItem>
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
            <TextField label="Nhãn vòng quay" value={props.editPrizeWheelLabel} onChange={(e) => props.setEditPrizeWheelLabel(e.target.value)} />
            <TextField label="Nhãn danh sách" value={props.editPrizeRailLabel} onChange={(e) => props.setEditPrizeRailLabel(e.target.value)} />
            <TextField label="Mô tả" value={props.editPrizeDescription} onChange={(e) => props.setEditPrizeDescription(e.target.value)} multiline minRows={2} />
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select label="Trạng thái" value={props.editPrizeActive ? 'true' : 'false'} onChange={(e) => props.setEditPrizeActive(e.target.value === 'true')}>
                <MenuItem value="true">Đang bật</MenuItem>
                <MenuItem value="false">Đang tắt</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => props.setEditingPrize(null)}>Hủy</Button>
          <Button variant="contained" onClick={props.handleUpdatePrize}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export function SettingsSection({ debugEnv, botInfo, debugLoading, handleDebugEnv }: any) {
  return (
    <AppSection title="Cài đặt & chẩn đoán" subtitle="Debug biến môi trường và định danh bot Telegram." accent="blue">
      <CardContent>
        <Stack spacing={2}>
          <Button variant="outlined" onClick={handleDebugEnv} disabled={debugLoading} sx={{ alignSelf: 'flex-start' }}>
            {debugLoading ? 'Đang tải...' : 'Debug biến môi trường'}
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
    <Dialog open={Boolean(open && user)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'points' ? 'Cộng 🍑' : 'Cộng lượt quay'} {user ? `• ${user.firstName ?? ''} ${user.lastName ?? ''}` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <ToggleButtonGroup exclusive value={mode} onChange={(_, value) => value && onModeChange(value)} size="small">
            <ToggleButton value="points">🍑</ToggleButton>
            <ToggleButton value="spins">Lượt quay</ToggleButton>
          </ToggleButtonGroup>
          <TextField label="Số lượng" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          <TextField label="Lý do" value={reason} onChange={(e) => setReason(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={onSubmit}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
}
