import { getAsiaHoChiMinhDate } from '../lib/date.js';
import { createRepositories } from './repositories.js';

const CHECKIN_POINTS = Number(process.env.CHECKIN_POINTS ?? 10);

export function createPointService(supabase: any) {
  const repos = createRepositories(supabase);

  async function upsertUser(profile: {
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  }) {
    const existing = await repos.users.findByTelegramId(profile.telegramId);

    if (existing) {
      const data = await repos.users.update(profile);
      return data;
    }

    const data = await repos.users.create(profile);

    await repos.wallets.ensure(data.id);
    return data;
  }

  async function getUserByTelegramId(telegramId: string) {
    return repos.users.findByTelegramId(telegramId);
  }

  async function getWalletByUserId(userId: string) {
    return repos.wallets.findByUserId(userId);
  }

  async function getBalance(telegramId: string) {
    const user = await getUserByTelegramId(telegramId);
    if (!user) return 0;
    const wallet = await getWalletByUserId(user.id);
    return wallet?.balance ?? 0;
  }

  async function createTransaction(input: {
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
    metadata?: Record<string, unknown>;
  }) {
    const wallet = await repos.wallets.findByUserId(input.userId);
    if (!wallet) throw new Error('Wallet not found');

    const nextBalance = wallet.balance + input.amount;
    if (nextBalance < 0) throw new Error('Insufficient balance');

    const transaction = await repos.transactions.create({
      userId: input.userId,
      amount: input.amount,
      type: input.type,
      reason: input.reason,
      metadata: input.metadata,
    });

    await repos.wallets.setBalance(input.userId, nextBalance);

    return transaction;
  }

  async function checkIn(profile: {
    telegramId: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  }) {
    const { data, error } = await supabase.rpc('checkin_user', {
      p_telegram_id: profile.telegramId,
      p_username: profile.username,
      p_first_name: profile.firstName,
      p_last_name: profile.lastName,
      p_avatar_url: profile.avatarUrl,
      p_points: CHECKIN_POINTS,
      p_checkin_date: getAsiaHoChiMinhDate(),
    });

    if (error) throw error;
    return data;
  }

  async function getSummary(telegramId: string) {
    const user = await getUserByTelegramId(telegramId);
    if (!user) {
      return { telegramId, balance: 0, transactions: [] };
    }

    const wallet = await getWalletByUserId(user.id);
    const transactions = await repos.transactions.listByUserId(user.id);

    return {
      telegramId,
      balance: wallet?.balance ?? 0,
      transactions: transactions,
    };
  }

  async function adjustBalance(input: {
    telegramId: string;
    amount: number;
    reason: string;
    metadata?: Record<string, unknown>;
  }) {
    const user = await upsertUser({
      telegramId: input.telegramId,
      username: null,
      firstName: null,
      lastName: null,
      avatarUrl: null,
    });

    const transaction = await createTransaction({
      userId: user.id,
      amount: input.amount,
      type: input.amount > 0 ? 'credit' : 'debit',
      reason: input.reason,
      metadata: input.metadata,
    });

    return { ok: true, transaction };
  }

  return { upsertUser, getUserByTelegramId, getBalance, checkIn, getSummary, adjustBalance };
}
