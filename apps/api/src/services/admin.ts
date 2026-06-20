export function createAdminService(supabase: any, points: any) {
  async function listUsers(query: { q?: string; limit: number; offset: number }) {
    let builder = supabase
      .from('users')
      .select('id, telegram_id, username, first_name, last_name, avatar_url, created_at, updated_at')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.q) {
      builder = builder.or(`telegram_id.ilike.%${query.q}%,username.ilike.%${query.q}%,first_name.ilike.%${query.q}%,last_name.ilike.%${query.q}%`);
    }

    const { data = [] } = await builder;
    const userIds = data.map((row: any) => row.id);
    const [{ data: wallets = [] }, { data: checkins = [] }] = await Promise.all([
      supabase.from('point_wallets').select('user_id, balance').in('user_id', userIds),
      supabase.from('daily_checkins').select('user_id, checkin_date').in('user_id', userIds).order('checkin_date', { ascending: false }),
    ]);

    return data.map((row: any) => ({
      id: row.id,
      telegramId: row.telegram_id,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      balance: wallets.find((wallet: any) => wallet.user_id === row.id)?.balance ?? 0,
      lastCheckinDate: checkins.find((checkin: any) => checkin.user_id === row.id)?.checkin_date ?? null,
    }));
  }

  async function listTransactions(query: { q?: string; limit: number; offset: number }) {
    let builder = supabase
      .from('point_transactions')
      .select('id, user_id, amount, type, reason, metadata, created_at, users!inner(telegram_id, username, first_name, last_name)')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.q) {
      builder = builder.or(`reason.ilike.%${query.q}%,type.ilike.%${query.q}%`);
    }

    const { data = [] } = await builder;
    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      type: row.type,
      reason: row.reason,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
      telegramId: row.users?.telegram_id ?? '',
      username: row.users?.username ?? null,
      firstName: row.users?.first_name ?? null,
      lastName: row.users?.last_name ?? null,
    }));
  }

  async function listAuditLogs(query: { limit: number; offset: number }) {
    const { data = [] } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    return data.map((row: any) => ({
      id: row.id,
      actorEmail: row.actor_email,
      action: row.action,
      targetTelegramId: row.target_telegram_id,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    }));
  }

  async function adjustPoints(input: {
    telegramId: string;
    amount: number;
    reason: string;
    metadata?: Record<string, unknown>;
    actorEmail?: string;
  }) {
    const result = await points.adjustBalance(input);
    if (input.actorEmail) {
      await supabase.from('admin_audit_logs').insert({
        actor_email: input.actorEmail,
        action: 'adjust_points',
        target_telegram_id: input.telegramId,
        metadata: {
          amount: input.amount,
          reason: input.reason,
          ...input.metadata,
        },
      });
    }
    return result;
  }

  return { listUsers, listTransactions, listAuditLogs, adjustPoints };
}
