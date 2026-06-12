import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { normalizeSupabaseUrl } from '@/lib/normalizeSupabaseUrl';

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const rawUrl = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;
  const url = normalizeSupabaseUrl(rawUrl);
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
