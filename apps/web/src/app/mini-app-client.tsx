'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Fade,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../lib/api';

type Summary = {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  balance: number;
  streak: number;
  lastCheckinAt: string | null;
  todayStatus: 'checked_in' | 'not_checked_in' | 'already_checked_in';
  pointsGainedToday: number;
  transactions: Array<{
    id: string;
    amount: number;
    reason: string;
    type: 'credit' | 'debit';
    createdAt: string;
  }>;
};

type DebugInfo = {
  hasTelegram: boolean;
  hasWebApp: boolean;
  initDataLength: number;
  platform: string;
  version: string;
  userAgent: string;
  href: string;
  referrer: string;
  hash: string;
  initDataUnsafe: Record<string, unknown> | null;
};

type BootIssue =
  | 'none'
  | 'no_telegram_object'
  | 'no_webapp_bridge'
  | 'empty_init_data'
  | 'missing_hash'
  | 'hash_mismatch'
  | 'invalid_user_json'
  | 'missing_user_id'
  | 'auth_failed'
  | 'unknown_error';

function sanitizeInitDataUnsafe(value: any) {
  if (!value || typeof value !== 'object') return null;

  const user = value.user && typeof value.user === 'object'
    ? {
        id: value.user.id ?? null,
        first_name: value.user.first_name ?? null,
        last_name: value.user.last_name ?? null,
        username: value.user.username ?? null,
        language_code: value.user.language_code ?? null,
        is_premium: value.user.is_premium ?? null,
        allows_write_to_pm: value.user.allows_write_to_pm ?? null,
      }
    : null;

  return {
    query_id: value.query_id ?? null,
    auth_date: value.auth_date ?? null,
    start_param: value.start_param ?? null,
    chat_type: value.chat_type ?? null,
    chat_instance: value.chat_instance ? '••••••' : null,
    user,
  };
}

export default function MiniAppClient() {
  const client = useMemo(() => apiClient(), []);
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-telegram' | 'error'>('loading');
  const [error, setError] = useState('');
  const [bootIssue, setBootIssue] = useState<BootIssue>('none');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [checkinMessage, setCheckinMessage] = useState('');
  const [pulse, setPulse] = useState(false);
  const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_WEBAPP === 'true';

  const bridgeReady = Boolean(debugInfo?.hasTelegram && debugInfo?.hasWebApp && (debugInfo?.initDataLength ?? 0) > 0);

  function getFallbackInitData() {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    if (!hash) return '';

    const params = new URLSearchParams(hash);
    const direct = params.get('tgWebAppData') ?? params.get('initData') ?? '';
    return direct ? decodeURIComponent(direct) : '';
  }

  function getBootIssueMessage(issue: BootIssue) {
    switch (issue) {
      case 'no_telegram_object':
        return 'Trang này đang mở ngoài Telegram, nên `window.Telegram` không tồn tại.';
      case 'no_webapp_bridge':
        return 'Telegram có mở trang, nhưng chưa inject được WebApp bridge.';
      case 'empty_init_data':
        return 'Bridge có tồn tại nhưng `initData` rỗng. Thường là Telegram desktop/app mở sai luồng hoặc app chưa nhận context.';
      case 'auth_failed':
        return 'Bridge đã có dữ liệu, nhưng server từ chối xác thực `initData`. Có thể token/bot hoặc chữ ký đang lệch.';
      case 'missing_hash':
        return 'initData gửi lên server không có `hash`, nên Telegram không thể xác thực.';
      case 'hash_mismatch':
        return 'Chữ ký HMAC không khớp. Thường là bot token ở Render đang khác bot thật, hoặc dữ liệu initData bị sửa/truncated.';
      case 'invalid_user_json':
        return 'Trường `user` trong initData không parse được JSON.';
      case 'missing_user_id':
        return 'initData có nhưng không có `user.id`.';
      case 'unknown_error':
        return 'Có lỗi không xác định trong lúc khởi tạo WebApp.';
      default:
        return 'Sẵn sàng.';
    }
  }

  useEffect(() => {
    let cancelled = false;

    const initTelegram = async () => {
      try {
        let telegram = (window as any).Telegram;
        let tg = telegram?.WebApp;

        const waitForBridge = async () => {
          for (let attempt = 0; attempt < 50; attempt += 1) {
            telegram = (window as any).Telegram;
            tg = telegram?.WebApp;
            if (tg?.initData !== undefined) {
              return tg;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
          return tg;
        };

        const readyWebApp = await waitForBridge();
        if (cancelled) return;

        const fallbackInitData = readyWebApp?.initData ? '' : getFallbackInitData();
        const initData = readyWebApp?.initData || fallbackInitData || '';
        const initDataUnsafe = sanitizeInitDataUnsafe(readyWebApp?.initDataUnsafe ?? null);
        const userAgent = window.navigator.userAgent;
        const href = window.location.href;
        const referrer = window.document.referrer;
        const hash = window.location.hash;
        if (debugEnabled) {
          console.debug('[webapp debug] Telegram WebApp bridge', {
            hasTelegram: Boolean(telegram),
            hasWebApp: Boolean(readyWebApp),
            platform: readyWebApp?.platform ?? 'unknown',
            version: readyWebApp?.version ?? 'unknown',
            userAgent,
            href,
            referrer,
            hash,
            fallbackInitDataLength: fallbackInitData.length,
            initDataUnsafe,
          });
        }
        setDebugInfo({
          hasTelegram: Boolean(telegram),
          hasWebApp: Boolean(readyWebApp),
          initDataLength: initData.length,
          platform: readyWebApp?.platform ?? 'unknown',
          version: readyWebApp?.version ?? 'unknown',
          userAgent,
          href,
          referrer,
          hash,
          initDataUnsafe,
        });

        if (!telegram) {
          setBootIssue('no_telegram_object');
        } else if (!readyWebApp) {
          setBootIssue('no_webapp_bridge');
        } else if (!initData) {
          setBootIssue('empty_init_data');
        } else {
          setBootIssue('none');
        }

        if (!initData) {
          setError('Telegram WebApp bridge chưa sẵn sàng hoặc không được inject.');
          setStatus('not-telegram');
          return;
        }

        readyWebApp?.ready?.();
        readyWebApp?.expand?.();

        const auth = await client.telegramLogin(initData);
        if (cancelled) return;
        setToken(auth.token);

        const data = await fetchSummary(auth.token);
        if (cancelled) return;
        setSummary(data);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        const response = (err as any)?.response;
        const serverReason = response?.reason as string | undefined;
        if (serverReason === 'missing_hash') setBootIssue('missing_hash');
        else if (serverReason === 'hash_mismatch') setBootIssue('hash_mismatch');
        else if (serverReason === 'invalid_user_json') setBootIssue('invalid_user_json');
        else if (serverReason === 'missing_user_id') setBootIssue('missing_user_id');
        else setBootIssue('auth_failed');
        setError(response?.message ?? 'Không thể xác thực Telegram WebApp.');
        setStatus('error');
      }
    };

    void initTelegram();
    return () => {
      cancelled = true;
    };
  }, [client]);

  async function fetchSummary(authToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/summary`, {
      headers: { authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) {
      throw new Error('Failed to load summary');
    }
    return response.json();
  }

  async function handleCheckin() {
    if (!token) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/checkin`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCheckinMessage(data.message ?? 'Done');
      setPulse(true);
      const refreshed = await fetchSummary(token);
      setSummary(refreshed);
    } catch {
      setError('Không thể điểm danh.');
    }
  }

  const renderDebugCard = () => {
    if (!debugEnabled) return null;
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Debug
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">hasTelegram: {String(debugInfo?.hasTelegram ?? false)}</Typography>
            <Typography variant="body2">hasWebApp: {String(debugInfo?.hasWebApp ?? false)}</Typography>
            <Typography variant="body2">initDataLength: {debugInfo?.initDataLength ?? 0}</Typography>
            <Typography variant="body2">platform: {debugInfo?.platform ?? 'unknown'}</Typography>
            <Typography variant="body2">version: {debugInfo?.version ?? 'unknown'}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>href: {debugInfo?.href ?? 'unknown'}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>referrer: {debugInfo?.referrer ?? 'unknown'}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>hash: {debugInfo?.hash ?? 'unknown'}</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
              userAgent: {debugInfo?.userAgent ?? 'unknown'}
            </Typography>
            <Box
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                m: 0,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(2,6,23,0.04)',
                fontSize: 12,
                lineHeight: 1.5,
                overflow: 'auto',
              }}
            >
              {JSON.stringify(debugInfo?.initDataUnsafe ?? null, null, 2)}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  if (status === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={2} direction="row" alignItems="center">
                <Skeleton variant="circular" width={56} height={56} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={28} />
                  <Skeleton width="35%" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton width="30%" />
              <Skeleton width="50%" height={72} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Skeleton width="40%" />
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
            </CardContent>
          </Card>
        </Stack>
      </Container>
    );
  }

  if (status === 'not-telegram') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 5, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,247,250,0.96))' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(20,184,166,0.18), rgba(15,118,110,0.1))', color: 'primary.main', fontSize: 28 }}>
                  ↗
                </Box>
                <Chip label={bridgeReady ? 'Telegram bridge: ON' : 'Telegram bridge: OFF'} color={bridgeReady ? 'success' : 'error'} size="small" />
              </Stack>
              <Typography variant="h5" fontWeight={800}>Mở trong Telegram để tiếp tục</Typography>
              <Typography color="text.secondary">
                {getBootIssueMessage(bootIssue)}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" onClick={() => { setError(''); setStatus('loading'); window.location.reload(); }} sx={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}>Thử lại</Button>
                <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</Button>
                {debugEnabled ? (
                  <Button
                    variant="outlined"
                    onClick={() => navigator.clipboard?.writeText(JSON.stringify(debugInfo ?? { bootIssue, error }, null, 2))}
                  >
                    Copy debug
                  </Button>
                ) : null}
              </Stack>
              <Card variant="outlined" sx={{ bgcolor: 'rgba(15,118,110,0.04)' }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Cách mở đúng</Typography>
                  <Typography variant="body2" color="text.secondary">1. Quay lại bot Telegram<br />2. Gõ /start<br />3. Bấm Open App<br />4. Nếu vẫn lỗi, gửi cho mình JSON debug bên dưới</Typography>
                </CardContent>
              </Card>
              {renderDebugCard()}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (status === 'error') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card sx={{ borderRadius: 5, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)', background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,244,244,0.96))' }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={800}>Có lỗi xảy ra</Typography>
              <Typography color="text.secondary">{getBootIssueMessage(bootIssue)}</Typography>
              <Alert severity="error">{error}</Alert>
              {bootIssue === 'hash_mismatch' ? (
                <Card variant="outlined" sx={{ bgcolor: 'rgba(239,68,68,0.04)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                      Cách fix nhanh
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      1. Kiểm tra `TELEGRAM_BOT_TOKEN` trên Render có đúng bot đang mở app không.
                      <br />
                      2. Redeploy backend sau khi đổi env.
                      <br />
                      3. Mở lại mini app từ `/start` và nút `Open App` mới.
                    </Typography>
                  </CardContent>
                </Card>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="contained" onClick={() => { setError(''); setStatus('loading'); window.location.reload(); }} sx={{ background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)' }}>Thử lại</Button>
                <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</Button>
                {debugEnabled ? (
                  <Button
                    variant="outlined"
                    onClick={() => navigator.clipboard?.writeText(JSON.stringify(debugInfo ?? { bootIssue, error }, null, 2))}
                  >
                    Copy debug
                  </Button>
                ) : null}
              </Stack>
              {renderDebugCard()}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top left, rgba(15,118,110,0.18), transparent 35%), radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,247,251,0.98))', borderRadius: 6 }} />
      <Stack spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={500}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)', background: 'linear-gradient(135deg, rgba(15,118,110,0.08), rgba(255,255,255,0.92))', transform: pulse ? 'translateY(-2px)' : 'translateY(0)', transition: 'transform 220ms ease, box-shadow 220ms ease' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                  <Avatar src={summary?.avatarUrl ?? undefined} sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontWeight: 700 }}>
                    {(summary?.firstName?.[0] ?? summary?.username?.[0] ?? 'T').toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" fontWeight={800} noWrap>
                      {[summary?.firstName, summary?.lastName].filter(Boolean).join(' ') || summary?.username || 'Tele Member'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`@${summary?.username ?? 'unknown'}`} />
                      <Chip size="small" label={`ID ${summary?.telegramId ?? '-'}`} />
                    </Stack>
                  </Box>
                </Stack>
                <Chip label={bridgeReady ? 'Telegram bridge: ON' : 'Telegram bridge: OFF'} color={bridgeReady ? 'success' : 'error'} size="small" />
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        <Fade in timeout={650}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
            <CardContent>
              <Stack direction="row" spacing={2} justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary">Điểm hiện tại</Typography>
                  <Typography variant="h2" fontWeight={800}>{summary?.balance ?? 0}</Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary">Streak</Typography>
                  <Typography variant="h2" fontWeight={800}>{summary?.streak ?? 0}</Typography>
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Lần điểm danh gần nhất: {summary?.lastCheckinAt ? new Date(summary.lastCheckinAt).toLocaleString('vi-VN') : 'Chưa có'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Trạng thái hôm nay: {summary?.todayStatus === 'checked_in' ? 'Đã điểm danh' : summary?.todayStatus === 'already_checked_in' ? 'Đã nhận điểm rồi' : 'Chưa điểm danh'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Điểm nhận hôm nay: {summary?.pointsGainedToday ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Fade>

        <Button
          variant="contained"
          size="large"
          onClick={handleCheckin}
          sx={{
            background: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)',
            boxShadow: '0 14px 30px rgba(20,184,166,0.28)',
            '&:hover': {
              background: 'linear-gradient(135deg, #115E59 0%, #0F766E 100%)',
              boxShadow: '0 16px 34px rgba(20,184,166,0.34)',
            },
          }}
        >
          Điểm danh hôm nay
        </Button>

        {checkinMessage ? <Alert severity="success">{checkinMessage}</Alert> : null}

        <Fade in timeout={800}>
          <Card sx={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)' }}>
            <CardContent>
              <Typography variant="h6">Lịch sử giao dịch</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {summary?.transactions?.length ? (
                  summary.transactions.map((tx) => (
                    <Card key={tx.id} variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Box>
                            <Typography fontWeight={700}>{tx.type.toUpperCase()} {tx.amount}</Typography>
                            <Typography variant="body2" color="text.secondary">{tx.reason}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{tx.createdAt}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card variant="outlined" sx={{ borderStyle: 'dashed' }}>
                    <CardContent>
                      <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ py: 2 }}>
                        <Typography variant="h6" fontWeight={700}>Chưa có giao dịch</Typography>
                        <Typography color="text.secondary">Khi bạn điểm danh hoặc nhận thưởng, lịch sử sẽ xuất hiện ở đây.</Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {renderDebugCard()}
      </Stack>
    </Container>
  );
}
