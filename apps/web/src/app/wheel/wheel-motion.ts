'use client';

import type { WheelRenderSegment } from './wheel-types';

export function getWheelSegmentAngle(segmentCount: number) {
  return 360 / Math.max(segmentCount, 1);
}

export type WheelMotionPhase = 'idle' | 'arming' | 'spinning' | 'slowing' | 'settling' | 'result';

export function getWheelStartRotation(previousRotation: number) {
  return previousRotation + 1440 + Math.floor(Math.random() * 360);
}

export function getWheelTargetRotation(segments: WheelRenderSegment[], prizeId?: string | null) {
  if (!segments.length || !prizeId) return 0;
  const index = segments.findIndex((segment) => segment.id === prizeId);
  if (index < 0) return 0;
  const segmentAngle = getWheelSegmentAngle(segments.length);
  const centerAngle = index * segmentAngle + segmentAngle / 2;
  return 360 - centerAngle;
}

export function getWheelSpinTransition(phase: WheelMotionPhase) {
  if (phase === 'spinning') return 'transform 5.9s cubic-bezier(0.16, 0.86, 0.18, 1)';
  if (phase === 'slowing') return 'transform 0.58s cubic-bezier(0.22, 1.08, 0.36, 1)';
  if (phase === 'settling') return 'transform 0.34s cubic-bezier(0.24, 1.22, 0.34, 1)';
  return 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
}
