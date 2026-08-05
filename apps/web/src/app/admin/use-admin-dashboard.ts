'use client';

import { useEffect, useMemo, useState } from 'react';
import { createAdminService } from './admin-service';
import type { AdminAuditLog, AdminTransaction, AdminUser } from './components/admin-tables';

type SectionKey = 'overview' | 'users' | 'transactions' | 'audit' | 'rewards' | 'wheel' | 'settings';

export function useAdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'has_username' | 'high_balance' | 'missing_checkin'>('all');
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'points' | 'spins' | 'negative'>('all');
  const [auditFilter, setAuditFilter] = useState<'all' | 'create' | 'update' | 'import' | 'debug'>('all');
  const [page, setPage] = useState(0);
  const [debugEnv, setDebugEnv] = useState<any>(null);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [telegramId, setTelegramId] = useState('');
  const [amount, setAmount] = useState(10);
  const [reason, setReason] = useState('manual_adjustment');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [adjustMode, setAdjustMode] = useState<'points' | 'spins'>('points');
  const [adjustAmount, setAdjustAmount] = useState(10);
  const [adjustReason, setAdjustReason] = useState('manual_adjustment');
  const [rewardName, setRewardName] = useState('');
  const [rewardPointCost, setRewardPointCost] = useState(0);
  const [rewardType, setRewardType] = useState('VOUCHER');
  const [createRewardOpen, setCreateRewardOpen] = useState(false);
  const [importCodesOpen, setImportCodesOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [importRewardId, setImportRewardId] = useState('');
  const [importCodesText, setImportCodesText] = useState('');
  const [prizeCampaignId, setPrizeCampaignId] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [prizeType, setPrizeType] = useState('POINT');
  const [prizeWeight, setPrizeWeight] = useState(1);
  const [prizeGlyph, setPrizeGlyph] = useState('⭐');
  const [prizeEmojiCount, setPrizeEmojiCount] = useState(1);
  const [prizeDeliveryMode, setPrizeDeliveryMode] = useState('immediate');
  const [prizeDeliveryTarget, setPrizeDeliveryTarget] = useState('point_wallet');
  const [prizeWheelLabel, setPrizeWheelLabel] = useState('');
  const [prizeRailLabel, setPrizeRailLabel] = useState('');
  const [prizeDescription, setPrizeDescription] = useState('');
  const [prizeRenderMode, setPrizeRenderMode] = useState<'emoji-only' | 'label-only' | 'mixed'>('emoji-only');
  const [createPrizeOpen, setCreatePrizeOpen] = useState(false);
  const [selectedWheelCampaignId, setSelectedWheelCampaignId] = useState('');
  const [wheelPrizes, setWheelPrizes] = useState<any[]>([]);
  const [wheelSpins, setWheelSpins] = useState<any[]>([]);
  const [wheelPreview, setWheelPreview] = useState<any>(null);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editingPrize, setEditingPrize] = useState<any>(null);
  const [editRewardName, setEditRewardName] = useState('');
  const [editRewardType, setEditRewardType] = useState('VOUCHER');
  const [editRewardPointCost, setEditRewardPointCost] = useState(0);
  const [editRewardStock, setEditRewardStock] = useState<string>('');
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editCampaignDescription, setEditCampaignDescription] = useState('');
  const [editCampaignActive, setEditCampaignActive] = useState(false);
  const [editPrizeName, setEditPrizeName] = useState('');
  const [editPrizeType, setEditPrizeType] = useState('POINT');
  const [editPrizeWeight, setEditPrizeWeight] = useState(1);
  const [editPrizeStock, setEditPrizeStock] = useState<string>('');
  const [editPrizeGlyph, setEditPrizeGlyph] = useState('⭐');
  const [editPrizeEmojiCount, setEditPrizeEmojiCount] = useState(1);
  const [editPrizeDeliveryMode, setEditPrizeDeliveryMode] = useState('immediate');
  const [editPrizeDeliveryTarget, setEditPrizeDeliveryTarget] = useState('point_wallet');
  const [editPrizeWheelLabel, setEditPrizeWheelLabel] = useState('');
  const [editPrizeRailLabel, setEditPrizeRailLabel] = useState('');
  const [editPrizeDescription, setEditPrizeDescription] = useState('');
  const [editPrizeRenderMode, setEditPrizeRenderMode] = useState<'emoji-only' | 'label-only' | 'mixed'>('emoji-only');
  const [editPrizeActive, setEditPrizeActive] = useState(true);
  const pageSize = 20;

  const service = useMemo(() => createAdminService(token), [token]);

  useEffect(() => {
    const saved = window.localStorage.getItem('tele-member-admin-token');
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    service.getUsers(search, page * pageSize, pageSize).then((data) => setUsers(data.users ?? data)).catch((err) => setError(String(err)));
    service.getTransactions(search, page * pageSize, pageSize).then((data) => setTransactions(data.transactions ?? data)).catch((err) => setError(String(err)));
    service.getAuditLogs(page * pageSize, pageSize).then((data) => setAuditLogs(data.logs ?? data)).catch((err) => setError(String(err)));
    service.getRewards().then((data) => setRewards(data.rewards ?? [])).catch(() => {});
    service.getWheelCampaigns().then((data) => {
      const nextCampaigns = data.campaigns ?? [];
      setCampaigns(nextCampaigns);
      setSelectedWheelCampaignId((current) => current || nextCampaigns[0]?.id || '');
    }).catch(() => {});
  }, [page, pageSize, search, service, token]);

  useEffect(() => {
    if (!token || !selectedWheelCampaignId) return;
    Promise.all([
      service.getWheelPrizes(selectedWheelCampaignId),
      service.getWheelPreview(selectedWheelCampaignId),
    ])
      .then(([prizeData, previewData]) => {
        setWheelPrizes(prizeData.prizes ?? []);
        setWheelPreview(previewData ?? null);
      })
      .catch(() => {
        setWheelPrizes([]);
        setWheelPreview(null);
      });
  }, [selectedWheelCampaignId, service, token]);

  useEffect(() => {
    if (!token) return;
    service.getWheelSpins().then((data) => setWheelSpins(data.spins ?? [])).catch(() => setWheelSpins([]));
  }, [service, token]);

  async function login() {
    try {
      setError('');
      setNotice('');
      const data = await service.login(email, password);
      setToken(data.token);
      window.localStorage.setItem('tele-member-admin-token', data.token);
      setNotice('Đăng nhập thành công');
    } catch {
      setError('Đăng nhập không thành công');
    }
  }

  async function adjustPoints() {
    try {
      setError('');
      setNotice('');
      await service.adjust({ telegramId, amount: Number(amount), reason });
      const updated = await service.getUsers(search, page * pageSize, pageSize);
      const refreshed = await service.getTransactions(search, page * pageSize, pageSize);
      const logs = await service.getAuditLogs(page * pageSize, pageSize);
      setUsers(updated.users ?? updated);
      setTransactions(refreshed.transactions ?? refreshed);
      setAuditLogs(logs.logs ?? logs);
      setNotice('Cập nhật 🍑 thành công');
    } catch {
      setError('Cập nhật 🍑 thất bại');
    }
  }

  function openUserAdjust(user: AdminUser, mode: 'points' | 'spins') {
    setSelectedUser(user);
    setAdjustMode(mode);
    setAdjustAmount(mode === 'points' ? 10 : 1);
    setAdjustReason(mode === 'points' ? 'manual_adjustment' : 'manual_spin_adjustment');
  }

  async function submitUserAdjust() {
    if (!selectedUser) return;
    try {
      setError('');
      setNotice('');
      if (adjustMode === 'points') {
        await service.adjust({ telegramId: selectedUser.telegramId, amount: Number(adjustAmount), reason: adjustReason });
      } else {
        await service.adjustSpins({ telegramId: selectedUser.telegramId, amount: Number(adjustAmount), reason: adjustReason });
      }
      const updated = await service.getUsers(search, page * pageSize, pageSize);
      const refreshed = await service.getTransactions(search, page * pageSize, pageSize);
      const logs = await service.getAuditLogs(page * pageSize, pageSize);
      setUsers(updated.users ?? updated);
      setTransactions(refreshed.transactions ?? refreshed);
      setAuditLogs(logs.logs ?? logs);
      setSelectedUser(null);
      setNotice(adjustMode === 'points' ? 'Đã cộng 🍑 cho người dùng' : 'Đã cộng lượt quay cho người dùng');
    } catch {
      setError(adjustMode === 'points' ? 'Cập nhật 🍑 thất bại' : 'Cập nhật lượt quay không thành công');
    }
  }

  async function refreshDebug() {
    if (!token) return;
    try {
      setDebugLoading(true);
      setError('');
      setNotice('');
      const [envData, botData] = await Promise.all([service.getDebugEnv(), service.getTelegramBotInfo()]);
      setDebugEnv(envData);
      setBotInfo(botData);
    } catch {
      setError('Không thể tải debug biến môi trường');
    } finally {
      setDebugLoading(false);
    }
  }

  async function createReward() {
    try {
      setError('');
      setNotice('');
      await service.createReward({
        name: rewardName,
        type: rewardType,
        pointCost: rewardPointCost,
        description: '',
        stock: null,
        isActive: true,
        metadata: {},
      });
      const data = await service.getRewards();
      setRewards(data.rewards ?? []);
      setCreateRewardOpen(false);
      setNotice('Đã tạo quà');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo quà');
    }
  }

  async function createCampaign() {
    try {
      setError('');
      setNotice('');
      await service.createWheelCampaign({
        name: campaignName,
        isActive: false,
        metadata: {},
      });
      const data = await service.getWheelCampaigns();
      setCampaigns(data.campaigns ?? []);
      setCreateCampaignOpen(false);
      setNotice('Đã tạo chiến dịch');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo chiến dịch');
    }
  }

  async function importCodes() {
    try {
      setError('');
      setNotice('');
      const codes = importCodesText.split('\n').map((line) => line.trim()).filter(Boolean);
      await service.importRewardCodes(importRewardId, codes);
      setImportCodesOpen(false);
      setNotice(`Đã nhập ${codes.length} code`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể nhập mã');
    }
  }

  async function createPrize() {
    try {
      setError('');
      setNotice('');
      if (!prizeCampaignId) throw new Error('Missing campaign');
      await service.createWheelPrize(prizeCampaignId, {
        name: prizeName,
        type: prizeType,
        weight: prizeWeight,
        stock: null,
        isActive: true,
        metadata: {
          glyph: prizeGlyph,
          emojiCount: prizeEmojiCount,
          deliveryMode: prizeDeliveryMode,
          deliveryTarget: prizeDeliveryTarget,
          wheelRenderMode: prizeRenderMode,
          wheelLabel: prizeWheelLabel || null,
          railLabel: prizeRailLabel || null,
          description: prizeDescription || null,
        },
      });
      const data = await service.getWheelPrizes(prizeCampaignId);
      setWheelPrizes(data.prizes ?? []);
      const preview = await service.getWheelPreview(prizeCampaignId);
      setWheelPreview(preview ?? null);
      setCreatePrizeOpen(false);
      setNotice('Đã tạo phần thưởng');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo phần thưởng');
    }
  }

  async function updatePrize() {
    if (!editingPrize) return;
    try {
      setError('');
      setNotice('');
      await service.updateWheelPrize(editingPrize.id, {
        name: editPrizeName,
        type: editPrizeType,
        weight: editPrizeWeight,
        stock: editPrizeStock === '' ? null : Number(editPrizeStock),
        isActive: editPrizeActive,
        metadata: {
          ...(editingPrize.metadata ?? {}),
          glyph: editPrizeGlyph,
          emojiCount: editPrizeEmojiCount,
          deliveryMode: editPrizeDeliveryMode,
          deliveryTarget: editPrizeDeliveryTarget,
          wheelRenderMode: editPrizeRenderMode,
          wheelLabel: editPrizeWheelLabel || null,
          railLabel: editPrizeRailLabel || null,
          description: editPrizeDescription || null,
        },
      });
      const data = await service.getWheelPrizes(selectedWheelCampaignId || editingPrize.campaign_id);
      setWheelPrizes(data.prizes ?? []);
      const preview = await service.getWheelPreview(selectedWheelCampaignId || editingPrize.campaign_id);
      setWheelPreview(preview ?? null);
      setEditingPrize(null);
      setNotice('Đã lưu phần thưởng');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu phần thưởng');
    }
  }

  async function updateReward() {
    if (!editingReward) return;
    try {
      setError('');
      setNotice('');
      await service.updateReward(editingReward.id, {
        name: editRewardName,
        type: editRewardType,
        pointCost: editRewardPointCost,
        stock: editRewardStock === '' ? null : Number(editRewardStock),
      });
      const data = await service.getRewards();
      setRewards(data.rewards ?? []);
      setEditingReward(null);
      setNotice('Đã lưu quà');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu quà');
    }
  }

  async function updateCampaign() {
    if (!editingCampaign) return;
    try {
      setError('');
      setNotice('');
      await service.updateWheelCampaign(editingCampaign.id, {
        name: editCampaignName,
        description: editCampaignDescription,
        isActive: editCampaignActive,
      });
      const data = await service.getWheelCampaigns();
      setCampaigns(data.campaigns ?? []);
      setEditingCampaign(null);
      setNotice('Đã lưu chiến dịch');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu chiến dịch');
    }
  }

  return {
    token,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    notice,
    setNotice,
    activeSection,
    setActiveSection,
    search,
    setSearch,
    userFilter,
    setUserFilter,
    transactionFilter,
    setTransactionFilter,
    auditFilter,
    setAuditFilter,
    page,
    setPage,
    pageSize,
    debugEnv,
    botInfo,
    debugLoading,
    users,
    transactions,
    auditLogs,
    rewards,
    campaigns,
    telegramId,
    setTelegramId,
    amount,
    setAmount,
    reason,
    setReason,
    selectedUser,
    setSelectedUser,
    adjustMode,
    setAdjustMode,
    adjustAmount,
    setAdjustAmount,
    adjustReason,
    setAdjustReason,
    rewardName,
    setRewardName,
    rewardPointCost,
    setRewardPointCost,
    rewardType,
    setRewardType,
    createRewardOpen,
    setCreateRewardOpen,
    importCodesOpen,
    setImportCodesOpen,
    campaignName,
    setCampaignName,
    createCampaignOpen,
    setCreateCampaignOpen,
    importRewardId,
    setImportRewardId,
    importCodesText,
    setImportCodesText,
    prizeCampaignId,
    setPrizeCampaignId,
    prizeName,
    setPrizeName,
    prizeType,
    setPrizeType,
    prizeWeight,
    setPrizeWeight,
    prizeGlyph,
    setPrizeGlyph,
    prizeEmojiCount,
    setPrizeEmojiCount,
    prizeDeliveryMode,
    setPrizeDeliveryMode,
    prizeDeliveryTarget,
    setPrizeDeliveryTarget,
    prizeWheelLabel,
    setPrizeWheelLabel,
    prizeRailLabel,
    setPrizeRailLabel,
    prizeDescription,
    setPrizeDescription,
    prizeRenderMode,
    setPrizeRenderMode,
    createPrizeOpen,
    setCreatePrizeOpen,
    selectedWheelCampaignId,
    setSelectedWheelCampaignId,
    wheelPrizes,
    wheelSpins,
    wheelPreview,
    editingReward,
    setEditingReward,
    editingCampaign,
    setEditingCampaign,
    editingPrize,
    setEditingPrize,
    editRewardName,
    setEditRewardName,
    editRewardType,
    setEditRewardType,
    editRewardPointCost,
    setEditRewardPointCost,
    editRewardStock,
    setEditRewardStock,
    editCampaignName,
    setEditCampaignName,
    editCampaignDescription,
    setEditCampaignDescription,
    editCampaignActive,
    setEditCampaignActive,
    editPrizeName,
    setEditPrizeName,
    editPrizeType,
    setEditPrizeType,
    editPrizeWeight,
    setEditPrizeWeight,
    editPrizeStock,
    setEditPrizeStock,
    editPrizeGlyph,
    setEditPrizeGlyph,
    editPrizeEmojiCount,
    setEditPrizeEmojiCount,
    editPrizeDeliveryMode,
    setEditPrizeDeliveryMode,
    editPrizeDeliveryTarget,
    setEditPrizeDeliveryTarget,
    editPrizeWheelLabel,
    setEditPrizeWheelLabel,
    editPrizeRailLabel,
    setEditPrizeRailLabel,
    editPrizeDescription,
    setEditPrizeDescription,
    editPrizeRenderMode,
    setEditPrizeRenderMode,
    editPrizeActive,
    setEditPrizeActive,
    login,
    adjustPoints,
    openUserAdjust,
    submitUserAdjust,
    refreshDebug,
    handleDebugEnv: refreshDebug,
    createReward,
    handleCreateReward: createReward,
    createCampaign,
    handleCreateCampaign: createCampaign,
    importCodes,
    handleImportCodes: importCodes,
    createPrize,
    handleCreatePrize: createPrize,
    updatePrize,
    handleUpdatePrize: updatePrize,
    updateReward,
    handleUpdateReward: updateReward,
    updateCampaign,
    handleUpdateCampaign: updateCampaign,
  };
}
