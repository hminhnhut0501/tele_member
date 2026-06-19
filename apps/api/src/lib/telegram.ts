type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

export function parseTelegramProfile(user: TelegramUser) {
  return {
    telegramId: String(user.id),
    username: user.username ?? null,
    firstName: user.first_name ?? null,
    lastName: user.last_name ?? null,
    avatarUrl: user.photo_url ?? null,
  };
}

