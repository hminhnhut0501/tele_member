'use client';

import { getDefaultWheelPrizes, getWheelPrizeGlyph, getWheelPrizeShortLabel, normalizeWheelPrize, type WheelPrize } from './wheel-model';
import { getWheelSegmentAngle } from './wheel-motion';
import type { WheelRenderSegment } from './wheel-types';

export type WheelRenderPreset = 'five' | 'six' | 'eight' | 'tenPlus' | 'custom';

export interface WheelTokenPlacement {
  prizeId: string;
  x: number;
  y: number;
  angle: number;
  size: number;
  offsetX: number;
  offsetY: number;
  counterRotate: number;
  token: string;
  assetUrl: string | null;
  label: string;
  renderMode: 'emoji-only' | 'label-only' | 'mixed';
  tone: string;
  textTone: string;
}

export interface WheelRenderPlan {
  preset: WheelRenderPreset;
  segmentAngle: number;
  wheelSize: string;
  tokenRadius: number;
  pointerInset: number;
  centerSize: number;
  historyTickerCount: number;
  segments: WheelRenderSegment[];
  tokenPlacements: WheelTokenPlacement[];
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function getPreset(segmentCount: number): WheelRenderPreset {
  if (segmentCount === 5) return 'five';
  if (segmentCount === 6) return 'six';
  if (segmentCount === 8) return 'eight';
  if (segmentCount >= 10) return 'tenPlus';
  return 'custom';
}

function getPalette(type: string, index: number) {
  const t = String(type ?? '').toUpperCase();
  const palette = ['#dfeeff', '#9fc2ff', '#5f8ef0'];
  if (t === 'NOTHING') return '#2a4d9f';
  return palette[index % palette.length];
}

function getTextTone(type: string) {
  const t = String(type ?? '').toUpperCase();
  return t === 'NOTHING' ? '#eaf2ff' : '#f8fbff';
}

function getRenderMode(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  const explicit = String(prize.metadata?.renderMode ?? prize.metadata?.wheelRenderMode ?? prize.metadata?.labelMode ?? '').toLowerCase();
  if (explicit === 'emoji-only' || explicit === 'label-only' || explicit === 'mixed') return explicit;
  if (type === 'POINT' || type === 'SPIN' || type === 'SPIN_TICKET' || type === 'BADGE') return 'emoji-only';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return 'label-only';
  return 'mixed';
}

function getWheelLabel(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  const glyph = getWheelPrizeGlyph(prize);
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `${glyph} ${amount}` : glyph;
  }
  if (type === 'SPIN' || type === 'SPIN_TICKET') return glyph || '🎞';
  if (type === 'VOUCHER') return glyph || '🎁';
  if (type === 'VIP_CODE') return glyph || '👑';
  if (type === 'NOTHING') return glyph || '😢';
  return glyph || getWheelPrizeShortLabel(prize);
}

function shortText(value: string, max = 12) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

function resolveAssetUrl(prize: WheelPrize, fallbackGlyph: string) {
  const direct = String(
    prize.metadata?.assetUrl ??
      prize.metadata?.tokenAssetUrl ??
      prize.metadata?.emojiAssetUrl ??
      prize.metadata?.iconUrl ??
      prize.metadata?.imageUrl ??
      prize.metadata?.wheelAssetUrl ??
      '',
  ).trim();
  if (direct) return direct;

  return direct || null;
}

export function buildWheelPlan(prizes: WheelPrize[], isMobile: boolean, isCompactHeight: boolean): WheelRenderPlan {
  const source = (prizes.length ? prizes : getDefaultWheelPrizes()).map((prize) => normalizeWheelPrize(prize));
  const segmentAngle = getWheelSegmentAngle(source.length);
  const preset = getPreset(source.length);
  const dense = source.length >= 10;
  const compact = source.length >= 8;
  const wheelSize = isMobile
    ? dense
      ? 'min(74vw, 332px)'
      : compact
        ? 'min(78vw, 354px)'
        : 'min(80vw, 382px)'
    : dense
      ? 'min(68vw, 500px)'
      : compact
        ? 'min(72vw, 540px)'
        : 'min(70vw, 560px)';

  const tokenRadius = isMobile
    ? dense
      ? 268
      : compact
        ? 286
        : 306
    : dense
      ? 292
      : compact
        ? 316
        : 336;

  const pointerInset = isMobile ? (isCompactHeight ? 5 : 8) : 12;
  const centerSize = isMobile ? (isCompactHeight ? 0.34 : 0.36) : 0.38;
  const historyTickerCount = Math.min(8, source.length + 2);

  const slotOffsetByPreset: Record<WheelRenderPreset, number[]> = {
    five: [5, -2, -5, 2, 1],
    six: [2.5, -1, -2.5, 0.5, 1.25, -0.5],
    eight: [2, 1, -1, -2, -1.25, 0.75, 1.5, -0.75],
    tenPlus: [1.5, 0.75, -0.25, -1, -1.5, -0.5, 0.2, 0.9, 1.1, -0.35],
    custom: [],
  };

  const segments: WheelRenderSegment[] = source.map((prize, index) => {
    const type = String(prize.type ?? '').toUpperCase();
    const renderMode = getRenderMode(prize);
    const wheelLabel = shortText(getWheelLabel(prize), preset === 'five' ? 12 : preset === 'six' ? 10 : 8);
    const railLabel = shortText(prize.metadata?.railLabel ? String(prize.metadata.railLabel) : prize.name || wheelLabel, 24);
    const glyph = getWheelPrizeGlyph(prize);
    const kind = type === 'POINT' ? 'value' : type === 'SPIN_TICKET' || type === 'SPIN' ? 'badge' : type === 'NOTHING' ? 'hidden' : 'phrase';

    return {
      id: prize.id,
      name: prize.name,
      compactName: wheelLabel,
      glyph,
      emojiCount: Number(prize.metadata?.emojiCount ?? 1),
      type: prize.type,
      weight: prize.weight,
      tone: getPalette(prize.type, index),
      textTone: getTextTone(prize.type),
      metadata: prize.metadata ?? {},
      labelPolicy: {
        kind,
        glyph,
        renderMode,
        wheelLabel,
        railLabel,
        maxChars: preset === 'five' ? 12 : preset === 'six' ? 10 : 8,
        showOnWheel: kind !== 'hidden',
        fontScale:
          renderMode === 'emoji-only'
            ? kind === 'value'
              ? 1.18
              : kind === 'badge'
                ? 1.1
                : 1.0
            : kind === 'value'
              ? 0.9
              : kind === 'badge'
                ? 0.86
                : kind === 'phrase'
                  ? 0.76
                  : 1,
        radiusShift:
          kind === 'value'
            ? 16
            : kind === 'badge'
              ? 10
              : kind === 'phrase'
                ? -4
                : 0,
        tone: getPalette(prize.type, index),
        textTone: getTextTone(prize.type),
      },
      displayLabel: wheelLabel,
      railLabel,
      showLabelOnWheel: kind !== 'hidden',
      slotBias: slotOffsetByPreset[preset][index % Math.max(slotOffsetByPreset[preset].length, 1)] ?? 0,
    } as WheelRenderSegment & {
      labelPolicy: WheelRenderSegment['labelPolicy'];
      displayLabel: string;
      railLabel: string;
      showLabelOnWheel: boolean;
      slotBias: number;
    };
  });

  const tokenPlacements: WheelTokenPlacement[] = segments.map((segment, index) => {
    const midAngle = (index + 0.5) * segmentAngle;
    const isFive = preset === 'five';
    const tokenRadiusNudge = isFive
      ? isMobile
        ? 8
        : 12
      : preset === 'six'
        ? 8
        : 0;
    const tokenRadiusEffective = tokenRadius + tokenRadiusNudge + segment.slotBias * 0.38 + (isFive ? (index === 0 ? 4 : index === 1 ? -1 : index === 2 ? -6 : index === 3 ? 3 : 1) : 0);
    const point = polarToCartesian(500, 500, tokenRadiusEffective, midAngle + (isMobile ? -1 : 0));
    const baseTokenSize = isFive ? (isMobile ? 52 : 60) : isMobile ? 40 : 48;
    const tokenSize = Math.max(
      isFive ? 34 : isMobile ? 28 : 30,
      baseTokenSize * (segment.labelPolicy.kind === 'phrase' ? 0.88 : segment.labelPolicy.kind === 'badge' ? 0.94 : 0.98),
    );
    const assetUrl = resolveAssetUrl(segment as unknown as WheelPrize, segment.glyph || '✦');

    return {
      prizeId: segment.id,
      x: point.x,
      y: point.y,
      angle: midAngle,
      size: tokenSize,
      offsetX: isFive ? (index === 0 ? -10 : index === 1 ? 4 : index === 2 ? 10 : index === 3 ? 2 : -2) : 0,
      offsetY: isFive ? (index === 0 ? -4 : index === 1 ? -2 : index === 2 ? 5 : index === 3 ? 0 : 2) : 0,
      counterRotate: 0,
      token: segment.glyph || '✦',
      assetUrl,
      label: segment.displayLabel,
      renderMode: segment.labelPolicy.renderMode,
      tone: segment.tone,
      textTone: segment.textTone,
    };
  });

  return {
    preset,
    segmentAngle,
    wheelSize,
    tokenRadius,
    pointerInset,
    centerSize,
    historyTickerCount,
    segments,
    tokenPlacements,
  };
}
