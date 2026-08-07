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
export type AdminTransactionRecord = z.infer<typeof adminTransactionRowSchema>;
export type AdminAuditLogRecord = z.infer<typeof adminAuditLogSchema>;
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
export type WheelPreviewWarningType =
  | 'EMPTY_LABEL'
  | 'EMPTY_EMOJI'
  | 'LABEL_TOO_LONG'
  | 'EMOJI_TOO_MANY'
  | 'TOTAL_WEIGHT_ZERO'
  | 'INACTIVE_PRIZE'
  | 'INVALID_RENDER_MODE'
  | 'MOBILE_OVERDENSITY';

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
    type: WheelPreviewWarningType;
    prizeId?: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
  }>;
};

export type AdminRewardRow = Reward;
export type AdminRewardsResponse = {
  rewards: AdminRewardRow[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type AdminTransactionRow = PointTransaction & {
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type AdminTransactionsResponse = {
  transactions: AdminTransactionRecord[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type AdminAuditLogRow = AdminAuditLogRecord;
export type AdminAuditLogsResponse = {
  logs: AdminAuditLogRow[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type WheelCampaignsResponse = {
  campaigns: WheelCampaign[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type WheelPrizesResponse = {
  prizes: WheelPrize[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type WheelSpinsResponse = {
  spins: WheelSpin[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type WheelCurrentResponse = {
  campaign: WheelCampaign | null;
  prizes: WheelPrize[];
};

export type WheelSpinHistoryItem = {
  id: string;
  userId: string;
  telegramId: string;
  username: string | null;
  displayName: string | null;
  prizeId: string | null;
  prizeName: string;
  prizeToken: string | null;
  resultLabel: string;
  resultType: string;
  status: 'won' | 'missed' | 'pending' | 'claimed';
  createdAt: string;
  resultMetadata: Record<string, unknown>;
};

export type WheelHistoryResponse = {
  spins: WheelSpinHistoryItem[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type RewardsResponse = {
  rewards: Reward[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type RewardRedemptionsResponse = {
  redemptions: RewardRedemption[];
  limit?: number;
  offset?: number;
  total?: number;
};

export type RewardInboxResponse = {
  inbox: RewardInboxItem[];
  limit?: number;
  offset?: number;
  total?: number;
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

function normalizeSnakeCaseRecord<T extends Record<string, unknown>>(input: T) {
  return input as T;
}

function cryptoRandomId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeRewardShape(reward: Partial<Reward> & Record<string, unknown>): Reward {
  const metadata = (reward.metadata ?? {}) as Record<string, unknown>;
  const pointCost = reward.pointCost ?? reward.point_cost ?? metadata.pointCost ?? metadata.point_cost ?? 0;
  const isActive = reward.isActive ?? reward.is_active ?? metadata.isActive ?? metadata.is_active ?? true;
  const stock = reward.stock === undefined
    ? metadata.stock === undefined
      ? null
      : metadata.stock === null
        ? null
        : Number(metadata.stock)
    : reward.stock;
  return rewardSchema.parse({
    id: String(reward.id ?? metadata.id ?? cryptoRandomId('reward')),
    name: normalizeText(reward.name ?? metadata.name ?? 'Untitled reward'),
    description: reward.description === undefined ? (metadata.description === undefined ? null : normalizeText(metadata.description)) : (reward.description === null ? null : normalizeText(reward.description)),
    type: String(reward.type ?? metadata.type ?? 'CUSTOM').toUpperCase(),
    pointCost: Number.isFinite(Number(pointCost)) ? Number(pointCost) : 0,
    stock: stock === null ? null : Number.isFinite(Number(stock)) ? Number(stock) : 0,
    isActive: Boolean(isActive),
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...reward.metadata,
    }),
    createdAt: String(reward.createdAt ?? reward.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    updatedAt: String(reward.updatedAt ?? reward.updated_at ?? metadata.updatedAt ?? metadata.updated_at ?? ''),
  });
}

function normalizeRewardCodeShape(code: Partial<RewardCode> & Record<string, unknown>): RewardCode {
  const status = String(code.status ?? code.codeStatus ?? 'AVAILABLE').toUpperCase();
  return rewardCodeSchema.parse({
    id: String(code.id ?? cryptoRandomId('reward_code')),
    rewardId: String(code.rewardId ?? code.reward_id ?? ''),
    code: normalizeText(code.code ?? ''),
    status: rewardStatusSchema.safeParse(status).success ? status : 'AVAILABLE',
    assignedTo: code.assignedTo ?? code.assigned_to ?? null,
    assignedAt: code.assignedAt ?? code.assigned_at ?? null,
    createdAt: String(code.createdAt ?? code.created_at ?? ''),
  });
}

function normalizeRewardRedemptionShape(redemption: Partial<RewardRedemption> & Record<string, unknown>): RewardRedemption {
  const metadata = (redemption.metadata ?? {}) as Record<string, unknown>;
  return rewardRedemptionSchema.parse({
    id: String(redemption.id ?? cryptoRandomId('redemption')),
    userId: String(redemption.userId ?? redemption.user_id ?? ''),
    rewardId: String(redemption.rewardId ?? redemption.reward_id ?? ''),
    codeId: redemption.codeId ?? redemption.code_id ?? null,
    pointCost: Number.isFinite(Number(redemption.pointCost ?? redemption.point_cost ?? 0)) ? Number(redemption.pointCost ?? redemption.point_cost ?? 0) : 0,
    status: redemptionStatusSchema.safeParse(String(redemption.status ?? 'PENDING').toUpperCase()).success ? String(redemption.status ?? 'PENDING').toUpperCase() : 'PENDING',
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...(redemption.metadata ?? {}),
    }),
    deliveryStatus: normalizeText(redemption.deliveryStatus ?? redemption.delivery_status ?? 'pending'),
    deliveryMode: normalizeText(redemption.deliveryMode ?? redemption.delivery_mode ?? 'immediate'),
    deliveryTarget: normalizeText(redemption.deliveryTarget ?? redemption.delivery_target ?? 'reward_inbox'),
    deliveryPayload: (redemption.deliveryPayload ?? redemption.delivery_payload ?? {}) as Record<string, unknown>,
    createdAt: String(redemption.createdAt ?? redemption.created_at ?? ''),
  });
}

function normalizeRewardInboxShape(item: Partial<RewardInboxItem> & Record<string, unknown>): RewardInboxItem {
  const payload = (item.payload ?? {}) as Record<string, unknown>;
  return rewardInboxSchema.parse({
    id: String(item.id ?? cryptoRandomId('inbox')),
    userId: String(item.userId ?? item.user_id ?? ''),
    sourceType: String(item.sourceType ?? item.source_type ?? 'manual').toLowerCase(),
    sourceId: item.sourceId ?? item.source_id ?? null,
    kind: String(item.kind ?? 'CUSTOM').toUpperCase(),
    status: String(item.status ?? 'new').toLowerCase(),
    claimable: Boolean(item.claimable ?? false),
    title: normalizeText(item.title ?? payload.title ?? 'Quà mới'),
    subtitle: item.subtitle === undefined ? (payload.subtitle === undefined ? null : normalizeText(payload.subtitle)) : (item.subtitle === null ? null : normalizeText(item.subtitle)),
    payload: normalizeSnakeCaseRecord({
      ...payload,
      ...(item.payload ?? {}),
    }),
    claimUrl: item.claimUrl ?? item.claim_url ?? null,
    expiresAt: item.expiresAt ?? item.expires_at ?? null,
    viewedAt: item.viewedAt ?? item.viewed_at ?? null,
    claimedAt: item.claimedAt ?? item.claimed_at ?? null,
    createdAt: String(item.createdAt ?? item.created_at ?? ''),
    updatedAt: String(item.updatedAt ?? item.updated_at ?? item.createdAt ?? item.created_at ?? ''),
  });
}

function normalizeAdminTransactionShape(transaction: Partial<AdminTransactionRecord> & Record<string, unknown>): AdminTransactionRecord {
  const metadata = (transaction.metadata ?? {}) as Record<string, unknown>;
  return adminTransactionRowSchema.parse({
    id: String(transaction.id ?? metadata.id ?? cryptoRandomId('transaction')),
    userId: String(transaction.userId ?? transaction.user_id ?? metadata.userId ?? metadata.user_id ?? ''),
    amount: Number.isFinite(Number(transaction.amount ?? metadata.amount ?? 0)) ? Number(transaction.amount ?? metadata.amount ?? 0) : 0,
    type: String(transaction.type ?? metadata.type ?? 'credit'),
    reason: String(transaction.reason ?? metadata.reason ?? ''),
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...(transaction.metadata ?? {}),
    }),
    createdAt: String(transaction.createdAt ?? transaction.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    telegramId: String(transaction.telegramId ?? transaction.telegram_id ?? metadata.telegramId ?? metadata.telegram_id ?? ''),
    username: transaction.username ?? metadata.username ?? null,
    firstName: transaction.firstName ?? metadata.firstName ?? null,
    lastName: transaction.lastName ?? metadata.lastName ?? null,
  });
}

function normalizeAdminAuditLogShape(log: Partial<AdminAuditLogRow> & Record<string, unknown>): AdminAuditLogRow {
  const metadata = (log.metadata ?? {}) as Record<string, unknown>;
  return adminAuditLogSchema.parse({
    id: String(log.id ?? metadata.id ?? cryptoRandomId('audit')),
    actorEmail: normalizeText(log.actorEmail ?? log.actor_email ?? metadata.actorEmail ?? metadata.actor_email ?? 'admin@example.com') || 'admin@example.com',
    action: String(log.action ?? metadata.action ?? ''),
    targetTelegramId: log.targetTelegramId ?? log.target_telegram_id ?? metadata.targetTelegramId ?? metadata.target_telegram_id ?? null,
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...(log.metadata ?? {}),
    }),
    createdAt: String(log.createdAt ?? log.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
  });
}

function normalizeWheelCampaignShape(campaign: Partial<WheelCampaign> & Record<string, unknown>): WheelCampaign {
  const metadata = (campaign.metadata ?? {}) as Record<string, unknown>;
  return wheelCampaignSchema.parse({
    id: String(campaign.id ?? metadata.id ?? cryptoRandomId('campaign')),
    name: normalizeText(campaign.name ?? metadata.name ?? 'Wheel Campaign'),
    description: campaign.description === undefined ? (metadata.description === undefined ? null : normalizeText(metadata.description)) : (campaign.description === null ? null : normalizeText(campaign.description)),
    isActive: Boolean(campaign.isActive ?? campaign.is_active ?? metadata.isActive ?? metadata.is_active ?? true),
    startsAt: campaign.startsAt ?? campaign.starts_at ?? metadata.startsAt ?? metadata.starts_at ?? null,
    endsAt: campaign.endsAt ?? campaign.ends_at ?? metadata.endsAt ?? metadata.ends_at ?? null,
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...campaign.metadata,
    }),
    createdAt: String(campaign.createdAt ?? campaign.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    updatedAt: String(campaign.updatedAt ?? campaign.updated_at ?? metadata.updatedAt ?? metadata.updated_at ?? ''),
  });
}

function normalizeWheelPrizeShape(prize: Partial<WheelPrize> & Record<string, unknown>): WheelPrize {
  const metadata = (prize.metadata ?? {}) as Record<string, unknown>;
  return wheelPrizeSchema.parse({
    id: String(prize.id ?? metadata.id ?? cryptoRandomId('prize')),
    campaignId: String(prize.campaignId ?? prize.campaign_id ?? metadata.campaignId ?? metadata.campaign_id ?? ''),
    name: normalizeText(prize.name ?? metadata.name ?? 'Untitled prize'),
    type: String(prize.type ?? metadata.type ?? 'CUSTOM').toUpperCase(),
    weight: Number.isFinite(Number(prize.weight ?? metadata.weight ?? 0)) ? Number(prize.weight ?? metadata.weight ?? 0) : 0,
    stock: prize.stock === undefined ? (metadata.stock === undefined ? null : metadata.stock === null ? null : Number.isFinite(Number(metadata.stock)) ? Number(metadata.stock) : 0) : prize.stock,
    isActive: Boolean(prize.isActive ?? prize.is_active ?? metadata.isActive ?? metadata.is_active ?? true),
    metadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...prize.metadata,
    }),
    createdAt: String(prize.createdAt ?? prize.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    updatedAt: String(prize.updatedAt ?? prize.updated_at ?? metadata.updatedAt ?? metadata.updated_at ?? ''),
  });
}

function normalizeWheelSpinShape(spin: Partial<WheelSpin> & Record<string, unknown>): WheelSpin {
  const metadata = (spin.resultMetadata ?? spin.result_metadata ?? {}) as Record<string, unknown>;
  return wheelSpinSchema.parse({
    id: String(spin.id ?? metadata.id ?? cryptoRandomId('spin')),
    userId: String(spin.userId ?? spin.user_id ?? metadata.userId ?? metadata.user_id ?? ''),
    campaignId: String(spin.campaignId ?? spin.campaign_id ?? metadata.campaignId ?? metadata.campaign_id ?? ''),
    prizeId: spin.prizeId === undefined ? (spin.prizeId ?? spin.prize_id ?? metadata.prizeId ?? metadata.prize_id ?? null) : spin.prizeId,
    costSpins: Number(spin.costSpins ?? spin.cost_spins ?? metadata.costSpins ?? metadata.cost_spins ?? 0),
    resultMetadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...(spin.resultMetadata ?? spin.result_metadata ?? {}),
    }),
    createdAt: String(spin.createdAt ?? spin.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
  });
}

function normalizeWheelStatus(value: unknown, hasPrize: boolean): WheelSpinHistoryItem['status'] {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'won' || raw === 'missed' || raw === 'pending' || raw === 'claimed') return raw;
  return hasPrize ? 'won' : 'missed';
}

function normalizeWheelHistoryShape(
  spin: Partial<WheelSpinHistoryItem> & Record<string, unknown>,
  fallbackTelegramId = '',
): WheelSpinHistoryItem {
  const metadata = (spin.resultMetadata ?? spin.result_metadata ?? {}) as Record<string, unknown>;
  const user = (spin.user ?? spin.users ?? metadata.user ?? metadata.users ?? {}) as Record<string, unknown>;
  const prize = (spin.prize ?? spin.wheel_prizes ?? metadata.prize ?? metadata.wheelPrize ?? {}) as Record<string, unknown>;
  const prizeMetadata = (prize.metadata ?? metadata.prizeMetadata ?? metadata.prize_metadata ?? {}) as Record<string, unknown>;
  const prizeType = String(prize.type ?? spin.resultType ?? metadata.resultType ?? metadata.result_type ?? 'CUSTOM').toUpperCase();
  const telegramId = normalizeText(
    spin.telegramId ?? spin.telegram_id ?? user.telegramId ?? user.telegram_id ?? fallbackTelegramId,
  ) || fallbackTelegramId;
  const username = user.username ?? metadata.username ?? null;
  const firstName = normalizeText(user.firstName ?? user.first_name ?? '');
  const lastName = normalizeText(user.lastName ?? user.last_name ?? '');
  const displayName = firstName || lastName ? normalizeText([firstName, lastName].filter(Boolean).join(' ')) : (username ? `@${normalizeText(username)}` : null);
  const prizeName = normalizeText(
    spin.prizeName ??
      spin.prize_name ??
      prize.name ??
      prize.prizeName ??
      prize.prize_name ??
      metadata.prizeName ??
      metadata.prize_name ??
      'Không trúng',
  ) || 'Không trúng';
  const prizeToken = normalizeText(
    spin.prizeToken ??
      spin.prize_token ??
      metadata.prizeToken ??
      metadata.prize_token ??
      getGlyph({ type: prizeType, metadata: prizeMetadata, name: prizeName }),
  ) || null;
  const resultLabel = normalizeText(
    spin.resultLabel ??
      spin.result_label ??
      metadata.resultLabel ??
      metadata.result_label ??
      prizeName,
  ) || prizeName;
  const resultType = normalizeText(
    spin.resultType ??
      spin.result_type ??
      prizeType ??
      metadata.resultType ??
      metadata.result_type ??
      (prizeName === 'Không trúng' ? 'NOTHING' : 'CUSTOM'),
  ) || 'CUSTOM';
  const createdAt = String(spin.createdAt ?? spin.created_at ?? metadata.createdAt ?? metadata.created_at ?? '');
  return {
    id: String(spin.id ?? metadata.id ?? cryptoRandomId('spin_history')),
    userId: String(spin.userId ?? spin.user_id ?? user.id ?? metadata.userId ?? metadata.user_id ?? ''),
    telegramId,
    username: username ? normalizeText(username) : null,
    displayName,
    prizeId: (spin.prizeId ?? spin.prize_id ?? prize.id ?? metadata.prizeId ?? metadata.prize_id ?? null) as string | null,
    prizeName,
    prizeToken,
    resultLabel,
    resultType,
    status: normalizeWheelStatus(spin.status ?? metadata.status, Boolean(spin.prizeId ?? spin.prize_id ?? prize.id)),
    createdAt,
    resultMetadata: normalizeSnakeCaseRecord({
      ...metadata,
      ...(spin.resultMetadata ?? spin.result_metadata ?? {}),
    }),
  };
}

function normalizeResponseEnvelope<T>(value: T) {
  return value;
}

export function normalizeAdminRewardsResponse(input: Partial<AdminRewardsResponse> & Record<string, unknown>): AdminRewardsResponse {
  const rewards = Array.isArray(input.rewards ?? (input as any).data) ? (input.rewards ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    rewards: rewards.map((reward: unknown) => normalizeRewardShape(reward as Partial<Reward> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeRewardsResponse(input: Partial<RewardsResponse> & Record<string, unknown>): RewardsResponse {
  const rewards = Array.isArray(input.rewards ?? (input as any).data) ? (input.rewards ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    rewards: rewards.map((reward: unknown) => normalizeRewardShape(reward as Partial<Reward> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeRewardRedemptionsResponse(input: Partial<RewardRedemptionsResponse> & Record<string, unknown>): RewardRedemptionsResponse {
  const redemptions = Array.isArray(input.redemptions ?? (input as any).data) ? (input.redemptions ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    redemptions: redemptions.map((redemption: unknown) => normalizeRewardRedemptionShape(redemption as Partial<RewardRedemption> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeRewardInboxResponse(input: Partial<RewardInboxResponse> & Record<string, unknown>): RewardInboxResponse {
  const inbox = Array.isArray(input.inbox ?? (input as any).data) ? (input.inbox ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    inbox: inbox.map((entry: unknown) => normalizeRewardInboxShape(entry as Partial<RewardInboxItem> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeAdminTransactionsResponse(input: Partial<AdminTransactionsResponse> & Record<string, unknown>): AdminTransactionsResponse {
  const transactions = Array.isArray(input.transactions ?? (input as any).data) ? (input.transactions ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    transactions: transactions.map((transaction: unknown) => normalizeAdminTransactionShape(transaction as Partial<AdminTransactionRecord> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeAdminAuditLogsResponse(input: Partial<AdminAuditLogsResponse> & Record<string, unknown>): AdminAuditLogsResponse {
  const logs = Array.isArray(input.logs ?? (input as any).data) ? (input.logs ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    logs: logs.map((log: unknown) => normalizeAdminAuditLogShape(log as Partial<AdminAuditLogRow> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeWheelCampaignsResponse(input: Partial<WheelCampaignsResponse> & Record<string, unknown>): WheelCampaignsResponse {
  const campaigns = Array.isArray(input.campaigns ?? (input as any).data) ? (input.campaigns ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    campaigns: campaigns.map((campaign: unknown) => normalizeWheelCampaignShape(campaign as Partial<WheelCampaign> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeWheelPrizesResponse(input: Partial<WheelPrizesResponse> & Record<string, unknown>): WheelPrizesResponse {
  const prizes = Array.isArray(input.prizes ?? (input as any).data) ? (input.prizes ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    prizes: prizes.map((prize: unknown) => normalizeWheelPrizeShape(prize as Partial<WheelPrize> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeWheelSpinsResponse(input: Partial<WheelSpinsResponse> & Record<string, unknown>): WheelSpinsResponse {
  const spins = Array.isArray(input.spins ?? (input as any).data) ? (input.spins ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    spins: spins.map((spin: unknown) => normalizeWheelSpinShape(spin as Partial<WheelSpin> & Record<string, unknown>)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}

export function normalizeWheelCurrentResponse(input: Partial<WheelCurrentResponse> & Record<string, unknown>): WheelCurrentResponse {
  const campaign = input.campaign ? normalizeWheelCampaignShape(input.campaign as Partial<WheelCampaign> & Record<string, unknown>) : null;
  const prizes = Array.isArray(input.prizes ?? (input as any).data) ? (input.prizes ?? (input as any).data) : [];
  return {
    campaign,
    prizes: prizes.map((prize: unknown) => normalizeWheelPrizeShape(prize as Partial<WheelPrize> & Record<string, unknown>)),
  };
}

export function normalizeWheelHistoryResponse(
  input: Partial<WheelHistoryResponse> & Record<string, unknown>,
  fallbackTelegramId = '',
): WheelHistoryResponse {
  const spins = Array.isArray(input.spins ?? (input as any).data) ? (input.spins ?? (input as any).data) : [];
  return normalizeResponseEnvelope({
    spins: spins.map((spin: unknown) => normalizeWheelHistoryShape(spin as Partial<WheelSpinHistoryItem> & Record<string, unknown>, fallbackTelegramId)),
    limit: input.limit === undefined ? (input as any).limit : Number(input.limit),
    offset: input.offset === undefined ? (input as any).offset : Number(input.offset),
    total: input.total === undefined ? (input as any).total : Number(input.total),
  });
}
