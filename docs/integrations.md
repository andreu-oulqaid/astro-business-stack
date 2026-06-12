# Integrations

All integrations are **optional**. Unset environment variables disable each layer without breaking the site.

## Resend (transactional email)

```bash
RESEND_API_KEY=re_xxx
RESEND_FROM=Stack Demo <onboarding@resend.dev>
LEAD_NOTIFICATION_EMAIL=you@example.com
```

Used by `/api/leads` and contact flows to send notification emails.

## Notion (CRM)

```bash
NOTION_API_KEY=ntn_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CLIENTS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # optional dedup
```

When configured:

1. API checks clients DB for existing email
2. Writes new leads to leads DB
3. Falls back to Resend-only if Notion write fails

## Supabase (funnel analytics)

1. Create a Supabase project
2. Run `scripts/supabase-analytics-base.sql` then `scripts/supabase-analytics-v2.sql` in SQL editor
3. Configure:

```bash
SUPABASE_TRACKING_ENABLED=true
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANALYTICS_SALT=64-char-random-hex
ANALYTICS_ENV=development
ADMIN_METRICS_ENABLED=true
```

Dashboard at `/admin/metrics` when enabled.

## Live demo sandbox (homepage)

Isolated from production analytics and CRM. Visitors run a real mini-pipeline (demo Supabase + demo Notion); each run is an anonymous numbered lead (`lead1`, `lead2`, …). Resend is simulated only.

1. Create a **separate** Supabase project for the demo
2. Run `scripts/supabase-live-demo-schema.sql` then `scripts/supabase-live-demo-seed.sql`
3. If pipeline runs fail with `permission denied`, run `scripts/supabase-live-demo-grants.sql`
3. Create a demo Notion Leads DB per `scripts/notion-live-demo-setup.md`
4. Configure:

```bash
PUBLIC_LIVE_DEMO_ENABLED=true
DEMO_SUPABASE_URL=https://xxx.supabase.co  # base URL only — not .../rest/v1/
DEMO_SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEMO_NOTION_API_KEY=ntn_xxx
DEMO_NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

The section appears below the video walkthrough when all variables are set.

## Cal.com (booking)

Per-locale embed links:

```bash
PUBLIC_CAL_LINK=your-team/demo-call
PUBLIC_CAL_LINK_EN=your-team/demo-call
PUBLIC_CAL_LINK_ES=your-team/demo-call-es
PUBLIC_CAL_LINK_CA=your-team/demo-call-ca
PUBLIC_CAL_LINK_PL=your-team/demo-call-pl
```

## Client analytics and consent

```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_CONSENT_ENABLED=true
PUBLIC_PRIVACY_POLICY_URL=/privacy
```

When `PUBLIC_CONSENT_ENABLED=true`, the consent banner gates GA/GTM until the visitor grants analytics consent. Enable on production when using client-side analytics.

## Graceful degradation

| Integration | When unset |
|-------------|------------|
| Notion | Leads email via Resend only |
| Resend | Lead API returns success but no email |
| Supabase | No funnel events recorded |
| Live demo | Section hidden on homepage |
| Cal.com | CTA booking section hidden or uses fallback |
| GA/GTM | No client-side analytics |
| Consent banner | Hidden when `PUBLIC_CONSENT_ENABLED` is false |

## Environment reference

See [.env.example](../.env.example) for the complete list with comments.
