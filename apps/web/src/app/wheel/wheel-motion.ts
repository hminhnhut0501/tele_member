'use client';

import type { WheelRenderSegment } from './wheel-types';
import { getWheelTargetRotation as getGeometryTargetRotation } from './wheel-geometry';

export function getWheelSegmentAngle(segmentCount: number) {
  return 360 / Math.max(segmentCount, 1);
}

export type WheelMotionPhase = 'idle' | 'arming' | 'spinning' | 'slowing' | 'settling' | 'result';

export function getWheelStartRotation(previousRotation: number) {
  return previousRotation + 1440 + Math.floor(Math.random() * 360);
}

export function getWheelTargetRotation(segments: WheelRenderSegment[], prizeId?: string | null) {
  if (!segments.length || !prizeId) return 0;
  const index = segments.findIndex((segment) => (
    segment.id === prizeId ||
    segment.id.startsWith(`${prizeId}-`) ||
    segment.metadata?.groupKey === prizeId ||
    segment.metadata?.visualGroupKey === prizeId
  ));
  if (index < 0) return 0;
  const segment = segments[index];
  return segment ? getGeometryTargetRotation(segment.centerAngle) : 0;
}

export function getWheelSpinTransition(phase: WheelMotionPhase) {
  // Rotation is resolved once per spin. Keep the same transition while the
  // visual phase changes so easing updates cannot retime an active transform.
  if (phase === 'spinning' || phase === 'slowing' || phase === 'settling') {
    return 'transform 4.5s cubic-bezier(0.12, 0.78, 0.18, 1)';
  }
  return 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)';
}
