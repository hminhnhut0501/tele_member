import type { WheelPrize } from './wheel-model';

export type FixedWheelGroupKey = 'gift' | 'peach' | 'nothing';

export const FIXED_WHEEL_GROUPS = [
  { key: 'gift', name: 'QUÀ', type: 'VOUCHER', glyph: '🎁', description: 'Phần thưởng bất ngờ' },
  { key: 'peach', name: 'ĐÀO', type: 'POINT', glyph: '🍑', description: 'Nhận đào ngẫu nhiên' },
  { key: 'nothing', name: 'KHÔNG TRÚNG', type: 'NOTHING', glyph: '✦', description: 'May mắn lần sau' },
] as const;

export const DEFAULT_GROUP_WEIGHTS: Record<FixedWheelGroupKey, number> = {
  gift: 40,
  peach: 45,
  nothing: 15,
};

export function buildFixedWheelPrizes(
  outcomes: WheelPrize[],
  probabilityWeights: Record<FixedWheelGroupKey, number>,
) {
  return FIXED_WHEEL_GROUPS.map((group) => {
    const outcome = outcomes.find((prize) => prize.groupKey === group.key);
    return {
      id: group.key,
      campaignId: outcome?.campaignId,
      name: group.name,
      type: group.type,
      groupKey: group.key,
      // Probability is preserved here; displayWeight deliberately stays equal.
      weight: probabilityWeights[group.key],
      stock: null,
      isActive: true,
      metadata: {
        ...(outcome?.metadata ?? {}),
        glyph: group.glyph,
        wheelLabel: group.name,
        railLabel: group.description,
        renderMode: 'mixed',
        displayWeight: 1,
      },
    } as WheelPrize;
  });
}
