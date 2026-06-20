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
  todayStatus: z.enum(['checked_in', 'not_checked_in', 'already_checked_in']),
  pointsGainedToday: z.number().int(),
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

export const rewardTypeSchema = z.enum(['VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'POINT_BONUS', 'CUSTOM']);
export const rewardStatusSchema = z.enum(['AVAILABLE', 'USED', 'EXPIRED']);
export const redemptionStatusSchema = z.enum(['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED']);
export const wheelPrizeTypeSchema = z.enum(['POINT', 'VOUCHER', 'VIP_CODE', 'SPIN_TICKET', 'NOTHING', 'CUSTOM']);

export const rewardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  type: rewardTypeSchema,
  pointCost: z.number().int(),
  stock: z.number().int().nullable(),
  isActive: z.boolean(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const rewardCodeSchema = z.object({
  id: z.string().uuid(),
  rewardId: z.string().uuid(),
  code: z.string(),
  status: rewardStatusSchema,
  assignedTo: z.string().uuid().nullable(),
  assignedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const rewardRedemptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  rewardId: z.string().uuid(),
  codeId: z.string().uuid().nullable(),
  pointCost: z.number().int(),
  status: redemptionStatusSchema,
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const spinWalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  balance: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const spinTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number().int(),
  type: z.enum(['REDEEM_REWARD', 'ADMIN_ADJUST', 'SPIN_USED', 'SPIN_PRIZE', 'SYSTEM_REFUND']),
  reason: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const wheelCampaignSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const wheelPrizeSchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  name: z.string(),
  type: wheelPrizeTypeSchema,
  weight: z.number().int(),
  stock: z.number().int().nullable(),
  isActive: z.boolean(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const wheelSpinSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  campaignId: z.string().uuid(),
  prizeId: z.string().uuid().nullable(),
  costSpins: z.number().int(),
  resultMetadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
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
export type Reward = z.infer<typeof rewardSchema>;
export type RewardCode = z.infer<typeof rewardCodeSchema>;
export type RewardRedemption = z.infer<typeof rewardRedemptionSchema>;
export type SpinWallet = z.infer<typeof spinWalletSchema>;
export type SpinTransaction = z.infer<typeof spinTransactionSchema>;
export type WheelCampaign = z.infer<typeof wheelCampaignSchema>;
export type WheelPrize = z.infer<typeof wheelPrizeSchema>;
export type WheelSpin = z.infer<typeof wheelSpinSchema>;
