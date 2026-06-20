import { createPointService } from './points.js';
import { createTelegramService } from './telegram-service.js';
import { createAdminService } from './admin.js';
import { createRewardService } from './rewards.js';
import { createWheelService } from './wheel.js';
import { createSupabaseClient } from './supabase.js';

export function createServiceContext() {
  const supabase = createSupabaseClient();
  const points = createPointService(supabase);
  const admin = createAdminService(supabase, points);
  const telegram = createTelegramService(points);
  const rewards = createRewardService(supabase);
  const wheel = createWheelService(supabase);

  return { supabase, points, admin, telegram, rewards, wheel };
}
