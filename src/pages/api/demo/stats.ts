import type { APIRoute } from 'astro';

import { getClientIp } from '@/lib/clientIp';
import { getDemoQuotaStatus } from '@/lib/demoRateLimit';
import { isLiveDemoConfigured } from '@/lib/demoEnv';
import { fetchDemoDashboardSummary } from '@/lib/liveDemoPipeline';

export const prerender = false;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  if (!isLiveDemoConfigured()) {
    return jsonResponse({ ok: false, error: 'disabled' }, 503);
  }

  const summary = await fetchDemoDashboardSummary();
  if (!summary) {
    return jsonResponse({ ok: false, error: 'unavailable' }, 503);
  }

  const quota = await getDemoQuotaStatus(getClientIp(request));

  return jsonResponse({
    ok: true,
    ...summary,
    quota: quota
      ? {
          remaining: quota.remaining,
          max: quota.max,
          globalRemaining: quota.globalRemaining,
          globalMax: quota.globalMax,
        }
      : { remaining: 0, max: 5, globalRemaining: 0, globalMax: 60 },
  });
};
