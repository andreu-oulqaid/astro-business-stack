# Architecture

## Overview

Astro Business Stack runs as a **two-container** deployment on a shared Docker network. A reverse proxy (Nginx Proxy Manager) terminates TLS and routes traffic — proxy config lives on the VPS, not in this repo.

## VPS layout

```
/opt/webfactory/
├── astro-stack/          # production (main branch)
├── astro-stack-test/     # staging (develop branch)
├── iluro-prod/           # client site example
├── da-sandro-mat/        # client site example
└── proxy/                # Nginx Proxy Manager
```

## Docker network

All public-facing containers join an external network:

```bash
docker network create web-public
```

`docker-compose.yml` references `web-public` as external. NPM proxy hosts point to container names on this network.

## Services

| Service | Container | Port | Role |
|---------|-----------|------|------|
| `app` | `${APP_CONTAINER_NAME}` | 4325 | Astro SSR — pages, API routes, integrations |
| `auth-gateway` | `${AUTH_CONTAINER_NAME}` | 3000 | GitHub OAuth for Decap CMS |

## Request flow

### Public site

```
Browser → NPM (TLS) → app:4325 → Astro SSR / API routes
```

### CMS login

```
/admin (Decap) → auth-gateway /api/auth → GitHub OAuth
              → callback /api/auth/callback → token → Decap popup
```

### Lead funnel (optional)

```
Contact form → POST /api/leads → Notion CRM (dedup)
                              → Resend (email notification)
                              → Supabase (analytics event)
```

## Branch strategy

| Branch | Environment | Typical path |
|--------|-------------|--------------|
| `main` | production | `/opt/webfactory/astro-stack` |
| `develop` | test | `/opt/webfactory/astro-stack-test` |

## Image rollback

Deploy workflow tags `latest` → `previous` before rebuild. To rollback:

```bash
docker tag astro-stack:previous astro-stack:latest
docker compose up -d --force-recreate app
```

## Multi-tenant pattern

One VPS hosts multiple client sites. Each site has:

- Its own git clone and `.env`
- Unique `APP_IMAGE` / `AUTH_IMAGE` names
- Shared `web-public` network
- Separate NPM proxy hosts

See [getting-started.md](getting-started.md) for first-time setup.
