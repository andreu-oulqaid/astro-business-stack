/**
 * Route Helper Functions for Translated URLs
 *
 * These utilities help with:
 * - Generating localized paths from route IDs
 * - Resolving route info from URL paths
 * - Switching locale while maintaining the current page
 * - Getting all translations for a route (for hreflang tags)
 */

import { type Locale, locales, defaultLocale, isValidLocale } from './config';
import { routes, type RouteId, isValidRouteId } from './routes';

/**
 * Get the localized URL path for a route
 *
 * @param routeId - The internal route identifier (e.g., 'about', 'blog')
 * @param locale - The target locale
 * @returns The full path with locale prefix if needed
 *
 * @example
 * getLocalizedPath('about', 'en') // → '/about'
 * getLocalizedPath('about', 'es') // → '/es/sobre-nosotros'
 * getLocalizedPath('about', 'fr') // → '/fr/a-propos'
 * getLocalizedPath('home', 'es')  // → '/es'
 */
export function getLocalizedPath(routeId: RouteId, locale: Locale): string {
  const route = routes[routeId];
  const slug = route[locale];

  // For default locale, no prefix needed
  if (locale === defaultLocale) {
    return slug ? `/${slug}` : '/';
  }

  // For other locales, add prefix
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}

/** Route ids for sales pillar pages (URLs use English folders under `/[lang]/services/`). */
const PILLAR_ROUTE_IDS_FS: Array<{
  routeId: 'serviceWeb' | 'serviceAutomation' | 'serviceFullSystem';
  folder: string;
}> = [
  { routeId: 'serviceWeb', folder: 'web' },
  { routeId: 'serviceAutomation', folder: 'automation' },
  { routeId: 'serviceFullSystem', folder: 'full-system' },
];

/**
 * Map one path segment after the localized "services" base (e.g. `automatizacion`)
 * to the Astro folder name for the pillar (`automation`).
 * Checks all locales so we never confuse a pillar slug with a portfolio slug.
 */
export function pillarFilesystemSegmentFromServicesSlugTail(
  tail: string,
  preferredLocale?: Locale
): string | null {
  if (!tail || tail.includes('/')) return null;

  const order: Locale[] = preferredLocale
    ? [preferredLocale, ...locales.filter((l) => l !== preferredLocale)]
    : [...locales];

  for (const loc of order) {
    for (const { routeId, folder } of PILLAR_ROUTE_IDS_FS) {
      const full = routes[routeId][loc];
      const last = full.split('/').pop();
      if (last === tail) return folder;
    }
  }
  return null;
}

/**
 * Build a reverse lookup map: { 'en/about': { routeId: 'about', locale: 'en' } }
 * This is computed once and cached for performance
 */
function buildPathLookup(): Map<string, { routeId: RouteId; locale: Locale }> {
  const lookup = new Map<string, { routeId: RouteId; locale: Locale }>();

  for (const [routeId, slugs] of Object.entries(routes)) {
    for (const locale of locales) {
      const slug = slugs[locale as Locale];
      // Create lookup key: locale/slug or just locale for home
      const key = slug ? `${locale}/${slug}` : locale;
      lookup.set(key, { routeId: routeId as RouteId, locale: locale as Locale });
    }
  }

  // [lang]/services/* pages use the literal folder name "services", not translated slugs
  // (e.g. /es/services exists; /es/servicios does not). Register those paths so locale
  // switching and resolveRouteFromPath match the filesystem routes.
  const servicesEnSlug = routes.services[defaultLocale];
  if (servicesEnSlug) {
    for (const locale of locales) {
      if (locale === defaultLocale) continue;
      const key = `${locale}/${servicesEnSlug}`;
      lookup.set(key, { routeId: 'services', locale: locale as Locale });
    }
  }

  // Filesystem uses English path segments under /[lang]/ (e.g. /es/services/web) while
  // routes.ts uses translated slugs (e.g. /es/servicios/web). Alias canonical paths.
  const aliasRouteIds: RouteId[] = [
    'docs',
    'serviceWeb',
    'serviceAutomation',
    'serviceFullSystem',
  ];
  for (const routeId of aliasRouteIds) {
    const enSlug = routes[routeId][defaultLocale];
    if (!enSlug) continue;
    for (const locale of locales) {
      if (locale === defaultLocale) continue;
      const translatedKey = `${locale}/${routes[routeId][locale]}`;
      const canonicalKey = `${locale}/${enSlug}`;
      const entry = lookup.get(translatedKey);
      if (entry && canonicalKey !== translatedKey) {
        lookup.set(canonicalKey, entry);
      }
    }
  }

  // Pillar URLs using English "services" + localized tail (e.g. /es/services/automatizacion).
  // Without this, resolveRouteFromPath matches only the hub ("services" + extra) and breaks locale switching.
  const pillarRouteIds: RouteId[] = ['serviceWeb', 'serviceAutomation', 'serviceFullSystem'];
  const enServicesBase = routes.services[defaultLocale];
  const filesystemPillarTails = new Set(['web', 'automation', 'full-system']);
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    const locBase = routes.services[locale];
    for (const routeId of pillarRouteIds) {
      const translatedFull = routes[routeId][locale];
      if (!translatedFull.startsWith(`${locBase}/`)) continue;
      const tail = translatedFull.slice(locBase.length + 1);
      if (filesystemPillarTails.has(tail)) continue;
      const hybridKey = `${locale}/${enServicesBase}/${tail}`;
      const translatedKey = `${locale}/${translatedFull}`;
      const entry = lookup.get(translatedKey);
      if (entry && hybridKey !== translatedKey) {
        lookup.set(hybridKey, entry);
      }
    }
  }

  return lookup;
}

const pathLookup = buildPathLookup();

/**
 * Result from resolving a route from a path
 */
export type ResolvedRoute = {
  routeId: RouteId;
  locale: Locale;
  /** Extra path segments after the route (e.g., blog post slug) */
  extra?: string;
};

/**
 * Resolve route information from a URL path
 *
 * @param pathname - The URL pathname (e.g., '/es/sobre-nosotros')
 * @returns The route ID, locale, and any extra path segments, or null if not a known route
 *
 * @example
 * resolveRouteFromPath('/about')           // → { routeId: 'about', locale: 'en' }
 * resolveRouteFromPath('/es/sobre-nosotros') // → { routeId: 'about', locale: 'es' }
 * resolveRouteFromPath('/fr/a-propos')     // → { routeId: 'about', locale: 'fr' }
 * resolveRouteFromPath('/blog/my-post')    // → { routeId: 'blog', locale: 'en', extra: 'my-post' }
 * resolveRouteFromPath('/es/blog/my-post') // → { routeId: 'blog', locale: 'es', extra: 'my-post' }
 * resolveRouteFromPath('/unknown')         // → null
 */
export function resolveRouteFromPath(pathname: string): ResolvedRoute | null {
  // Clean the path
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  const segments = cleanPath.split('/').filter(Boolean);

  // Determine locale from first segment
  let locale: Locale = defaultLocale;
  let slugSegments = segments;

  if (segments.length > 0 && isValidLocale(segments[0])) {
    locale = segments[0] as Locale;
    slugSegments = segments.slice(1);
  }

  // Build lookup key
  const slug = slugSegments.join('/');
  const lookupKey = slug ? `${locale}/${slug}` : locale;

  // Try exact match first
  const match = pathLookup.get(lookupKey);
  if (match) {
    return match;
  }

  // For root path without locale, it's home in default locale
  if (cleanPath === '' || cleanPath === '/') {
    return { routeId: 'home', locale: defaultLocale };
  }

  // Check if it's just a locale (home page for that locale)
  if (segments.length === 1 && isValidLocale(segments[0])) {
    return { routeId: 'home', locale: segments[0] as Locale };
  }

  // Handle nested routes like blog posts: /blog/my-post or /es/blog/my-post
  // Check if the first slug segment matches a known route
  if (slugSegments.length > 1) {
    const firstSlug = slugSegments[0];
    const firstSlugLookupKey = `${locale}/${firstSlug}`;
    const parentMatch = pathLookup.get(firstSlugLookupKey);

    if (parentMatch) {
      // Found a parent route, the rest is extra path info
      const extra = slugSegments.slice(1).join('/');
      return {
        routeId: parentMatch.routeId,
        locale,
        extra,
      };
    }

    // Also check for translated blog slugs (e.g., /fr/blogue/my-post)
    // We need to find which route this slug belongs to
    for (const [routeId, routeSlugs] of Object.entries(routes)) {
      if (routeSlugs[locale] === firstSlug) {
        const extra = slugSegments.slice(1).join('/');
        return {
          routeId: routeId as RouteId,
          locale,
          extra,
        };
      }
    }
  }

  return null;
}

/**
 * Switch to a different locale while staying on the same page
 *
 * @param currentPath - The current URL pathname
 * @param targetLocale - The locale to switch to
 * @returns The new path in the target locale, or the home page if route unknown
 *
 * @example
 * switchLocale('/about', 'es')               // → '/es/sobre-nosotros'
 * switchLocale('/es/sobre-nosotros', 'fr')   // → '/fr/a-propos'
 * switchLocale('/es/sobre-nosotros', 'en')   // → '/about'
 * switchLocale('/blog/my-post', 'es')        // → '/es/blog/my-post'
 * switchLocale('/es/blog/my-post', 'fr')     // → '/fr/blogue/my-post'
 * switchLocale('/unknown', 'es')             // → '/es' (fallback to home)
 */
export function switchLocale(currentPath: string, targetLocale: Locale): string {
  const resolved = resolveRouteFromPath(currentPath);

  if (resolved) {
    const basePath = getLocalizedPath(resolved.routeId, targetLocale);

    // If there's extra path info (like blog post slug), append it
    if (resolved.extra) {
      // Ensure we don't double-slash
      const separator = basePath.endsWith('/') ? '' : '/';
      return `${basePath}${separator}${resolved.extra}`;
    }

    return basePath;
  }

  // Fallback: if we can't resolve the route, go to home page for target locale
  return getLocalizedPath('home', targetLocale);
}

/**
 * Get all localized URLs for a route (for hreflang tags)
 *
 * @param routeId - The route identifier
 * @returns An array of { locale, path } for all locales
 *
 * @example
 * getRouteTranslations('about')
 * // → [
 * //   { locale: 'en', path: '/about' },
 * //   { locale: 'es', path: '/es/sobre-nosotros' },
 * //   { locale: 'fr', path: '/fr/a-propos' }
 * // ]
 */
export function getRouteTranslations(
  routeId: RouteId
): Array<{ locale: Locale; path: string }> {
  return locales.map((locale) => ({
    locale,
    path: getLocalizedPath(routeId, locale),
  }));
}

/**
 * Get the slug for a route in a specific locale
 *
 * @param routeId - The route identifier
 * @param locale - The locale
 * @returns The URL slug (without locale prefix)
 *
 * @example
 * getRouteSlug('about', 'es') // → 'sobre-nosotros'
 */
export function getRouteSlug(routeId: RouteId, locale: Locale): string {
  return routes[routeId][locale];
}

/**
 * Check if a path matches a specific route
 *
 * @param pathname - The URL pathname to check
 * @param routeId - The route to match against
 * @returns True if the path matches the route in any locale
 */
export function isRoute(pathname: string, routeId: RouteId): boolean {
  const resolved = resolveRouteFromPath(pathname);
  return resolved?.routeId === routeId;
}

/**
 * Navigation route information
 */
export type NavRoute = {
  routeId: RouteId;
  label: string;
  order: number;
  path: string;
};

/**
 * Get routes that should appear in navigation, sorted by order
 *
 * @param locale - The locale to get paths for (defaults to defaultLocale)
 * @returns Array of navigation routes with their translation keys and localized paths
 *
 * @example
 * const navRoutes = getNavRoutes('en');
 * // → [
 * //   { routeId: 'components', label: 'nav.components', order: 1, path: '/components' },
 * //   { routeId: 'blog', label: 'nav.blog', order: 2, path: '/blog' },
 * //   { routeId: 'about', label: 'nav.about', order: 3, path: '/about' },
 * //   { routeId: 'contact', label: 'nav.contact', order: 4, path: '/contact' },
 * // ]
 */
export function getNavRoutes(locale: Locale = defaultLocale): NavRoute[] {
  return Object.entries(routes)
    .filter(([_, route]) => route.nav?.show === true)
    .map(([routeId, route]) => ({
      routeId: routeId as RouteId,
      label: route.nav!.label,
      order: route.nav!.order,
      path: getLocalizedPath(routeId as RouteId, locale),
    }))
    .sort((a, b) => a.order - b.order);
}

// Re-export route types for convenience
export { type RouteId, isValidRouteId } from './routes';
