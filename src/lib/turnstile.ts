import { PUBLIC_DEMO_CAPTCHA_ENABLED, PUBLIC_TURNSTILE_SITE_KEY } from 'astro:env/client';
import { TURNSTILE_SECRET_KEY } from 'astro:env/server';

export function isDemoCaptchaEnabled(): boolean {
  return (
    PUBLIC_DEMO_CAPTCHA_ENABLED === true &&
    Boolean(PUBLIC_TURNSTILE_SITE_KEY) &&
    Boolean(TURNSTILE_SECRET_KEY)
  );
}

export function getTurnstileSiteKey(): string | undefined {
  if (!isDemoCaptchaEnabled()) return undefined;
  return PUBLIC_TURNSTILE_SITE_KEY;
}

type TurnstileVerifyResponse = {
  success: boolean;
  'error-codes'?: string[];
};

export async function verifyTurnstileToken(
  token: string,
  clientIp: string,
): Promise<boolean> {
  if (!TURNSTILE_SECRET_KEY) return false;

  const body = new URLSearchParams({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (clientIp && clientIp !== 'unknown') {
    body.set('remoteip', clientIp);
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) return false;

    const data = (await res.json()) as TurnstileVerifyResponse;
    return data.success === true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[turnstile] verify failed:', msg);
    return false;
  }
}
