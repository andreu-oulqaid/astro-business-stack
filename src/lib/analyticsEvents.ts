import { getAnalyticsEnv } from './analyticsEnv';
import { getSupabaseAdmin } from './supabase';
import { SUPABASE_TRACKING_ENABLED } from 'astro:env/server';
import {
  type DeviceType,
  getAnonymizedHash,
  normalizeUtm,
} from './analyticsUtils';

export type AnalyticsContext = {
  email: string;
  locale: string;
  page_path: string;
  device_type: DeviceType;
  referrer?: string | null;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

function analyticsMetadata(): { env: string } {
  return { env: getAnalyticsEnv() };
}

function shouldTrackSupabase(): boolean {
  return SUPABASE_TRACKING_ENABLED === true;
}

export async function trackLeadCaptured(ctx: AnalyticsContext): Promise<void> {
  if (!shouldTrackSupabase()) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const user_hash = getAnonymizedHash(ctx.email);
  if (!user_hash) return;
  try {
    const utm = normalizeUtm(ctx);
    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'lead_captured',
      user_hash,
      locale: ctx.locale,
      page_path: ctx.page_path,
      device_type: ctx.device_type,
      referrer: ctx.referrer ?? null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      metadata: analyticsMetadata(),
    });
    if (error) console.error('[Supabase Analytics Error]:', error.message);
  } catch (e) {
    console.error('[Supabase Analytics Error]:', e);
  }
}

export async function trackCalendarViewed(ctx: AnalyticsContext): Promise<void> {
  if (!shouldTrackSupabase()) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const user_hash = getAnonymizedHash(ctx.email);
  if (!user_hash) return;
  try {
    const utm = normalizeUtm(ctx);
    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'calendar_viewed',
      user_hash,
      locale: ctx.locale,
      page_path: ctx.page_path,
      device_type: ctx.device_type,
      referrer: ctx.referrer ?? null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      metadata: analyticsMetadata(),
    });
    if (error) console.error('[Supabase Analytics Error]:', error.message);
  } catch (e) {
    console.error('[Supabase Analytics Error]:', e);
  }
}

export async function trackAuditBooked(ctx: AnalyticsContext): Promise<void> {
  if (!shouldTrackSupabase()) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const user_hash = getAnonymizedHash(ctx.email);
  if (!user_hash) return;
  try {
    const { data: lead, error: lookupErr } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('event_type', 'lead_captured')
      .eq('user_hash', user_hash)
      .contains('metadata', { env: getAnalyticsEnv() })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lookupErr) {
      console.error('[Supabase Analytics Error]:', lookupErr.message);
    }

    let conversion_delta_seconds: number | null = null;
    if (lead?.created_at) {
      const ms = Date.now() - new Date(lead.created_at).getTime();
      if (ms >= 0) conversion_delta_seconds = Math.round(ms / 1000);
    }

    const utm = normalizeUtm(ctx);
    const { error } = await supabase.from('analytics_events').insert({
      event_type: 'audit_booked',
      user_hash,
      locale: ctx.locale,
      page_path: ctx.page_path,
      device_type: ctx.device_type,
      referrer: ctx.referrer ?? null,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
      conversion_delta_seconds,
      metadata: analyticsMetadata(),
    });
    if (error) console.error('[Supabase Analytics Error]:', error.message);
  } catch (e) {
    console.error('[Supabase Analytics Error]:', e);
  }
}
