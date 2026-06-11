# Nginx Proxy Manager — Example Configuration

This file documents reverse proxy setup. **Do not commit certificates or live proxy exports.**

## Proxy host: main site

| Setting | Value |
|---------|-------|
| Domain | `stack.example.com` |
| Scheme | `http` |
| Forward hostname | `astro-stack-app` (Docker container name) |
| Forward port | `4325` |
| Block common exploits | On |
| Websockets support | Off |
| SSL | Let's Encrypt certificate |

## Auth gateway routes

The OAuth gateway must be reachable at the same public domain for Decap CMS.

**Option A — Same domain, path routing**

Add a custom location or second proxy host:

| Path | Forward to |
|------|------------|
| `/api/auth` | `astro-stack-auth:3000` |
| `/api/auth/callback` | `astro-stack-auth:3000` |

**Option B — Subdomain**

| Domain | Forward to |
|--------|------------|
| `auth.stack.example.com` | `astro-stack-auth:3000` |

If using Option B, set `AUTH_GATEWAY_URL=https://auth.stack.example.com` and register that callback in GitHub OAuth App.

## Network requirement

Both `app` and `auth-gateway` containers must be on the `web-public` Docker network so NPM can reach them by container name.

## Test environment

Duplicate hosts for test domain pointing to `astro-stack-test-app` and `astro-stack-test-auth`.
