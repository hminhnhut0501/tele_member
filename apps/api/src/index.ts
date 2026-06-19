import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { z } from 'zod';
import {
  checkinResponseSchema,
  manualAdjustmentSchema,
  pointSummarySchema,
} from '@tele-member/shared';
import { createServiceContext } from './services/context.js';

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

app.post('/admin/adjust', async (request) => {
  const body = manualAdjustmentSchema.parse(request.body);
  const result = await context.admin.adjustPoints(body);
  return result;
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
