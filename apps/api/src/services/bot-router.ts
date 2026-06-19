import { parseTelegramProfile } from '../lib/telegram.js';

type TelegramUpdate = Record<string, unknown>;

function extractMessageText(update: any) {
  return update?.message?.text ?? update?.edited_message?.text ?? '';
}

function extractChatId(update: any) {
  return update?.message?.chat?.id ?? update?.callback_query?.message?.chat?.id ?? null;
}

function extractUser(update: any) {
  return update?.message?.from ?? update?.callback_query?.from ?? null;
}

export function createBotRouter(deps: {
  points: {
    upsertUser(profile: {
      telegramId: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    }): Promise<any>;
    checkIn(profile: {
      telegramId: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      avatarUrl: string | null;
    }): Promise<any>;
    getSummary(telegramId: string): Promise<any>;
  };
  sendTelegramMessage(chatId: string | number, text: string): Promise<void>;
}) {
  async function handleWebhook(update: TelegramUpdate) {
    const text = extractMessageText(update);
    const chatId = extractChatId(update);
    const user = extractUser(update);

    if (!chatId || !user) return { ok: true };

    const profile = parseTelegramProfile({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
    });

    if (text.startsWith('/start')) {
      await deps.points.upsertUser(profile);
      await deps.sendTelegramMessage(
        chatId,
        [
          'Chào mừng bạn đến với Tele Member.',
          'Commands:',
          '/help - xem hướng dẫn',
          '/diemdanh hoặc /checkin - nhận điểm mỗi ngày',
          '/diem - xem số điểm hiện tại',
        ].join('\n'),
      );
      return { ok: true };
    }

    if (text.startsWith('/help')) {
      await deps.sendTelegramMessage(chatId, ['/start', '/help', '/diemdanh', '/checkin', '/diem'].join('\n'));
      return { ok: true };
    }

    if (text.startsWith('/diemdanh') || text.startsWith('/checkin')) {
      const result = await deps.points.checkIn(profile);
      await deps.sendTelegramMessage(chatId, result.message);
      return { ok: true, result };
    }

    if (text.startsWith('/diem')) {
      await deps.points.upsertUser(profile);
      const summary = await deps.points.getSummary(profile.telegramId);
      await deps.sendTelegramMessage(chatId, `Số điểm hiện tại của bạn: ${summary.balance}`);
      return { ok: true, summary };
    }

    return { ok: true };
  }

  return { handleWebhook };
}
