import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '@/lib/og';
import siteConfig from '@/config/site.config';

const STATIC_PAGES = [
  { slug: 'index', title: siteConfig.name, description: siteConfig.description },
  { slug: 'about', title: 'About', description: `Learn more about ${siteConfig.name}` },
  { slug: 'contact', title: 'Contact', description: `Get in touch with ${siteConfig.name}` },
  { slug: 'services', title: 'Services', description: `Latest service insights from ${siteConfig.name}` },
  { slug: 'docs', title: 'Docs', description: `Stack documentation from ${siteConfig.name}` },
  { slug: 'services/web', title: 'Websites & performance', description: `Web pillar - ${siteConfig.name}` },
  { slug: 'services/automation', title: 'Automation & AI', description: `Automation pillar - ${siteConfig.name}` },
  { slug: 'services/full-system', title: 'Full system', description: `Full system pillar - ${siteConfig.name}` },
  { slug: 'components', title: 'Component Library', description: 'UI component showcase' },
];

export const getStaticPaths: GetStaticPaths = async () => {
  const docPosts = await getCollection('docs', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const docPaths = docPosts.map((post) => ({
    params: { slug: `docs/${post.id}` },
    props: {
      title: post.data.title,
      description: post.data.description,
      type: 'article' as const,
    },
  }));

  const staticPaths = STATIC_PAGES.map((page) => ({
    params: { slug: page.slug },
    props: {
      title: page.title,
      description: page.description,
      type: 'website' as const,
    },
  }));

  return [...staticPaths, ...docPaths];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, description, type } = props as {
    title: string;
    description?: string;
    type: 'website' | 'article';
  };

  const png = await generateOGImage({
    title,
    description,
    type,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
