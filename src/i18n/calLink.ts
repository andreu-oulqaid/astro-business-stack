import {
  PUBLIC_CAL_LINK,
  PUBLIC_CAL_LINK_CA,
  PUBLIC_CAL_LINK_EN,
  PUBLIC_CAL_LINK_ES,
  PUBLIC_CAL_LINK_PL,
} from 'astro:env/client';
import type { Locale } from './config';

const FALLBACK_CAL_LINK = 'your-team/demo-call';

const calLinkByLocale: Record<Locale, string | undefined> = {
  en: PUBLIC_CAL_LINK_EN,
  es: PUBLIC_CAL_LINK_ES,
  ca: PUBLIC_CAL_LINK_CA,
  pl: PUBLIC_CAL_LINK_PL,
};

export function getCalLink(locale: Locale): string {
  return calLinkByLocale[locale] || PUBLIC_CAL_LINK || FALLBACK_CAL_LINK;
}
