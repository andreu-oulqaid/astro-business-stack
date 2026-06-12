import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  site: process.env.SITE_URL || 'https://example.com',

  env: {
    schema: {
      ADMIN_METRICS_ENABLED: envField.boolean({
        context: 'server',
        access: 'secret',
        default: false,
      }),
      SUPABASE_TRACKING_ENABLED: envField.boolean({
        context: 'server',
        access: 'secret',
        default: false,
      }),
      PUBLIC_CONSENT_ENABLED: envField.boolean({
        context: 'client',
        access: 'public',
        default: false,
      }),
      PUBLIC_PRIVACY_POLICY_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '',
      }),
      PUBLIC_GOOGLE_MAPS_API_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '',
      }),
      PUBLIC_CAL_LINK: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CAL_LINK_EN: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CAL_LINK_ES: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CAL_LINK_CA: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_CAL_LINK_PL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
      PUBLIC_DEMO_VIDEO_URL: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
        default: '',
      }),
      PUBLIC_LIVE_DEMO_ENABLED: envField.boolean({
        context: 'client',
        access: 'public',
        default: false,
      }),
      DEMO_SUPABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: '',
      }),
      DEMO_SUPABASE_SERVICE_ROLE_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: '',
      }),
      DEMO_NOTION_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: '',
      }),
      DEMO_NOTION_DATABASE_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
        default: '',
      }),
    },
  },

  redirects: {
    '/portfolio/web': '/portfolio/multi-locale-ssr',
    '/portfolio/automation': '/portfolio/cms-workflow',
    '/portfolio/fullsystem': '/portfolio/lead-funnel',
    '/portfolio/envilo': '/portfolio',
    '/es/casos/web': '/es/casos/multi-locale-ssr',
    '/es/casos/automatizacion': '/es/casos/cms-workflow',
    '/es/casos/sistema-completo': '/es/casos/lead-funnel',
    '/ca/portfoli/web': '/ca/portfoli/multi-locale-ssr',
    '/ca/portfoli/automatitzacio': '/ca/portfoli/cms-workflow',
    '/ca/portfoli/sistema-complet': '/ca/portfoli/lead-funnel',
    '/pl/realizacje/web': '/pl/realizacje/multi-locale-ssr',
    '/pl/realizacje/automatyzacja': '/pl/realizacje/cms-workflow',
    '/pl/realizacje/pelny-system': '/pl/realizacje/lead-funnel',
  },

  // i18n configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'ca', 'pl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es',
          ca: 'ca',
          pl: 'pl',
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  security: {
    checkOrigin: true,
  },

  experimental: {
    contentIntellisense: true,
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
