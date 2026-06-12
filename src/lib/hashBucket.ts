import { createHmac } from 'node:crypto';

function getRateLimitSalt(): string {
  const salt =
    (import.meta.env.RATE_LIMIT_SALT as string | undefined) ||
    (import.meta.env.ANALYTICS_SALT as string | undefined);
  if (!salt) {
    if (import.meta.env.DEV) {
      console.warn('[rate-limit] RATE_LIMIT_SALT unset; using dev-only fallback');
    }
    return 'dev-rate-limit-salt-change-in-production';
  }
  return salt;
}

/** HMAC bucket key for an IP — never store raw IPs in rate-limit tables. */
export function hashIpBucket(ip: string): string {
  return createHmac('sha256', getRateLimitSalt()).update(ip || 'unknown').digest('hex');
}
