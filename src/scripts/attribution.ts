const KEY = 'iluro_attr_v1';

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string | null;
};

export function captureAttributionOnce(): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(KEY)) return;
    const url = new URL(window.location.href);
    const referrer = document.referrer || '';
    const isExternal = referrer && !referrer.startsWith(window.location.origin);
    const attribution: Attribution = {
      utm_source: url.searchParams.get('utm_source') || undefined,
      utm_medium: url.searchParams.get('utm_medium') || undefined,
      utm_campaign: url.searchParams.get('utm_campaign') || undefined,
      referrer: isExternal ? referrer : null,
    };
    sessionStorage.setItem(KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage blocked (private mode etc.) -> attribution defaults to 'direct'.
  }
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}
