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
  peachesGainedToday: z.number().int().optional(),
  currencyEmoji: z.string().optional(),
  currencyLabel: z.string().optional(),
  spinExchangeRate: z.number().int().optional(),
  spinExchangeCost: z.number().int().optional(),
});

export const checkinResponseSchema = z.object({
  telegramId: z.string(),
  today: z.string(),
  alreadyCheckedIn: z.boolean(),
  pointsGained: z.number().int(),
  totalPoints: z.number().int(),
  streak: z.number().int(),
  message: z.string(),
  peachesGained: z.number().int().optional(),
  totalPeaches: z.number().int().optional(),
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
  deliveryStatus: z.string(),
  deliveryMode: z.string(),
  deliveryTarget: z.string(),
  deliveryPayload: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const rewardInboxStatusSchema = z.enum(['new', 'delivered', 'claimed', 'expired', 'failed']);
export const rewardInboxKindSchema = z.enum(['POINT', 'SPIN_TICKET', 'VOUCHER', 'VIP_CODE', 'ITEM', 'BADGE', 'NOTHING', 'CUSTOM']);

export const rewardInboxSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceType: z.enum(['wheel', 'reward_redemption', 'manual', 'checkin']),
  sourceId: z.string().uuid().nullable(),
  kind: rewardInboxKindSchema,
  status: rewardInboxStatusSchema,
  claimable: z.boolean(),
  title: z.string(),
  subtitle: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()),
  claimUrl: z.string().nullable(),
  expiresAt: z.string().nullable(),
  viewedAt: z.string().nullable(),
  claimedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const rewardDeliveryLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  sourceType: z.enum(['wheel', 'reward_redemption', 'manual', 'checkin']),
  sourceId: z.string().uuid().nullable(),
  rewardId: z.string().uuid().nullable(),
  prizeId: z.string().uuid().nullable(),
  deliveryMode: z.string(),
  deliveryTarget: z.string(),
  status: z.enum(['success', 'failed', 'pending']),
  message: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()),
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
export type RewardInboxItem = z.infer<typeof rewardInboxSchema>;
export type RewardDeliveryLog = z.infer<typeof rewardDeliveryLogSchema>;
export type SpinWallet = z.infer<typeof spinWalletSchema>;
export type SpinTransaction = z.infer<typeof spinTransactionSchema>;
export type WheelCampaign = z.infer<typeof wheelCampaignSchema>;
export type WheelPrize = z.infer<typeof wheelPrizeSchema>;
export type WheelSpin = z.infer<typeof wheelSpinSchema>;

export type WheelPreviewRenderMode = 'emoji-only' | 'label-only' | 'mixed';
export type WheelPreviewPreset = 'five' | 'six' | 'eight' | 'tenPlus' | 'custom';

export type WheelPreviewDistributionItem = {
  prizeId: string;
  name: string;
  type: string;
  weight: number;
  chance: number;
  isActive: boolean;
  renderMode: WheelPreviewRenderMode;
  emoji?: string;
  emojiCount?: number;
  label?: string;
  railLabel?: string;
  deliveryMode?: string;
  deliveryTarget?: string;
  slotIndex: number;
  visualToken: string;
  visualDensity: number;
  warning?: string | null;
};

export type WheelPreviewContract = {
  campaignId: string;
  totalWeight: number;
  preset: WheelPreviewPreset;
  mobileMode: boolean;
  prizes: WheelPreviewDistributionItem[];
  distribution: WheelPreviewDistributionItem[];
  renderHints: {
    recommendedRenderMode: WheelPreviewRenderMode;
    tokenDensity: 'low' | 'medium' | 'high';
    useEmojiOnly: boolean;
    useLabelOnly: boolean;
    clampLabelLength: number;
    fallbackStrategy: WheelPreviewRenderMode;
  };
  warnings: Array<{
    type: 'EMPTY_LABEL' | 'EMPTY_EMOJI' | 'LABEL_TOO_LONG' | 'EMOJI_TOO_MANY' | 'TOTAL_WEIGHT_ZERO' | 'INACTIVE_PRIZE' | 'INVALID_RENDER_MODE' | 'MOBILE_OVERDENSITY';
    prizeId?: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
};

function normalizeText(value: unknown) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function normalizeRenderMode(value: unknown): WheelPreviewRenderMode {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'emoji-only' || raw === 'emoji_only') return 'emoji-only';
  if (raw === 'label-only' || raw === 'label_only') return 'label-only';
  return 'mixed';
}

function normalizePreset(value: unknown): WheelPreviewPreset {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'five' || raw === '5') return 'five';
  if (raw === 'six' || raw === '6') return 'six';
  if (raw === 'eight' || raw === '8') return 'eight';
  if (raw === 'tenplus' || raw === '10+') return 'tenPlus';
  return 'custom';
}

function normalizeNumber(value: unknown, fallback = 0) {
  const next = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getGlyph(item: { type?: string; metadata?: Record<string, unknown> | null; name?: string }) {
  const type = String(item.type ?? '').toUpperCase();
  const meta = (item.metadata ?? {}) as Record<string, unknown>;
  const glyph = normalizeText(meta.glyph ?? meta.wheelGlyph ?? meta.icon ?? meta.emoji ?? '✦');
  if (glyph) return glyph;
  if (type === 'POINT') return '🍑';
  if (type === 'SPIN' || type === 'SPIN_TICKET') return '🎞';
  if (type === 'VOUCHER') return '🎁';
  if (type === 'VIP_CODE') return '👑';
  if (type === 'NOTHING') return '😢';
  return normalizeText(item.name ?? '✦') || '✦';
}

function inferRenderMode(item: { type?: string; metadata?: Record<string, unknown> | null }, fallback: WheelPreviewRenderMode = 'mixed') {
  const meta = (item.metadata ?? {}) as Record<string, unknown>;
  const explicit = String(meta.wheelRenderMode ?? meta.renderMode ?? meta.labelMode ?? '').toLowerCase();
  if (explicit === 'emoji-only' || explicit === 'label-only' || explicit === 'mixed') return explicit;
  const type = String(item.type ?? '').toUpperCase();
  if (type === 'POINT' || type === 'SPIN' || type === 'SPIN_TICKET') return 'emoji-only';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return 'label-only';
  return fallback;
}

export function buildWheelPreviewContract(input: {
  campaignId?: string | null;
  prizes?: Array<Record<string, unknown>>;
  distribution?: Array<Record<string, unknown>>;
  totalWeight?: number | null;
  preset?: WheelPreviewPreset | string | null;
  slotPreset?: WheelPreviewPreset | string | null;
  mobileMode?: boolean | null;
  renderHints?: Partial<WheelPreviewContract['renderHints']>;
  warnings?: Array<Partial<WheelPreviewContract['warnings'][number]>>;
}): WheelPreviewContract {
  const source = (input.prizes?.length ? input.prizes : input.distribution ?? []).map((item, index) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>;
    const type = String(item.type ?? 'CUSTOM').toUpperCase();
    const weight = Math.max(0, normalizeNumber(item.weight ?? metadata.weight ?? 0, 0));
    const renderMode = normalizeRenderMode(item.renderMode ?? metadata.renderMode ?? metadata.wheelRenderMode ?? metadata.labelMode ?? inferRenderMode({ type, metadata }, 'mixed'));
    const emoji = normalizeText(item.emoji ?? metadata.emoji ?? metadata.glyph ?? metadata.wheelGlyph ?? metadata.icon ?? '');
    const label = normalizeText(item.label ?? metadata.label ?? metadata.wheelLabel ?? item.name ?? '');
    const railLabel = normalizeText(item.railLabel ?? metadata.railLabel ?? label ?? item.name ?? '');
    const token = normalizeText(item.visualToken ?? emoji ?? label ?? getGlyph({ type, metadata, name: String(item.name ?? '') }));
    const emojiCount = Math.max(1, Math.round(normalizeNumber(item.emojiCount ?? metadata.emojiCount ?? 1, 1)));
    return {
      prizeId: normalizeText(item.prizeId ?? item.id ?? ''),
      name: normalizeText(item.name ?? label ?? token),
      type,
      weight,
      chance: 0,
      isActive: Boolean(item.isActive ?? item.is_active ?? metadata.isActive ?? metadata.is_active ?? true),
      renderMode,
      emoji: emoji || undefined,
      emojiCount,
      label: label || undefined,
      railLabel: railLabel || undefined,
      deliveryMode: normalizeText(item.deliveryMode ?? metadata.deliveryMode ?? 'immediate'),
      deliveryTarget: normalizeText(item.deliveryTarget ?? metadata.deliveryTarget ?? 'reward_inbox'),
      slotIndex: Number.isFinite(Number(item.slotIndex)) ? Number(item.slotIndex) : index,
      visualToken: token || '✦',
      visualDensity: clamp(normalizeNumber(item.visualDensity ?? 1, 1), 0.5, 2),
      warning: item.warning ? normalizeText(item.warning) : null,
    } satisfies WheelPreviewDistributionItem;
  });

  const totalWeight = normalizeNumber(input.totalWeight ?? source.reduce((sum, item) => sum + item.weight, 0), 0);
  const normalized = source.map((item, index) => ({
    ...item,
    chance: totalWeight > 0 ? (item.weight / totalWeight) * 100 : 0,
    slotIndex: index,
  }));
  const preset = normalizePreset(input.preset ?? input.slotPreset ?? (normalized.length === 5 ? 'five' : normalized.length === 6 ? 'six' : normalized.length === 8 ? 'eight' : normalized.length >= 10 ? 'tenPlus' : 'custom'));

  return {
    campaignId: normalizeText(input.campaignId ?? ''),
    totalWeight,
    preset,
    mobileMode: Boolean(input.mobileMode ?? false),
    prizes: normalized,
    distribution: normalized,
    renderHints: {
      recommendedRenderMode: normalizeRenderMode(input.renderHints?.recommendedRenderMode ?? 'emoji-only'),
      tokenDensity: input.renderHints?.tokenDensity ?? (normalized.length >= 10 ? 'high' : normalized.length >= 8 ? 'medium' : 'low'),
      useEmojiOnly: Boolean(input.renderHints?.useEmojiOnly ?? false),
      useLabelOnly: Boolean(input.renderHints?.useLabelOnly ?? false),
      clampLabelLength: Math.max(4, normalizeNumber(input.renderHints?.clampLabelLength ?? 8, 8)),
      fallbackStrategy: normalizeRenderMode(input.renderHints?.fallbackStrategy ?? 'emoji-only'),
    },
    warnings: (input.warnings ?? []).map((warning) => ({
      type: warning.type ?? 'INVALID_RENDER_MODE',
      prizeId: warning.prizeId,
      message: normalizeText(warning.message ?? ''),
      severity: warning.severity ?? 'info',
    })),
  };
}
