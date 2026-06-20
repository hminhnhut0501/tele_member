'use client';

import { Component, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Avatar, Box, Button, Chip, Container, Divider, Fade, Skeleton, Stack, Typography } from '@mui/material';
import { apiClient } from '../lib/api';
import { AppSection, HeroChip, MetricCard, PageShell, SectionButton } from './shared-ui';

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
  transactions: Array<{ id: string; amount: number; reason: string; type: 'credit' | 'debit'; createdAt: string }>;
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

type MiniAppErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class MiniAppErrorBoundary extends Component<{ children: ReactNode }, MiniAppErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      errorMessage: error?.message ?? 'Mini app crashed',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[mini-app-client] render error', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageShell>
          <Container maxWidth="sm" sx={{ py: 6 }}>
            <AppSection title="Có lỗi hiển thị" subtitle="Mini app vừa gặp exception khi render giao diện." accent="rose" action={<HeroChip label="Fallback" color="error" />}>
              <Stack spacing={2}>
                <Alert severity="error">{this.state.errorMessage}</Alert>
                <Typography variant="body2" color="text.secondary">
                  Nếu lỗi này tiếp tục xuất hiện, mở DevTools console hoặc gửi lại ảnh màn hình này để mình đọc đúng exception.
                </Typography>
              </Stack>
            </AppSection>
          </Container>
        </PageShell>
      );
    }

    return this.props.children;
  }
}

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
  const appTone = status === 'error' ? 'rose' : status === 'not-telegram' ? 'amber' : 'emerald';

  function getFallbackInitData() {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    if (!hash) return '';
    const params = new URLSearchParams(hash);
    const direct = params.get('tgWebAppData') ?? params.get('initData') ?? '';
    return direct ? decodeURIComponent(direct) : '';
  }

  function getBootIssueMessage(issue: BootIssue) {
    switch (issue) {
      case 'no_telegram_object': return 'Trang này đang mở ngoài Telegram, nên `window.Telegram` không tồn tại.';
      case 'no_webapp_bridge': return 'Telegram có mở trang, nhưng chưa inject được WebApp bridge.';
      case 'empty_init_data': return 'Bridge có tồn tại nhưng `initData` rỗng.';
      case 'auth_failed': return 'Bridge đã có dữ liệu, nhưng server từ chối xác thực `initData`.';
      case 'missing_hash': return 'initData gửi lên server không có `hash`.';
      case 'hash_mismatch': return 'Chữ ký HMAC không khớp. Token/bot hoặc dữ liệu initData đang lệch.';
      case 'invalid_user_json': return 'Trường `user` trong initData không parse được JSON.';
      case 'missing_user_id': return 'initData có nhưng không có `user.id`.';
      case 'unknown_error': return 'Có lỗi không xác định trong lúc khởi tạo WebApp.';
      default: return 'Sẵn sàng.';
    }
  }

  async function fetchSummary(authToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/summary`, {
      headers: { authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) throw new Error('Failed to load summary');
    return response.json();
  }

  useEffect(() => {
    let cancelled = false;
    const initTelegram = async () => {
      try {
        let telegram = (window as any).Telegram;
        let tg = telegram?.WebApp;
        for (let attempt = 0; attempt < 50; attempt += 1) {
          telegram = (window as any).Telegram;
          tg = telegram?.WebApp;
          if (tg?.initData !== undefined) break;
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (cancelled) return;

        const fallbackInitData = tg?.initData ? '' : getFallbackInitData();
        const initData = tg?.initData || fallbackInitData || '';
        const initDataUnsafe = sanitizeInitDataUnsafe(tg?.initDataUnsafe ?? null);
        const debugPayload = {
          hasTelegram: Boolean(telegram),
          hasWebApp: Boolean(tg),
          initDataLength: initData.length,
          platform: tg?.platform ?? 'unknown',
          version: tg?.version ?? 'unknown',
          userAgent: window.navigator.userAgent,
          href: window.location.href,
          referrer: window.document.referrer,
          hash: window.location.hash,
          initDataUnsafe,
        };
        if (debugEnabled) console.debug('[webapp debug]', debugPayload);
        setDebugInfo(debugPayload);

        if (!telegram) setBootIssue('no_telegram_object');
        else if (!tg) setBootIssue('no_webapp_bridge');
        else if (!initData) setBootIssue('empty_init_data');
        else setBootIssue('none');

        if (!initData) {
          setError('Telegram WebApp bridge chưa sẵn sàng hoặc không được inject.');
          setStatus('not-telegram');
          return;
        }

        tg?.ready?.();
        tg?.expand?.();

        const auth = await client.telegramLogin(initData);
        if (cancelled) return;
        setToken(auth.token);
        window.localStorage.setItem('tele-member-token', auth.token);
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
    return () => { cancelled = true; };
  }, [client, debugEnabled]);

  async function handleCheckin() {
    if (!token) return;
    try {
      setError('');
      setCheckinMessage('');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/me/checkin`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Check-in failed');
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
      <AppSection title="Debug bridge" subtitle="Thông tin bridge, version và initData đã che dữ liệu nhạy cảm." accent="violet">
        <Stack spacing={1.2}>
          <MetricCard label="Bridge" value={bridgeReady ? 'ONLINE' : 'OFFLINE'} note={`Telegram: ${String(debugInfo?.hasTelegram ?? false)} | WebApp: ${String(debugInfo?.hasWebApp ?? false)}`} accent={bridgeReady ? 'emerald' : 'amber'} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
            <Chip label={`platform: ${debugInfo?.platform ?? 'unknown'}`} variant="outlined" />
            <Chip label={`version: ${debugInfo?.version ?? 'unknown'}`} variant="outlined" />
            <Chip label={`initDataLength: ${debugInfo?.initDataLength ?? 0}`} variant="outlined" />
            <Chip label={`status: ${status}`} variant="outlined" />
          </Box>
          <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: 'rgba(2,6,23,0.04)', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 12, lineHeight: 1.55 }}>
            {JSON.stringify(debugInfo, null, 2)}
          </Box>
        </Stack>
      </AppSection>
    );
  };

  if (status === 'loading') {
    return (
      <PageShell>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <AppSection title="Đang khởi tạo Telegram WebApp..." subtitle="Đợi bridge và initData từ Telegram." accent="cyan">
            <Stack spacing={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Skeleton variant="circular" width={56} height={56} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={28} />
                  <Skeleton width="35%" />
                </Box>
              </Stack>
              <Skeleton width="30%" />
              <Skeleton width="50%" height={72} />
              <Skeleton width="100%" height={48} />
              <Skeleton width="100%" height={48} />
            </Stack>
          </AppSection>
        </Container>
      </PageShell>
    );
  }

  if (status === 'not-telegram') {
    return (
      <PageShell>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <AppSection title="Mở trong Telegram để tiếp tục" subtitle={getBootIssueMessage(bootIssue)} accent="amber" action={<HeroChip label={bridgeReady ? 'Telegram bridge: ON' : 'Telegram bridge: OFF'} color={bridgeReady ? 'success' : 'error'} />}>
            <Stack spacing={2}>
              <Box sx={{ width: 56, height: 56, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, rgba(37,99,235,0.14), rgba(16,185,129,0.12))', color: 'primary.main', fontSize: 28 }}>
                ↗
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <SectionButton variant="contained" onClick={() => { setError(''); setStatus('loading'); window.location.reload(); }}>Thử lại</SectionButton>
                <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</Button>
                {debugEnabled ? <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(JSON.stringify(debugInfo ?? { bootIssue, error }, null, 2))}>Copy debug</Button> : null}
              </Stack>
              <AppSection title="Cách mở đúng" subtitle="Đường mở chuẩn để Telegram inject initData." accent="blue" compact>
                <Typography variant="body2" color="text.secondary">
                  1. Quay lại bot Telegram
                  <br />
                  2. Gõ /start
                  <br />
                  3. Bấm Open App
                  <br />
                  4. Nếu vẫn lỗi, gửi cho mình JSON debug bên dưới
                </Typography>
              </AppSection>
              {renderDebugCard()}
            </Stack>
          </AppSection>
        </Container>
      </PageShell>
    );
  }

  if (status === 'error') {
    return (
      <PageShell>
        <Container maxWidth="sm" sx={{ py: 6 }}>
          <AppSection title="Có lỗi xảy ra" subtitle={getBootIssueMessage(bootIssue)} accent="rose" action={<HeroChip label="Error" color="error" />}>
            <Stack spacing={2}>
              <Alert severity="error">{error}</Alert>
              {bootIssue === 'hash_mismatch' ? (
                <AppSection title="Cách fix nhanh" subtitle="Các bước kiểm tra nhanh khi initData bị lệch." accent="rose" compact>
                  <Typography variant="body2" color="text.secondary">
                    1. Kiểm tra `TELEGRAM_BOT_TOKEN` trên Render có đúng bot đang mở app không.
                    <br />
                    2. Redeploy backend sau khi đổi env.
                    <br />
                    3. Mở lại mini app từ `/start` và nút `Open App` mới.
                  </Typography>
                </AppSection>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <SectionButton variant="contained" onClick={() => { setError(''); setStatus('loading'); window.location.reload(); }}>Thử lại</SectionButton>
                <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(window.location.href)}>Copy link</Button>
                {debugEnabled ? <Button variant="outlined" onClick={() => navigator.clipboard?.writeText(JSON.stringify(debugInfo ?? { bootIssue, error }, null, 2))}>Copy debug</Button> : null}
              </Stack>
              {renderDebugCard()}
            </Stack>
          </AppSection>
        </Container>
      </PageShell>
    );
  }

  return (
    <MiniAppErrorBoundary>
      <PageShell>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Fade in timeout={500}>
            <AppSection title="Tele Member" subtitle="Mini app dashboard kết nối Telegram bridge và Supabase." accent={appTone} action={<HeroChip label={bridgeReady ? 'Telegram bridge: ON' : 'Telegram bridge: OFF'} color={bridgeReady ? 'success' : 'error'} />}>
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
              </Stack>
            </AppSection>
          </Fade>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            <MetricCard label="Điểm hiện tại" value={String(summary?.balance ?? 0)} note="Số điểm đang có trong ví" accent="emerald" />
            <MetricCard label="Streak" value={String(summary?.streak ?? 0)} note={`Lần điểm danh gần nhất: ${summary?.lastCheckinAt ? new Date(summary.lastCheckinAt).toLocaleString('vi-VN') : 'Chưa có'}`} accent="blue" />
          </Box>

          <AppSection title="Today status" subtitle={`Trạng thái hôm nay: ${summary?.todayStatus === 'checked_in' ? 'Đã điểm danh' : summary?.todayStatus === 'already_checked_in' ? 'Đã nhận điểm rồi' : 'Chưa điểm danh'}`} accent="cyan">
            <Typography variant="body2" color="text.secondary">Điểm nhận hôm nay: {summary?.pointsGainedToday ?? 0}</Typography>
          </AppSection>

          <SectionButton variant="contained" size="large" onClick={handleCheckin} sx={{ py: 1.2 }}>
            Điểm danh hôm nay
          </SectionButton>

          {checkinMessage ? <Alert severity="success">{checkinMessage}</Alert> : null}
          {error ? <Alert severity="error">{error}</Alert> : null}

          <AppSection title="Lịch sử giao dịch" subtitle="Các phát sinh credit/debit gần nhất." accent="violet">
            <Stack spacing={1}>
              {summary?.transactions?.length ? (
                summary.transactions.map((tx) => (
                  <Box key={tx.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.8)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography fontWeight={700}>{tx.type.toUpperCase()} {tx.amount}</Typography>
                        <Typography variant="body2" color="text.secondary">{tx.reason}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">{new Date(tx.createdAt).toLocaleString('vi-VN')}</Typography>
                    </Stack>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Chưa có giao dịch nào.</Typography>
              )}
            </Stack>
          </AppSection>

        {renderDebugCard()}
      </Stack>
      </Container>
      </PageShell>
    </MiniAppErrorBoundary>
  );
}
