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
  glyph: string;
  emojiCount?: number;
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

export function getWheelPrizeGlyph(prize: Pick<WheelPrize, 'type' | 'metadata'>) {
  const type = String(prize.type ?? '').toUpperCase();
  const meta = (prize.metadata ?? {}) as Record<string, unknown>;
  const glyph = normalizeText(String(meta.glyph ?? meta.wheelGlyph ?? meta.icon ?? meta.emoji ?? '✦'));
  if (glyph) return glyph;
  if (type === 'POINT') return '⭐';
  if (type === 'SPIN_TICKET') return '🎞';
  if (type === 'VOUCHER') return '🎁';
  if (type === 'VIP_CODE') return '👑';
  if (type === 'NOTHING') return '😢';
  if (type === 'ITEM') return '🧩';
  if (type === 'BADGE') return '💠';
  return '✦';
}

export function getWheelPrizeShortLabel(prize: Pick<WheelPrize, 'name' | 'type' | 'metadata'>) {
  const meta = (prize.metadata ?? {}) as Record<string, unknown>;
  const glyph = getWheelPrizeGlyph(prize);
  const type = String(prize.type ?? '').toUpperCase();
  if (type === 'POINT') {
    const amount = meta.points ?? meta.point_amount ?? meta.value;
    return amount ? `${glyph} ${amount}` : glyph;
  }
  return normalizeText(prize.name || glyph);
}

export function buildWheelSegments(prizes: WheelPrize[]) {
  const source = prizes.length ? prizes : getDefaultWheelPrizes();

  return source.map((prize, index) => ({
    ...(prize.metadata ? {} : {}),
    id: prize.id,
    name: normalizeText(prize.name || prize.type || 'Prize'),
    compactName: normalizeText(prize.name || prize.type || 'Prize'),
    glyph: getWheelPrizeGlyph(prize),
    emojiCount: Number((prize.metadata ? (prize.metadata as Record<string, unknown>).emojiCount : undefined) ?? 1),
    type: prize.type,
    weight: prize.weight,
    tone: index % 2 === 0 ? '#2f64e4' : '#4b7bff',
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
    { id: 'demo-point-10', name: '10 điểm', type: 'POINT', weight: 4, metadata: { points: 10, glyph: '⭐' } },
    { id: 'demo-spin-1', name: '+1 lượt quay', type: 'SPIN_TICKET', weight: 3, metadata: { glyph: '🎞' } },
    { id: 'demo-point-25', name: '25 điểm', type: 'POINT', weight: 2, metadata: { points: 25, glyph: '⭐' } },
    { id: 'demo-voucher', name: 'Voucher', type: 'VOUCHER', weight: 1, metadata: { glyph: '🎁' } },
    { id: 'demo-lose', name: 'Không trúng', type: 'CUSTOM', weight: 1, metadata: { glyph: '😢' } },
  ];
}
