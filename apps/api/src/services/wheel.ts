import { buildWheelPreviewContract } from '@tele-member/shared';

function normalizeGroupWeights(metadata: Record<string, unknown> | undefined) {
  const source = (metadata?.groupWeights ?? {}) as Record<string, unknown>;
  const groupWeights = {
    gift: Number(source.gift ?? 40),
    peach: Number(source.peach ?? 45),
    nothing: Number(source.nothing ?? 15),
  };
  if (Object.values(groupWeights).some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error('Group weights must be non-negative numbers');
  }
  const total = groupWeights.gift + groupWeights.peach + groupWeights.nothing;
  if (total !== 100) throw new Error('Group weights must total 100');
  return { ...(metadata ?? {}), groupWeights };
}

export function createWheelService(supabase: any) {
  async function getCurrentCampaign() {
    const { data } = await supabase
      .from('wheel_campaigns')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  }

  async function getCampaign(id: string) {
    const { data } = await supabase.from('wheel_campaigns').select('*').eq('id', id).maybeSingle();
    return data ?? null;
  }

  async function listCampaignPrizes(campaignId: string) {
    const { data = [] } = await supabase
      .from('wheel_prizes')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });
    return data;
  }

  async function listCampaignGroups(campaignId: string) {
    const preview = await getCampaignPreview(campaignId);
    return Array.isArray((preview as any)?.groups) ? (preview as any).groups : [];
  }

  async function spin(userId: string, campaignId: string) {
    const { data, error } = await supabase.rpc('spin_wheel', {
      p_user_id: userId,
      p_campaign_id: campaignId,
    });
    if (error) throw error;
    return data;
  }

  async function listSpinHistory(userId: string) {
    const { data = [] } = await supabase
      .from('wheel_spins')
      .select('id, user_id, campaign_id, prize_id, cost_spins, result_metadata, created_at, wheel_campaigns(name), wheel_prizes(name, type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data;
  }

  async function listAdminSpins(query: { limit: number; offset: number; userId?: string; campaignId?: string }) {
    let builder = supabase
      .from('wheel_spins')
      .select('id, user_id, campaign_id, prize_id, cost_spins, result_metadata, created_at, users(telegram_id, username), wheel_campaigns(name), wheel_prizes(name, type)')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);
    if (query.userId) builder = builder.eq('user_id', query.userId);
    if (query.campaignId) builder = builder.eq('campaign_id', query.campaignId);
    const { data = [] } = await builder;
    return data;
  }

  async function getCampaignPreview(campaignId: string) {
    const { data, error } = await supabase.rpc('wheel_campaign_probability_preview', {
      p_campaign_id: campaignId,
    });
    if (error) throw error;
    const preview = data ?? null;
    const contract = buildWheelPreviewContract({
      campaignId,
      prizes: Array.isArray(preview?.prizes) ? preview.prizes : Array.isArray(preview?.distribution) ? preview.distribution : [],
      distribution: Array.isArray(preview?.distribution) ? preview.distribution : Array.isArray(preview?.prizes) ? preview.prizes : [],
      totalWeight: preview?.totalWeight ?? preview?.total_weight,
      preset: preview?.preset ?? preview?.slotPreset,
      mobileMode: preview?.mobileMode,
      renderHints: preview?.renderHints,
      warnings: preview?.warnings,
    });
    return { ...contract, groups: Array.isArray(preview?.groups) ? preview.groups : [] };
  }

  async function createCampaign(input: {
    name: string;
    description?: string | null;
    isActive?: boolean;
    startsAt?: string | null;
    endsAt?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    if (input.isActive) {
      await supabase.from('wheel_campaigns').update({ is_active: false, updated_at: new Date().toISOString() }).eq('is_active', true);
    }
    const { data, error } = await supabase.from('wheel_campaigns').insert({
      name: input.name,
      description: input.description ?? null,
      is_active: input.isActive ?? false,
      starts_at: input.startsAt ?? null,
      ends_at: input.endsAt ?? null,
      metadata: normalizeGroupWeights(input.metadata),
    }).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updateCampaign(id: string, input: Partial<{
    name: string;
    description: string | null;
    isActive: boolean;
    startsAt: string | null;
    endsAt: string | null;
    metadata: Record<string, unknown>;
  }>) {
    if (input.isActive) {
      await supabase.from('wheel_campaigns').update({ is_active: false, updated_at: new Date().toISOString() }).eq('is_active', true).neq('id', id);
    }
    const { data, error } = await supabase.from('wheel_campaigns').update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
      ...(input.startsAt !== undefined ? { starts_at: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { ends_at: input.endsAt } : {}),
      ...(input.metadata !== undefined ? { metadata: normalizeGroupWeights(input.metadata) } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async function createPrize(campaignId: string, input: {
    name: string;
    type: string;
    groupKey?: 'gift' | 'peach' | 'nothing';
    weight: number;
    stock?: number | null;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase.from('wheel_prizes').insert({
      campaign_id: campaignId,
      name: input.name,
      type: input.type,
      group_key: input.groupKey ?? (input.type === 'NOTHING' ? 'nothing' : input.type === 'POINT' ? 'peach' : 'gift'),
      weight: input.weight,
      stock: input.stock ?? null,
      is_active: input.isActive ?? true,
      metadata: input.metadata ?? {},
    }).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updatePrize(id: string, input: Partial<{
    name: string;
    type: string;
    groupKey: 'gift' | 'peach' | 'nothing';
    weight: number;
    stock: number | null;
    isActive: boolean;
    metadata: Record<string, unknown>;
  }>) {
    const { data, error } = await supabase.from('wheel_prizes').update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.groupKey !== undefined ? { group_key: input.groupKey } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  return { getCurrentCampaign, getCampaign, listCampaignPrizes, listCampaignGroups, spin, listSpinHistory, listAdminSpins, getCampaignPreview, createCampaign, updateCampaign, createPrize, updatePrize };
}
