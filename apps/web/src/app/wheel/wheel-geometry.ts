export type WheelGeometryInput = {
  id: string;
  probabilityWeight: number;
  displayWeight?: number;
};

export type WheelGeometrySegment = {
  id: string;
  probabilityWeight: number;
  probabilityChance: number;
  displayWeight: number;
  startAngle: number;
  endAngle: number;
  sweepAngle: number;
  centerAngle: number;
};

export type WheelGeometry = {
  totalProbabilityWeight: number;
  totalDisplayWeight: number;
  segments: WheelGeometrySegment[];
};

function positiveWeight(value: number | undefined) {
  return Number.isFinite(value) && (value ?? 0) > 0 ? value ?? 0 : 0;
}

function normalizedWeights(items: WheelGeometryInput[], key: 'probabilityWeight' | 'displayWeight') {
  const weights = items.map((item) => positiveWeight(item[key]));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return total > 0 ? { weights, total } : { weights: items.map(() => 1), total: items.length };
}

export function buildWheelGeometry(items: WheelGeometryInput[]): WheelGeometry {
  const probability = normalizedWeights(items, 'probabilityWeight');
  const display = normalizedWeights(items, 'displayWeight');
  const displaySweeps = display.weights.map((weight) => (weight / display.total) * 360);
  let cursor = -(displaySweeps[0] ?? 0) / 2;

  const segments = items.map((item, index) => {
    const sweepAngle = displaySweeps[index] ?? 0;
    const startAngle = cursor;
    const endAngle = startAngle + sweepAngle;
    cursor = endAngle;
    return {
      id: item.id,
      probabilityWeight: probability.weights[index],
      probabilityChance: probability.weights[index] / probability.total,
      displayWeight: display.weights[index],
      startAngle,
      endAngle,
      sweepAngle,
      centerAngle: startAngle + sweepAngle / 2,
    };
  });

  return {
    totalProbabilityWeight: probability.total,
    totalDisplayWeight: display.total,
    segments,
  };
}

export function polarToWheelPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.sin(angleRad),
    y: cy - radius * Math.cos(angleRad),
  };
}

export function describeWheelSegmentPath(segment: Pick<WheelGeometrySegment, 'startAngle' | 'sweepAngle'>, radius = 500, cx = 500, cy = 500) {
  const start = polarToWheelPoint(cx, cy, radius, segment.startAngle);
  const end = polarToWheelPoint(cx, cy, radius, segment.startAngle + segment.sweepAngle);
  const largeArcFlag = segment.sweepAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export function getWheelTargetRotation(centerAngle: number) {
  return (360 - centerAngle) % 360;
}
