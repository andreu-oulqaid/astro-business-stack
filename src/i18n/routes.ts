/**
 * Route Definitions for Translated URLs
 *
 * This file defines the URL slugs for each route in each supported locale.
 * The route ID (key) is used internally to reference routes, while the values
 * define the actual URL segments for each language.
 *
 * Example:
 * - Route 'about' → /about (en), /es/sobre-nosotros (es), /ca/sobre-nosaltres (ca), /pl/o-nas (pl)
 *
 * Note: Empty string '' represents the root/home page.
 */

import type { Locale } from './config';

/**
 * Navigation configuration for a route
 */
export type NavConfig = {
  /** Whether to show this route in the navbar */
  show: boolean;
  /** Sort order in navigation (lower = first) */
  order: number;
  /** Translation key for the navigation label (e.g., 'nav.about') */
  label: string;
};

/**
 * A route definition maps each locale to its URL slug
 * Optionally includes navigation configuration
 */
export type RouteDefinition = Record<Locale, string> & {
  nav?: NavConfig;
};

/**
 * Route definitions for all static pages
 *
 * Keys are internal route IDs (use these in LocalizedLink and getLocalizedPath)
 * Values are the URL slugs for each locale, plus optional nav config
 *
 * Rules:
 * - Use lowercase letters and hyphens only (no underscores, no special chars)
 * - Empty string '' for home/root page
 * - Do not include leading or trailing slashes
 */
export const routes = {
  // Home page (root) - not shown in nav (logo links there)
  home: {
    en: '', es: '', ca: '', pl: '',
    nav: { show: false, order: 0, label: 'nav.home' },
  },

  // Static pages
  about: {
    en: 'about', es: 'sobre-nosotros', ca: 'sobre-nosaltres', pl: 'o-nas',
    nav: { show: false, order: 3, label: 'nav.about' },
  },
  contact: {
    en: 'contact', es: 'contacto', ca: 'contacte', pl: 'kontakt',
    nav: { show: false, order: 4, label: 'nav.contact' },
  },
  privacy: {
    en: 'privacy', es: 'privacidad', ca: 'privacitat', pl: 'prywatnosc',
    nav: { show: false, order: 0, label: 'footer.links.privacy' },
  },

  // Services section (hub index)
  services: {
    en: 'services', es: 'servicios', ca: 'serveis', pl: 'uslugi',
    nav: { show: true, order: 2, label: 'nav.blog' },
  },

  /** Case studies (MDX collection) — “Proof engine” */
  portfolio: {
    en: 'portfolio',
    es: 'casos',
    ca: 'portfoli',
    pl: 'realizacje',
    nav: { show: false, order: 0, label: 'nav.portfolio' },
  },

  /** Deploy pipeline guides (MDX docs collection) */
  docs: {
    en: 'docs',
    es: 'documentacion',
    ca: 'documentacio',
    pl: 'dokumentacja',
    nav: { show: false, order: 0, label: 'docs.breadcrumb' },
  },

  /** Sales pillar: web */
  serviceWeb: {
    en: 'services/web',
    es: 'servicios/web',
    ca: 'serveis/web',
    pl: 'uslugi/web',
    nav: { show: false, order: 0, label: 'nav.serviceWeb' },
  },

  /** Sales pillar: automation */
  serviceAutomation: {
    en: 'services/automation',
    es: 'servicios/automatizacion',
    ca: 'serveis/automatitzacio',
    pl: 'uslugi/automatyzacja',
    nav: { show: false, order: 0, label: 'nav.serviceAutomation' },
  },

  /** Sales pillar: full system */
  serviceFullSystem: {
    en: 'services/full-system',
    es: 'servicios/sistema-completo',
    ca: 'serveis/sistema-complet',
    pl: 'uslugi/pelny-system',
    nav: { show: false, order: 0, label: 'nav.serviceFullSystem' },
  },

  // Components showcase
  components: {
    en: 'components', es: 'componentes', ca: 'components', pl: 'komponenty',
    nav: { show: false, order: 1, label: 'nav.components' },
  },
} as const satisfies Record<string, RouteDefinition>;

/**
 * Type-safe route identifier
 */
export type RouteId = keyof typeof routes;

/**
 * Get all available route IDs
 */
export const routeIds = Object.keys(routes) as RouteId[];

/**
 * Validate if a string is a valid route ID
 */
export function isValidRouteId(id: string): id is RouteId {
  return id in routes;
}

