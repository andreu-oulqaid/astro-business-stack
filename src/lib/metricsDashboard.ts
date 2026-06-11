import type { SupabaseClient } from '@supabase/supabase-js';

import { getAnalyticsEnv } from './analyticsEnv';

export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

export type DashboardRow = {
  created_at: string;
  event_type: string;
  locale: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  conversion_delta_seconds: number | null;
  page_path: string | null;
};

export type DashboardData = {
  envFilter: string;
  usedRpc: boolean;
  fallbackWarning: string | null;
  counts: {
    lead_captured: number;
    calendar_viewed: number;
    audit_booked: number;
  };
  unique_users: { lead_users: number; booking_users: number };
  avg_lead_to_booking_seconds: number | null;
  by_source: Array<{ utm_source: string; leads: number; bookings: number; conversion: number; volume: number }>;
  by_campaign: Array<{ utm_campaign: string; leads: number; bookings: number; conversion: number; volume: number }>;
  by_device: Record<DeviceType, number>;
  by_locale: Array<{
    locale: string;
    leads: number;
    bookings: number;
    calendar_views: number;
    conversion: number;
    lead_to_calendar_drop: number;
    calendar_to_book_drop: number;
  }>;
  latest: DashboardRow[];
};

type RpcPayload = {
  counts?: { lead_captured?: number; calendar_viewed?: number; audit_booked?: number };
  unique_users?: { lead_users?: number; booking_users?: number };
  avg_lead_to_booking_seconds?: number | null;
  by_source?: Array<{ utm_source: string; leads: number; bookings: number }>;
  by_campaign?: Array<{ utm_campaign: string; leads: number; bookings: number }>;
  by_device?: Record<string, number>;
  by_locale?: Array<{ locale: string; leads: number; bookings: number; calendar_views: number }>;
  latest?: DashboardRow[];
};

function emptyDeviceRecord(): Record<DeviceType, number> {
  return { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
}

function enrichFromRpc(raw: RpcPayload, envFilter: string): DashboardData {
  const counts = {
    lead_captured: raw.counts?.lead_captured ?? 0,
    calendar_viewed: raw.counts?.calendar_viewed ?? 0,
    audit_booked: raw.counts?.audit_booked ?? 0,
  };
  const unique_users = {
    lead_users: raw.unique_users?.lead_users ?? 0,
    booking_users: raw.unique_users?.booking_users ?? 0,
  };
  const by_source = (raw.by_source ?? []).map((r) => ({
    utm_source: r.utm_source,
    leads: r.leads,
    bookings: r.bookings,
    conversion: r.leads > 0 ? (r.bookings / r.leads) * 100 : 0,
    volume: r.leads + r.bookings,
  }));
  const by_campaign = (raw.by_campaign ?? []).map((r) => ({
    utm_campaign: r.utm_campaign,
    leads: r.leads,
    bookings: r.bookings,
    conversion: r.leads > 0 ? (r.bookings / r.leads) * 100 : 0,
    volume: r.leads + r.bookings,
  }));

  const by_device = emptyDeviceRecord();
  for (const [k, v] of Object.entries(raw.by_device ?? {})) {
    const key = k as DeviceType;
    if (key === 'desktop' || key === 'mobile' || key === 'tablet' || key === 'unknown') {
      by_device[key] = typeof v === 'number' ? v : 0;
    } else {
      by_device.unknown += typeof v === 'number' ? v : 0;
    }
  }

  const by_locale = (raw.by_locale ?? []).map((r) => {
    const leads = r.leads ?? 0;
    const calendar_views = r.calendar_views ?? 0;
    const bookings = r.bookings ?? 0;
    const lead_to_calendar_drop = leads > 0 ? (1 - calendar_views / leads) * 100 : 0;
    const calendar_to_book_drop = calendar_views > 0 ? (1 - bookings / calendar_views) * 100 : 0;
    return {
      locale: r.locale,
      leads,
      bookings,
      calendar_views,
      conversion: leads > 0 ? (bookings / leads) * 100 : 0,
      lead_to_calendar_drop,
      calendar_to_book_drop,
    };
  });

  return {
    envFilter,
    usedRpc: true,
    fallbackWarning: null,
    counts,
    unique_users,
    avg_lead_to_booking_seconds:
      raw.avg_lead_to_booking_seconds == null ? null : Number(raw.avg_lead_to_booking_seconds),
    by_source,
    by_campaign,
    by_device,
    by_locale,
    latest: raw.latest ?? [],
  };
}

async function countFiltered(
  supabase: SupabaseClient,
  sinceIso: string,
  env: string,
  eventType: string,
): Promise<number> {
  let q = supabase
    .from('analytics_events')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sinceIso)
    .eq('event_type', eventType);
  if (env) {
    q = q.contains('metadata', { env });
  }
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function loadFallback(
  supabase: SupabaseClient,
  sinceIso: string,
  env: string,
): Promise<DashboardData> {
  const [lead_captured, calendar_viewed, audit_booked] = await Promise.all([
    countFiltered(supabase, sinceIso, env, 'lead_captured'),
    countFiltered(supabase, sinceIso, env, 'calendar_viewed'),
    countFiltered(supabase, sinceIso, env, 'audit_booked'),
  ]);

  let q = supabase
    .from('analytics_events')
    .select(
      'event_type,user_hash,locale,page_path,device_type,referrer,utm_source,utm_campaign,conversion_delta_seconds,created_at',
    )
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(50_000);
  if (env) {
    q = q.contains('metadata', { env });
  }
  const { data: rows, error: fetchErr } = await q;
  if (fetchErr) throw new Error(fetchErr.message);

  const events = (rows ?? []) as Array<{
    event_type: string;
    user_hash: string;
    locale: string | null;
    page_path: string | null;
    device_type: string | null;
    utm_source: string | null;
    utm_campaign: string | null;
    conversion_delta_seconds: number | null;
    created_at: string;
  }>;

  const leadUsers = new Set(events.filter((e) => e.event_type === 'lead_captured').map((e) => e.user_hash));
  const bookingUsers = new Set(events.filter((e) => e.event_type === 'audit_booked').map((e) => e.user_hash));

  const conversionVals = events
    .filter((e) => e.event_type === 'audit_booked' && typeof e.conversion_delta_seconds === 'number')
    .map((e) => e.conversion_delta_seconds as number);
  const avg_lead_to_booking_seconds =
    conversionVals.length > 0
      ? Math.round((conversionVals.reduce((a, b) => a + b, 0) / conversionVals.length) * 100) / 100
      : null;

  type Group = { leads: number; bookings: number };
  const sourceMap = new Map<string, Group>();
  const campaignMap = new Map<string, Group>();
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
  const by_source = Array.from(sourceMap.entries())
    .map(([utm_source, s]) => ({
      utm_source,
      leads: s.leads,
      bookings: s.bookings,
      conversion: s.leads > 0 ? (s.bookings / s.leads) * 100 : 0,
      volume: s.leads + s.bookings,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);
  const by_campaign = Array.from(campaignMap.entries())
    .map(([utm_campaign, s]) => ({
      utm_campaign,
      leads: s.leads,
      bookings: s.bookings,
      conversion: s.leads > 0 ? (s.bookings / s.leads) * 100 : 0,
      volume: s.leads + s.bookings,
    }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8);

  const by_device = emptyDeviceRecord();
  for (const e of events) {
    const raw = e.device_type || 'unknown';
    const key: DeviceType =
      raw === 'desktop' || raw === 'mobile' || raw === 'tablet' || raw === 'unknown' ? raw : 'unknown';
    by_device[key] += 1;
  }

  const localeKeys = ['en', 'es', 'ca', 'pl'] as const;
  const by_locale = localeKeys.map((loc) => {
    const leads = events.filter((e) => e.locale === loc && e.event_type === 'lead_captured').length;
    const calendar_views = events.filter((e) => e.locale === loc && e.event_type === 'calendar_viewed').length;
    const bookings = events.filter((e) => e.locale === loc && e.event_type === 'audit_booked').length;
    return {
      locale: loc,
      leads,
      bookings,
      calendar_views,
      conversion: leads > 0 ? (bookings / leads) * 100 : 0,
      lead_to_calendar_drop: leads > 0 ? (1 - calendar_views / leads) * 100 : 0,
      calendar_to_book_drop: calendar_views > 0 ? (1 - bookings / calendar_views) * 100 : 0,
    };
  });

  const latest: DashboardRow[] = events.slice(0, 50).map((e) => ({
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
    envFilter: env,
    usedRpc: false,
    fallbackWarning:
      events.length >= 50_000
        ? 'Fallback mode hit the 50k row cap; run scripts/supabase-analytics-v2.sql for accurate aggregates.'
        : 'Using fallback aggregates (RPC missing or failed). Run scripts/supabase-analytics-v2.sql in Supabase for exact counts.',
    counts: { lead_captured, calendar_viewed, audit_booked },
    unique_users: { lead_users: leadUsers.size, booking_users: bookingUsers.size },
    avg_lead_to_booking_seconds,
    by_source,
    by_campaign,
    by_device,
    by_locale,
    latest,
  };
}

export type LoadDashboardOptions = {
  /** When true, RPC uses blank p_env and fallback skips metadata.env (all rows in window). */
  allEnvironments?: boolean;
};

export async function loadDashboardData(
  supabase: SupabaseClient,
  sinceIso: string,
  options?: LoadDashboardOptions,
): Promise<DashboardData> {
  const deploymentEnv = getAnalyticsEnv();
  const allEnvironments = options?.allEnvironments === true;
  const envFilter = allEnvironments ? 'all' : deploymentEnv;
  const rpcEnv = allEnvironments ? '' : deploymentEnv;
  const fallbackEnv = allEnvironments ? '' : deploymentEnv;

  const { data: rpcData, error: rpcError } = await supabase.rpc('analytics_dashboard_summary', {
    p_since: sinceIso,
    p_env: rpcEnv,
  });

  if (!rpcError && rpcData && typeof rpcData === 'object') {
    return enrichFromRpc(rpcData as RpcPayload, envFilter);
  }

  try {
    const fallback = await loadFallback(supabase, sinceIso, fallbackEnv);
    return {
      ...fallback,
      fallbackWarning:
        (rpcError ? `${rpcError.message}. ` : '') + (fallback.fallbackWarning ?? ''),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(rpcError ? `${rpcError.message}; fallback: ${msg}` : msg);
  }
}
