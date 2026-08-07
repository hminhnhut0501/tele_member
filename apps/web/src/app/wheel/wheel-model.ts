export type {
  WheelPrize,
  WheelCampaign,
  WheelCampaignMetadata,
  WheelPrizeMetadata,
  PrizeRenderMode,
  PrizeDeliveryMode,
  PrizeDeliveryTarget,
  PrizeType,
  WheelPreset,
  WheelPreview,
  WheelPreviewItem,
  WheelRailItem,
  WheelSpinHistoryItem,
  WheelSlotToken,
  WheelRendererConfig,
  WheelWarning,
  WheelPrizeFormState,
  WheelCampaignFormState,
  WheelSegment,
} from './wheel-schema';

export {
  clamp,
  getDefaultWheelPrizes,
  getWheelPrizeGlyph,
  getWheelPrizeRenderMode,
  getWheelPrizeShortLabel,
  normalizeDeliveryMode,
  normalizeDeliveryTarget,
  normalizeRenderMode,
  normalizeText,
  normalizeWheelCampaign,
  normalizeWheelPreset,
  normalizeWheelPreview,
  normalizeWheelPreviewItem,
  normalizeWheelPrize,
  normalizeWheelWarning,
  toFiniteNumber,
  validateWheelCampaign,
  validateWheelPreview,
  validateWheelPrize,
} from './wheel-schema';

import {
  getDefaultWheelPrizes as getSchemaDefaultWheelPrizes,
  getWheelPrizeGlyph,
  getWheelPrizeRenderMode,
  getWheelPrizeShortLabel,
  normalizeText,
  normalizeWheelPrize,
  toFiniteNumber,
  type WheelPrize,
  type WheelSegment,
} from './wheel-schema';

function getPrizeClass(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') return 'value' as const;
  if (type === 'SPIN_TICKET' || type === 'SPIN') return 'badge' as const;
  if (type === 'VOUCHER' || type === 'VIP_CODE') return 'phrase' as const;
  if (type === 'NOTHING') return 'hidden' as const;
  return 'phrase' as const;
}

function getTone(type: string, index: number) {
  const t = String(type ?? '').toUpperCase();
  const palette = ['#cfe4ff', '#a9ccff', '#7fb0ff', '#5f93ff', '#3d73ef', '#264fbf'];
  const base = palette[index % palette.length];
  if (t === 'NOTHING') return '#182a58';
  return base;
}

function getTextTone(type: string) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'NOTHING') return '#eaf2ff';
  return '#f8fbff';
}

export function buildWheelSegments(prizes: WheelPrize[]) {
  const source = prizes.length ? prizes.map((prize) => normalizeWheelPrize(prize as any)) : getSchemaDefaultWheelPrizes();

  return source.map((prize, index) => {
    const kind = getPrizeClass(prize);
    const renderMode = getWheelPrizeRenderMode(prize, kind === 'hidden' ? 'mixed' : 'mixed');
    const wheelLabel = getWheelPrizeShortLabel(prize);
    const glyph = getWheelPrizeGlyph(prize);
    return {
      id: prize.id,
      name: normalizeText(prize.name || wheelLabel),
      compactName: normalizeText(wheelLabel),
      glyph,
      emojiCount: Number(prize.metadata?.emojiCount ?? 1),
      type: prize.type,
      weight: toFiniteNumber(prize.weight, 0),
      tone: getTone(prize.type, index),
      textTone: getTextTone(prize.type),
      metadata: prize.metadata ?? {},
      labelPolicy: {
        kind,
        glyph,
        renderMode,
        wheelLabel,
        railLabel: normalizeText(prize.metadata?.railLabel ?? wheelLabel),
        maxChars: kind === 'phrase' ? 8 : 12,
        showOnWheel: kind !== 'hidden',
        fontScale: renderMode === 'emoji-only' ? 1.04 : kind === 'phrase' ? 0.84 : 0.9,
        radiusShift: kind === 'value' ? 10 : kind === 'badge' ? 6 : kind === 'phrase' ? -2 : 0,
        tone: getTone(prize.type, index),
        textTone: getTextTone(prize.type),
      },
      displayLabel: wheelLabel,
      railLabel: normalizeText(prize.metadata?.railLabel ?? wheelLabel),
      showLabelOnWheel: kind !== 'hidden',
      slotBias: 0,
    } satisfies WheelSegment & {
      labelPolicy: unknown;
      displayLabel: string;
      railLabel: string;
      showLabelOnWheel: boolean;
      slotBias: number;
    };
  });
}

export function getWheelFallbackCampaign() {
  return {
    id: 'wheel_fallback',
    name: 'Reveal Wheel',
    description: 'Minimal blue / bronze reveal game. Segments tự co giãn theo danh sách reward, không cần sửa layout khi thêm prize mới.',
    is_active: true,
  };
}

export function getWheelDefaultOutcomeLabel(name?: string | null) {
  return name ? normalizeText(name) : 'Sẵn sàng';
}
