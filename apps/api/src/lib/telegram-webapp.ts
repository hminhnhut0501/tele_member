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
  if (!hash) return null;

  params.delete('hash');
  const pairs = Array.from(params.entries())
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(pairs).digest('hex');

  if (!safeCompare(calculatedHash, hash)) return null;

  const userRaw = params.get('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  return {
    authDate: Number(params.get('auth_date') ?? '0'),
    queryId: params.get('query_id'),
    startParam: params.get('start_param'),
    user,
  };
}
