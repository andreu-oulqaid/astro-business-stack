import { z } from 'astro/zod';

export const ANALYTICS_EVENT_KEYS = [
  'interaction',
  'lead_captured',
  'calendar_viewed',
  'audit_booked',
] as const;

export type AnalyticsEventKey = (typeof ANALYTICS_EVENT_KEYS)[number];

export const METRICS_MODULE_IDS = [
  'summary_cards',
  'interactions',
  'funnel',
  'funnel_friction',
  'utm_sources',
  'utm_campaigns',
  'device_breakdown',
  'locale_breakdown',
  'latest_events',
] as const;

export type MetricsModuleId = (typeof METRICS_MODULE_IDS)[number];

const eventFlagsSchema = z.object({
  collect: z.boolean(),
  dashboard: z.boolean(),
});

const moduleSchema = z.object({
  id: z.enum(METRICS_MODULE_IDS),
  enabled: z.boolean(),
  requires_events: z.array(z.enum(ANALYTICS_EVENT_KEYS)).optional(),
});

export const analyticsSiteProfileSchema = z.object({
  display_name: z.string().min(1).max(200),
  events: z.record(z.enum(ANALYTICS_EVENT_KEYS), eventFlagsSchema),
  dashboard: z.object({
    modules: z.array(moduleSchema).min(1),
  }),
});

export type AnalyticsSiteProfile = z.infer<typeof analyticsSiteProfileSchema>;
export type AnalyticsEventFlags = z.infer<typeof eventFlagsSchema>;
export type MetricsModuleConfig = z.infer<typeof moduleSchema>;

/** Full-funnel profile for client sites that use lead capture + booking. */
export function createFullFunnelProfile(displayName: string): AnalyticsSiteProfile {
  const enabled = { collect: true, dashboard: true };
  return {
    display_name: displayName,
    events: {
      interaction: enabled,
      lead_captured: enabled,
      calendar_viewed: enabled,
      audit_booked: enabled,
    },
    dashboard: {
      modules: [
        { id: 'summary_cards', enabled: true },
        { id: 'interactions', enabled: true },
        { id: 'funnel', enabled: true },
        { id: 'funnel_friction', enabled: true },
        { id: 'utm_sources', enabled: true, requires_events: ['lead_captured'] },
        { id: 'utm_campaigns', enabled: true, requires_events: ['lead_captured'] },
        { id: 'device_breakdown', enabled: true },
        { id: 'locale_breakdown', enabled: true, requires_events: ['lead_captured'] },
        { id: 'latest_events', enabled: true },
      ],
    },
  };
}
