import { Client, isFullDatabase } from '@notionhq/client';

export type NotionLeadLocale = 'en' | 'es' | 'ca' | 'pl';

export type NotionDbName = 'Leads' | 'Clients';

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  locale?: NotionLeadLocale;
};

export type FindLeadResult =
  | { status: 'exists'; pageId: string }
  | { status: 'missing' }
  | { status: 'error' };

let cachedNotionClient: Client | null = null;
const dataSourceCache = new Map<string, string>();

function logNotionError(dbName: NotionDbName, e: unknown): void {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[Notion Error] ${dbName}: ${msg}`);
}

export function getNotionClient(apiKey: string): Client {
  if (!cachedNotionClient) {
    cachedNotionClient = new Client({ auth: apiKey });
  }
  return cachedNotionClient;
}

export async function getDataSourceId(
  notion: Client,
  databaseId: string,
  dbName: NotionDbName,
): Promise<string | null> {
  const cached = dataSourceCache.get(databaseId);
  if (cached) return cached;
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    if (isFullDatabase(db) && db.data_sources.length > 0) {
      const dsId = db.data_sources[0].id;
      dataSourceCache.set(databaseId, dsId);
      return dsId;
    }
    logNotionError(dbName, 'databases.retrieve returned no data_sources');
    return null;
  } catch (e) {
    logNotionError(dbName, e);
    return null;
  }
}

export async function findLeadInNotion(
  notion: Client,
  dataSourceId: string,
  email: string,
  dbName: NotionDbName,
): Promise<FindLeadResult> {
  try {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: { property: 'Email', email: { equals: email } },
      page_size: 1,
    });
    const first = res.results[0];
    if (first) {
      return { status: 'exists', pageId: first.id };
    }
    return { status: 'missing' };
  } catch (e) {
    logNotionError(dbName, e);
    return { status: 'error' };
  }
}

export async function createLeadInNotion(
  notion: Client,
  databaseId: string,
  lead: LeadInput,
  extras?: { auditBookedDate?: string },
  dbName: NotionDbName = 'Leads',
): Promise<{ ok: true; pageId: string } | { ok: false }> {
  try {
    const res = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Company: { title: [{ text: { content: lead.name } }] },
        Name: { rich_text: [{ text: { content: lead.name } }] },
        Email: { email: lead.email },
        ...(lead.phone ? { Phone: { phone_number: lead.phone } } : {}),
        Source: { rich_text: [{ text: { content: 'website-cta' } }] },
        ...(lead.locale ? { Locale: { select: { name: lead.locale } } } : {}),
        Status: { status: { name: 'New Response' } },
        ...(extras?.auditBookedDate
          ? { AuditBookedDate: { date: { start: extras.auditBookedDate } } }
          : {}),
      },
    });
    return { ok: true, pageId: res.id };
  } catch (e) {
    logNotionError(dbName, e);
    return { ok: false };
  }
}

export async function updateAuditBookedDate(
  notion: Client,
  pageId: string,
  isoDate: string,
): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: { AuditBookedDate: { date: { start: isoDate } } },
    });
    return true;
  } catch (e) {
    logNotionError('Leads', e);
    return false;
  }
}

export async function updateNextPlannedAudit(
  notion: Client,
  pageId: string,
  isoDate: string,
): Promise<boolean> {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: { NextPlannedAudit: { date: { start: isoDate } } },
    });
    return true;
  } catch (e) {
    logNotionError('Clients', e);
    return false;
  }
}
