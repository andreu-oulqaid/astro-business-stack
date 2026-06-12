import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

import { checkAndConsumeApiQuota } from '@/lib/apiRateLimit';
import { trackCalendarViewed } from '@/lib/analyticsEvents';
import { getClientIp } from '@/lib/clientIp';
import { detectDevice } from '@/lib/analyticsUtils';

export const prerender = false;

const bodySchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().max(40).optional(),
  locale: z.enum(['en', 'es', 'ca', 'pl']).optional(),
  page_path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional().nullable(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
});

type BodyPayload = z.infer<typeof bodySchema>;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function trackInBackground(payload: BodyPayload, ua: string | null): Promise<void> {
  const email = payload.email.trim().toLowerCase();
  await trackCalendarViewed({
    email,
    locale: payload.locale ?? 'en',
    page_path: payload.page_path ?? '/',
    device_type: detectDevice(ua),
    referrer: payload.referrer ?? null,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
  });
}

export const POST: APIRoute = async ({ request }) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  const raw = json as Record<string, unknown>;
  if (raw.company != null && String(raw.company).length > 0) {
    return jsonResponse({ ok: true });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  const quota = await checkAndConsumeApiQuota('calendar_viewed', getClientIp(request));
  if (!quota.allowed) {
    return jsonResponse(
      { ok: false, error: 'rate_limited', retryAfterSec: quota.retryAfterSec },
      429,
    );
  }

  const ua = request.headers.get('user-agent');

  void trackInBackground(parsed.data, ua).catch((e) => {
    console.error('[api/analytics/calendar-viewed] background error:', e);
  });

  return jsonResponse({ ok: true });
};
