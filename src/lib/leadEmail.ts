import { Resend } from 'resend';

import siteConfig from '@/config/site.config';
import type { LeadInput } from '@/lib/notionLeads';

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export async function sendLeadEmail(
  resendApiKey: string,
  from: string,
  lead: LeadInput,
  fallback: boolean,
): Promise<void> {
  const resend = new Resend(resendApiKey);
  const phoneLine = lead.phone
    ? `<p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>`
    : '';
  const localeLine = lead.locale
    ? `<p><strong>Locale:</strong> ${escapeHtml(lead.locale)}</p>`
    : '';
  const sourceLine = `<p><strong>Source:</strong> website-cta</p>`;
  const fallbackLine = fallback
    ? `<p><em>Note: Notion CRM write failed for this lead; this email is the fallback notification.</em></p>`
    : '';

  const { error } = await resend.emails.send({
    from,
    to: import.meta.env.LEAD_NOTIFICATION_EMAIL || siteConfig.email,
    subject: `New demo lead: ${lead.name}`,
    html: `<p><strong>Name:</strong> ${escapeHtml(lead.name)}</p><p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>${phoneLine}${localeLine}${sourceLine}${fallbackLine}`,
  });

  if (error) {
    console.error('[leadEmail] Resend error:', error);
  }
}
