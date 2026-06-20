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
  sendTelegramKeyboard?(chatId: string | number, text: string, replyMarkup: Record<string, unknown>): Promise<void>;
  createWebAppButton?(): any;
}) {
  async function handleWebhook(update: TelegramUpdate) {
    const text = extractMessageText(update);
    const chatId = extractChatId(update);
    const user = extractUser(update);
    const callbackQuery = (update as any).callback_query as { id?: string; data?: string } | undefined;

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
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'https://tele-member.vercel.app';
      await deps.sendTelegramMessage(
        chatId,
        [
          'Chào mừng bạn đến với Tele Member.',
          'Bấm nút bên dưới để mở mini app và xem dashboard của bạn.',
        ].join('\n'),
      );
      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'Open App',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'Open App',
                      web_app: {
                        url: webAppUrl,
                      },
                    },
                    {
                      text: 'Lucky Wheel',
                      web_app: {
                        url: `${webAppUrl}/wheel`,
                      },
                    },
                  ],
                  [
                    { text: 'Điểm danh', callback_data: 'checkin' },
                    { text: 'Xem điểm', callback_data: 'points' },
                  ],
              ],
            },
          }),
        });
      }
      return { ok: true };
    }

    if (callbackQuery?.data === 'checkin') {
      const result = await deps.points.checkIn(profile);
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: result.alreadyCheckedIn ? 'Hôm nay bạn đã điểm danh rồi.' : 'Điểm danh thành công!',
          }),
        });
      }
      await deps.sendTelegramMessage(chatId, result.message);
      return { ok: true, result };
    }

    if (callbackQuery?.data === 'points') {
      const summary = await deps.points.getSummary(profile.telegramId);
      const token = process.env.TELEGRAM_BOT_TOKEN;
      if (token) {
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: `Bạn đang có ${summary.balance} điểm.`,
            show_alert: false,
          }),
        });
      }
      return { ok: true, summary };
    }

    if (text.startsWith('/help')) {
      await deps.sendTelegramMessage(
        chatId,
        ['Commands:', '/start', '/help', '/diemdanh', '/checkin', '/diem', '/thuong', '/vongquay'].join('\n'),
      );
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

    if (text.startsWith('/thuong')) {
      const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'https://tele-member.vercel.app';
      await deps.sendTelegramMessage(chatId, `Mở Reward Store: ${webAppUrl}/rewards`);
      return { ok: true };
    }

    if (text.startsWith('/vongquay')) {
      const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? 'https://tele-member.vercel.app';
      await deps.sendTelegramMessage(chatId, `Mở Lucky Wheel: ${webAppUrl}/wheel`);
      return { ok: true };
    }

    return { ok: true };
  }

  return { handleWebhook };
}
