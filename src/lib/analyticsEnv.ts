/**
 * Label stored in analytics_events.metadata.env to separate dev/staging/prod in one Supabase project.
 * Set ANALYTICS_ENV explicitly on each deployment (e.g. development on laptop, production on VPS).
 */
export function getAnalyticsEnv(): string {
  const raw = import.meta.env.ANALYTICS_ENV;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim();
  }
  return import.meta.env.PROD ? 'production' : 'development';
}
