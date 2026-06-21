import type { WheelPrize, WheelSegment } from './wheel-model';

export function getWheelSegmentAngle(segmentCount: number) {
  return 360 / Math.max(segmentCount, 1);
}

export function getWheelTargetRotation(segments: WheelSegment[], prizeId?: string | null) {
  if (!segments.length || !prizeId) return 0;
  const index = segments.findIndex((segment) => segment.id === prizeId);
  if (index < 0) return 0;
  const segmentAngle = getWheelSegmentAngle(segments.length);
  const centerAngle = index * segmentAngle + segmentAngle / 2;
  return 360 - centerAngle;
}

export function getWheelStartSpinRotation(previousRotation: number) {
  return previousRotation + 1440 + Math.floor(Math.random() * 360);
}

export function getWheelSpinRotation(previousRotation: number, segments: WheelSegment[], prizeId?: string | null) {
  return previousRotation + getWheelStartSpinRotation(previousRotation - previousRotation) + getWheelTargetRotation(segments, prizeId);
}

export function getWheelSegmentTone(prize: WheelPrize, index: number) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') return index % 2 === 0 ? '#f3d86d' : '#f7e08c';
  if (type === 'SPIN_TICKET') return index % 2 === 0 ? '#8eb3f7' : '#74a4ff';
  if (type === 'VOUCHER' || type === 'VIP_CODE') return index % 2 === 0 ? '#1a2644' : '#111b31';
  return index % 2 === 0 ? '#294fc2' : '#2f64e4';
}
