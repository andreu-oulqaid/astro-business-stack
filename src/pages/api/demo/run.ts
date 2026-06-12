import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

import { isLiveDemoConfigured } from '@/lib/demoEnv';
import { checkDemoRateLimit, getClientIp, recordDemoRateLimitHit } from '@/lib/demoRateLimit';
import { runLiveDemoPipeline } from '@/lib/liveDemoPipeline';

export const prerender = false;

const demoRunSchema = z.object({
  locale: z.enum(['en', 'es', 'ca', 'pl']).optional(),
  page_path: z.string().max(500).optional(),
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!isLiveDemoConfigured()) {
    return jsonResponse({ ok: false, error: 'disabled' }, 503);
  }

  const clientIp = getClientIp(request);
  const rateCheck = checkDemoRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return jsonResponse(
      { ok: false, error: 'rate_limited', retryAfterSec: rateCheck.retryAfterSec },
      429,
    );
  }

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

  const parsed = demoRunSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  recordDemoRateLimitHit(clientIp);

  try {
    const result = await runLiveDemoPipeline({
      locale: parsed.data.locale ?? 'en',
      pagePath: parsed.data.page_path ?? '/',
      userAgent: request.headers.get('user-agent'),
    });

    return jsonResponse({
      ok: true,
      runId: result.runId,
      leadNumber: result.leadNumber,
      leadLabel: result.leadLabel,
      status: result.status,
      failedStep: result.failedStep ?? null,
      totalDurationMs: result.totalDurationMs,
      steps: result.steps,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Pipeline error';
    console.error('[api/demo/run]', message);
    return jsonResponse({ ok: false, error: 'pipeline' }, 500);
  }
};
