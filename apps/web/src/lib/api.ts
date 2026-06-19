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
    getUsers: (q = '') => request(`/admin/users?q=${encodeURIComponent(q)}`, {}, token),
    getTransactions: (q = '') => request(`/admin/transactions?q=${encodeURIComponent(q)}`, {}, token),
    adjust: (payload: { telegramId: string; amount: number; reason: string }) =>
      request('/admin/adjust', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token),
  };
}

