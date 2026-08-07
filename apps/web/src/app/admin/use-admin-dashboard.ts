'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildWheelPreviewContract,
  normalizeAdminAuditLogsResponse,
  normalizeAdminRewardsResponse,
  normalizeAdminTransactionsResponse,
  normalizeOpsEventsResponse,
  normalizeOpsSummaryResponse,
  normalizePolicyConfigsResponse,
  normalizePolicyVersionsResponse,
  normalizeWheelCampaignsResponse,
  normalizeWheelHistoryResponse,
  normalizeWheelPrizesResponse,
  type OpsEvent,
  type OpsSummary,
  type PolicyConfig,
  type PolicyVersion,
  type WheelCampaign,
  type WheelPrize,
  type WheelSpinHistoryItem,
  type WheelPreviewContract,
} from '@tele-member/shared';
import { createAdminService } from './admin-service';
import type { AdminAuditLog, AdminTransaction, AdminUser } from './components/admin-tables';

type SectionKey = 'overview' | 'users' | 'transactions' | 'audit' | 'rewards' | 'wheel' | 'policies' | 'featureFlags' | 'ops' | 'settings';

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
  const [campaigns, setCampaigns] = useState<WheelCampaign[]>([]);
  const [policies, setPolicies] = useState<PolicyConfig[]>([]);
  const [policyVersions, setPolicyVersions] = useState<PolicyVersion[]>([]);
  const [featureFlagsLive, setFeatureFlagsLive] = useState<Record<string, unknown>>({});
  const [opsSummary, setOpsSummary] = useState<OpsSummary | null>(null);
  const [opsEvents, setOpsEvents] = useState<OpsEvent[]>([]);
  const [opsSeverity, setOpsSeverity] = useState<'all' | 'info' | 'warning' | 'error' | 'critical'>('all');
  const [opsCategory, setOpsCategory] = useState('');
  const [opsSource, setOpsSource] = useState('');
  const [opsLoading, setOpsLoading] = useState(false);
  const [selectedPolicyKey, setSelectedPolicyKey] = useState('');
  const [policyEditorOpen, setPolicyEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyConfig | null>(null);
  const [policyScope, setPolicyScope] = useState<'system' | 'currency' | 'reward' | 'delivery' | 'wheel' | 'feature_flag'>('system');
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyDataText, setPolicyDataText] = useState('{}');
  const [policyNote, setPolicyNote] = useState('');
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
  const [wheelPrizes, setWheelPrizes] = useState<WheelPrize[]>([]);
  const [wheelSpins, setWheelSpins] = useState<WheelSpinHistoryItem[]>([]);
  const [wheelPreview, setWheelPreview] = useState<WheelPreviewContract | null>(null);
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
    service.getTransactions(search, page * pageSize, pageSize)
      .then((data) => setTransactions(normalizeAdminTransactionsResponse(data).transactions as AdminTransaction[]))
      .catch((err) => setError(String(err)));
    service.getAuditLogs(page * pageSize, pageSize)
      .then((data) => setAuditLogs(normalizeAdminAuditLogsResponse(data).logs as AdminAuditLog[]))
      .catch((err) => setError(String(err)));
    service.getRewards()
      .then((data) => setRewards(normalizeAdminRewardsResponse(data).rewards))
      .catch(() => {});
    service.getWheelCampaigns()
      .then((data) => {
        const normalized = normalizeWheelCampaignsResponse(data).campaigns;
        setCampaigns(normalized);
        setSelectedWheelCampaignId((current) => current || normalized[0]?.id || '');
      })
      .catch(() => {});
    service.getPolicies()
      .then((data) => {
        const normalized = normalizePolicyConfigsResponse(data).policies;
        setPolicies(normalized);
        setSelectedPolicyKey((current) => current || normalized[0]?.policyKey || '');
      })
      .catch(() => setPolicies([]));
    service.getFeatureFlags()
      .then((data) => {
        const normalized = normalizePolicyConfigsResponse(data).policies;
        const policy = normalized.find((item) => item.policyKey === 'feature_flags') ?? normalized[0] ?? null;
        setFeatureFlagsLive((policy?.publishedData ?? policy?.draftData ?? {}) as Record<string, unknown>);
      })
      .catch(() => setFeatureFlagsLive({}));
    refreshOps();
  }, [page, pageSize, search, service, token]);

  useEffect(() => {
    if (!token || !selectedWheelCampaignId) return;
    Promise.all([
      service.getWheelPrizes(selectedWheelCampaignId),
      service.getWheelPreview(selectedWheelCampaignId),
    ])
      .then(([prizeData, previewData]) => {
        const nextPrizes = normalizeWheelPrizesResponse(prizeData).prizes;
        setWheelPrizes(nextPrizes);
        setWheelPreview(buildWheelPreviewContract({
          campaignId: selectedWheelCampaignId,
          prizes: nextPrizes as unknown as Array<Record<string, unknown>>,
          distribution: Array.isArray((previewData as any)?.distribution) ? (previewData as any).distribution : Array.isArray((previewData as any)?.prizes) ? (previewData as any).prizes : [],
          totalWeight: (previewData as any)?.totalWeight ?? (previewData as any)?.total_weight,
          preset: (previewData as any)?.preset ?? (previewData as any)?.slotPreset,
          mobileMode: (previewData as any)?.mobileMode,
          renderHints: (previewData as any)?.renderHints,
          warnings: (previewData as any)?.warnings,
        }));
      })
      .catch(() => {
        setWheelPrizes([]);
        setWheelPreview(null);
      });
  }, [selectedWheelCampaignId, service, token]);

  useEffect(() => {
    if (!token || !selectedPolicyKey) {
      setPolicyVersions([]);
      return;
    }
    service.getPolicyVersions(selectedPolicyKey)
      .then((data) => {
        const normalized = normalizePolicyVersionsResponse(data).versions;
        setPolicyVersions(normalized);
      })
      .catch(() => setPolicyVersions([]));
  }, [selectedPolicyKey, service, token]);

  useEffect(() => {
    if (!token) return;
    service.getWheelSpins()
      .then((data) => setWheelSpins(normalizeWheelHistoryResponse(data).spins))
      .catch(() => setWheelSpins([]));
  }, [service, token]);

  useEffect(() => {
    if (!token) return;
    refreshOps();
  }, [opsSeverity, opsCategory, opsSource, service, token]);

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

  async function refreshOps() {
    if (!token) return;
    try {
      setOpsLoading(true);
      const [summary, events] = await Promise.all([
        service.getOpsSummary(),
        service.getOpsEvents({
          limit: 20,
          severity: opsSeverity === 'all' ? undefined : opsSeverity,
          category: opsCategory.trim() || undefined,
          source: opsSource.trim() || undefined,
        }),
      ]);
      setOpsSummary(normalizeOpsSummaryResponse(summary).summary);
      setOpsEvents(normalizeOpsEventsResponse(events).events);
    } catch {
      setOpsSummary(null);
      setOpsEvents([]);
    } finally {
      setOpsLoading(false);
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
      setRewards(normalizeAdminRewardsResponse(data).rewards);
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
      setCampaigns(normalizeWheelCampaignsResponse(data).campaigns);
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
      const normalizedPrizes = normalizeWheelPrizesResponse(data).prizes;
      setWheelPrizes(normalizedPrizes);
      const preview = await service.getWheelPreview(prizeCampaignId);
      setWheelPreview(buildWheelPreviewContract({
        campaignId: prizeCampaignId,
        prizes: normalizedPrizes as unknown as Array<Record<string, unknown>>,
        distribution: Array.isArray((preview as any)?.distribution) ? (preview as any).distribution : Array.isArray((preview as any)?.prizes) ? (preview as any).prizes : [],
        totalWeight: (preview as any)?.totalWeight ?? (preview as any)?.total_weight,
        preset: (preview as any)?.preset ?? (preview as any)?.slotPreset,
        mobileMode: (preview as any)?.mobileMode,
        renderHints: (preview as any)?.renderHints,
        warnings: (preview as any)?.warnings,
      }));
      setCreatePrizeOpen(false);
      setNotice('Đã tạo phần thưởng');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo phần thưởng');
    }
  }

  function openPolicyEditor(policy: PolicyConfig) {
    setEditingPolicy(policy);
    setPolicyEditorOpen(true);
    setPolicyScope(policy.scope);
    setPolicyTitle(policy.title);
    setPolicyDescription(policy.description ?? '');
    setPolicyDataText(JSON.stringify(policy.draftData && Object.keys(policy.draftData).length ? policy.draftData : policy.publishedData ?? {}, null, 2));
    setPolicyNote('');
  }

  function refreshPolicies() {
    if (!token) return;
    service.getPolicies()
      .then((data) => {
        const normalized = normalizePolicyConfigsResponse(data).policies;
        setPolicies(normalized);
        setSelectedPolicyKey((current) => current || normalized[0]?.policyKey || '');
      })
      .catch(() => setPolicies([]));
  }

  async function savePolicy(publish = false) {
    if (!editingPolicy) return;
    try {
      setError('');
      setNotice('');
      const parsedData = policyDataText.trim() ? JSON.parse(policyDataText) : {};
      const payload = {
        scope: policyScope,
        title: policyTitle,
        description: policyDescription || null,
        data: parsedData,
        note: policyNote || null,
      };
      if (publish) {
        await service.publishPolicy(editingPolicy.policyKey, payload);
        setNotice('Đã xuất bản chính sách');
      } else {
        await service.updatePolicy(editingPolicy.policyKey, payload);
        setNotice('Đã lưu nháp chính sách');
      }
      refreshPolicies();
      const refreshed = await service.getPolicy(editingPolicy.policyKey);
      const normalized = refreshed ? normalizePolicyConfigsResponse({ policies: [refreshed] }).policies[0] : null;
      setPolicyVersions(normalized?.versions ?? []);
      setEditingPolicy(null);
      setPolicyEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu chính sách');
    }
  }

  async function openPolicyByKey(policyKey: string) {
    setSelectedPolicyKey(policyKey);
    const policy = policies.find((item) => item.policyKey === policyKey);
    if (policy) openPolicyEditor(policy);
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
      const data = await service.getWheelPrizes(selectedWheelCampaignId || editingPrize.campaignId);
      const normalizedPrizes = normalizeWheelPrizesResponse(data).prizes;
      setWheelPrizes(normalizedPrizes);
      const preview = await service.getWheelPreview(selectedWheelCampaignId || editingPrize.campaignId);
      setWheelPreview(buildWheelPreviewContract({
        campaignId: selectedWheelCampaignId || editingPrize.campaignId,
        prizes: normalizedPrizes as unknown as Array<Record<string, unknown>>,
        distribution: Array.isArray((preview as any)?.distribution) ? (preview as any).distribution : Array.isArray((preview as any)?.prizes) ? (preview as any).prizes : [],
        totalWeight: (preview as any)?.totalWeight ?? (preview as any)?.total_weight,
        preset: (preview as any)?.preset ?? (preview as any)?.slotPreset,
        mobileMode: (preview as any)?.mobileMode,
        renderHints: (preview as any)?.renderHints,
        warnings: (preview as any)?.warnings,
      }));
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
      setRewards(normalizeAdminRewardsResponse(data).rewards);
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
      setCampaigns(normalizeWheelCampaignsResponse(data).campaigns);
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
    policies,
    policyVersions,
    featureFlagsLive,
    opsSummary,
    opsEvents,
    opsSeverity,
    setOpsSeverity,
    opsCategory,
    setOpsCategory,
    opsSource,
    setOpsSource,
    opsLoading,
    selectedPolicyKey,
    setSelectedPolicyKey,
    policyEditorOpen,
    setPolicyEditorOpen,
    editingPolicy,
    setEditingPolicy,
    policyScope,
    setPolicyScope,
    policyTitle,
    setPolicyTitle,
    policyDescription,
    setPolicyDescription,
    policyDataText,
    setPolicyDataText,
    policyNote,
    setPolicyNote,
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
    refreshOps,
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
    openPolicyEditor,
    openPolicyByKey,
    refreshPolicies,
    savePolicy,
    handleSavePolicy: savePolicy,
  };
}
