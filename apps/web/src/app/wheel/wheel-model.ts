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

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { id: 'demo-point-10', name: '10đ', compactName: '10đ', type: 'POINT', weight: 4, tone: '#f3d86d', textTone: '#1a2340', metadata: { points: 10 } },
  { id: 'demo-spin-1', name: '+1 spin', compactName: '+1 spin', type: 'SPIN_TICKET', weight: 3, tone: '#8fb9ff', textTone: '#102044', metadata: {} },
  { id: 'demo-point-25', name: '25đ', compactName: '25đ', type: 'POINT', weight: 2, tone: '#f0c84c', textTone: '#1a2340', metadata: { points: 25 } },
  { id: 'demo-voucher', name: 'Voucher', compactName: 'Voucher', type: 'VOUCHER', weight: 1, tone: '#17213a', textTone: '#f5f7ff', metadata: {} },
  { id: 'demo-lose', name: 'Không trúng', compactName: 'Không trúng', type: 'CUSTOM', weight: 1, tone: '#223566', textTone: '#eef5ff', metadata: {} },
];

function normalizeText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

function compactLabel(prize: WheelPrize) {
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = prize.metadata?.points ?? prize.metadata?.point_amount ?? prize.metadata?.value;
    return amount ? `+${amount}đ` : 'Điểm';
  }
  if (type === 'SPIN_TICKET') return '+1 spin';
  if (type === 'VOUCHER') return 'Voucher';
  if (type === 'VIP_CODE') return 'VIP';
  if (type === 'NOTHING') return 'Không trúng';
  if (type === 'CUSTOM') return prize.name || 'Không trúng';
  return prize.name || type || 'Prize';
}

function segmentTone(type: string, index: number) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT') return index % 2 === 0 ? '#f3d86d' : '#f7e08c';
  if (t === 'SPIN_TICKET') return index % 2 === 0 ? '#8eb3f7' : '#74a4ff';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return index % 2 === 0 ? '#1a2644' : '#111b31';
  return index % 2 === 0 ? '#294fc2' : '#2f64e4';
}

function textTone(type: string) {
  const t = String(type ?? '').toUpperCase();
  if (t === 'POINT' || t === 'SPIN_TICKET') return '#13203e';
  if (t === 'VOUCHER' || t === 'VIP_CODE') return '#f3f7ff';
  return '#eef5ff';
}

export function buildWheelSegments(prizes: WheelPrize[]) {
  const source = prizes.length
    ? prizes
    : DEFAULT_SEGMENTS;

  return source.map((prize, index) => ({
    id: prize.id,
    name: normalizeText(prize.name || compactLabel(prize)),
    compactName: normalizeText(compactLabel(prize)),
    type: prize.type,
    weight: prize.weight,
    tone: segmentTone(prize.type, index),
    textTone: textTone(prize.type),
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
