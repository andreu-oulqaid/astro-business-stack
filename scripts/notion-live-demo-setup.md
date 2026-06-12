# Notion — Live Demo Leads Database

Create a **separate** Leads database in your demo Notion workspace. Do not reuse production `NOTION_DATABASE_ID`.

## Properties

| Property | Type | Notes |
|----------|------|-------|
| `ID` | Title | Internal label `lead1`, `lead2`, … (not shown in the public UI) |
| `Name` | Rich text | Same as ID |
| `Email` | Email | Internal `lead{n}@sandbox.internal` — never mailed |
| `Phone` | Phone | Optional, unused in v1 |
| `Source` | Rich text | Value: `live-demo` |
| `Locale` | Select | Options: `en`, `es`, `ca`, `pl` |
| `Status` | Status | Option: `New Response` |

## Setup

1. Create the database with the properties above.
2. Notion → **Settings → Connections** → create or reuse an integration.
3. Share the database with the integration (full access).
4. Copy the database ID from the URL into VPS `.env` as `DEMO_NOTION_DATABASE_ID`.
5. Set `DEMO_NOTION_API_KEY` to the integration secret.

The live demo pipeline calls the same `createLeadInNotion` helper as production, with `source: live-demo`.
