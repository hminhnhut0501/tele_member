import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
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
  if (request.url.startsWith('/admin')) {
    await request.jwtVerify();
    const payload = request.user as { role?: string } | undefined;
    if (payload?.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  }

  if (request.url.startsWith('/me')) {
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
