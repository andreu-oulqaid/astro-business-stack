import type { AnalyticsSiteProfile, MetricsModuleId } from '@/lib/analyticsProfileSchema';

export function getVisibleModules(profile: AnalyticsSiteProfile): MetricsModuleId[] {
  const dashboardEvents = new Set(
    (Object.entries(profile.events) as [string, { dashboard: boolean }][])
      .filter(([, f]) => f.dashboard)
      .map(([k]) => k),
  );

  return profile.dashboard.modules
    .filter((mod) => {
      if (!mod.enabled) return false;
      if (!mod.requires_events?.length) return true;
      return mod.requires_events.some((ev) => dashboardEvents.has(ev));
    })
    .map((mod) => mod.id);
}

export function isModuleVisible(
  profile: AnalyticsSiteProfile,
  moduleId: MetricsModuleId,
): boolean {
  return getVisibleModules(profile).includes(moduleId);
}

export const INTERACTION_TARGET_LABELS: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  demo_video: 'Demo video',
  unknown: 'Unknown',
};

export const INTERACTION_PLACEMENT_LABELS: Record<string, string> = {
  navbar: 'Navbar',
  footer: 'Footer',
  cta: 'CTA',
  hero: 'Hero video',
  unknown: 'Unknown',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  interaction: 'Interaction',
  lead_captured: 'Lead captured',
  calendar_viewed: 'Calendar viewed',
  audit_booked: 'Audit booked',
};
