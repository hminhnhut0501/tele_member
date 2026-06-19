export function createRepositories(supabase: any) {
  const users = {
    async findByTelegramId(telegramId: string) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .maybeSingle();
      return data ?? null;
    },
    async create(profile: {
      telegramId: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    }) {
      const { data } = await supabase
        .from('users')
        .insert({
          telegram_id: profile.telegramId,
          username: profile.username,
          first_name: profile.firstName,
          last_name: profile.lastName,
          avatar_url: profile.avatarUrl,
        })
        .select('*')
        .single();
      return data;
    },
    async update(profile: {
      telegramId: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    }) {
      const { data } = await supabase
        .from('users')
        .update({
          username: profile.username,
          first_name: profile.firstName,
          last_name: profile.lastName,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('telegram_id', profile.telegramId)
        .select('*')
        .single();
      return data;
    },
  };

  const wallets = {
    async findByUserId(userId: string) {
      const { data } = await supabase
        .from('point_wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      return data ?? null;
    },
    async ensure(userId: string) {
      await supabase
        .from('point_wallets')
        .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' });
    },
    async setBalance(userId: string, balance: number) {
      await supabase
        .from('point_wallets')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    },
  };

  const transactions = {
    async create(input: {
      userId: string;
      amount: number;
      type: 'credit' | 'debit';
      reason: string;
      metadata?: Record<string, unknown>;
    }) {
      const { data } = await supabase
        .from('point_transactions')
        .insert({
          user_id: input.userId,
          amount: input.amount,
          type: input.type,
          reason: input.reason,
          metadata: input.metadata ?? {},
        })
        .select('*')
        .single();
      return data;
    },
    async listByUserId(userId: string) {
      const { data = [] } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data;
    },
  };

  const checkins = {
    async findByUserAndDate(userId: string, checkinDate: string) {
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .eq('checkin_date', checkinDate)
        .maybeSingle();
      return data ?? null;
    },
    async findLatestByUser(userId: string) {
      const { data } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
    async create(input: { userId: string; checkinDate: string; points: number; streak: number }) {
      const { data } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: input.userId,
          checkin_date: input.checkinDate,
          points: input.points,
          streak: input.streak,
        })
        .select('*')
        .single();
      return data;
    },
  };

  return { users, wallets, transactions, checkins };
}
