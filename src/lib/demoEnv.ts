import { PUBLIC_LIVE_DEMO_ENABLED } from 'astro:env/client';
import {
  DEMO_NOTION_API_KEY,
  DEMO_NOTION_DATABASE_ID,
  DEMO_SUPABASE_SERVICE_ROLE_KEY,
  DEMO_SUPABASE_URL,
} from 'astro:env/server';

export function isLiveDemoConfigured(): boolean {
  return (
    PUBLIC_LIVE_DEMO_ENABLED === true &&
    Boolean(DEMO_SUPABASE_URL) &&
    Boolean(DEMO_SUPABASE_SERVICE_ROLE_KEY) &&
    Boolean(DEMO_NOTION_API_KEY) &&
    Boolean(DEMO_NOTION_DATABASE_ID)
  );
}
