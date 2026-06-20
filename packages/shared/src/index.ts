import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.string(),
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const pointTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int(),
  type: z.enum(['credit', 'debit']),
  reason: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});

export const pointSummarySchema = z.object({
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  balance: z.number().int(),
  streak: z.number().int(),
  lastCheckinAt: z.string().nullable(),
  transactions: z.array(pointTransactionSchema),
});

export const checkinResponseSchema = z.object({
  telegramId: z.string(),
  today: z.string(),
  alreadyCheckedIn: z.boolean(),
  pointsGained: z.number().int(),
  totalPoints: z.number().int(),
  streak: z.number().int(),
  message: z.string(),
});

export const adminUserRowSchema = userSchema.extend({
  balance: z.number().int(),
  lastCheckinDate: z.string().nullable(),
});

export const adminTransactionRowSchema = pointTransactionSchema.extend({
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export const adminAuditLogSchema = z.object({
  id: z.string().uuid(),
  actorEmail: z.string().email(),
  action: z.string(),
  targetTelegramId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const manualAdjustmentSchema = z.object({
  telegramId: z.string().min(1),
  amount: z.number().int().refine((value) => value !== 0, 'Amount must not be zero'),
  reason: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const telegramProfileSchema = z.object({
  telegramId: z.string(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;
export type PointTransaction = z.infer<typeof pointTransactionSchema>;
export type PointSummary = z.infer<typeof pointSummarySchema>;
export type CheckinResponse = z.infer<typeof checkinResponseSchema>;
export type AdminUserRow = z.infer<typeof adminUserRowSchema>;
export type AdminTransactionRow = z.infer<typeof adminTransactionRowSchema>;
export type AdminAuditLog = z.infer<typeof adminAuditLogSchema>;
export type ManualAdjustment = z.infer<typeof manualAdjustmentSchema>;
export type TelegramProfile = z.infer<typeof telegramProfileSchema>;
