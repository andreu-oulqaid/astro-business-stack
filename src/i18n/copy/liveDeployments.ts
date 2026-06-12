import type { Locale } from '@/i18n/config';

export type LiveDeployment = {
  name: string;
  description: string;
  url: string;
  tags: string[];
};

const deployments: Record<Locale, LiveDeployment[]> = {
  en: [
    {
      name: 'Iluro Digital',
      description: 'Agency site with Supabase analytics, Notion CRM, Resend, and Cal.com booking.',
      url: 'https://ilurodigital.com',
      tags: ['SSR', 'Integrations', 'i18n'],
    },
    {
      name: 'Da Sandro Mataró',
      description: 'Restaurant CMS with Decap content editing and multi-locale menu collections.',
      url: 'https://dasandro.ilurodigital.com',
      tags: ['Decap CMS', 'Docker', 'GitHub Actions'],
    },
  ],
  es: [
    {
      name: 'Iluro Digital',
      description: 'Sitio de agencia con analítica Supabase, CRM Notion, Resend y reservas Cal.com.',
      url: 'https://ilurodigital.com',
      tags: ['SSR', 'Integraciones', 'i18n'],
    },
    {
      name: 'Da Sandro Mataró',
      description: 'CMS de restaurante con Decap y colecciones de menú multiidioma.',
      url: 'https://dasandro.ilurodigital.com',
      tags: ['Decap CMS', 'Docker', 'GitHub Actions'],
    },
  ],
  ca: [
    {
      name: 'Iluro Digital',
      description: "Lloc d'agència amb analítica Supabase, CRM Notion, Resend i reserves Cal.com.",
      url: 'https://ilurodigital.com',
      tags: ['SSR', 'Integracions', 'i18n'],
    },
    {
      name: 'Da Sandro Mataró',
      description: 'CMS de restaurant amb Decap i col·leccions de menú multiidioma.',
      url: 'https://dasandro.ilurodigital.com',
      tags: ['Decap CMS', 'Docker', 'GitHub Actions'],
    },
  ],
  pl: [
    {
      name: 'Iluro Digital',
      description: 'Strona agencji z analityką Supabase, CRM Notion, Resend i rezerwacjami Cal.com.',
      url: 'https://ilurodigital.com',
      tags: ['SSR', 'Integracje', 'i18n'],
    },
    {
      name: 'Da Sandro Mataró',
      description: 'CMS restauracji z Decap i wielojęzycznymi kolekcjami menu.',
      url: 'https://dasandro.ilurodigital.com',
      tags: ['Decap CMS', 'Docker', 'GitHub Actions'],
    },
  ],
};

export const liveDeploymentsSection: Record<Locale, { title: string; description: string; visitSite: string }> = {
  en: {
    title: 'Live deployments',
    description: 'Production sites running on the same VPS platform this stack powers.',
    visitSite: 'Visit site',
  },
  es: {
    title: 'Despliegues en producción',
    description: 'Sitios reales en el mismo VPS que impulsa este stack.',
    visitSite: 'Visitar sitio',
  },
  ca: {
    title: 'Desplegaments en producció',
    description: 'Llocs reals al mateix VPS que impulsa aquest stack.',
    visitSite: 'Visitar lloc',
  },
  pl: {
    title: 'Wdrożenia produkcyjne',
    description: 'Prawdziwe strony na tym samym VPS, który napędza ten stack.',
    visitSite: 'Odwiedź stronę',
  },
};

export function getLiveDeployments(locale: Locale): LiveDeployment[] {
  return deployments[locale];
}
