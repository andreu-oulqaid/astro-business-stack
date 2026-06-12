/**
 * Site identifier stored in interaction event metadata for multi-site Supabase projects.
 * Defaults to SITE_URL hostname; override with ANALYTICS_SITE_ID per deployment.
 */
export function getAnalyticsSiteId(): string {
  const override = import.meta.env.ANALYTICS_SITE_ID;
  if (typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }

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
