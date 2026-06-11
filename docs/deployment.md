# Deployment

## Prerequisites

- Hetzner (or any) VPS with Docker and Docker Compose
- SSH access for GitHub Actions
- Nginx Proxy Manager (or equivalent reverse proxy)
- GitHub repository with Environments: `production` and `test`

## GitHub secrets

Configure per environment or repository:

| Secret | Description |
|--------|-------------|
| `SSH_HOST` | VPS IP or hostname |
| `SSH_USER` | SSH user (e.g. `deploy`) |
| `SSH_PRIVATE_KEY` | Private key for SSH |
| `DEPLOY_PATH` | Production clone path (e.g. `/opt/webfactory/astro-stack`) |
| `DEPLOY_PATH_TEST` | Test clone path (e.g. `/opt/webfactory/astro-stack-test`) |

## First-time VPS setup

```bash
# 1. Clone
sudo mkdir -p /opt/webfactory
sudo git clone git@github.com:andreu-oulqaid/astro-business-stack.git /opt/webfactory/astro-stack-test
cd /opt/webfactory/astro-stack-test
git checkout develop

# 2. Environment file
cp .env.example .env
# Edit .env — see integrations.md for all variables

# 3. Docker network
docker network create web-public

# 4. Build and run
docker compose build
docker compose up -d
```

Repeat for production on `main` branch at `DEPLOY_PATH`.

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
| `stack.example.com` | `astro-stack-test-app:4325` |
| `stack.example.com` path `/api/auth` | `astro-stack-test-auth:3000` |

Exact hostnames depend on your `.env` container names. Auth gateway must be reachable at `AUTH_GATEWAY_URL` for OAuth callbacks.

## Production vs test

Use different values in `.env`:

```bash
# Test
APP_CONTAINER_NAME=astro-stack-test-app
APP_IMAGE=astro-stack-test
AUTH_GATEWAY_URL=https://test-stack.example.com

# Production
APP_CONTAINER_NAME=astro-stack-app
APP_IMAGE=astro-stack
AUTH_GATEWAY_URL=https://stack.example.com
```

## Troubleshooting

- **Missing .env** — deploy fails intentionally; create from `.env.example`
- **OAuth redirect mismatch** — GitHub OAuth App callback must match `AUTH_GATEWAY_URL/api/auth/callback`
- **Container not reachable** — verify both services are on `web-public` network
- **Build slow** — workflow uses BuildKit cache mounts for pnpm, Astro, and Sharp
