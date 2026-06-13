import type { SupabaseClient } from '@supabase/supabase-js';

import {
  dashboardEventTypes,
  resolveSiteProfile,
  syncSiteProfile,
} from '@/lib/analyticsProfile';
import type { AnalyticsEventKey, MetricsModuleId } from '@/lib/analyticsProfileSchema';
import { getAnalyticsEnv } from '@/lib/analyticsEnv';
import { getAnalyticsSiteId } from '@/lib/analyticsSite';
import { parseMetricsEnvParam, type MetricsEnvParam } from '@/lib/metricsEnvParams';
import { getVisibleModules } from '@/lib/metricsModules';
import {
  emptyAggregates,
  type MetricsAggregates,
  type MetricsContext,
  type MetricsLatestRow,
} from '@/lib/metricsTypes';

type RpcAggregatePayload = {
  totals?: Record<string, number>;
  unique_visitors?: Record<string, number>;
  interaction_dimensions?: {
    by_target?: Record<string, number>;
    by_placement?: Record<string, number>;
  };
  funnel?: {
    lead_captured?: number;
    calendar_viewed?: number;
    audit_booked?: number;
    unique_lead_users?: number;
    unique_booking_users?: number;
    avg_lead_to_booking_seconds?: number | null;
  };
  utm?: {
    by_source?: Array<{ utm_source: string; leads: number; bookings: number }>;
    by_campaign?: Array<{ utm_campaign: string; leads: number; bookings: number }>;
  };
  by_device?: Record<string, number>;
  by_locale?: Array<{
    locale: string;
    leads: number;
    bookings: number;
    calendar_views: number;
  }>;
  latest?: MetricsLatestRow[];
  by_env?: Record<string, RpcAggregatePayload>;
};

function normalizeAggregates(raw: RpcAggregatePayload): MetricsAggregates {
  const funnel = raw.funnel ?? {};
  const byEnvRaw = raw.by_env;
  let byEnv: Record<string, MetricsAggregates> | undefined;

  if (byEnvRaw && typeof byEnvRaw === 'object') {
    byEnv = {};
    for (const [envKey, slice] of Object.entries(byEnvRaw)) {
      if (slice && typeof slice === 'object') {
        byEnv[envKey] = normalizeAggregates(slice);
      }
    }
    if (Object.keys(byEnv).length === 0) {
      byEnv = undefined;
    }
  }

  return {
    totals: raw.totals ?? {},
    unique_visitors: raw.unique_visitors ?? {},
    interaction_dimensions: {
      by_target: raw.interaction_dimensions?.by_target ?? {},
      by_placement: raw.interaction_dimensions?.by_placement ?? {},
    },
    funnel: {
      lead_captured: funnel.lead_captured ?? 0,
      calendar_viewed: funnel.calendar_viewed ?? 0,
      audit_booked: funnel.audit_booked ?? 0,
      unique_lead_users: funnel.unique_lead_users ?? 0,
      unique_booking_users: funnel.unique_booking_users ?? 0,
      avg_lead_to_booking_seconds:
        funnel.avg_lead_to_booking_seconds == null
          ? null
          : Number(funnel.avg_lead_to_booking_seconds),
    },
    utm: {
      by_source: raw.utm?.by_source ?? [],
      by_campaign: raw.utm?.by_campaign ?? [],
    },
    by_device: raw.by_device ?? {},
    by_locale: raw.by_locale ?? [],
    latest: raw.latest ?? [],
    byEnv,
  };
}

async function loadFallbackAggregates(
  supabase: SupabaseClient,
  sinceIso: string,
  siteId: string,
  env: string,
  eventTypes: AnalyticsEventKey[],
): Promise<MetricsAggregates> {
  let q = supabase
    .from('analytics_events')
    .select(
      'event_type,user_hash,locale,page_path,device_type,utm_source,utm_campaign,conversion_delta_seconds,created_at,metadata,site_id,env',
    )
    .gte('created_at', sinceIso)
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(50_000);

  if (env) {
    q = q.eq('env', env);
  }

  const { data: rows, error } = await q;
  if (error) throw new Error(error.message);

  const events = (rows ?? []).filter((e) =>
    eventTypes.length === 0 ? true : eventTypes.includes(e.event_type as AnalyticsEventKey),
  );

  const totals: Record<string, number> = {};
  const unique_visitors: Record<string, number> = {};
  const usersByType = new Map<string, Set<string>>();

  for (const e of events) {
    totals[e.event_type] = (totals[e.event_type] ?? 0) + 1;
    const set = usersByType.get(e.event_type) ?? new Set<string>();
    set.add(e.user_hash);
    usersByType.set(e.event_type, set);
  }
  for (const [type, set] of usersByType) {
    unique_visitors[type] = set.size;
  }

  const interactionEvents = events.filter((e) => e.event_type === 'interaction');
  const by_target: Record<string, number> = {};
  const by_placement: Record<string, number> = {};
  for (const e of interactionEvents) {
    const meta = e.metadata as { target?: string; placement?: string } | null;
    const target = meta?.target ?? 'unknown';
    const placement = meta?.placement ?? 'unknown';
    by_target[target] = (by_target[target] ?? 0) + 1;
    by_placement[placement] = (by_placement[placement] ?? 0) + 1;
  }

  const conversionVals = events
    .filter((e) => e.event_type === 'audit_booked' && typeof e.conversion_delta_seconds === 'number')
    .map((e) => e.conversion_delta_seconds as number);

  const by_device: Record<string, number> = {};
  for (const e of events) {
    const key = e.device_type || 'unknown';
    by_device[key] = (by_device[key] ?? 0) + 1;
  }

  type LocaleGroup = { leads: number; bookings: number; calendar_views: number };
  const localeMap = new Map<string, LocaleGroup>();
  for (const e of events) {
    const loc = e.locale || 'unknown';
    const g = localeMap.get(loc) ?? { leads: 0, bookings: 0, calendar_views: 0 };
    if (e.event_type === 'lead_captured') g.leads += 1;
    if (e.event_type === 'audit_booked') g.bookings += 1;
    if (e.event_type === 'calendar_viewed') g.calendar_views += 1;
    localeMap.set(loc, g);
  }

  type UtmGroup = { leads: number; bookings: number };
  const sourceMap = new Map<string, UtmGroup>();
  const campaignMap = new Map<string, UtmGroup>();
  for (const e of events) {
    const sk = e.utm_source || 'direct';
    const ck = e.utm_campaign || 'unknown';
    const sg = sourceMap.get(sk) ?? { leads: 0, bookings: 0 };
    const cg = campaignMap.get(ck) ?? { leads: 0, bookings: 0 };
    if (e.event_type === 'lead_captured') {
      sg.leads += 1;
      cg.leads += 1;
    }
    if (e.event_type === 'audit_booked') {
      sg.bookings += 1;
      cg.bookings += 1;
    }
    sourceMap.set(sk, sg);
    campaignMap.set(ck, cg);
  }

  const latest: MetricsLatestRow[] = events.slice(0, 50).map((e) => ({
    created_at: e.created_at,
    event_type: e.event_type,
    locale: e.locale,
    device_type: e.device_type,
    utm_source: e.utm_source,
    utm_campaign: e.utm_campaign,
    conversion_delta_seconds: e.conversion_delta_seconds,
    page_path: e.page_path,
  }));

  return {
    totals,
    unique_visitors,
    interaction_dimensions: { by_target, by_placement },
    funnel: {
      lead_captured: totals.lead_captured ?? 0,
      calendar_viewed: totals.calendar_viewed ?? 0,
      audit_booked: totals.audit_booked ?? 0,
      unique_lead_users: unique_visitors.lead_captured ?? 0,
      unique_booking_users: unique_visitors.audit_booked ?? 0,
      avg_lead_to_booking_seconds:
        conversionVals.length > 0
          ? Math.round((conversionVals.reduce((a, b) => a + b, 0) / conversionVals.length) * 100) /
            100
          : null,
    },
    utm: {
      by_source: Array.from(sourceMap.entries())
        .map(([utm_source, s]) => ({ utm_source, leads: s.leads, bookings: s.bookings }))
        .sort((a, b) => b.leads + b.bookings - (a.leads + a.bookings))
        .slice(0, 8),
      by_campaign: Array.from(campaignMap.entries())
        .map(([utm_campaign, s]) => ({ utm_campaign, leads: s.leads, bookings: s.bookings }))
        .sort((a, b) => b.leads + b.bookings - (a.leads + a.bookings))
        .slice(0, 8),
    },
    by_device,
    by_locale: Array.from(localeMap.entries()).map(([locale, g]) => ({
      locale,
      ...g,
    })),
    latest,
  };
}

function buildFallbackByEnv(
  supabase: SupabaseClient,
  sinceIso: string,
  siteId: string,
  eventTypes: AnalyticsEventKey[],
  envKeys: string[],
): Promise<Record<string, MetricsAggregates>> {
  return Promise.all(
    envKeys.map(async (envKey) => {
      const agg = await loadFallbackAggregates(supabase, sinceIso, siteId, envKey, eventTypes);
      return [envKey, agg] as const;
    }),
  ).then((entries) => Object.fromEntries(entries));
}

async function loadFallbackAggregatesWithEnv(
  supabase: SupabaseClient,
  sinceIso: string,
  siteId: string,
  env: string,
  eventTypes: AnalyticsEventKey[],
): Promise<MetricsAggregates> {
  const base = await loadFallbackAggregates(supabase, sinceIso, siteId, env, eventTypes);

  if (!env) {
    const { data: envRows } = await supabase
      .from('analytics_events')
      .select('env')
      .gte('created_at', sinceIso)
      .eq('site_id', siteId);

    const envKeys = [
      ...new Set((envRows ?? []).map((r) => r.env).filter((v): v is string => Boolean(v))),
    ].sort();

    if (envKeys.length > 1) {
      base.byEnv = await buildFallbackByEnv(supabase, sinceIso, siteId, eventTypes, envKeys);
    }
  }

  return base;
}

export type LoadMetricsOptions = {
  /** @deprecated Use env */
  allEnvironments?: boolean;
  env?: MetricsEnvParam;
  envFilterLabel?: string;
  rpcEnv?: string;
};

async function loadAggregatesForSite(
  supabase: SupabaseClient,
  sinceIso: string,
  siteId: string,
  rpcEnv: string,
  eventTypes: AnalyticsEventKey[],
): Promise<{ aggregates: MetricsAggregates; usedRpc: boolean; fallbackWarning: string | null }> {
  const { data: rpcData, error: rpcError } = await supabase.rpc('analytics_aggregate_metrics', {
    p_since: sinceIso,
    p_site_id: siteId,
    p_env: rpcEnv,
    p_event_types: eventTypes,
  });

  if (!rpcError && rpcData && typeof rpcData === 'object' && !('error' in (rpcData as object))) {
    return {
      aggregates: normalizeAggregates(rpcData as RpcAggregatePayload),
      usedRpc: true,
      fallbackWarning: null,
    };
  }

  try {
    const aggregates = await loadFallbackAggregatesWithEnv(
      supabase,
      sinceIso,
      siteId,
      rpcEnv,
      eventTypes,
    );
    return {
      aggregates,
      usedRpc: false,
      fallbackWarning:
        (rpcError ? `${rpcError.message}. ` : '') +
        'Using fallback aggregates. Run scripts/supabase-analytics-v6-project-env.sql in Supabase.',
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(rpcError ? `${rpcError.message}; fallback: ${msg}` : msg);
  }
}

export async function loadMetricsContext(
  supabase: SupabaseClient,
  sinceIso: string,
  options?: LoadMetricsOptions,
): Promise<MetricsContext> {
  const deploymentSiteId = getAnalyticsSiteId();
  const parsed =
    options?.envFilterLabel != null && options?.rpcEnv != null
      ? {
          envFilterLabel: options.envFilterLabel,
          rpcEnv: options.rpcEnv,
          env: options.env ?? ('deploy' as MetricsEnvParam),
        }
      : (() => {
          if (options?.allEnvironments === true) {
            return {
              env: 'all' as MetricsEnvParam,
              envFilterLabel: 'all envs',
              rpcEnv: '',
            };
          }
          if (options?.env) {
            const deploymentEnv = getAnalyticsEnv();
            const envFilterLabel =
              options.env === 'deploy'
                ? deploymentEnv
                : options.env === 'all'
                  ? 'all envs'
                  : options.env;
            const rpcEnv =
              options.env === 'deploy'
                ? deploymentEnv
                : options.env === 'all'
                  ? ''
                  : options.env;
            return { env: options.env, envFilterLabel, rpcEnv };
          }
          const p = parseMetricsEnvParam(new URLSearchParams());
          return { env: p.env, envFilterLabel: p.envFilterLabel, rpcEnv: p.rpcEnv };
        })();

  await syncSiteProfile(supabase);
  const profile = await resolveSiteProfile(supabase);
  const eventTypes = dashboardEventTypes(profile);
  const { aggregates, usedRpc, fallbackWarning } = await loadAggregatesForSite(
    supabase,
    sinceIso,
    deploymentSiteId,
    parsed.rpcEnv,
    eventTypes,
  );

  return {
    profile,
    aggregates,
    envFilter: parsed.envFilterLabel,
    siteFilter: deploymentSiteId,
    usedRpc,
    fallbackWarning,
    visibleModules: getVisibleModules(profile),
  };
}

/** @deprecated Use loadMetricsContext */
export async function loadDashboardData(
  supabase: SupabaseClient,
  sinceIso: string,
  options?: LoadMetricsOptions,
): Promise<MetricsContext> {
  return loadMetricsContext(supabase, sinceIso, options);
}

export type { MetricsModuleId } from '@/lib/analyticsProfileSchema';
