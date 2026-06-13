import type { AnalyticsSiteProfile } from '@/lib/analyticsProfileSchema';

/**
 * Per-repo analytics profile — source of defaults synced to Supabase.
 * Marketing stack: interactions only (no lead/calendar/booking funnel on this site).
 */
export const analyticsRepoKey = 'astro-business-stack';

export const analyticsProfile: AnalyticsSiteProfile = {
  display_name: 'Astro Business Stack',
  events: {
    interaction: { collect: true, dashboard: true },
    lead_captured: { collect: false, dashboard: false },
    calendar_viewed: { collect: false, dashboard: false },
    audit_booked: { collect: false, dashboard: false },
  },
  dashboard: {
    modules: [
      { id: 'summary_cards', enabled: true },
      { id: 'interactions', enabled: true },
      { id: 'funnel', enabled: false },
      { id: 'funnel_friction', enabled: false },
      { id: 'utm_sources', enabled: false, requires_events: ['lead_captured'] },
      { id: 'utm_campaigns', enabled: false, requires_events: ['lead_captured'] },
      { id: 'device_breakdown', enabled: true },
      { id: 'locale_breakdown', enabled: false, requires_events: ['lead_captured'] },
      { id: 'latest_events', enabled: true },
    ],
  },
};
