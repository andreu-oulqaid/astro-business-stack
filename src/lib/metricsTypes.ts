import type {
  AnalyticsEventKey,
  AnalyticsSiteProfile,
  MetricsModuleId,
} from '@/lib/analyticsProfileSchema';

export type MetricsLatestRow = {
  created_at: string;
  event_type: string;
  locale: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  conversion_delta_seconds: number | null;
  page_path: string | null;
};

export type MetricsAggregates = {
  totals: Record<string, number>;
  unique_visitors: Record<string, number>;
  interaction_dimensions: {
    by_target: Record<string, number>;
    by_placement: Record<string, number>;
  };
  funnel: {
    lead_captured: number;
    calendar_viewed: number;
    audit_booked: number;
    unique_lead_users: number;
    unique_booking_users: number;
    avg_lead_to_booking_seconds: number | null;
  };
  utm: {
    by_source: Array<{ utm_source: string; leads: number; bookings: number }>;
    by_campaign: Array<{ utm_campaign: string; leads: number; bookings: number }>;
  };
  by_device: Record<string, number>;
  by_locale: Array<{
    locale: string;
    leads: number;
    bookings: number;
    calendar_views: number;
  }>;
  latest: MetricsLatestRow[];
  /** Per-env slices when viewing all environments (from RPC by_env). */
  byEnv?: Record<string, MetricsAggregates>;
};

export type MetricsContext = {
  profile: AnalyticsSiteProfile;
  aggregates: MetricsAggregates;
  envFilter: string;
  siteFilter: string;
  usedRpc: boolean;
  fallbackWarning: string | null;
  visibleModules: MetricsModuleId[];
};

export function emptyAggregates(): MetricsAggregates {
  return {
    totals: {},
    unique_visitors: {},
    interaction_dimensions: { by_target: {}, by_placement: {} },
    funnel: {
      lead_captured: 0,
      calendar_viewed: 0,
      audit_booked: 0,
      unique_lead_users: 0,
      unique_booking_users: 0,
      avg_lead_to_booking_seconds: null,
    },
    utm: { by_source: [], by_campaign: [] },
    by_device: {},
    by_locale: [],
    latest: [],
  };
}

export function totalEventCount(aggregates: MetricsAggregates): number {
  return Object.values(aggregates.totals).reduce((sum, n) => sum + n, 0);
}

export function isDashboardEventEnabled(
  profile: AnalyticsSiteProfile,
  eventKey: AnalyticsEventKey,
): boolean {
  return profile.events[eventKey]?.dashboard === true;
}

export function interactionSummary(aggregates: MetricsAggregates) {
  return {
    total: aggregates.totals.interaction ?? 0,
    unique_visitors: aggregates.unique_visitors.interaction ?? 0,
    by_target: aggregates.interaction_dimensions.by_target,
    by_placement: aggregates.interaction_dimensions.by_placement,
  };
}

export function enrichedUtmSources(aggregates: MetricsAggregates) {
  return aggregates.utm.by_source.map((r) => ({
    ...r,
    conversion: r.leads > 0 ? (r.bookings / r.leads) * 100 : 0,
    volume: r.leads + r.bookings,
  }));
}

export function enrichedUtmCampaigns(aggregates: MetricsAggregates) {
  return aggregates.utm.by_campaign.map((r) => ({
    ...r,
    conversion: r.leads > 0 ? (r.bookings / r.leads) * 100 : 0,
    volume: r.leads + r.bookings,
  }));
}

export function enrichedLocaleRows(aggregates: MetricsAggregates) {
  return aggregates.by_locale.map((r) => {
    const leads = r.leads ?? 0;
    const calendar_views = r.calendar_views ?? 0;
    const bookings = r.bookings ?? 0;
    return {
      ...r,
      conversion: leads > 0 ? (bookings / leads) * 100 : 0,
      lead_to_calendar_drop: leads > 0 ? (1 - calendar_views / leads) * 100 : 0,
      calendar_to_book_drop: calendar_views > 0 ? (1 - bookings / calendar_views) * 100 : 0,
    };
  });
}

export function formatLeadToBookingSpeed(seconds: number | null): string {
  if (seconds == null || Number.isNaN(seconds)) return 'N/A';
  const s = Math.round(Number(seconds));
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}
