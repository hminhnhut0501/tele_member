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
    throw new Error(await response.text());
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
  };
}
