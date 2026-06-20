import crypto from 'node:crypto';

function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function validateTelegramWebAppInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return { ok: false as const, reason: 'missing_hash' as const };
  }

  const dataCheckString = initData
    .split('&')
    .filter((part) => part && !part.startsWith('hash='))
    .sort()
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (!safeCompare(calculatedHash, hash)) {
    return {
      ok: false as const,
      reason: 'hash_mismatch' as const,
      details: {
        calculatedHash,
        receivedHash: hash,
        pairCount: params.size - 1,
        hasUser: params.has('user'),
        hasAuthDate: params.has('auth_date'),
      },
    };
  }

  const userRaw = params.get('user');
  try {
    const user = userRaw ? JSON.parse(userRaw) : null;
    return {
      ok: true as const,
      authDate: Number(params.get('auth_date') ?? '0'),
      queryId: params.get('query_id'),
      startParam: params.get('start_param'),
      user,
    };
  } catch {
    return { ok: false as const, reason: 'invalid_user_json' as const };
  }
}
