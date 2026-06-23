export type WheelPrize = {
  id: string;
  name: string;
  type: string;
  weight: number;
  metadata?: Record<string, unknown> | null;
};

export type WheelCampaign = {
  id?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
};

export type WheelSegment = {
  id: string;
  name: string;
  compactName: string;
  type: string;
  weight: number;
  tone: string;
  textTone: string;
  metadata?: Record<string, unknown> | null;
};

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildWheelSegments(prizes: WheelPrize[]) {
  const source = prizes.length ? prizes : getDefaultWheelPrizes();

  return source.map((prize, index) => ({
    id: prize.id,
    name: normalizeText(prize.name || prize.type || 'Prize'),
    compactName: normalizeText(prize.name || prize.type || 'Prize'),
    type: prize.type,
    weight: prize.weight,
    tone: index % 2 === 0 ? '#294fc2' : '#2f64e4',
    textTone: '#eef5ff',
    metadata: prize.metadata ?? {},
  }));
}

export function getWheelFallbackCampaign(): WheelCampaign {
  return {
    name: 'Reveal Wheel',
    description: 'Minimal blue / bronze reveal game. Segments tự co giãn theo danh sách reward, không cần sửa layout khi thêm prize mới.',
    is_active: true,
  };
}

export function getWheelDefaultOutcomeLabel(name?: string | null) {
  return name ? normalizeText(name) : 'Sẵn sàng';
}

export function getDefaultWheelPrizes() {
  return [
    { id: 'demo-point-10', name: '10đ', type: 'POINT', weight: 4, metadata: { points: 10 } },
    { id: 'demo-spin-1', name: '+1 spin', type: 'SPIN_TICKET', weight: 3, metadata: {} },
    { id: 'demo-point-25', name: '25đ', type: 'POINT', weight: 2, metadata: { points: 25 } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: {} },
    { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: {} },
  ];
}
