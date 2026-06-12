import {
  API_CALENDAR_VIEWED_MAX_PER_HOUR,
  API_LEADS_CONFIRM_MAX_PER_HOUR,
  API_LEADS_MAX_PER_HOUR,
} from 'astro:env/server';

import { hashIpBucket } from '@/lib/hashBucket';
import { getSupabaseAdmin } from '@/lib/supabase';

const WINDOW_MINUTES = 60;

export type ApiRateLimitRoute = 'leads' | 'leads_confirm' | 'calendar_viewed';

export type ApiQuotaCheckResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number }
  | { allowed: true; skipped: true };

function maxForRoute(route: ApiRateLimitRoute): number {
  const raw =
    route === 'leads'
      ? API_LEADS_MAX_PER_HOUR
      : route === 'leads_confirm'
        ? API_LEADS_CONFIRM_MAX_PER_HOUR
        : API_CALENDAR_VIEWED_MAX_PER_HOUR;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
}

/**
 * Fail-open: missing Supabase or RPC errors allow the request (template-safe for misconfig).
 * Only explicit RPC `allowed: false` blocks with rate limit.
 */
export async function checkAndConsumeApiQuota(
  route: ApiRateLimitRoute,
  clientIp: string,
): Promise<ApiQuotaCheckResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { allowed: true, skipped: true };
  }

  const ipHash = hashIpBucket(clientIp);

  try {
    const { data, error } = await supabase.rpc('api_try_consume_quota', {
      p_route: route,
      p_ip_hash: ipHash,
      p_max: maxForRoute(route),
      p_window_minutes: WINDOW_MINUTES,
    });

    if (error || !data || typeof data !== 'object') {
      console.error(`[apiRateLimit] ${route} RPC error:`, error?.message ?? 'empty response');
      return { allowed: true, skipped: true };
    }

    const row = data as Record<string, unknown>;
    if (row.allowed === true) {
      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfterSec: Number(row.retry_after_sec ?? 60),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[apiRateLimit] ${route} failed:`, msg);
    return { allowed: true, skipped: true };
  }
}
