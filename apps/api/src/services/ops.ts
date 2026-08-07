export function createOpsService(supabase: any) {
  async function logEvent(input: {
    source: string;
    category: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    targetTelegramId?: string | null;
    metadata?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase.rpc('log_ops_event', {
      p_source: input.source,
      p_category: input.category,
      p_severity: input.severity,
      p_title: input.title,
      p_message: input.message,
      p_target_telegram_id: input.targetTelegramId ?? null,
      p_metadata: input.metadata ?? {},
    });
    if (error) throw error;
    return data;
  }

  async function countTable(table: string, sinceColumn?: string, sinceValue?: string) {
    let builder = supabase.from(table).select('id', { count: 'exact', head: true });
    if (sinceColumn && sinceValue) builder = builder.gte(sinceColumn, sinceValue);
    const { count, error } = await builder;
    if (error) throw error;
    return count ?? 0;
  }

  async function getSummary() {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [
      totalUsers,
      activeUsers24h,
      totalRewards,
      totalCampaigns,
      activeCampaigns,
      pendingInboxItems,
      failedDeliveries24h,
      webhookErrors24h,
      recentErrors,
    ] = await Promise.all([
      countTable('users'),
      countTable('users', 'updated_at', since24h),
      countTable('rewards'),
      countTable('wheel_campaigns'),
      countTable('wheel_campaigns', 'updated_at', since24h),
      supabase.from('reward_inbox_items').select('id', { count: 'exact', head: true }).in('status', ['new', 'delivered']).then(({ count }: any) => count ?? 0),
      supabase.from('reward_delivery_logs').select('id', { count: 'exact', head: true }).eq('status', 'failed').gte('created_at', since24h).then(({ count }: any) => count ?? 0),
      supabase.from('ops_events').select('id', { count: 'exact', head: true }).eq('category', 'webhook').eq('severity', 'error').gte('created_at', since24h).then(({ count }: any) => count ?? 0),
      supabase.from('ops_events').select('id', { count: 'exact', head: true }).in('severity', ['error', 'critical']).gte('created_at', since7d).then(({ count }: any) => count ?? 0),
    ]);

    const [statusCount] = await Promise.all([
      supabase.from('wheel_campaigns').select('id', { count: 'exact', head: true }).eq('is_active', true).then(({ count }: any) => count ?? 0),
    ]);

    return {
      apiStatus: 'ok' as const,
      databaseStatus: 'ok' as const,
      totalUsers,
      activeUsers24h,
      totalRewards,
      totalCampaigns,
      activeCampaigns: statusCount,
      pendingInboxItems,
      failedDeliveries24h,
      webhookErrors24h,
      recentErrors,
      uptimeSeconds: Math.floor(process.uptime()),
      lastCheckedAt: new Date().toISOString(),
    };
  }

  async function listEvents(query: { limit: number; offset: number; severity?: string; category?: string; source?: string }) {
    let builder = supabase
      .from('ops_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);
    if (query.severity) builder = builder.eq('severity', query.severity);
    if (query.category) builder = builder.eq('category', query.category);
    if (query.source) builder = builder.eq('source', query.source);
    const { data = [] } = await builder;
    return data;
  }

  return { logEvent, getSummary, listEvents };
}
