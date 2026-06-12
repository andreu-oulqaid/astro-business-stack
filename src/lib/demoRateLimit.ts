import {
  DEMO_GLOBAL_MAX_RUNS_PER_HOUR,
  DEMO_MAX_RUNS_PER_HOUR,
} from 'astro:env/server';

import { getDemoSupabaseAdmin } from '@/lib/demoSupabase';
import { hashIpBucket } from '@/lib/hashBucket';

const WINDOW_MINUTES = 60;

export type DemoQuotaConsumeResult =
  | {
      ok: true;
      remaining: number;
      max: number;
      globalRemaining: number;
      globalMax: number;
    }
  | { ok: false; reason: 'ip' | 'global'; retryAfterSec: number }
  | { ok: false; unavailable: true };

export type DemoQuotaStatus = {
  remaining: number;
  max: number;
  globalRemaining: number;
  globalMax: number;
};

function ipMax(): number {
  const n = Number(DEMO_MAX_RUNS_PER_HOUR);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 5;
}

function globalMax(): number {
  const n = Number(DEMO_GLOBAL_MAX_RUNS_PER_HOUR);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 60;
}

export async function consumeDemoQuota(clientIp: string): Promise<DemoQuotaConsumeResult> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) {
    return { ok: false, unavailable: true };
  }

  const ipHash = hashIpBucket(clientIp);

  try {
    const { data, error } = await supabase.rpc('demo_try_consume_quota', {
      p_ip_hash: ipHash,
      p_ip_max: ipMax(),
      p_global_max: globalMax(),
      p_window_minutes: WINDOW_MINUTES,
    });

    if (error || !data || typeof data !== 'object') {
      console.error('[demoRateLimit] consume RPC error:', error?.message ?? 'empty response');
      return { ok: false, unavailable: true };
    }

    const row = data as Record<string, unknown>;
    if (row.allowed === true) {
      return {
        ok: true,
        remaining: Number(row.remaining ?? 0),
        max: Number(row.max ?? ipMax()),
        globalRemaining: Number(row.global_remaining ?? 0),
        globalMax: Number(row.global_max ?? globalMax()),
      };
    }

    return {
      ok: false,
      reason: row.reason === 'global' ? 'global' : 'ip',
      retryAfterSec: Number(row.retry_after_sec ?? 60),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[demoRateLimit] consume failed:', msg);
    return { ok: false, unavailable: true };
  }
}

export async function getDemoQuotaStatus(clientIp: string): Promise<DemoQuotaStatus | null> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) return null;

  const ipHash = hashIpBucket(clientIp);

  try {
    const { data, error } = await supabase.rpc('demo_quota_status', {
      p_ip_hash: ipHash,
      p_ip_max: ipMax(),
      p_global_max: globalMax(),
      p_window_minutes: WINDOW_MINUTES,
    });

    if (error || !data || typeof data !== 'object') {
      console.error('[demoRateLimit] status RPC error:', error?.message ?? 'empty response');
      return null;
    }

    const row = data as Record<string, unknown>;
    return {
      remaining: Number(row.remaining ?? 0),
      max: Number(row.max ?? ipMax()),
      globalRemaining: Number(row.global_remaining ?? 0),
      globalMax: Number(row.global_max ?? globalMax()),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[demoRateLimit] status failed:', msg);
    return null;
  }
}
