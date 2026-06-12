# Astro Business Stack

Self-hosted Astro SSR sites — Dockerized apps, GitHub OAuth CMS, CI/CD to Hetzner VPS, with optional Notion CRM, Supabase analytics, Resend email, and Cal.com booking.

## What this demonstrates

| Layer | Technology |
|-------|------------|
| Frontend | Astro 6 SSR, React islands, Tailwind v4, i18n (en/es/ca/pl) |
| Runtime | Node adapter, multi-stage Docker build |
| CMS | Decap CMS + self-hosted GitHub OAuth gateway |
| Deploy | GitHub Actions → SSH → Docker Compose on VPS |
| Proxy | Nginx Proxy Manager (documented, not in repo) |
| Integrations | Notion, Supabase, Resend, Cal.com (all optional) |

## Architecture

```
GitHub (main/develop)
    │ push
    ▼
GitHub Actions (SSH deploy)
    ▼
VPS /opt/webfactory/astro-stack
    ├── .env (secrets, not in git)
    └── docker compose
            ├── app (Astro SSR :4325)
            └── auth-gateway (OAuth :3000)
                    └── web-public network
                            ▼
                    Nginx Proxy Manager → TLS + routing
```

See [docs/architecture.md](docs/architecture.md) for the full VPS topology.

## Quick start (local)

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open `http://localhost:4321`. CMS admin loads at `/admin` (requires OAuth gateway in production).

### Docker (local)

```bash
docker network create web-public 2>/dev/null || true
docker compose build
docker compose up -d
```

## Live deployments

Sites built with this stack pattern (external repos):

- [ilurodigital.com](https://ilurodigital.com) — agency site with full integrations
- [dasandro.ilurodigital.com](https://dasandro.ilurodigital.com) — restaurant CMS variant

## Documentation

- [Getting started (VPS)](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Deployment](docs/deployment.md)
- [CMS & OAuth](docs/cms-oauth.md)
- [Integrations](docs/integrations.md)
- [Local development](docs/local-development.md)

## VPS deployment

See [docs/getting-started.md](docs/getting-started.md) for the full checklist: deploy user, SSH keys, DNS, `.env`, NPM, and GitHub Actions secrets (`DEPLOY_PATH_PROD`, `DEPLOY_PATH_TEST`). Push `develop` → test, `main` → production.

## Upstream

UI foundation from [Southwell Velocity](https://github.com/ryansouthwell/velocity) (Astro 6 + Tailwind v4). This repo adds VPS deployment, OAuth gateway, CI/CD, and business integrations.

## License

MIT — see [LICENSE](LICENSE).
