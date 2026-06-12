/**
 * Canonical logo mark modifiers — single source for TrustBar, pipeline, tech edge, pillar strips.
 * Base state: muted grayscale. Hover: full color (see logo-chips.css).
 */
export type LogoMarkModifier = 'on-dark' | 'mono' | 'decap';

export type LogoKey =
  | 'astro'
  | 'docker'
  | 'githubActions'
  | 'decap'
  | 'hetzner'
  | 'tailwind'
  | 'supabase'
  | 'notion'
  | 'resend'
  | 'cal'
  | 'n8n'
  | 'claude'
  | 'pageSpeed';

const LOGO_MARK_MODIFIERS: Partial<Record<LogoKey, LogoMarkModifier>> = {
  githubActions: 'mono',
  notion: 'on-dark',
  resend: 'on-dark',
  decap: 'decap',
};

export function getLogoMarkClass(key: LogoKey): string | undefined {
  const modifier = LOGO_MARK_MODIFIERS[key];
  if (!modifier) return undefined;
  return `logo-mark--${modifier}`;
}

export function logoMarkClassFromModifier(modifier?: LogoMarkModifier): string | undefined {
  if (!modifier) return undefined;
  return `logo-mark--${modifier}`;
}
