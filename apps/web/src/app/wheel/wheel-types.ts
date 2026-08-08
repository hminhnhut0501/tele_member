'use client';

import type { PrizeRenderMode, WheelPrize, WheelPrizeMetadata } from './wheel-schema';

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

export type WheelRenderSegment = {
  id: string;
  name: string;
  compactName: string;
  glyph: string;
  emojiCount?: number;
  type: WheelPrize['type'];
  weight: number;
  tone: string;
  textTone: string;
  metadata?: WheelPrizeMetadata | null;
  labelPolicy: WheelLabelPolicy;
  displayLabel: string;
  railLabel: string;
  showLabelOnWheel: boolean;
  slotBias: number;
};

