import {
  normalizeWheelCurrentResponse,
  normalizeWheelHistoryResponse,
  normalizeOpsEventsResponse,
  normalizePolicyConfigsResponse,
  normalizePolicyVersionsResponse,
  normalizeOpsSummaryResponse,
} from '@tele-member/shared';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const hasBody = options.body !== undefined && options.body !== null;
  const headers: HeadersInit = {
    ...(hasBody ? { 'content-type': 'application/json' } : {}),
    ...(token ? { authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');
    const error = new Error(typeof body === 'string' ? body : body?.message ?? 'Request failed') as Error & {
      response?: unknown;
    };
    error.response = body;
    throw error;
  }

  return response.json();
}

export function apiClient(token?: string | null) {
  return {
    login: (email: string, password: string) =>
      request('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    telegramLogin: (initData: string) =>
      request('/auth/telegram/webapp', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      }),
    getUsers: (q = '', offset = 0, limit = 20) =>
      request(`/admin/users?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`, {}, token),
    getTransactions: (q = '', offset = 0, limit = 20) =>
      request(`/admin/transactions?q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`, {}, token),
    getAuditLogs: (offset = 0, limit = 20) =>
      request(`/admin/audit-logs?offset=${offset}&limit=${limit}`, {}, token),
    adjust: (payload: { telegramId: string; amount: number; reason: string }) =>
      request('/admin/adjust', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
    adjustSpins: (payload: { telegramId: string; amount: number; reason: string }) =>
      request('/admin/spins/adjust', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
    getDebugEnv: () => request('/admin/debug/env', {}, token),
    getTelegramBotInfo: () => request('/admin/debug/telegram-bot', {}, token),
    getRewards: () => request('/api/rewards', {}, token),
    getReward: (id: string) => request(`/api/rewards/${id}`, {}, token),
    redeemReward: (id: string) => request(`/api/rewards/${id}/redeem`, { method: 'POST' }, token),
    getMyRewards: () => request('/api/me/rewards', {}, token),
    getMyInbox: () => request('/api/me/inbox', {}, token),
    getMySpins: () => request('/api/me/spins', {}, token),
    getSpinTransactions: () => request('/api/me/spin-transactions', {}, token),
    convertPeachesToSpin: (amount = 1) =>
      request('/api/me/spins/convert', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      }, token),
    getWheelCurrent: async () => normalizeWheelCurrentResponse(await request('/api/wheel/current', {}, token)),
    spinWheel: () => request('/api/wheel/spin', { method: 'POST' }, token),
    getWheelHistory: async () => normalizeWheelHistoryResponse(await request('/api/wheel/history', {}, token)),
    adminGetRewards: () => request('/api/admin/rewards', {}, token),
    adminCreateReward: (payload: {
      name: string;
      description?: string | null;
      type: string;
      pointCost: number;
      stock?: number | null;
      isActive?: boolean;
      metadata?: Record<string, unknown>;
    }) => request('/api/admin/rewards', { method: 'POST', body: JSON.stringify(payload) }, token),
    adminUpdateReward: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/rewards/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminDeleteReward: (id: string) => request(`/api/admin/rewards/${id}`, { method: 'DELETE' }, token),
    adminImportRewardCodes: (id: string, codes: string[]) =>
      request(`/api/admin/rewards/${id}/codes/import`, { method: 'POST', body: JSON.stringify({ codes }) }, token),
    adminGetRewardCodes: (id: string) => request(`/api/admin/rewards/${id}/codes`, {}, token),
    adminGetRedemptions: () => request('/api/admin/redemptions', {}, token),
    adminGetOpsSummary: async () => normalizeOpsSummaryResponse(await request('/api/admin/ops/summary', {}, token)),
    adminGetOpsEvents: async (params: { limit?: number; offset?: number; severity?: string; category?: string; source?: string } = {}) =>
      normalizeOpsEventsResponse(await request(`/api/admin/ops/events?${new URLSearchParams(Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>)).toString()}`, {}, token)),
    adminGetPolicies: async () => normalizePolicyConfigsResponse(await request('/api/admin/policies', {}, token)),
    adminGetPolicy: (key: string) => request(`/api/admin/policies/${encodeURIComponent(key)}`, {}, token),
    adminGetPolicyVersions: async (key: string) => normalizePolicyVersionsResponse(await request(`/api/admin/policies/${encodeURIComponent(key)}/versions`, {}, token)),
    adminUpdatePolicy: (key: string, payload: {
      scope: string;
      title: string;
      description?: string | null;
      data?: Record<string, unknown>;
      note?: string | null;
    }) => request(`/api/admin/policies/${encodeURIComponent(key)}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminPublishPolicy: (key: string, payload: {
      scope: string;
      title: string;
      description?: string | null;
      data?: Record<string, unknown>;
      note?: string | null;
    }) => request(`/api/admin/policies/${encodeURIComponent(key)}/publish`, { method: 'POST', body: JSON.stringify(payload) }, token),
    adminGetWheelCampaigns: () => request('/api/admin/wheel/campaigns', {}, token),
    adminCreateWheelCampaign: (payload: Record<string, unknown>) =>
      request('/api/admin/wheel/campaigns', { method: 'POST', body: JSON.stringify(payload) }, token),
    adminUpdateWheelCampaign: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminDeleteWheelCampaign: (id: string) => request(`/api/admin/wheel/campaigns/${id}`, { method: 'DELETE' }, token),
    adminGetWheelPrizes: (id: string) => request(`/api/admin/wheel/campaigns/${id}/prizes`, {}, token),
    adminGetWheelPreview: (id: string) => request(`/api/admin/wheel/campaigns/${id}/preview`, {}, token),
    adminCreateWheelPrize: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/campaigns/${id}/prizes`, { method: 'POST', body: JSON.stringify(payload) }, token),
    adminUpdateWheelPrize: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/prizes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminDeleteWheelPrize: (id: string) => request(`/api/admin/wheel/prizes/${id}`, { method: 'DELETE' }, token),
    adminGetWheelSpins: async () => normalizeWheelHistoryResponse(await request('/api/admin/wheel/spins', {}, token)),
  };
}
