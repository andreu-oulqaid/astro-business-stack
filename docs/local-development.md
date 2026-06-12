# Local Development

## Requirements

- Node.js ≥ 22.12 (see `.nvmrc`)
- pnpm

## Setup

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Site runs at `http://localhost:4321`.

## Useful commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Development server with hot reload |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Astro type check |
| `pnpm lint` | ESLint |
| `pnpm validate` | lint + check + build |

## Docker locally

```bash
docker network create web-public 2>/dev/null || true
docker compose build
docker compose up
```

App image serves on port 4325 inside the container. Map ports in compose if you need host access.

## Content editing

Without OAuth gateway running locally, edit files directly:

- Blog: `src/content/blog/{locale}/*.mdx`
- FAQs: `src/content/faqs/*.json`

Or use Decap CMS against a deployed test environment.

## i18n

Locales: `en` (default, no prefix), `es`, `ca`, `pl`.

- Translations: `src/i18n/translations/`
- Route slugs: `src/i18n/routes.ts`
- Localized pages: `src/pages/[lang]/`

### Auto locale redirect

On first visit, unprefixed English URLs (`/`, `/about`, `/portfolio/...`) redirect to the best matching locale using the browser `Accept-Language` header. Unsupported languages fall back to English.

After you pick a language in the navbar switcher, a `preferred_locale` cookie (1 year) overrides auto-detection. To re-test detection, clear that cookie in devtools and reload.

Implementation: [`src/middleware.ts`](../src/middleware.ts) + [`src/lib/localeDetect.ts`](../src/lib/localeDetect.ts).

## API routes (SSR)

All under `src/pages/api/` — require `output: 'server'` and Node adapter. Test with curl or the contact form on `/contact`.
