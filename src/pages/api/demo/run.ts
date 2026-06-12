import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

import { getClientIp } from '@/lib/clientIp';
import { consumeDemoQuota } from '@/lib/demoRateLimit';
import { isLiveDemoConfigured } from '@/lib/demoEnv';
import { runLiveDemoPipeline } from '@/lib/liveDemoPipeline';
import { isDemoCaptchaEnabled, verifyTurnstileToken } from '@/lib/turnstile';

export const prerender = false;

const demoRunSchema = z.object({
  locale: z.enum(['en', 'es', 'ca', 'pl']).optional(),
  page_path: z.string().max(500).optional(),
  captcha_token: z.string().optional(),
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function gateMs(start: number): number {
  return Math.max(0, Math.round(performance.now() - start));
}

export const POST: APIRoute = async ({ request }) => {
  if (!isLiveDemoConfigured()) {
    return jsonResponse({ ok: false, error: 'disabled' }, 503);
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

  const gateStart = performance.now();
  const clientIp = getClientIp(request);

  if (isDemoCaptchaEnabled()) {
    const token = parsed.data.captcha_token?.trim();
    if (!token) {
      return jsonResponse({ ok: false, error: 'captcha_required', gateDurationMs: gateMs(gateStart) }, 400);
    }
    const verified = await verifyTurnstileToken(token, clientIp);
    if (!verified) {
      return jsonResponse({ ok: false, error: 'captcha_failed', gateDurationMs: gateMs(gateStart) }, 403);
    }
  }

  const quota = await consumeDemoQuota(clientIp);
  if (!quota.ok) {
    if ('unavailable' in quota) {
      return jsonResponse(
        { ok: false, error: 'quota_unavailable', gateDurationMs: gateMs(gateStart) },
        503,
      );
    }
    return jsonResponse(
      {
        ok: false,
        error: 'rate_limited',
        gateDurationMs: gateMs(gateStart),
        retryAfterSec: quota.retryAfterSec,
      },
      429,
    );
  }

  const gateDurationMs = gateMs(gateStart);

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
      gateDurationMs,
      totalDurationMs: result.totalDurationMs,
      steps: result.steps,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Pipeline error';
    console.error('[api/demo/run]', message);
    return jsonResponse({ ok: false, error: 'pipeline', gateDurationMs }, 500);
  }
};
