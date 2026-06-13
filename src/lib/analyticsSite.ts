import { analyticsRepoKey } from '@/config/analytics.profile';

/**
 * Logical project id for analytics (stable across test/prod deploys).
 * Override with ANALYTICS_SITE_ID only for exceptional multi-tenant cases.
 */
export function getAnalyticsSiteId(): string {
  const override = import.meta.env.ANALYTICS_SITE_ID;
  if (typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }

  return analyticsRepoKey;
}

/**
 * Deployment hostname for traceability in event metadata (not used for aggregation).
 */
export function getDeployHost(): string {
  const siteUrl = import.meta.env.SITE_URL;
  if (typeof siteUrl === 'string' && siteUrl.trim().length > 0) {
    try {
      return new URL(siteUrl).hostname;
    } catch {
      return siteUrl.trim();
    }
  }

  return 'unknown';
}
