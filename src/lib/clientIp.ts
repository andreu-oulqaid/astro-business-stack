/**
 * Client IP for rate limiting. Requires a trusted reverse proxy (NPM, Caddy, etc.)
 * to set X-Real-IP or X-Forwarded-For — do not expose the app directly to the internet.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}
