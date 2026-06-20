export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

async function request(path: string, options: RequestInit = {}, token?: string | null) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
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
    getDebugEnv: () => request('/admin/debug/env', {}, token),
    getTelegramBotInfo: () => request('/admin/debug/telegram-bot', {}, token),
    getRewards: () => request('/api/rewards', {}, token),
    getReward: (id: string) => request(`/api/rewards/${id}`, {}, token),
    redeemReward: (id: string) => request(`/api/rewards/${id}/redeem`, { method: 'POST' }, token),
    getMyRewards: () => request('/api/me/rewards', {}, token),
    getMySpins: () => request('/api/me/spins', {}, token),
    getSpinTransactions: () => request('/api/me/spin-transactions', {}, token),
    getWheelCurrent: () => request('/api/wheel/current', {}, token),
    spinWheel: () => request('/api/wheel/spin', { method: 'POST' }, token),
    getWheelHistory: () => request('/api/wheel/history', {}, token),
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
    adminGetWheelCampaigns: () => request('/api/admin/wheel/campaigns', {}, token),
    adminCreateWheelCampaign: (payload: Record<string, unknown>) =>
      request('/api/admin/wheel/campaigns', { method: 'POST', body: JSON.stringify(payload) }, token),
    adminUpdateWheelCampaign: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminDeleteWheelCampaign: (id: string) => request(`/api/admin/wheel/campaigns/${id}`, { method: 'DELETE' }, token),
    adminGetWheelPrizes: (id: string) => request(`/api/admin/wheel/campaigns/${id}/prizes`, {}, token),
    adminCreateWheelPrize: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/campaigns/${id}/prizes`, { method: 'POST', body: JSON.stringify(payload) }, token),
    adminUpdateWheelPrize: (id: string, payload: Record<string, unknown>) =>
      request(`/api/admin/wheel/prizes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }, token),
    adminDeleteWheelPrize: (id: string) => request(`/api/admin/wheel/prizes/${id}`, { method: 'DELETE' }, token),
    adminGetWheelSpins: () => request('/api/admin/wheel/spins', {}, token),
  };
}
