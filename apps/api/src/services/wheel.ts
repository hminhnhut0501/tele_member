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
      metadata: input.metadata ?? {},
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
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  async function createPrize(campaignId: string, input: {
    name: string;
    type: string;
    weight: number;
    stock?: number | null;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase.from('wheel_prizes').insert({
      campaign_id: campaignId,
      name: input.name,
      type: input.type,
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
    weight: number;
    stock: number | null;
    isActive: boolean;
    metadata: Record<string, unknown>;
  }>) {
    const { data, error } = await supabase.from('wheel_prizes').update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.stock !== undefined ? { stock: input.stock } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
      ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  }

  return { getCurrentCampaign, getCampaign, listCampaignPrizes, spin, listSpinHistory, listAdminSpins, createCampaign, updateCampaign, createPrize, updatePrize };
}
