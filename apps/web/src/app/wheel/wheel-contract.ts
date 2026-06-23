import type { WheelPrize, WheelSegment } from './wheel-model';

export type WheelLabelKind = 'value' | 'badge' | 'phrase' | 'hidden';

export type WheelLabelPolicy = {
  kind: WheelLabelKind;
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
};

export type WheelRenderSegment = WheelSegment & {
  labelPolicy: WheelLabelPolicy;
  displayLabel: string;
  railLabel: string;
  showLabelOnWheel: boolean;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

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

function getPrizeWheelLabel(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `+${amount}đ` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP';
  if (type === 'NOTHING') return 'Không trúng';
  return prize.name || type || 'Prize';
}

function getPrizeRailLabel(prize: WheelPrize, fallbackWheelLabel: string) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `${amount} điểm` : prize.name || fallbackWheelLabel;
  }
  if (type === 'SPIN_TICKET') return 'Cộng 1 lượt quay';
  if (type === 'VOUCHER') return prize.name || 'Voucher';
  if (type === 'VIP_CODE') return prize.name || 'Mã VIP';
  if (type === 'NOTHING') return 'Không trúng';
  return prize.name || fallbackWheelLabel;
}

function getTone(type: string, index: number) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT') return index % 2 === 0 ? '#f3d86d' : '#f7e08c';
  if (t === 'SPIN_TICKET') return index % 2 === 0 ? '#8eb3f7' : '#74a4ff';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return index % 2 === 0 ? '#1a2644' : '#111b31';
  return index % 2 === 0 ? '#294fc2' : '#2f64e4';
}

function getTextTone(type: string) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT' || t === 'SPIN_TICKET') return '#13203e';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return '#f3f7ff';
  return '#eef5ff';
}

export function buildWheelRenderContract(prizes: WheelPrize[]) {
  const segmentCount = Math.max(prizes.length, 1);
  const segmentAngle = 360 / segmentCount;
  const labelRadius = segmentCount <= 5 ? 32 : segmentCount <= 8 ? 30 : 28;
  const chipLabelLimit = segmentCount <= 6 ? 18 : segmentCount <= 8 ? 14 : 12;
  const wheelLabelScale = segmentCount <= 5 ? 1 : segmentCount <= 8 ? 0.92 : 0.84;
  const railLabelScale = segmentCount <= 5 ? 1 : 0.95;

  const segments = prizes.length ? prizes : getDefaultWheelPrizes();

  const decoratedSegments: WheelRenderSegment[] = segments.map((prize, index) => {
    const kind = getPrizeClass(prize);
    const wheelLabel = shortText(getPrizeWheelLabel(prize), kind === 'phrase' ? 11 : 12);
      const railLabel = shortText(getPrizeRailLabel(prize, wheelLabel), 24);
      const labelPolicy: WheelLabelPolicy = {
        kind,
        wheelLabel,
        railLabel,
        maxChars: kind === 'phrase' ? 11 : 12,
        showOnWheel: kind !== 'hidden',
        fontScale: kind === 'value' ? 1.03 : kind === 'badge' ? 0.95 : 0.88,
        radiusShift: kind === 'value' ? 0.01 : kind === 'badge' ? -0.01 : 0.02,
        tone: getTone(prize.type, index),
        textTone: getTextTone(prize.type),
    };

    return {
      id: prize.id,
      name: normalizeText(prize.name || wheelLabel),
      compactName: wheelLabel,
      type: prize.type,
      weight: prize.weight,
      tone: labelPolicy.tone,
      textTone: labelPolicy.textTone,
      metadata: prize.metadata ?? {},
      labelPolicy,
      displayLabel: wheelLabel,
      railLabel,
      showLabelOnWheel: labelPolicy.showOnWheel,
    };
  });

  return {
    segmentAngle,
    labelRadius,
    chipLabelLimit,
    wheelLabelScale,
    railLabelScale,
    segments: decoratedSegments,
  };
}

export function getDefaultWheelPrizes(): WheelPrize[] {
  return [
    { id: 'demo-point-10', name: '10đ', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25đ', type: 'POINT', weight: 2, metadata: { points: 25 } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
    { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: {} },
  ];
}
