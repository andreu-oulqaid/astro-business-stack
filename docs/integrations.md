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
2. Run `scripts/supabase-analytics-v2.sql` in SQL editor
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

## Cal.com (booking)

Per-locale embed links:

```bash
PUBLIC_CAL_LINK=your-team/demo-call
PUBLIC_CAL_LINK_EN=your-team/demo-call
PUBLIC_CAL_LINK_ES=your-team/demo-call-es
PUBLIC_CAL_LINK_CA=your-team/demo-call-ca
PUBLIC_CAL_LINK_PL=your-team/demo-call-pl
```

## Client analytics (optional)

```bash
PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
PUBLIC_GTM_ID=GTM-XXXXXXX
PUBLIC_CONSENT_ENABLED=true
PUBLIC_PRIVACY_POLICY_URL=/privacy
```

## Graceful degradation

| Integration | When unset |
|-------------|------------|
| Notion | Leads email via Resend only |
| Resend | Lead API returns success but no email |
| Supabase | No funnel events recorded |
| Cal.com | CTA booking section hidden or uses fallback |
| GA/GTM | No client-side analytics |

## Environment reference

See [.env.example](../.env.example) for the complete list with comments.
