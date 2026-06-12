import { defaultLocale, isValidLocale, type Locale } from '@/i18n/config';

export const PREFERRED_LOCALE_COOKIE = 'preferred_locale';

export const PREFERRED_LOCALE_COOKIE_OPTIONS = {
  path: '/',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
};

const STATIC_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.css',
  '.map',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.xml',
  '.txt',
  '.webmanifest',
  '.json',
  '.mp4',
  '.pdf',
]);

function primaryLanguageTag(tag: string): string {
  return tag.trim().split('-')[0]?.toLowerCase() ?? '';
}

function mapTagToLocale(tag: string): Locale | null {
  const primary = primaryLanguageTag(tag);
  if (primary === 'ca') return 'ca';
  if (primary === 'pl') return 'pl';
  if (primary === 'es') return 'es';
  if (primary === 'en') return 'en';
  return null;
}

/**
 * Parse Accept-Language with q-values; first supported locale wins, else English.
 */
export function parseAcceptLanguage(header: string | null): Locale {
  if (!header?.trim()) return defaultLocale;

  const entries = header
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';');
      let q = 1;
      for (const param of params) {
        const trimmed = param.trim();
        if (trimmed.startsWith('q=')) {
          const parsed = Number.parseFloat(trimmed.slice(2));
          if (Number.isFinite(parsed)) q = parsed;
        }
      }
      return { tag: rawTag.trim(), q };
    })
    .filter((entry) => entry.tag.length > 0 && entry.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    const locale = mapTagToLocale(tag);
    if (locale) return locale;
  }

  return defaultLocale;
}

function readCookieValue(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [rawKey, ...rest] = part.split('=');
    if (rawKey?.trim() === name) {
      const value = rest.join('=').trim();
      return value ? decodeURIComponent(value) : null;
    }
  }

  return null;
}

/** Cookie overrides Accept-Language when set to a supported locale. */
export function getPreferredLocale(request: Request): Locale {
  const fromCookie = readCookieValue(request, PREFERRED_LOCALE_COOKIE);
  if (fromCookie && isValidLocale(fromCookie)) {
    return fromCookie;
  }

  return parseAcceptLanguage(request.headers.get('accept-language'));
}

export function shouldSkipLocaleRedirect(pathname: string): boolean {
  if (pathname.startsWith('/api/') || pathname.startsWith('/admin/')) {
    return true;
  }

  if (
    pathname === '/robots.txt' ||
    pathname === '/rss.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/admin/config.yml'
  ) {
    return true;
  }

  if (pathname.startsWith('/sitemap') || pathname.startsWith('/og/')) {
    return true;
  }

  const lastDot = pathname.lastIndexOf('.');
  if (lastDot > pathname.lastIndexOf('/')) {
    const ext = pathname.slice(lastDot).toLowerCase();
    if (STATIC_EXTENSIONS.has(ext)) return true;
  }

  return false;
}
