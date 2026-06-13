import { defineMiddleware } from 'astro:middleware';

import { defaultLocale, getLocaleFromPath } from '@/i18n/config';
import { resolveRouteFromPath, switchLocale } from '@/i18n/helpers';
import {
  getPreferredLocale,
  PREFERRED_LOCALE_COOKIE,
  PREFERRED_LOCALE_COOKIE_OPTIONS,
  shouldSkipLocaleRedirect,
} from '@/lib/localeDetect';

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    return next();
  }

  const { pathname } = context.url;

  if (shouldSkipLocaleRedirect(pathname)) {
    return next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  if (pathLocale !== defaultLocale) {
    context.cookies.set(PREFERRED_LOCALE_COOKIE, pathLocale, PREFERRED_LOCALE_COOKIE_OPTIONS);
    return next();
  }

  const targetLocale = getPreferredLocale(context.request);

  if (targetLocale === defaultLocale) {
    return next();
  }

  const resolved = resolveRouteFromPath(pathname);
  if (!resolved) {
    return next();
  }

  const destination = switchLocale(pathname, targetLocale);
  if (destination === pathname) {
    return next();
  }

  return context.redirect(destination, 302);
});
