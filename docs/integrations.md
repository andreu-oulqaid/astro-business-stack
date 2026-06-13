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

## Supabase (analytics platform)

1. Create a Supabase project (shared across sites if desired)
2. Run migrations in order:
   - `scripts/supabase-analytics-base.sql`
   - `scripts/supabase-analytics-v2.sql`
   - `scripts/supabase-analytics-v3-interactions.sql`
   - `scripts/supabase-analytics-v4-profiles.sql` (site registry, profile-driven dashboard)
   - `scripts/supabase-analytics-v5-admin-hub.sql` (org-wide hub RPCs; run on shared Supabase if using iluro develop hub)
3. Run `scripts/supabase-api-rate-limit.sql` for API quotas
4. Configure per deployment:

```bash
SUPABASE_TRACKING_ENABLED=true
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANALYTICS_SALT=64-char-random-hex
RATE_LIMIT_SALT=64-char-random-hex  # optional; defaults to ANALYTICS_SALT
API_LEADS_MAX_PER_HOUR=10
API_LEADS_CONFIRM_MAX_PER_HOUR=10
API_CALENDAR_VIEWED_MAX_PER_HOUR=20
API_ANALYTICS_INTERACTION_MAX_PER_HOUR=30
ANALYTICS_ENV=development          # tag rows: development | production | staging
# ANALYTICS_SITE_ID=custom-id      # optional; defaults to analyticsRepoKey (e.g. astro-business-stack)
ADMIN_METRICS_ENABLED=true         # test/staging only; prod returns 404 for /admin/metrics
```

Canonical **`site_id`** is the repo key from [`src/config/analytics.profile.ts`](../src/config/analytics.profile.ts) (`astro-business-stack`, `iluro-prod`, …). Test and prod VPS hosts write the same project id; **`env`** separates lanes. **`metadata.deploy_host`** records the hostname for traceability only.

Run `scripts/supabase-analytics-v6-project-env.sql` in Supabase after v5 to backfill legacy hostname rows and enable per-env breakdown in aggregates.

Run `scripts/supabase-analytics-v7-hub-projects.sql` after v6 to dedupe the hub project picker (one row per `repo_key`).

### Hybrid site profiles (collect + dashboard modules)

Each repo declares defaults in [`src/config/analytics.profile.ts`](../src/config/analytics.profile.ts). On ingest and dashboard load, the app syncs the profile to Supabase (`analytics_sites`, `analytics_site_profiles`).

- **`events.*.collect`** — whether this deployment writes that event type (guard on server ingest)
- **`events.*.dashboard`** — whether aggregates include that event type
- **`dashboard.modules`** — which UI sections `/admin/metrics` renders

**This repo (marketing stack):** interactions only — no lead/calendar/booking funnel on the public site.

**Client funnel sites:** copy the profile template and enable funnel modules + event types.

Optional DB override (no redeploy): update `analytics_site_profiles.config` JSON in Supabase SQL editor.

### Test vs production collection

| Deployment | `ANALYTICS_ENV` | Collects events? | `/admin/metrics` |
|------------|-----------------|------------------|------------------|
| Test VPS (`stack.ilurodigital.com`) | `development` | Yes | Yes when `ADMIN_METRICS_ENABLED=true` |
| Prod VPS (`stack.andreuog.com`) | `production` | Yes (`SUPABASE_TRACKING_ENABLED=true`) | No (404) |

Env filters on `/admin/metrics`: **All environments** | **Development** | **Production** (default). Period: **24h** | **7d** | **30d** | **90d**. With **All environments**, combined totals plus an env breakdown panel appear when v6+ SQL is applied.

**Hub drill-down** (iluro develop): `/admin/metrics?site=astro-business-stack&env=all&range=90d`.

Dashboard at `/admin/metrics` when enabled locally (`pnpm dev`) or when `ADMIN_METRICS_ENABLED=true`.

**Org-wide hub:** iluro-prod develop (`SITE_URL=https://test-iluro.ilurodigital.com`) hosts the multi-site command center with `?site=all` and env filters. This repo keeps its per-deployment dashboard unchanged. See [iluro-prod docs/integrations.md](../../iluro-prod/docs/integrations.md).

Production API limits **fail open** if Supabase is unset or the RPC errors — leads still flow. Only explicit quota exhaustion returns 429 (interaction ingest silently drops at 204 instead).

### Interaction analytics (GitHub, LinkedIn, demo video)

First-party click/play events via `POST /api/analytics/interaction`:

- **Event type:** `interaction` with metadata `{ category, action, target, placement }` plus columns `site_id`, `env`
- **Visitor identity:** IP HMAC via `RATE_LIMIT_SALT` (stored in `user_hash`; distinct from email HMAC on funnel events)
- **Rate limit:** `analytics_interaction` route, default **30 events/hour per IP** (`API_ANALYTICS_INTERACTION_MAX_PER_HOUR`)
- **Client:** `navigator.sendBeacon` with JSON blob; video play deduped once per tab session
- **Multi-site:** one Supabase project, one `site_id` per repo (`analyticsRepoKey`). Override with `ANALYTICS_SITE_ID` only for edge cases.

Allowed values (server-validated):

| Field | Values |
|-------|--------|
| `target` | `github`, `linkedin`, `demo_video` |
| `placement` | `navbar`, `footer`, `cta`, `hero` |
| `action` | `click`, `play` |

Tracked automatically on navbar/footer/CTA outbound links and MP4 demo poster click. Not a replacement for GA — complementary portfolio metrics.

## Live demo sandbox (homepage)

Isolated from production analytics and CRM. Visitors run a real mini-pipeline (demo Supabase + demo Notion); each run is an anonymous numbered lead (`lead1`, `lead2`, …). Resend is simulated only.

1. Create a **separate** Supabase project for the demo
2. Run `scripts/supabase-live-demo-schema.sql` then `scripts/supabase-live-demo-seed.sql`
3. Run `scripts/supabase-live-demo-rate-limit.sql` for per-IP + global demo quotas
4. If pipeline runs fail with `permission denied`, run `scripts/supabase-live-demo-grants.sql`
5. Create a demo Notion Leads DB per `scripts/notion-live-demo-setup.md`
6. Configure:

```bash
PUBLIC_LIVE_DEMO_ENABLED=true
DEMO_SUPABASE_URL=https://xxx.supabase.co  # base URL only — not .../rest/v1/
DEMO_SUPABASE_SERVICE_ROLE_KEY=eyJ...
DEMO_NOTION_API_KEY=ntn_xxx
DEMO_NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DEMO_MAX_RUNS_PER_HOUR=5
DEMO_GLOBAL_MAX_RUNS_PER_HOUR=60
```

The section appears below the video walkthrough when all variables are set.

### Demo rate limits & optional CAPTCHA

- Quotas are stored in **demo Supabase** (`demo_rate_limit_events` + RPCs). Default: **5 runs/hour per IP**, **60/hour global**.
- Run the rate-limit SQL migration after the demo schema. Stale rows are pruned automatically (~5% of successful runs; 48h retention).
- Set `RATE_LIMIT_SALT` (or reuse `ANALYTICS_SALT`) so IP buckets are HMAC-hashed — never store raw IPs.
- **Trusted proxy required:** the app reads `X-Forwarded-For` / `X-Real-IP`. Do not expose Node directly to the internet without a reverse proxy (NPM, Caddy, etc.).
- Optional Cloudflare Turnstile (invisible, **off by default**):

```bash
PUBLIC_DEMO_CAPTCHA_ENABLED=true
PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

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
