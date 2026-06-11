# Deployment

**First time on a VPS?** Follow the full walkthrough in [getting-started.md](getting-started.md).

## Prerequisites

- Hetzner (or any) VPS with Docker and Docker Compose
- SSH access for GitHub Actions
- Nginx Proxy Manager (or equivalent reverse proxy)
- GitHub repository with Environments: `production` and `test`

## GitHub secrets

Configure per environment (`production` for `main`, `test` for `develop`) or at repository level:

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | VPS IP or hostname |
| `SSH_USER` | SSH user (e.g. `deploy`) |
| `SSH_PRIVATE_KEY` | Private key for GitHub Actions → VPS SSH |
| `DEPLOY_PATH_PROD` | Production clone path (e.g. `/opt/webfactory/astro-business-stack`) |
| `DEPLOY_PATH_TEST` | Test clone path (e.g. `/opt/webfactory/astro-stack-test`) |

## First-time VPS setup

See [getting-started.md](getting-started.md) for deploy user, SSH keys, clone, `.env`, DNS, NPM, and first manual `docker compose` run.

## Workflow behavior

On push to `main` or `develop`:

1. GitHub Actions SSHs into VPS
2. `git fetch` + `reset --hard` to branch tip
3. Verifies `.env` exists
4. Substitutes `AUTH_GATEWAY_URL` into `public/admin/config.yml`
5. Tags images for rollback
6. `docker compose build app auth-gateway`
7. `docker compose up -d --force-recreate`

## NPM proxy configuration

Create proxy hosts (example):

| Domain | Forward to |
|--------|------------|
| `stack.example.com` | `astro-stack-app:4325` |
| `stack.example.com` path `/api/auth` | `astro-stack-auth:3000` |

Exact hostnames depend on your `.env` container names. Auth gateway must be reachable at `AUTH_GATEWAY_URL` for OAuth callbacks.

See [infra/nginx-proxy-manager.example.md](../infra/nginx-proxy-manager.example.md) for detailed NPM settings.

## Production vs test

Use different values in `.env`:

```bash
# Test
APP_CONTAINER_NAME=astro-stack-test-app
AUTH_CONTAINER_NAME=astro-stack-test-auth
APP_IMAGE=astro-stack-test
AUTH_IMAGE=astro-stack-test-auth
AUTH_GATEWAY_URL=https://test-stack.example.com

# Production
APP_CONTAINER_NAME=astro-stack-app
AUTH_CONTAINER_NAME=astro-stack-auth
APP_IMAGE=astro-stack
AUTH_IMAGE=astro-stack-auth
AUTH_GATEWAY_URL=https://stack.example.com
```

## Image rollback

Deploy workflow tags `latest` → `previous` before rebuild. To rollback:

```bash
docker tag astro-stack:previous astro-stack:latest
docker compose up -d --force-recreate app
```

## Troubleshooting

- **Missing .env** — deploy fails intentionally; create from `.env.example`
- **OAuth redirect mismatch** — GitHub OAuth App callback must match `AUTH_GATEWAY_URL/api/auth/callback`
- **Container not reachable** — verify both services are on `web-public` network
- **Build slow** — workflow uses BuildKit cache mounts for pnpm, Astro, and Sharp
