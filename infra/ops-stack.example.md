# Ops Stack (Companion)

Automation and workflow tooling runs separately from site containers.

## iluro-core-ops

On the production VPS, `/opt/iluro-core-ops` runs:

- **n8n** — workflow automation
- **PostgreSQL** — n8n database

This is optional for Astro Business Stack but demonstrates full platform operations:

- Lead notifications can trigger n8n workflows
- Scheduled jobs (backups, reports) run outside the Astro container

## Publishing

Consider publishing `iluro-core-ops` as a separate GitHub repo with its own README and `docker-compose.yml`. Link it from the main stack README as the automation companion.

## Integration points

| Event | Possible n8n trigger |
|-------|---------------------|
| New lead in Notion | Webhook → Slack/email sequence |
| Deploy complete | GitHub webhook → notification |
| Analytics threshold | Supabase webhook → alert |

No n8n configuration is required for the stack to function.
