import { createHash } from 'node:crypto';

export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

export function getAnonymizedHash(email: string): string | null {
  const salt = import.meta.env.ANALYTICS_SALT;
  if (!salt) return null;
  return createHash('sha256')
    .update(email.trim().toLowerCase() + salt)
    .digest('hex');
}

export function detectDevice(ua: string | null | undefined): DeviceType {
  if (!ua) return 'unknown';
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iPhone|iPod|Opera Mini|IEMobile|BlackBerry/i.test(ua)) return 'mobile';
  return 'desktop';
}

export type NormalizedUtm = {
  utm_source: string;
  utm_medium: string | undefined;
  utm_campaign: string | undefined;
};

export function normalizeUtm(p: {
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
}): NormalizedUtm {
  const clean = (v: unknown): string | undefined =>
    typeof v === 'string' && v.length > 0 && v.length <= 200 ? v : undefined;
  return {
    utm_source: clean(p.utm_source) ?? 'direct',
    utm_medium: clean(p.utm_medium),
    utm_campaign: clean(p.utm_campaign),
  };
}
