import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

import { trackAuditBooked } from '@/lib/analyticsEvents';
import { detectDevice } from '@/lib/analyticsUtils';
import { sendLeadEmail } from '@/lib/leadEmail';
import {
  type LeadInput,
  createLeadInNotion,
  findLeadInNotion,
  getDataSourceId,
  getNotionClient,
  updateAuditBookedDate,
  updateNextPlannedAudit,
} from '@/lib/notionLeads';

export const prerender = false;

const confirmSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().max(40).optional(),
  locale: z.enum(['en', 'es', 'ca', 'pl']).optional(),
  auditDate: z.iso.datetime().optional(),
  page_path: z.string().max(500).optional(),
  referrer: z.string().max(500).optional().nullable(),
  utm_source: z.string().max(200).optional(),
  utm_medium: z.string().max(200).optional(),
  utm_campaign: z.string().max(200).optional(),
});

type ConfirmPayload = z.infer<typeof confirmSchema>;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function confirmAuditBookedInBackground(
  payload: ConfirmPayload,
  ua: string | null,
): Promise<void> {
  const notionKey = import.meta.env.NOTION_API_KEY;
  const databaseId = import.meta.env.NOTION_DATABASE_ID;
  const clientsDbId = import.meta.env.NOTION_CLIENTS_DATABASE_ID;
  const resendApiKey = import.meta.env.RESEND_API_KEY;
  const from = import.meta.env.RESEND_FROM;

  const lead: LeadInput = {
    name: payload.name,
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone?.trim() || undefined,
    locale: payload.locale,
  };

  const auditDate = payload.auditDate ?? new Date().toISOString();

  void trackAuditBooked({
    email: lead.email,
    locale: payload.locale ?? 'en',
    page_path: payload.page_path ?? '/',
    device_type: detectDevice(ua),
    referrer: payload.referrer ?? null,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
  }).catch(() => {});

  if (!notionKey || !databaseId) {
    if (import.meta.env.DEV) {
      console.warn(
        '[api/leads/confirm] NOTION_API_KEY or NOTION_DATABASE_ID missing; skipping CRM update',
      );
    }
    return;
  }

  const notion = getNotionClient(notionKey);

  if (clientsDbId) {
    const clientsDsId = await getDataSourceId(notion, clientsDbId, 'Clients');
    if (clientsDsId) {
      const inClients = await findLeadInNotion(notion, clientsDsId, lead.email, 'Clients');
      if (inClients.status === 'exists') {
        await updateNextPlannedAudit(notion, inClients.pageId, auditDate);
        return;
      }
    }
  }

  const leadsDsId = await getDataSourceId(notion, databaseId, 'Leads');
  if (!leadsDsId) return;

  const inLeads = await findLeadInNotion(notion, leadsDsId, lead.email, 'Leads');
  if (inLeads.status === 'exists') {
    await updateAuditBookedDate(notion, inLeads.pageId, auditDate);
    return;
  }

  if (inLeads.status === 'missing') {
    const created = await createLeadInNotion(
      notion,
      databaseId,
      lead,
      { auditBookedDate: auditDate },
      'Leads',
    );
    if (created.ok && resendApiKey && from) {
      await sendLeadEmail(resendApiKey, from, lead, false);
    } else if (!created.ok && resendApiKey && from) {
      await sendLeadEmail(resendApiKey, from, lead, true);
    } else if (import.meta.env.DEV && (!resendApiKey || !from)) {
      console.warn('[api/leads/confirm] RESEND_API_KEY or RESEND_FROM missing; skipping email');
    }
  }
}

export const POST: APIRoute = async ({ request }) => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  const parsed = confirmSchema.safeParse(json);
  if (!parsed.success) {
    return jsonResponse({ ok: false, error: 'invalid' }, 400);
  }

  const ua = request.headers.get('user-agent');

  void confirmAuditBookedInBackground(parsed.data, ua).catch((e) => {
    console.error('[api/leads/confirm] background error:', e);
  });

  return jsonResponse({ ok: true });
};
