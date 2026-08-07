export type PrizeRenderMode = 'emoji-only' | 'label-only' | 'mixed';

export type PrizeDeliveryMode = 'immediate' | 'inbox' | 'claim_required' | 'external_code' | 'manual';

export type PrizeDeliveryTarget = 'point_wallet' | 'spin_wallet' | 'reward_inbox' | 'code_pool' | 'manual';

export type PrizeType = 'POINT' | 'SPIN' | 'SPIN_TICKET' | 'VOUCHER' | 'ITEM' | 'NOTHING' | 'BADGE' | 'VIP_CODE' | 'CUSTOM';

export type WheelPreset = 'five' | 'six' | 'eight' | 'tenPlus' | 'custom';

export interface WheelPrizeMetadata {
  emoji?: string;
  glyph?: string;
  icon?: string;
  wheelGlyph?: string;
  label?: string;
  wheelLabel?: string;
  railLabel?: string;
  mobileLabel?: string;
  desktopLabel?: string;
  description?: string;
  renderMode?: PrizeRenderMode;
  wheelRenderMode?: PrizeRenderMode;
  labelMode?: PrizeRenderMode;
  emojiCount?: number;
  displayPriority?: number;
  deliveryMode?: PrizeDeliveryMode;
  deliveryTarget?: PrizeDeliveryTarget;
  codePrefix?: string;
  points?: number;
  point_amount?: number;
  value?: number;
  [key: string]: unknown;
}

export interface WheelPrize {
  id: string;
  campaignId?: string;
  name: string;
  type: PrizeType | string;
  weight: number;
  stock?: number | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: WheelPrizeMetadata | null;
}

export interface WheelCampaignMetadata {
  theme?: 'blue-lobby' | 'bronze-lobby' | 'dark-lobby';
  slotPreset?: WheelPreset;
  minSlotCount?: number;
  maxSlotCount?: number;
  renderModeDefault?: PrizeRenderMode;
  mobileDensityRule?: 'compact' | 'normal' | 'dense';
  tokenStyle?: 'emoji-first' | 'label-first' | 'mixed';
  backgroundMode?: 'lobby-grid' | 'soft-glow' | 'minimal-dark';
  [key: string]: unknown;
}

export interface WheelCampaign {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  metadata?: WheelCampaignMetadata | null;
}

export interface WheelPreviewItem {
  prizeId: string;
  name: string;
  type: PrizeType | string;
  weight: number;
  chance: number;
  isActive: boolean;
  renderMode: PrizeRenderMode;
  emoji?: string;
  emojiCount?: number;
  label?: string;
  railLabel?: string;
  deliveryMode?: PrizeDeliveryMode;
  deliveryTarget?: PrizeDeliveryTarget;
  slotIndex: number;
  visualToken: string;
  visualDensity: number;
  warning?: string | null;
}

export interface WheelPreview {
  campaignId: string;
  totalWeight: number;
  preset: WheelPreset;
  mobileMode: boolean;
  prizes: WheelPreviewItem[];
  distribution: WheelPreviewItem[];
  renderHints: {
    recommendedRenderMode: PrizeRenderMode;
    tokenDensity: 'low' | 'medium' | 'high';
    useEmojiOnly: boolean;
    useLabelOnly: boolean;
    clampLabelLength: number;
    fallbackStrategy: PrizeRenderMode;
  };
  warnings: WheelWarning[];
}

export interface WheelSegment {
  id: string;
  name: string;
  compactName: string;
  glyph: string;
  emojiCount?: number;
  type: PrizeType | string;
  weight: number;
  tone: string;
  textTone: string;
  metadata?: WheelPrizeMetadata | null;
}

export interface WheelRailItem {
  prizeId: string;
  token: string;
  shortLabel: string;
  count?: number;
  state: 'active' | 'inactive' | 'hidden';
  type: PrizeType | string;
  renderMode: PrizeRenderMode;
}

export interface WheelSpinHistoryItem {
  id: string;
  userId: string;
  telegramId: string;
  username: string | null;
  displayName: string | null;
  prizeId: string | null;
  prizeName: string;
  prizeToken: string | null;
  resultLabel: string;
  resultType: PrizeType | string;
  status: 'won' | 'missed' | 'pending' | 'claimed';
  createdAt: string;
  resultMetadata?: WheelPrizeMetadata | Record<string, unknown>;
}

export interface WheelSlotToken {
  prizeId: string;
  slotIndex: number;
  token: string;
  label: string;
  renderMode: PrizeRenderMode;
  density: number;
  rotationDeg: number;
  scale: number;
  xBias: number;
  yBias: number;
  shouldMirror: boolean;
}

export interface WheelRendererConfig {
  preset: WheelPreset;
  slotCount: number;
  mobile: boolean;
  tokenStyle: 'emoji-first' | 'label-first' | 'mixed';
  backgroundMode: 'lobby-grid' | 'soft-glow' | 'minimal-dark';
  clampLabelLength: number;
  maxEmojiPerSlot: number;
  minSlotSpacing: number;
  useTextPath: boolean;
  useSvgTokens: boolean;
}

export interface WheelWarning {
  type:
    | 'EMPTY_LABEL'
    | 'EMPTY_EMOJI'
    | 'LABEL_TOO_LONG'
    | 'EMOJI_TOO_MANY'
    | 'TOTAL_WEIGHT_ZERO'
    | 'INACTIVE_PRIZE'
    | 'INVALID_RENDER_MODE'
    | 'MOBILE_OVERDENSITY';
  prizeId?: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface WheelPrizeFormState {
  campaignId: string;
  name: string;
  type: PrizeType | string;
  weight: number;
  stock: number | null;
  isActive: boolean;
  emoji: string;
  label: string;
  railLabel: string;
  description: string;
  renderMode: PrizeRenderMode;
  emojiCount: number;
  displayPriority: number;
  deliveryMode: PrizeDeliveryMode;
  deliveryTarget: PrizeDeliveryTarget;
  codePrefix: string;
}

export interface WheelCampaignFormState {
  name: string;
  description: string;
  isActive: boolean;
  theme: 'blue-lobby' | 'bronze-lobby' | 'dark-lobby';
  slotPreset: WheelPreset;
  minSlotCount: number;
  maxSlotCount: number;
  renderModeDefault: PrizeRenderMode;
  mobileDensityRule: 'compact' | 'normal' | 'dense';
  tokenStyle: 'emoji-first' | 'label-first' | 'mixed';
  backgroundMode: 'lobby-grid' | 'soft-glow' | 'minimal-dark';
}

export function normalizeText(value: unknown) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function toFiniteNumber(value: unknown, fallback = 0) {
  const next = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getWheelPrizeGlyph(prize: Pick<WheelPrize, 'type' | 'metadata'>) {
  const type = String(prize.type ?? '').toUpperCase();
  const meta = (prize.metadata ?? {}) as WheelPrizeMetadata;
  const glyph = normalizeText(meta.glyph ?? meta.wheelGlyph ?? meta.icon ?? meta.emoji ?? '✦');
  if (glyph) return glyph;
  if (type === 'POINT') return '⭐';
  if (type === 'SPIN' || type === 'SPIN_TICKET') return '🎞';
  if (type === 'VOUCHER') return '🎁';
  if (type === 'VIP_CODE') return '👑';
  if (type === 'NOTHING') return '😢';
  if (type === 'ITEM') return '🧩';
  if (type === 'BADGE') return '💠';
  return '✦';
}

export function getWheelPrizeShortLabel(prize: Pick<WheelPrize, 'name' | 'type' | 'metadata'>) {
  const meta = (prize.metadata ?? {}) as WheelPrizeMetadata;
  const glyph = getWheelPrizeGlyph(prize);
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = meta.points ?? meta.point_amount ?? meta.value;
    return amount ? `${glyph} ${amount}🍑` : glyph;
  }
  return normalizeText(prize.name || glyph);
}

export function getWheelPrizeRenderMode(prize: Pick<WheelPrize, 'type' | 'metadata'>, fallback: PrizeRenderMode = 'mixed'): PrizeRenderMode {
  const meta = (prize.metadata ?? {}) as WheelPrizeMetadata;
  const explicit = String(meta.wheelRenderMode ?? meta.renderMode ?? meta.labelMode ?? '').toLowerCase();
  if (explicit === 'emoji-only' || explicit === 'label-only' || explicit === 'mixed') return explicit;
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT' || type === 'SPIN' || type === 'SPIN_TICKET') return 'emoji-only';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return 'label-only';
  return fallback;
}

export function normalizeWheelPrize(
  prize: Partial<WheelPrize> & {
    campaign_id?: string;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    stock?: number | null;
    metadata?: WheelPrizeMetadata | null;
  },
): WheelPrize {
  const metadata = (prize.metadata ?? {}) as WheelPrizeMetadata;
  const type = String(prize.type ?? metadata.type ?? 'CUSTOM').toUpperCase();
  return {
    id: normalizeText(prize.id ?? metadata.id ?? cryptoRandomId('prize')),
    campaignId: normalizeText(prize.campaignId ?? prize.campaign_id ?? metadata.campaignId ?? metadata.campaign_id ?? ''),
    name: normalizeText(prize.name ?? metadata.name ?? getWheelPrizeShortLabel({ name: '', type, metadata })),
    type,
    weight: Math.max(0, toFiniteNumber(prize.weight ?? metadata.weight ?? 0, 0)),
    stock: prize.stock === null ? null : prize.stock === undefined ? (metadata.stock === null ? null : toFiniteNumber(metadata.stock ?? null, 0)) : toFiniteNumber(prize.stock, 0),
    isActive: Boolean(prize.isActive ?? prize.is_active ?? metadata.isActive ?? metadata.is_active ?? true),
    createdAt: String(prize.createdAt ?? prize.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    updatedAt: String(prize.updatedAt ?? prize.updated_at ?? metadata.updatedAt ?? metadata.updated_at ?? ''),
    metadata: {
      ...metadata,
      emoji: normalizeText(metadata.emoji ?? metadata.glyph ?? metadata.wheelGlyph ?? metadata.icon ?? metadata.wheelGlyph ?? ''),
      glyph: normalizeText(metadata.glyph ?? metadata.wheelGlyph ?? metadata.icon ?? metadata.emoji ?? ''),
      icon: normalizeText(metadata.icon ?? metadata.glyph ?? metadata.emoji ?? ''),
      wheelGlyph: normalizeText(metadata.wheelGlyph ?? metadata.glyph ?? metadata.emoji ?? ''),
      label: normalizeText(metadata.label ?? metadata.wheelLabel ?? prize.name ?? ''),
      wheelLabel: normalizeText(metadata.wheelLabel ?? metadata.label ?? prize.name ?? ''),
      railLabel: normalizeText(metadata.railLabel ?? metadata.label ?? prize.name ?? ''),
      description: normalizeText(metadata.description ?? ''),
      renderMode: getWheelPrizeRenderMode({ type, metadata }, 'mixed'),
      wheelRenderMode: getWheelPrizeRenderMode({ type, metadata }, 'mixed'),
      labelMode: getWheelPrizeRenderMode({ type, metadata }, 'mixed'),
      emojiCount: Math.max(1, Math.round(toFiniteNumber(metadata.emojiCount ?? 1, 1))),
      displayPriority: Math.round(toFiniteNumber(metadata.displayPriority ?? 0, 0)),
      deliveryMode: normalizeDeliveryMode(metadata.deliveryMode ?? 'immediate'),
      deliveryTarget: normalizeDeliveryTarget(metadata.deliveryTarget ?? 'reward_inbox'),
      codePrefix: normalizeText(metadata.codePrefix ?? ''),
      points: metadata.points === undefined ? undefined : toFiniteNumber(metadata.points, 0),
      point_amount: metadata.point_amount === undefined ? undefined : toFiniteNumber(metadata.point_amount, 0),
      value: metadata.value === undefined ? undefined : toFiniteNumber(metadata.value, 0),
    },
  };
}

export function normalizeWheelCampaign(
  campaign: Partial<WheelCampaign> & {
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    metadata?: WheelCampaignMetadata | null;
  },
): WheelCampaign {
  const metadata = (campaign.metadata ?? {}) as WheelCampaignMetadata;
  return {
    id: normalizeText(campaign.id ?? metadata.id ?? cryptoRandomId('campaign')),
    name: normalizeText(campaign.name ?? metadata.name ?? 'Wheel Campaign'),
    description: campaign.description === undefined ? null : normalizeText(campaign.description),
    isActive: Boolean(campaign.isActive ?? campaign.is_active ?? metadata.isActive ?? metadata.is_active ?? true),
    createdAt: String(campaign.createdAt ?? campaign.created_at ?? metadata.createdAt ?? metadata.created_at ?? ''),
    updatedAt: String(campaign.updatedAt ?? campaign.updated_at ?? metadata.updatedAt ?? metadata.updated_at ?? ''),
    metadata: {
      ...metadata,
      theme: metadata.theme ?? 'blue-lobby',
      slotPreset: metadata.slotPreset ?? 'five',
      minSlotCount: Math.max(1, toFiniteNumber(metadata.minSlotCount ?? 5, 5)),
      maxSlotCount: Math.max(1, toFiniteNumber(metadata.maxSlotCount ?? 8, 8)),
      renderModeDefault: metadata.renderModeDefault ?? 'emoji-only',
      mobileDensityRule: metadata.mobileDensityRule ?? 'compact',
      tokenStyle: metadata.tokenStyle ?? 'emoji-first',
      backgroundMode: metadata.backgroundMode ?? 'lobby-grid',
    },
  };
}

export function normalizeWheelPreviewItem(item: Partial<WheelPreviewItem> & { metadata?: WheelPrizeMetadata | null }, slotIndex = 0): WheelPreviewItem {
  const meta = (item.metadata ?? {}) as WheelPrizeMetadata;
  const renderMode = normalizeRenderMode(item.renderMode ?? meta.renderMode ?? meta.wheelRenderMode ?? meta.labelMode ?? 'mixed');
  const token = normalizeText(item.visualToken ?? item.emoji ?? item.label ?? item.railLabel ?? getWheelPrizeGlyph({ type: item.type ?? 'CUSTOM', metadata: meta }));
  return {
    prizeId: normalizeText(item.prizeId ?? (item as any).id ?? ''),
    name: normalizeText(item.name ?? ''),
    type: String(item.type ?? 'CUSTOM').toUpperCase(),
    weight: Math.max(0, toFiniteNumber(item.weight ?? 0, 0)),
    chance: Math.max(0, toFiniteNumber(item.chance ?? 0, 0)),
    isActive: Boolean(item.isActive ?? true),
    renderMode,
    emoji: normalizeText(item.emoji ?? ''),
    emojiCount: Math.max(1, Math.round(toFiniteNumber(item.emojiCount ?? 1, 1))),
    label: normalizeText(item.label ?? ''),
    railLabel: normalizeText(item.railLabel ?? ''),
    deliveryMode: normalizeDeliveryMode(item.deliveryMode ?? meta.deliveryMode ?? 'immediate'),
    deliveryTarget: normalizeDeliveryTarget(item.deliveryTarget ?? meta.deliveryTarget ?? 'reward_inbox'),
    slotIndex: Number.isFinite(Number(item.slotIndex)) ? Number(item.slotIndex) : slotIndex,
    visualToken: token || '✦',
    visualDensity: clamp(toFiniteNumber(item.visualDensity ?? 1, 1), 0.5, 2),
    warning: item.warning ? normalizeText(item.warning) : null,
  };
}

export function normalizeWheelPreview(
  preview: Partial<WheelPreview> & {
    slotPreset?: WheelPreset;
    distribution?: Array<Partial<WheelPreviewItem> & { metadata?: WheelPrizeMetadata | null }>;
    renderHints?: Partial<WheelPreview['renderHints']>;
  },
): WheelPreview {
  const items = Array.isArray(preview.prizes) ? preview.prizes : Array.isArray(preview.distribution) ? preview.distribution : [];
  const prizes = items.map((item, index: number) => normalizeWheelPreviewItem(item as Partial<WheelPreviewItem> & { metadata?: WheelPrizeMetadata | null }, index));
  const totalWeight = prizes.reduce((sum: number, item: WheelPreviewItem) => sum + Math.max(0, item.weight), 0);
  const preset = normalizeWheelPreset(
    preview.preset ?? preview.slotPreset ?? (prizes.length === 5 ? 'five' : prizes.length === 6 ? 'six' : prizes.length === 8 ? 'eight' : prizes.length >= 10 ? 'tenPlus' : 'custom'),
  );
  return {
    campaignId: normalizeText(preview.campaignId ?? ''),
    totalWeight,
    preset,
    mobileMode: Boolean(preview.mobileMode ?? false),
    prizes,
    distribution: prizes,
    renderHints: {
      recommendedRenderMode: normalizeRenderMode(preview.renderHints?.recommendedRenderMode ?? 'emoji-only'),
      tokenDensity: preview.renderHints?.tokenDensity ?? (prizes.length >= 10 ? 'high' : prizes.length >= 8 ? 'medium' : 'low'),
      useEmojiOnly: Boolean(preview.renderHints?.useEmojiOnly ?? false),
      useLabelOnly: Boolean(preview.renderHints?.useLabelOnly ?? false),
      clampLabelLength: Math.max(4, toFiniteNumber(preview.renderHints?.clampLabelLength ?? 8, 8)),
      fallbackStrategy: normalizeRenderMode(preview.renderHints?.fallbackStrategy ?? 'emoji-only'),
    },
    warnings: Array.isArray(preview.warnings) ? preview.warnings.map((warning) => normalizeWheelWarning(warning as WheelWarning)) : [],
  };
}

export function validateWheelPrize(prize: WheelPrize) {
  const warnings: WheelWarning[] = [];
  const renderMode = normalizeRenderMode(prize.metadata?.renderMode ?? prize.metadata?.wheelRenderMode ?? prize.metadata?.labelMode ?? 'mixed');
  const emoji = normalizeText(prize.metadata?.emoji ?? prize.metadata?.glyph ?? prize.metadata?.wheelGlyph ?? prize.metadata?.icon ?? '');
  const label = normalizeText(prize.metadata?.label ?? prize.metadata?.wheelLabel ?? prize.name);

  if (!label) warnings.push({ type: 'EMPTY_LABEL', prizeId: prize.id, message: 'Prize thiếu nhãn.', severity: 'error' });
  if (!emoji && renderMode === 'emoji-only') warnings.push({ type: 'EMPTY_EMOJI', prizeId: prize.id, message: 'Prize emoji-only nhưng thiếu emoji.', severity: 'error' });
  if (!label && renderMode === 'label-only') warnings.push({ type: 'EMPTY_LABEL', prizeId: prize.id, message: 'Prize label-only nhưng thiếu nhãn.', severity: 'error' });
  if (normalizeText(prize.name).length > 24) warnings.push({ type: 'LABEL_TOO_LONG', prizeId: prize.id, message: 'Tên prize quá dài.', severity: 'warning' });
  if (Math.max(1, toFiniteNumber(prize.metadata?.emojiCount ?? 1, 1)) > 3) warnings.push({ type: 'EMOJI_TOO_MANY', prizeId: prize.id, message: 'Emoji hiển thị quá nhiều.', severity: 'warning' });
  if (toFiniteNumber(prize.weight, 0) <= 0) warnings.push({ type: 'TOTAL_WEIGHT_ZERO', prizeId: prize.id, message: 'Trọng số phải lớn hơn 0.', severity: 'error' });
  if (prize.isActive === false) warnings.push({ type: 'INACTIVE_PRIZE', prizeId: prize.id, message: 'Prize đang tắt.', severity: 'info' });
  if (!['emoji-only', 'label-only', 'mixed'].includes(renderMode)) warnings.push({ type: 'INVALID_RENDER_MODE', prizeId: prize.id, message: 'Chế độ hiển thị không hợp lệ.', severity: 'error' });
  return warnings;
}

export function validateWheelCampaign(campaign: WheelCampaign) {
  const warnings: WheelWarning[] = [];
  if (!normalizeText(campaign.name)) {
    warnings.push({ type: 'EMPTY_LABEL', message: 'Campaign thiếu tên.', severity: 'error' });
  }
  return warnings;
}

export function validateWheelPreview(preview: WheelPreview) {
  const warnings = [...(preview.warnings ?? [])];
  if (!preview.totalWeight || preview.totalWeight <= 0) {
    warnings.push({ type: 'TOTAL_WEIGHT_ZERO', message: 'Tổng trọng số phải lớn hơn 0.', severity: 'error' });
  }
  preview.prizes.forEach((item) => {
    warnings.push(...validateWheelPrize(normalizeWheelPrize({
      id: item.prizeId,
      name: item.name,
      type: item.type,
      weight: item.weight,
      isActive: item.isActive,
      metadata: {
        emoji: item.emoji,
        label: item.label,
        railLabel: item.railLabel,
        renderMode: item.renderMode,
        emojiCount: item.emojiCount,
        deliveryMode: item.deliveryMode,
        deliveryTarget: item.deliveryTarget,
      },
    })));
  });
  return warnings;
}

export function normalizeWheelWarning(warning: Partial<WheelWarning>): WheelWarning {
  return {
    type: warning.type ?? 'INVALID_RENDER_MODE',
    prizeId: warning.prizeId,
    message: normalizeText(warning.message ?? ''),
    severity: warning.severity ?? 'info',
  };
}

export function normalizeWheelPreset(value: unknown): WheelPreset {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'five' || raw === '5') return 'five';
  if (raw === 'six' || raw === '6') return 'six';
  if (raw === 'eight' || raw === '8') return 'eight';
  if (raw === 'tenplus' || raw === '10+') return 'tenPlus';
  return 'custom';
}

export function normalizeRenderMode(value: unknown): PrizeRenderMode {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'emoji-only' || raw === 'emoji_only') return 'emoji-only';
  if (raw === 'label-only' || raw === 'label_only') return 'label-only';
  return 'mixed';
}

export function normalizeDeliveryMode(value: unknown): PrizeDeliveryMode {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'inbox') return 'inbox';
  if (raw === 'claim_required' || raw === 'claim-required') return 'claim_required';
  if (raw === 'external_code' || raw === 'external-code') return 'external_code';
  if (raw === 'manual') return 'manual';
  return 'immediate';
}

export function normalizeDeliveryTarget(value: unknown): PrizeDeliveryTarget {
  const raw = String(value ?? '').toLowerCase();
  if (raw === 'spin_wallet' || raw === 'spin-wallet') return 'spin_wallet';
  if (raw === 'reward_inbox' || raw === 'reward-inbox') return 'reward_inbox';
  if (raw === 'code_pool' || raw === 'code-pool') return 'code_pool';
  if (raw === 'manual') return 'manual';
  return 'point_wallet';
}

export function getDefaultWheelPrizes(): WheelPrize[] {
  return [
    normalizeWheelPrize({ id: 'demo-point-10', name: '10🍑', type: 'POINT', weight: 4, metadata: { points: 10, glyph: '🍑', wheelRenderMode: 'emoji-only', labelMode: 'emoji-only' } }),
    normalizeWheelPrize({ id: 'demo-spin-1', name: '+1 lượt quay', type: 'SPIN_TICKET', weight: 3, metadata: { glyph: '🎞', wheelRenderMode: 'emoji-only', labelMode: 'emoji-only' } }),
    normalizeWheelPrize({ id: 'demo-point-25', name: '25🍑', type: 'POINT', weight: 2, metadata: { points: 25, glyph: '🍑', wheelRenderMode: 'emoji-only', labelMode: 'emoji-only' } }),
    normalizeWheelPrize({ id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: { glyph: '🎁', wheelRenderMode: 'emoji-only', labelMode: 'emoji-only' } }),
    normalizeWheelPrize({ id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: { glyph: '😢', wheelRenderMode: 'mixed', labelMode: 'mixed' } }),
  ];
}

function cryptoRandomId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
