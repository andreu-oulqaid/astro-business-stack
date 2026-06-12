/** Strip REST path suffixes — Supabase JS client expects the project base URL only. */
export function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}
