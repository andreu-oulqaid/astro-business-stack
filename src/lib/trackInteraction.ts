export type TrackInteractionPayload = {
  target: 'github' | 'linkedin' | 'demo_video';
  placement: 'navbar' | 'footer' | 'cta' | 'hero';
  action: 'click' | 'play';
  category?: 'outbound' | 'media';
  locale?: string;
  page_path?: string;
};

const ENDPOINT = '/api/analytics/interaction';

function sessionDedupeKey(payload: TrackInteractionPayload): string | null {
  if (payload.target === 'demo_video' && payload.action === 'play') {
    return `interaction:${payload.target}:${payload.placement}`;
  }
  return null;
}

function shouldSkip(payload: TrackInteractionPayload): boolean {
  const key = sessionDedupeKey(payload);
  if (!key) return false;
  try {
    if (sessionStorage.getItem(key) === '1') return true;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage unavailable — still track
  }
  return false;
}

function sendPayload(payload: TrackInteractionPayload): void {
  const body = JSON.stringify({
    ...payload,
    page_path: payload.page_path ?? window.location.pathname,
    website: '',
  });

  const blob = new Blob([body], { type: 'application/json' });
  if (typeof navigator.sendBeacon === 'function' && navigator.sendBeacon(ENDPOINT, blob)) {
    return;
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    body,
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {});
}

/** Fire-and-forget first-party interaction analytics (outbound clicks, video play). */
export function trackInteraction(payload: TrackInteractionPayload): void {
  if (shouldSkip(payload)) return;
  sendPayload(payload);
}

export function initInteractionTracking(): void {
  if (typeof document === 'undefined') return;

  const handleClick = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;

    const analyticsTarget = target.dataset.analyticsTarget;
    const placement = target.dataset.analyticsPlacement;
    const action = target.dataset.analyticsAction ?? 'click';

    if (
      analyticsTarget !== 'github' &&
      analyticsTarget !== 'linkedin' &&
      analyticsTarget !== 'demo_video'
    ) {
      return;
    }
    if (
      placement !== 'navbar' &&
      placement !== 'footer' &&
      placement !== 'cta' &&
      placement !== 'hero'
    ) {
      return;
    }
    if (action !== 'click' && action !== 'play') return;

    trackInteraction({
      target: analyticsTarget,
      placement,
      action,
      category: target.dataset.analyticsCategory === 'media' ? 'media' : 'outbound',
    });
  };

  document.querySelectorAll<HTMLElement>('[data-analytics-target]').forEach((el) => {
    if (el.dataset.analyticsBound === '1') return;
    el.dataset.analyticsBound = '1';
    el.addEventListener('click', handleClick);
  });
}
