import { describe, expect, it } from 'vitest';

import { parseAcceptLanguage, shouldSkipLocaleRedirect } from '@/lib/localeDetect';

describe('parseAcceptLanguage', () => {
  it('prefers Catalan when listed first', () => {
    expect(parseAcceptLanguage('ca-ES,es;q=0.9,en;q=0.8')).toBe('ca');
  });

  it('prefers Polish when listed first', () => {
    expect(parseAcceptLanguage('pl-PL,en;q=0.5')).toBe('pl');
  });

  it('falls back to English for unsupported languages', () => {
    expect(parseAcceptLanguage('fr-FR,de;q=0.9')).toBe('en');
  });

  it('returns English for en-US', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9')).toBe('en');
  });

  it('returns English when header is missing', () => {
    expect(parseAcceptLanguage(null)).toBe('en');
    expect(parseAcceptLanguage('')).toBe('en');
  });

  it('respects q-values when ordering tags', () => {
    expect(parseAcceptLanguage('en;q=0.1,es-ES;q=0.9')).toBe('es');
  });
});

describe('shouldSkipLocaleRedirect', () => {
  it('skips API and admin routes', () => {
    expect(shouldSkipLocaleRedirect('/api/demo/stats')).toBe(true);
    expect(shouldSkipLocaleRedirect('/admin/metrics')).toBe(true);
  });

  it('skips static assets', () => {
    expect(shouldSkipLocaleRedirect('/favicon.svg')).toBe(true);
    expect(shouldSkipLocaleRedirect('/demo/video.mp4')).toBe(true);
  });

  it('does not skip marketing pages', () => {
    expect(shouldSkipLocaleRedirect('/')).toBe(false);
    expect(shouldSkipLocaleRedirect('/about')).toBe(false);
    expect(shouldSkipLocaleRedirect('/ca/')).toBe(false);
  });
});
