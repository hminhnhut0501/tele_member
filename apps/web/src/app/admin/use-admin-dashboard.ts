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
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [search, setSearch] = useState('');
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
  const [rewardName, setRewardName] = useState('');
  const [rewardPointCost, setRewardPointCost] = useState(0);
  const [rewardType, setRewardType] = useState('VOUCHER');
  const [campaignName, setCampaignName] = useState('');
  const [importRewardId, setImportRewardId] = useState('');
  const [importCodesText, setImportCodesText] = useState('');
  const [prizeCampaignId, setPrizeCampaignId] = useState('');
  const [prizeName, setPrizeName] = useState('');
  const [prizeType, setPrizeType] = useState('POINT');
  const [prizeWeight, setPrizeWeight] = useState(1);
  const [editingReward, setEditingReward] = useState<any>(null);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editRewardName, setEditRewardName] = useState('');
  const [editRewardType, setEditRewardType] = useState('VOUCHER');
  const [editRewardPointCost, setEditRewardPointCost] = useState(0);
  const [editRewardStock, setEditRewardStock] = useState<string>('');
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editCampaignDescription, setEditCampaignDescription] = useState('');
  const [editCampaignActive, setEditCampaignActive] = useState(false);
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
    service.getWheelCampaigns().then((data) => setCampaigns(data.campaigns ?? [])).catch(() => {});
  }, [page, pageSize, search, service, token]);

  async function login() {
    try {
      setError('');
      const data = await service.login(email, password);
      setToken(data.token);
      window.localStorage.setItem('tele-member-admin-token', data.token);
    } catch {
      setError('Đăng nhập thất bại');
    }
  }

  async function adjustPoints() {
    try {
      await service.adjust({ telegramId, amount: Number(amount), reason });
      const updated = await service.getUsers(search, page * pageSize, pageSize);
      const refreshed = await service.getTransactions(search, page * pageSize, pageSize);
      const logs = await service.getAuditLogs(page * pageSize, pageSize);
      setUsers(updated.users ?? updated);
      setTransactions(refreshed.transactions ?? refreshed);
      setAuditLogs(logs.logs ?? logs);
      setError('');
    } catch {
      setError('Cập nhật điểm thất bại');
    }
  }

  async function refreshDebug() {
    if (!token) return;
    try {
      setDebugLoading(true);
      setError('');
      const [envData, botData] = await Promise.all([service.getDebugEnv(), service.getTelegramBotInfo()]);
      setDebugEnv(envData);
      setBotInfo(botData);
    } catch {
      setError('Không thể tải debug env');
    } finally {
      setDebugLoading(false);
    }
  }

  async function createReward() {
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
  }

  async function createCampaign() {
    await service.createWheelCampaign({
      name: campaignName,
      isActive: false,
      metadata: {},
    });
    const data = await service.getWheelCampaigns();
    setCampaigns(data.campaigns ?? []);
  }

  async function importCodes() {
    const codes = importCodesText.split('\n').map((line) => line.trim()).filter(Boolean);
    await service.importRewardCodes(importRewardId, codes);
  }

  async function createPrize() {
    if (!prizeCampaignId) throw new Error('Missing campaign');
    await service.createWheelPrize(prizeCampaignId, {
      name: prizeName,
      type: prizeType,
      weight: prizeWeight,
      stock: null,
      isActive: true,
      metadata: {},
    });
  }

  async function updateReward() {
    if (!editingReward) return;
    await service.updateReward(editingReward.id, {
      name: editRewardName,
      type: editRewardType,
      pointCost: editRewardPointCost,
      stock: editRewardStock === '' ? null : Number(editRewardStock),
    });
    const data = await service.getRewards();
    setRewards(data.rewards ?? []);
    setEditingReward(null);
  }

  async function updateCampaign() {
    if (!editingCampaign) return;
    await service.updateWheelCampaign(editingCampaign.id, {
      name: editCampaignName,
      description: editCampaignDescription,
      isActive: editCampaignActive,
    });
    const data = await service.getWheelCampaigns();
    setCampaigns(data.campaigns ?? []);
    setEditingCampaign(null);
  }

  return {
    token,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    activeSection,
    setActiveSection,
    search,
    setSearch,
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
    rewardName,
    setRewardName,
    rewardPointCost,
    setRewardPointCost,
    rewardType,
    setRewardType,
    campaignName,
    setCampaignName,
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
    editingReward,
    setEditingReward,
    editingCampaign,
    setEditingCampaign,
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
    login,
    adjustPoints,
    refreshDebug,
    createReward,
    createCampaign,
    importCodes,
    createPrize,
    updateReward,
    updateCampaign,
  };
}
