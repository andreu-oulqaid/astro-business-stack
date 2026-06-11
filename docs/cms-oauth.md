# CMS & GitHub OAuth

## Why a separate auth gateway?

Decap CMS needs a GitHub access token to commit content. Netlify Identity is the default hosted option. This stack uses a **self-hosted Express gateway** (`gateway/`) so CMS auth works on your own VPS without third-party auth SaaS.

## Components

| File | Role |
|------|------|
| `public/admin/index.html` | Loads Decap CMS |
| `public/admin/config.yml` | CMS collections, repo, branch, `base_url` |
| `gateway/index.js` | OAuth authorize + callback |
| `Dockerfile.gateway` | Gateway container image |

## GitHub OAuth App setup

1. GitHub → Settings → Developer settings → OAuth Apps → New
2. **Authorization callback URL**: `https://your-domain/api/auth/callback`
3. Copy Client ID and Client Secret to VPS `.env`:

```bash
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
AUTH_GATEWAY_URL=https://your-domain
```

4. For test + production, create separate OAuth Apps or add both callback URLs if GitHub allows multiple.

## OAuth flow

```
1. Editor opens /admin
2. Decap redirects to AUTH_GATEWAY_URL/api/auth
3. Gateway redirects to GitHub OAuth (scope: repo, user)
4. GitHub callbacks to /api/auth/callback
5. Gateway exchanges code for token
6. postMessage sends token to Decap opener window
7. Decap commits content to configured branch (develop)
```

## Decap config

`public/admin/config.yml` uses a deploy-time placeholder:

```yaml
base_url: __AUTH_GATEWAY_URL__
```

The deploy workflow runs:

```bash
sed -i "s|__AUTH_GATEWAY_URL__|$AUTH_GATEWAY_URL|g" public/admin/config.yml
```

Collections match `src/content.config.ts`:

- `blog/` — MDX posts per locale
- `faqs/` — JSON FAQ entries
- `pages/` — optional static pages

## Local development

OAuth requires a public HTTPS URL. Options:

1. Deploy to test environment and edit content there
2. Use a tunnel (ngrok, Cloudflare Tunnel) pointing to `auth-gateway:3000`
3. Skip CMS locally; edit content files directly

## Security notes

- `GITHUB_CLIENT_SECRET` stays in `.env` on the server only
- Gateway listens on `0.0.0.0:3000` inside Docker — expose only via reverse proxy
- CMS commits go to `develop` by default; merge to `main` for production content
