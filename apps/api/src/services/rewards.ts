export function createRewardService(supabase: any) {
  async function listRewards() {
    const { data = [] } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    return data;
  }

  async function getReward(id: string) {
    const { data } = await supabase.from('rewards').select('*').eq('id', id).maybeSingle();
    return data ?? null;
  }

  async function redeemReward(input: { userId: string; rewardId: string }) {
    const { data, error } = await supabase.rpc('redeem_reward', {
      p_user_id: input.userId,
      p_reward_id: input.rewardId,
    });
    if (error) throw error;
    return data;
  }

  async function listMyRedemptions(userId: string) {
    const { data = [] } = await supabase
      .from('reward_redemptions')
      .select('id, user_id, reward_id, code_id, point_cost, status, metadata, created_at, rewards(name, type), reward_codes(code)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data;
  }

  async function listAdminRedemptions(query: { limit: number; offset: number; rewardId?: string; userId?: string }) {
    let builder = supabase
      .from('reward_redemptions')
      .select('id, user_id, reward_id, code_id, point_cost, status, metadata, created_at, users(telegram_id, username, first_name, last_name), rewards(name, type), reward_codes(code)')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);
    if (query.rewardId) builder = builder.eq('reward_id', query.rewardId);
    if (query.userId) builder = builder.eq('user_id', query.userId);
    const { data = [] } = await builder;
    return data;
  }

  async function createReward(input: {
    name: string;
    description?: string | null;
    type: string;
    pointCost: number;
    stock?: number | null;
    isActive?: boolean;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from('rewards')
      .insert({
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        point_cost: input.pointCost,
        stock: input.stock ?? null,
        is_active: input.isActive ?? true,
        metadata: input.metadata ?? {},
      })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function updateReward(id: string, input: Partial<{
    name: string;
    description: string | null;
    type: string;
    pointCost: number;
    stock: number | null;
    isActive: boolean;
    metadata: Record<string, unknown>;
  }>) {
    const { data, error } = await supabase
      .from('rewards')
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.type !== undefined ? { type: input.type } : {}),
        ...(input.pointCost !== undefined ? { point_cost: input.pointCost } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data;
  }

  async function importCodes(rewardId: string, codes: string[]) {
    const rows = codes.map((code) => ({
      reward_id: rewardId,
      code,
      status: 'AVAILABLE',
    }));
    const { data, error } = await supabase.from('reward_codes').insert(rows).select('*');
    if (error) throw error;
    return data ?? [];
  }

  async function listCodes(rewardId: string) {
    const { data = [] } = await supabase
      .from('reward_codes')
      .select('*')
      .eq('reward_id', rewardId)
      .order('created_at', { ascending: false });
    return data;
  }

  return { listRewards, getReward, redeemReward, listMyRedemptions, listAdminRedemptions, createReward, updateReward, importCodes, listCodes };
}
