export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  author: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  socialLinks: string[];
  twitter?: {
    site: string;
    creator: string;
  };
  verification?: {
    google?: string;
    bing?: string;
  };
  branding: {
    logo: {
      alt: string;
    };
    favicon: {
      svg: string;
    };
    colors: {
      themeColor: string;
      backgroundColor: string;
    };
  };
  github: {
    repo: string;
    url: string;
    profile: string;
  };
}

const siteUrl =
  (import.meta.env.SITE_URL as string | undefined) ||
  (import.meta.env.PUBLIC_SITE_URL as string | undefined) ||
  'https://stack.example.com';

const siteConfig: SiteConfig = {
  name: 'Astro Business Stack',
  description:
    'Self-hosted Astro SSR sites with Docker, GitHub OAuth CMS, CI/CD to VPS, and production integrations.',
  url: siteUrl,
  ogImage: '/og-default.png',
  author: 'Andreu Oulqaid',
  email: 'hello@example.com',
  socialLinks: ['https://github.com/andreu-oulqaid'],
  twitter: {
    site: '@example',
    creator: '@example',
  },
  verification: {
    google: (import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION as string | undefined) || undefined,
    bing: (import.meta.env.PUBLIC_BING_SITE_VERIFICATION as string | undefined) || undefined,
  },
  branding: {
    logo: {
      alt: 'Astro Business Stack',
    },
    favicon: {
      svg: '/favicon.svg',
    },
    colors: {
      themeColor: '#9f1239',
      backgroundColor: '#ffffff',
    },
  },
  github: {
    repo: 'andreu-oulqaid/astro-business-stack',
    url: 'https://github.com/andreu-oulqaid/astro-business-stack',
    profile: 'https://github.com/andreu-oulqaid',
  },
};

export default siteConfig;
