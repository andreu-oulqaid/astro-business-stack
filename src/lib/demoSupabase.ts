import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { normalizeSupabaseUrl } from '@/lib/normalizeSupabaseUrl';

let cached: { url: string; client: SupabaseClient } | null = null;

export function getDemoSupabaseAdmin(): SupabaseClient | null {
  const rawUrl = import.meta.env.DEMO_SUPABASE_URL;
  const key = import.meta.env.DEMO_SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) return null;
  const url = normalizeSupabaseUrl(rawUrl);
  if (!cached || cached.url !== url) {
    cached = {
      url,
      client: createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    };
  }
  return cached.client;
}
