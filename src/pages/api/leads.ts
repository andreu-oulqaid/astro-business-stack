import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

import { trackLeadCaptured } from '@/lib/analyticsEvents';
import { detectDevice } from '@/lib/analyticsUtils';
import { sendLeadEmail } from '@/lib/leadEmail';
import {
  type LeadInput,
  createLeadInNotion,
  findLeadInNotion,
  getDataSourceId,
  getNotionClient,
} from '@/lib/notionLeads';

export const prerender = false;

const leadSchema = z.object({
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

type LeadPayload = z.infer<typeof leadSchema>;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function processLeadInBackground(
  payload: LeadPayload,
  ua: string | null,
): Promise<void> {
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;
  const notionKey = import.meta.env.NOTION_API_KEY;
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  const clientsDbId = import.meta.env.NOTION_CLIENTS_DATABASE_ID;

  const lead: LeadInput = {
    name: payload.name,
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || undefined,
    locale: payload.locale,
  };

  void trackLeadCaptured({
    email: lead.email,
    locale: payload.locale ?? 'en',
    page_path: payload.page_path ?? '/',
    device_type: detectDevice(ua),
    referrer: payload.referrer ?? null,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
  }).catch(() => {});

  const sendResend = async (fallback: boolean): Promise<void> => {
    if (!resendApiKey || !from) {
      if (import.meta.env.DEV) {
        console.warn('[api/leads] RESEND_API_KEY or RESEND_FROM missing; skipping email');
      }
      return;
    }
    await sendLeadEmail(resendApiKey, from, lead, fallback);
  };

  if (!notionKey || !databaseId) {
    if (import.meta.env.DEV) {
      console.warn('[api/leads] NOTION_API_KEY or NOTION_DATABASE_ID missing; skipping CRM');
    }
    await sendResend(false);
    return;
  }

  const notion = getNotionClient(notionKey);

  if (clientsDbId) {
    const clientsDsId = await getDataSourceId(notion, clientsDbId, 'Clients');
    if (clientsDsId) {
      const inClients = await findLeadInNotion(notion, clientsDsId, lead.email, 'Clients');
      if (inClients.status === 'exists') {
        return;
      }
    }
  }

  const leadsDsId = await getDataSourceId(notion, databaseId, 'Leads');
  if (!leadsDsId) {
    await sendResend(true);
    return;
  }

  const inLeads = await findLeadInNotion(notion, leadsDsId, lead.email, 'Leads');
  if (inLeads.status === 'exists') {
    return;
  }

  if (inLeads.status === 'missing') {
    const created = await createLeadInNotion(notion, databaseId, lead, undefined, 'Leads');
    await sendResend(!created.ok);
    return;
  }

  await sendResend(true);
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

  const parsed = leadSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  const ua = request.headers.get('user-agent');

  void processLeadInBackground(parsed.data, ua).catch((e) => {
    console.error('[api/leads] background error:', e);
  });

  return jsonResponse({ ok: true });
};
