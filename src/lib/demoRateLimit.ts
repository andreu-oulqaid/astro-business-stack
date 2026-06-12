export const DEMO_MAX_RUNS_PER_HOUR = 5;
const WINDOW_MS = 60 * 60 * 1000;

type RateEntry = { count: number; windowStart: number };

const hits = new Map<string, RateEntry>();

function getOrRefreshEntry(ip: string, now: number): RateEntry {
  const key = ip || 'unknown';
  let entry = hits.get(key);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    hits.set(key, entry);
  }
  return entry;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function getDemoRateLimitStatus(ip: string): {
  remaining: number;
  max: number;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const entry = getOrRefreshEntry(ip, now);
  const remaining = Math.max(0, DEMO_MAX_RUNS_PER_HOUR - entry.count);
  const status = { remaining, max: DEMO_MAX_RUNS_PER_HOUR };

  if (remaining === 0 && entry.count >= DEMO_MAX_RUNS_PER_HOUR) {
    return {
      ...status,
      retryAfterSec: Math.max(1, Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000)),
    };
  }

  return status;
}

export function checkDemoRateLimit(ip: string): { allowed: true } | { allowed: false; retryAfterSec: number } {
  const status = getDemoRateLimitStatus(ip);
  if (status.remaining === 0 && status.retryAfterSec != null) {
    return { allowed: false, retryAfterSec: status.retryAfterSec };
  }
  return { allowed: true };
}

export function recordDemoRateLimitHit(ip: string): void {
  const now = Date.now();
  const key = ip || 'unknown';
  const entry = getOrRefreshEntry(ip, now);
  entry.count += 1;
  hits.set(key, entry);
}
