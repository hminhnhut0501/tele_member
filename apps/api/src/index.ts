import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  adminAuditLogSchema,
  checkinResponseSchema,
  manualAdjustmentSchema,
  pointSummarySchema,
} from '@tele-member/shared';
import { createServiceContext } from './services/context.js';
import { validateTelegramWebAppInitData } from './lib/telegram-webapp.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' });

const context = createServiceContext();

app.get('/health', async () => ({ ok: true }));

function fingerprint(value: string | undefined) {
  if (!value) return null;
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
}

app.post('/auth/admin/login', async (request, reply) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .parse(request.body);

  if (
    body.email !== (process.env.ADMIN_EMAIL ?? 'admin@example.com') ||
    body.password !== (process.env.ADMIN_PASSWORD ?? 'admin123')
  ) {
    return reply.code(401).send({ message: 'Invalid credentials' });
  }

  await context.supabase.from('admin_audit_logs').insert({
    actor_email: body.email,
    action: 'admin_login',
    target_telegram_id: null,
    metadata: {},
  });

  const token = await reply.jwtSign({ role: 'admin', email: body.email });
  return { token };
});

app.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/admin') || request.url.startsWith('/api/admin')) {
    await request.jwtVerify();
    const payload = request.user as { role?: string } | undefined;
    if (payload?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  }

  if (request.url.startsWith('/me') || request.url.startsWith('/api/me')) {
    await request.jwtVerify();
    const payload = request.user as { role?: string } | undefined;
    if (payload?.role !== 'telegram') {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  }

  if (request.url.startsWith('/bot/webhook')) {
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (expectedSecret) {
      const actualSecret = request.headers['x-telegram-bot-api-secret-token'];
      if (actualSecret !== expectedSecret) {
        return reply.code(401).send({ message: 'Invalid webhook secret' });
      }
    }
  }
});

app.get('/admin/users', async (request) => {
  const query = z
    .object({
      q: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .parse(request.query);

  const users = await context.admin.listUsers(query);
  return {
    users,
    limit: query.limit,
    offset: query.offset,
  };
});

app.get('/admin/transactions', async (request) => {
  const query = z
    .object({
      q: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .parse(request.query);

  const transactions = await context.admin.listTransactions(query);
  return {
    transactions,
    limit: query.limit,
    offset: query.offset,
  };
});

app.get('/admin/audit-logs', async (request) => {
  const query = z
    .object({
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    })
    .parse(request.query);
  const logs = await context.admin.listAuditLogs(query);
  return {
    logs,
    limit: query.limit,
    offset: query.offset,
  };
});

app.get('/admin/debug/env', async () => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  return {
    botTokenFingerprint: fingerprint(botToken),
    webhookSecretFingerprint: fingerprint(webhookSecret),
    telegramBotUsername: process.env.TELEGRAM_BOT_USERNAME ?? null,
    webAppUrl: process.env.NEXT_PUBLIC_WEB_APP_URL ?? null,
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? null,
    host: process.env.HOST ?? null,
    port: process.env.PORT ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    hasBotToken: Boolean(botToken),
    hasWebhookSecret: Boolean(webhookSecret),
  };
});

app.get('/admin/debug/telegram-bot', async (request, reply) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return reply.code(500).send({ message: 'Missing bot token' });
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) {
    return reply.code(502).send({
      message: 'Unable to fetch Telegram bot identity',
      status: response.status,
      description: data?.description ?? null,
    });
  }

  return {
    id: data.result?.id ?? null,
    isBot: data.result?.is_bot ?? null,
    firstName: data.result?.first_name ?? null,
    username: data.result?.username ?? null,
    canJoinGroups: data.result?.can_join_groups ?? null,
    canReadAllGroupMessages: data.result?.can_read_all_group_messages ?? null,
    supportsInlineQueries: data.result?.supports_inline_queries ?? null,
  };
});

app.get('/api/rewards', async () => ({
  rewards: await context.rewards.listRewards(),
}));

app.get('/api/rewards/:id', async (request, reply) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const reward = await context.rewards.getReward(params.id);
  if (!reward) return reply.code(404).send({ message: 'Not found' });
  return reward;
});

app.post('/api/rewards/:id/redeem', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return reply.code(404).send({ message: 'User not found' });
  return context.rewards.redeemReward({ userId: user.id, rewardId: params.id });
});

app.get('/api/me/rewards', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return { rewards: [] };
  return { rewards: await context.rewards.listMyRedemptions(user.id) };
});

app.get('/api/me/spins', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return { balance: 0 };
  const { data } = await context.supabase.from('spin_wallets').select('balance').eq('user_id', user.id).maybeSingle();
  return { balance: data?.balance ?? 0 };
});

app.get('/api/me/spin-transactions', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return { transactions: [] };
  const { data = [] } = await context.supabase
    .from('spin_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return { transactions: data };
});

app.get('/api/wheel/current', async () => {
  const campaign = await context.wheel.getCurrentCampaign();
  if (!campaign) return { campaign: null, prizes: [] };
  return { campaign, prizes: await context.wheel.listCampaignPrizes(campaign.id) };
});

app.post('/api/wheel/spin', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return reply.code(404).send({ message: 'User not found' });
  const campaign = await context.wheel.getCurrentCampaign();
  if (!campaign) return reply.code(400).send({ message: 'No active campaign' });
  return context.wheel.spin(user.id, campaign.id);
});

app.get('/api/wheel/history', async (request, reply) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) return reply.code(401).send({ message: 'Unauthorized' });
  const user = await context.points.getUserByTelegramId(telegramId);
  if (!user) return { spins: [] };
  return { spins: await context.wheel.listSpinHistory(user.id) };
});

app.get('/api/admin/rewards', async () => ({ rewards: await context.rewards.listRewards() }));

app.post('/api/admin/rewards', async (request) => {
  const body = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    type: z.enum(['VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'POINT_BONUS', 'CUSTOM']),
    pointCost: z.number().int().nonnegative(),
    stock: z.number().int().nullable().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.rewards.createReward(body);
});

app.patch('/api/admin/rewards/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    type: z.enum(['VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'POINT_BONUS', 'CUSTOM']).optional(),
    pointCost: z.number().int().nonnegative().optional(),
    stock: z.number().int().nullable().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.rewards.updateReward(params.id, body);
});

app.delete('/api/admin/rewards/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  return context.rewards.updateReward(params.id, { isActive: false });
});

app.post('/api/admin/rewards/:id/codes/import', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({ codes: z.array(z.string().min(1)) }).parse(request.body);
  return { codes: await context.rewards.importCodes(params.id, body.codes) };
});

app.get('/api/admin/rewards/:id/codes', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  return { codes: await context.rewards.listCodes(params.id) };
});

app.get('/api/admin/redemptions', async (request) => {
  const query = z.object({
    rewardId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }).parse(request.query);
  return { redemptions: await context.rewards.listAdminRedemptions(query) };
});

app.get('/api/admin/wheel/campaigns', async () => {
  const { data = [] } = await context.supabase.from('wheel_campaigns').select('*').order('created_at', { ascending: false });
  return { campaigns: data };
});

app.post('/api/admin/wheel/campaigns', async (request) => {
  const body = z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.wheel.createCampaign(body);
});

app.patch('/api/admin/wheel/campaigns/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({
    name: z.string().optional(),
    description: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.wheel.updateCampaign(params.id, body);
});

app.delete('/api/admin/wheel/campaigns/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  return context.wheel.updateCampaign(params.id, { isActive: false });
});

app.get('/api/admin/wheel/campaigns/:id/prizes', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  return { prizes: await context.wheel.listCampaignPrizes(params.id) };
});

app.post('/api/admin/wheel/campaigns/:id/prizes', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({
    name: z.string().min(1),
    type: z.enum(['POINT', 'VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'NOTHING', 'CUSTOM']),
    weight: z.number().int().positive(),
    stock: z.number().int().nullable().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.wheel.createPrize(params.id, body);
});

app.patch('/api/admin/wheel/prizes/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  const body = z.object({
    name: z.string().optional(),
    type: z.enum(['POINT', 'VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'NOTHING', 'CUSTOM']).optional(),
    weight: z.number().int().positive().optional(),
    stock: z.number().int().nullable().optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }).parse(request.body);
  return context.wheel.updatePrize(params.id, body);
});

app.delete('/api/admin/wheel/prizes/:id', async (request) => {
  const params = z.object({ id: z.string().uuid() }).parse(request.params);
  return context.wheel.updatePrize(params.id, { isActive: false });
});

app.get('/api/admin/wheel/spins', async (request) => {
  const query = z.object({
    userId: z.string().uuid().optional(),
    campaignId: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }).parse(request.query);
  return { spins: await context.wheel.listAdminSpins(query) };
});

app.post('/admin/adjust', async (request) => {
  const body = manualAdjustmentSchema.parse(request.body);
  const auth = (request.user as { email?: string } | undefined)?.email;
  const result = await context.admin.adjustPoints({ ...body, actorEmail: auth });
  return result;
});

app.get('/me/summary', async (request) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) {
    return { telegramId: '', balance: 0, transactions: [] };
  }

  const summary = await context.points.getSummary(telegramId);
  return summary;
});

app.post('/me/checkin', async (request) => {
  const payload = request.user as { telegramId?: string } | undefined;
  const telegramId = payload?.telegramId;
  if (!telegramId) {
    return { message: 'Unauthorized' };
  }

  const user = await context.points.getUserByTelegramId(telegramId);
  const response = await context.points.checkIn({
    telegramId,
    username: user?.username ?? null,
    firstName: user?.first_name ?? null,
    lastName: user?.last_name ?? null,
    avatarUrl: user?.avatar_url ?? null,
  });

  return response;
});

app.post('/auth/telegram/webapp', async (request, reply) => {
  const body = z
    .object({
      initData: z.string().min(1),
    })
    .parse(request.body);

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return reply.code(500).send({ message: 'Missing bot token' });
  }

  const payload = validateTelegramWebAppInitData(body.initData, botToken);
  if (!payload.ok) {
    return reply.code(401).send({
      message: 'Invalid Telegram WebApp initData',
      reason: payload.reason,
      details: 'details' in payload ? payload.details : undefined,
    });
  }

  if (!payload.user?.id) {
    return reply.code(401).send({ message: 'Invalid Telegram WebApp initData', reason: 'missing_user_id' });
  }

  const telegramId = String(payload.user.id);
  const profile = {
    telegramId,
    username: payload.user.username ?? null,
    firstName: payload.user.first_name ?? null,
    lastName: payload.user.last_name ?? null,
    avatarUrl: payload.user.photo_url ?? null,
  };

  await context.points.upsertUser(profile);
  const token = await reply.jwtSign({ role: 'telegram', telegramId });
  return { token, telegramId };
});

app.post('/bot/webhook', async (request) => {
  const update = z.record(z.unknown()).parse(request.body);
  const result = await context.telegram.handleUpdate(update);
  return result;
});

app.post('/bot/checkin', async (request) => {
  const body = z
    .object({
      telegramId: z.string().min(1),
      username: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      avatarUrl: z.string().url().optional(),
    })
    .parse(request.body);

  const response = await context.points.checkIn({
    telegramId: body.telegramId,
    username: body.username ?? null,
    firstName: body.firstName ?? null,
    lastName: body.lastName ?? null,
    avatarUrl: body.avatarUrl ?? null,
  });

  return checkinResponseSchema.parse(response);
});

app.get('/bot/points/:telegramId', async (request) => {
  const params = z
    .object({
      telegramId: z.string().min(1),
    })
    .parse(request.params);

  const summary = await context.points.getSummary(params.telegramId);
  return pointSummarySchema.parse(summary);
});

app.get('/bot/help', async () => ({
  commands: ['/start', '/help', '/diemdanh', '/checkin', '/diem'],
}));

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

await app.listen({ port, host });
