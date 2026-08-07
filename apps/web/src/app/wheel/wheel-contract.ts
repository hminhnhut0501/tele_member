import {
  getDefaultWheelPrizes as getSchemaDefaultWheelPrizes,
  getWheelPrizeGlyph,
  getWheelPrizeRenderMode,
  normalizeText,
  normalizeWheelPrize,
  type PrizeRenderMode,
  type WheelPrize,
  type WheelSegment,
} from './wheel-schema';

export type WheelLabelKind = 'value' | 'badge' | 'phrase' | 'hidden';
export type WheelRenderMode = PrizeRenderMode;

export type WheelLabelPolicy = {
  kind: WheelLabelKind;
  glyph: string;
  renderMode: WheelRenderMode;
  wheelLabel: string;
  railLabel: string;
  maxChars: number;
  showOnWheel: boolean;
  fontScale: number;
  radiusShift: number;
  tone: string;
  textTone: string;
};

export type WheelRenderContract = {
  segmentAngle: number;
  labelRadius: number;
  chipLabelLimit: number;
  wheelLabelScale: number;
  railLabelScale: number;
  labelInset: number;
  centerLabel: string;
  preset: 'five' | 'six' | 'eight' | 'tenPlus' | 'custom';
};

export type WheelRenderSegment = WheelSegment & {
  labelPolicy: WheelLabelPolicy;
  displayLabel: string;
  railLabel: string;
  showLabelOnWheel: boolean;
  slotBias: number;
};

function shortText(value: string, maxChars: number) {
  const normalized = normalizeText(value);
  if (normalized.length <= maxChars) return normalized;
  const clipped = normalized.slice(0, Math.max(1, maxChars - 1)).trimEnd();
  return `${clipped}…`;
}

function getPrizeClass(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') return 'value' as const;
  if (type === 'SPIN_TICKET') return 'badge' as const;
  if (type === 'VOUCHER' || type === 'VIP_CODE') return 'phrase' as const;
  if (type === 'NOTHING') return 'hidden' as const;
  return 'phrase' as const;
}

function getWheelRenderMode(prize: WheelPrize, kind: WheelLabelKind): WheelRenderMode {
  const explicit = getWheelPrizeRenderMode(prize, 'mixed');
  if (explicit === 'emoji-only' || explicit === 'label-only' || explicit === 'mixed') return explicit;
  if (kind === 'value' || kind === 'badge') return 'emoji-only';
  if (kind === 'phrase') return 'label-only';
  return 'mixed';
}

function getPrizeWheelLabel(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  const glyph = getWheelPrizeGlyph(prize);
  const normalized = normalizeWheelPrize(prize);
  if (type === 'POINT') {
    const amount = normalized.metadata?.points ?? normalized.metadata?.point_amount ?? normalized.metadata?.value;
    return amount ? `${glyph}${amount}🍑` : glyph;
  }
  if (type === 'SPIN_TICKET' || type === 'SPIN') return glyph || '⟲';
  if (type === 'VOUCHER') return glyph || '🎁';
  if (type === 'VIP_CODE') return glyph || '👑';
  if (type === 'NOTHING') return glyph || '😢';
  return glyph || normalized.name || '•';
}

function getPrizeRailLabel(prize: WheelPrize, fallbackWheelLabel: string) {
  const type = String(prize.type ?? '').toUpperCase();
  const glyph = getWheelPrizeGlyph(prize);
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `${glyph} ${amount}🍑` : `${glyph} 🍑`;
  }
  if (type === 'SPIN_TICKET' || type === 'SPIN') return prize.name || `${glyph} 1 lượt quay`;
  if (type === 'VOUCHER') return prize.name || `${glyph} Voucher`;
  if (type === 'VIP_CODE') return prize.name || `${glyph} VIP`;
  if (type === 'NOTHING') return prize.name || `${glyph} Không trúng`;
  return prize.name || fallbackWheelLabel;
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

export function buildWheelRenderContract(prizes: WheelPrize[]) {
  const normalizedPrizes = (prizes.length ? prizes : getSchemaDefaultWheelPrizes()).map((prize) => normalizeWheelPrize(prize));
  const segmentCount = Math.max(normalizedPrizes.length, 1);
  const segmentAngle = 360 / segmentCount;
  const preset: WheelRenderContract['preset'] =
    segmentCount === 5 ? 'five' : segmentCount === 6 ? 'six' : segmentCount === 8 ? 'eight' : segmentCount >= 10 ? 'tenPlus' : 'custom';

  const labelRadius = preset === 'five' ? 392 : preset === 'six' ? 370 : preset === 'eight' ? 350 : preset === 'tenPlus' ? 318 : 336;
  const chipLabelLimit = preset === 'five' ? 18 : preset === 'six' ? 16 : preset === 'eight' ? 14 : preset === 'tenPlus' ? 12 : 14;
  const wheelLabelScale = preset === 'five' ? 1.1 : preset === 'six' ? 0.96 : preset === 'eight' ? 0.88 : preset === 'tenPlus' ? 0.78 : 0.9;
  const railLabelScale = preset === 'five' ? 1 : preset === 'six' ? 0.98 : 0.96;
  const labelInset = preset === 'five' ? 6 : preset === 'six' ? 8 : segmentAngle >= 45 ? 10 : 12;

  const slotBiasByPreset: Record<WheelRenderContract['preset'], number[]> = {
    five: [10, 6, 1, -6, -1],
    six: [8, 5, 0, -4, -2, 1],
    eight: [4, 3, 1, -2, -3, -1, 0, 2],
    tenPlus: [2, 1, 0, -1, -2, -1, 0, 1, 2, -1, 0, 1],
    custom: [],
  };

  const decoratedSegments: WheelRenderSegment[] = normalizedPrizes.map((prize, index) => {
    const kind = getPrizeClass(prize);
    const renderMode = getWheelRenderMode(prize, kind);
    const wheelLabelBase = getPrizeWheelLabel(prize);
    const wheelLabelBudget = segmentAngle >= 72 ? 12 : segmentAngle >= 45 ? 10 : 8;
    const glyph = getWheelPrizeGlyph(prize);
    const wheelLabel = shortText(wheelLabelBase, kind === 'phrase' ? Math.min(10, wheelLabelBudget) : wheelLabelBudget);
    const railLabel = shortText(getPrizeRailLabel(prize, wheelLabel), 24);
    const showOnWheel = kind !== 'hidden';
    const labelPolicy: WheelLabelPolicy = {
      kind,
      glyph,
      renderMode,
      wheelLabel,
      railLabel,
      maxChars: kind === 'phrase' ? Math.min(8, wheelLabelBudget) : wheelLabelBudget,
      showOnWheel,
      fontScale:
        renderMode === 'emoji-only'
          ? kind === 'value'
            ? 1.12
            : kind === 'badge'
              ? 1.08
              : 1.0
          : kind === 'value'
            ? 0.92
            : kind === 'badge'
              ? 0.88
              : segmentAngle < 45
                ? 0.72
                : 0.8,
      radiusShift:
        kind === 'value'
          ? renderMode === 'emoji-only'
            ? 18
            : 12
          : kind === 'badge'
            ? renderMode === 'emoji-only'
              ? 14
              : 8
            : kind === 'phrase'
              ? renderMode === 'label-only'
                ? -8
                : -2
              : 0,
      tone: getTone(prize.type, index),
      textTone: getTextTone(prize.type),
    };

    return {
      id: prize.id,
      name: normalizeText(prize.name || wheelLabel),
      compactName: wheelLabel,
      glyph,
      type: prize.type,
      weight: prize.weight,
      tone: labelPolicy.tone,
      textTone: labelPolicy.textTone,
      metadata: prize.metadata ?? {},
      labelPolicy,
      displayLabel: wheelLabel,
      railLabel,
      showLabelOnWheel: labelPolicy.showOnWheel,
      slotBias: slotBiasByPreset[preset][index % Math.max(slotBiasByPreset[preset].length, 1)] ?? 0,
    };
  });

  return {
    segmentAngle,
    labelRadius,
    chipLabelLimit,
    wheelLabelScale,
    railLabelScale,
    labelInset,
    centerLabel: '',
    preset,
    segments: decoratedSegments,
  };
}

export function getDefaultWheelPrizes(): WheelPrize[] {
  return [
    { id: 'demo-point-10', name: '10🍑', type: 'POINT', weight: 4, metadata: { points: 10, glyph: '🍑' } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25🍑', type: 'POINT', weight: 2, metadata: { points: 25, glyph: '🍑' } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
    { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: {} },
  ];
}
