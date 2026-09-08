import type { WheelPrize } from './wheel-model';

export type FixedWheelGroupKey = 'gift' | 'peach' | 'nothing';

export const FIXED_WHEEL_GROUPS = [
  { key: 'gift-1', groupKey: 'gift', name: 'QUÀ', type: 'VOUCHER', glyph: '🎁', iconVariant: 1, description: 'Phần thưởng bất ngờ' },
  { key: 'peach-1', groupKey: 'peach', name: 'ĐÀO', type: 'POINT', glyph: '🍑', iconVariant: 1, description: 'Nhận đào ngẫu nhiên' },
  { key: 'nothing-1', groupKey: 'nothing', name: 'KHÔNG TRÚNG', type: 'NOTHING', glyph: '✦', iconVariant: 1, description: 'May mắn lần sau' },
  { key: 'gift-2', groupKey: 'gift', name: 'QUÀ', type: 'VOUCHER', glyph: '🎀', iconVariant: 2, description: 'Phần thưởng bất ngờ' },
  { key: 'peach-2', groupKey: 'peach', name: 'ĐÀO', type: 'POINT', glyph: '🍑', iconVariant: 2, description: 'Nhận đào ngẫu nhiên' },
  { key: 'nothing-2', groupKey: 'nothing', name: 'KHÔNG TRÚNG', type: 'NOTHING', glyph: '✧', iconVariant: 2, description: 'May mắn lần sau' },
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
    const outcome = outcomes.find((prize) => prize.groupKey === group.groupKey);
    return {
      id: group.key,
      campaignId: outcome?.campaignId,
      name: group.name,
      type: group.type,
      groupKey: group.groupKey,
      // Split group probability across the two visual slots; display stays equal.
      weight: probabilityWeights[group.groupKey] / 2,
      stock: null,
      isActive: true,
      metadata: {
        ...(outcome?.metadata ?? {}),
        glyph: group.glyph,
        iconVariant: group.iconVariant,
        visualGroupKey: group.groupKey,
        wheelLabel: group.name,
        railLabel: group.description,
        renderMode: 'mixed',
        displayWeight: 1,
      },
    } as WheelPrize;
  });
}
