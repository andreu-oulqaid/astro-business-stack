import type { Locale } from '@/i18n/config';

export type HomeFaqItem = {
  question: string;
  answer: string;
};

export const homeFaq: Record<Locale, HomeFaqItem[]> = {
  en: [
    {
      question: 'What is Astro Business Stack?',
      answer:
        'A production-ready template for marketing sites: Astro 6 SSR, Docker, self-hosted GitHub OAuth for Decap CMS, GitHub Actions deploys to a VPS, and optional Notion, Supabase, Resend, and Cal.com integrations.',
    },
    {
      question: 'Can I run it without a VPS?',
      answer:
        'Yes. Use `pnpm dev` locally for development. Docker Compose runs the same app and auth-gateway containers you deploy to production.',
    },
    {
      question: 'How does the CMS authentication work?',
      answer:
        'Decap CMS loads at `/admin`. A separate Express gateway container handles GitHub OAuth and returns a token to the CMS — no third-party auth SaaS required.',
    },
    {
      question: 'Are integrations required?',
      answer:
        'No. Each integration is optional and controlled via environment variables. The site runs without Notion, Supabase, or Resend; lead flows degrade gracefully.',
    },
    {
      question: 'What upstream project is this based on?',
      answer:
        'The UI foundation comes from Southwell Velocity (Astro 6 + Tailwind v4). This repo adds VPS deployment, OAuth gateway, CI/CD, and business integrations.',
    },
  ],
  es: [
    {
      question: '¿Qué es Astro Business Stack?',
      answer:
        'Plantilla lista para producción: Astro 6 SSR, Docker, OAuth GitHub autoalojado para Decap CMS, despliegues con GitHub Actions a un VPS e integraciones opcionales con Notion, Supabase, Resend y Cal.com.',
    },
    {
      question: '¿Puedo ejecutarlo sin VPS?',
      answer:
        'Sí. Usa `pnpm dev` en local. Docker Compose ejecuta los mismos contenedores de app y auth-gateway que en producción.',
    },
    {
      question: '¿Cómo funciona la autenticación del CMS?',
      answer:
        'Decap CMS se carga en `/admin`. Un contenedor gateway Express gestiona OAuth de GitHub y devuelve el token al CMS, sin SaaS de autenticación de terceros.',
    },
    {
      question: '¿Son obligatorias las integraciones?',
      answer:
        'No. Cada integración es opcional y se controla con variables de entorno. El sitio funciona sin Notion, Supabase o Resend.',
    },
    {
      question: '¿En qué proyecto upstream se basa?',
      answer:
        'La base UI proviene de Southwell Velocity (Astro 6 + Tailwind v4). Este repo añade despliegue VPS, gateway OAuth, CI/CD e integraciones de negocio.',
    },
  ],
  ca: [
    {
      question: "Què és Astro Business Stack?",
      answer:
        "Plantilla llesta per a producció: Astro 6 SSR, Docker, OAuth GitHub autoallotjat per a Decap CMS, desplegaments amb GitHub Actions a un VPS i integracions opcionals amb Notion, Supabase, Resend i Cal.com.",
    },
    {
      question: 'Puc executar-lo sense VPS?',
      answer:
        'Sí. Fes servir `pnpm dev` en local. Docker Compose executa els mateixos contenidors app i auth-gateway que en producció.',
    },
    {
      question: "Com funciona l'autenticació del CMS?",
      answer:
        "Decap CMS es carrega a `/admin`. Un contenidor gateway Express gestiona OAuth de GitHub i retorna el token al CMS, sense SaaS d'autenticació de tercers.",
    },
    {
      question: 'Són obligatòries les integracions?',
      answer:
        'No. Cada integració és opcional i es controla amb variables d\'entorn. El lloc funciona sense Notion, Supabase o Resend.',
    },
    {
      question: 'En quin projecte upstream es basa?',
      answer:
        'La base UI prové de Southwell Velocity (Astro 6 + Tailwind v4). Aquest repo afegeix desplegament VPS, gateway OAuth, CI/CD i integracions de negoci.',
    },
  ],
  pl: [
    {
      question: 'Czym jest Astro Business Stack?',
      answer:
        'Szablon produkcyjny: Astro 6 SSR, Docker, self-hosted GitHub OAuth dla Decap CMS, wdrożenia GitHub Actions na VPS oraz opcjonalne integracje Notion, Supabase, Resend i Cal.com.',
    },
    {
      question: 'Czy mogę uruchomić to bez VPS?',
      answer:
        'Tak. Użyj `pnpm dev` lokalnie. Docker Compose uruchamia te same kontenery app i auth-gateway co w produkcji.',
    },
    {
      question: 'Jak działa uwierzytelnianie CMS?',
      answer:
        'Decap CMS ładuje się pod `/admin`. Osobny kontener gateway Express obsługuje GitHub OAuth i zwraca token do CMS — bez zewnętrznego SaaS auth.',
    },
    {
      question: 'Czy integracje są wymagane?',
      answer:
        'Nie. Każda integracja jest opcjonalna i sterowana zmiennymi środowiskowymi. Strona działa bez Notion, Supabase czy Resend.',
    },
    {
      question: 'Na jakim projekcie upstream jest to oparte?',
      answer:
        'Fundament UI pochodzi z Southwell Velocity (Astro 6 + Tailwind v4). Ten repo dodaje wdrożenie VPS, gateway OAuth, CI/CD i integracje biznesowe.',
    },
  ],
};
