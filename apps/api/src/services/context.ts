import { createPointService } from './points.js';
import { createTelegramService } from './telegram-service.js';
import { createAdminService } from './admin.js';
import { createSupabaseClient } from './supabase.js';

export function createServiceContext() {
  const supabase = createSupabaseClient();
  const points = createPointService(supabase);
  const admin = createAdminService(supabase, points);
  const telegram = createTelegramService(points);

  return { supabase, points, admin, telegram };
}
