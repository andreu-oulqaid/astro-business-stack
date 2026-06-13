import { createHash } from 'node:crypto';

import type { SupabaseClient } from '@supabase/supabase-js';

import { analyticsProfile, analyticsRepoKey } from '@/config/analytics.profile';
import {
  type AnalyticsEventKey,
  type AnalyticsSiteProfile,
  analyticsSiteProfileSchema,
} from '@/lib/analyticsProfileSchema';
import { getAnalyticsSiteId } from '@/lib/analyticsSite';

type ProfileRow = {
  site_id: string;
  profile_version: number;
  config: unknown;
  repo_profile_hash: string | null;
};

let cachedProfile: { profile: AnalyticsSiteProfile; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export function getRepoProfile(): AnalyticsSiteProfile {
  return analyticsSiteProfileSchema.parse(analyticsProfile);
}

export function hashRepoProfile(profile: AnalyticsSiteProfile): string {
  return createHash('sha256').update(JSON.stringify(profile)).digest('hex');
}

function parseProfileConfig(raw: unknown): AnalyticsSiteProfile | null {
  const parsed = analyticsSiteProfileSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export async function syncSiteProfile(supabase: SupabaseClient): Promise<void> {
  const siteId = getAnalyticsSiteId();
  const repoProfile = getRepoProfile();
  const repoHash = hashRepoProfile(repoProfile);
  const now = new Date().toISOString();

  const { data: existing, error: fetchErr } = await supabase
    .from('analytics_site_profiles')
    .select('site_id, profile_version, config, repo_profile_hash')
    .eq('site_id', siteId)
    .maybeSingle();

  if (fetchErr) {
    console.error('[analyticsProfile] sync fetch error:', fetchErr.message);
    return;
  }

  const row = existing as ProfileRow | null;
  if (row?.repo_profile_hash === repoHash) {
    return;
  }

  const { error: siteErr } = await supabase.from('analytics_sites').upsert(
    {
      site_id: siteId,
      display_name: repoProfile.display_name,
      repo_key: analyticsRepoKey,
      updated_at: now,
    },
    { onConflict: 'site_id' },
  );

  if (siteErr) {
    console.error('[analyticsProfile] sync site upsert error:', siteErr.message);
    return;
  }

  const { error: profileErr } = await supabase.from('analytics_site_profiles').upsert(
    {
      site_id: siteId,
      profile_version: (row?.profile_version ?? 0) + 1,
      config: repoProfile,
      repo_profile_hash: repoHash,
      updated_at: now,
    },
    { onConflict: 'site_id' },
  );

  if (profileErr) {
    console.error('[analyticsProfile] sync profile upsert error:', profileErr.message);
    return;
  }

  cachedProfile = null;
}

export async function resolveSiteProfile(supabase: SupabaseClient): Promise<AnalyticsSiteProfile> {
  const now = Date.now();
  if (cachedProfile && cachedProfile.expiresAt > now) {
    return cachedProfile.profile;
  }

  const siteId = getAnalyticsSiteId();
  const repoProfile = getRepoProfile();

  const { data, error } = await supabase
    .from('analytics_site_profiles')
    .select('config')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error) {
    console.error('[analyticsProfile] resolve error:', error.message);
    cachedProfile = { profile: repoProfile, expiresAt: now + CACHE_TTL_MS };
    return repoProfile;
  }

  const dbProfile = parseProfileConfig((data as { config?: unknown } | null)?.config);
  const profile = dbProfile ?? repoProfile;
  cachedProfile = { profile, expiresAt: now + CACHE_TTL_MS };
  return profile;
}

export function dashboardEventTypes(profile: AnalyticsSiteProfile): AnalyticsEventKey[] {
  return (Object.entries(profile.events) as [AnalyticsEventKey, { dashboard: boolean }][])
    .filter(([, flags]) => flags.dashboard)
    .map(([key]) => key);
}

export function collectEventTypes(profile: AnalyticsSiteProfile): AnalyticsEventKey[] {
  return (Object.entries(profile.events) as [AnalyticsEventKey, { collect: boolean }][])
    .filter(([, flags]) => flags.collect)
    .map(([key]) => key);
}

export function isCollectEnabled(
  profile: AnalyticsSiteProfile,
  eventType: string,
): eventType is AnalyticsEventKey {
  const flags = profile.events[eventType as AnalyticsEventKey];
  return flags?.collect === true;
}

export function invalidateProfileCache(): void {
  cachedProfile = null;
}
