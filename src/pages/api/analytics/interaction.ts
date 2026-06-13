import type { APIRoute } from 'astro';

import {
  interactionPayloadSchema,
  recordInteractionEvent,
} from '@/lib/analyticsEvents';
import { checkAndConsumeApiQuota } from '@/lib/apiRateLimit';
import { detectDevice } from '@/lib/analyticsUtils';
import { getClientIp } from '@/lib/clientIp';

export const prerender = false;

const ENDPOINT = '/api/analytics/interaction';

function noContent(): Response {
  return new Response(null, { status: 204 });
}

export const POST: APIRoute = async ({ request }) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return noContent();
  }

  const raw = json as Record<string, unknown>;
  if (raw.website != null && String(raw.website).length > 0) {
    return noContent();
  }

  const parsed = interactionPayloadSchema.safeParse(json);
  if (!parsed.success) {
    return noContent();
  }

  const quota = await checkAndConsumeApiQuota('analytics_interaction', getClientIp(request));
  if (!quota.allowed) {
    return noContent();
  }

  const ua = request.headers.get('user-agent');
  const referer = request.headers.get('referer');
  let page_path = parsed.data.page_path;
  if (!page_path && referer) {
    try {
      page_path = new URL(referer).pathname;
    } catch {
      page_path = '/';
    }
  }

  void recordInteractionEvent(
    getClientIp(request),
    { ...parsed.data, page_path: page_path ?? '/' },
    detectDevice(ua),
  ).catch((e) => {
    console.error(`[${ENDPOINT}] background error:`, e);
  });

  return noContent();
};
