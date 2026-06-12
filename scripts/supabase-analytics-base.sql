-- Base schema for production funnel analytics (run once in the analytics Supabase project).
-- Then run supabase-analytics-v2.sql for calendar_viewed + dashboard RPC.

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  user_hash text NOT NULL,
  locale text NOT NULL DEFAULT 'en',
  page_path text NOT NULL DEFAULT '/',
  device_type text NOT NULL DEFAULT 'unknown',
  referrer text,
  utm_source text NOT NULL DEFAULT 'direct',
  utm_medium text,
  utm_campaign text,
  conversion_delta_seconds integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT analytics_events_event_type_check CHECK (
    event_type = ANY (
      ARRAY[
        'lead_captured'::text,
        'audit_booked'::text,
        'calendar_viewed'::text
      ]
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
  ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type
  ON public.analytics_events (event_type);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
