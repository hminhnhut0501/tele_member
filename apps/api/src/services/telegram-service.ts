import { createBotRouter } from './bot-router.js';

function createTelegramSender() {
  async function sendTelegramMessage(chatId: string | number, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  }

  return { sendTelegramMessage };
}

export function createTelegramService(points: any) {
  const sender = createTelegramSender();
  const router = createBotRouter({
    points,
    sendTelegramMessage: sender.sendTelegramMessage,
  });

  return {
    handleUpdate: router.handleWebhook,
    sendTelegramMessage: sender.sendTelegramMessage,
  };
}
