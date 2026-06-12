import type { APIRoute } from 'astro';
import siteConfig from '@/config/site.config';

export const GET: APIRoute = () => {
  const { name, description, branding } = siteConfig;

  const manifest = {
    name,
    short_name: name,
    description,
    start_url: '/',
    display: 'standalone',
    background_color: branding.colors.backgroundColor,
    theme_color: branding.colors.themeColor,
    icons: [
      {
        src: branding.favicon.svg,
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: branding.favicon.manifest192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: branding.favicon.manifest512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
};
