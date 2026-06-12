-- Run after supabase-analytics-v3-interactions.sql.
-- Profile-driven multi-site analytics: first-class site_id/env columns, registry tables,
-- generic analytics_aggregate_metrics RPC, backward-compat dashboard wrapper.

-- ---------------------------------------------------------------------------
-- 1) Promote site_id + env to first-class columns on analytics_events
-- ---------------------------------------------------------------------------
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS site_id text,
  ADD COLUMN IF NOT EXISTS env text;

UPDATE public.analytics_events
SET
  site_id = coalesce(nullif(trim(site_id), ''), nullif(trim(metadata ->> 'site_id'), ''), 'unknown'),
  env = coalesce(nullif(trim(env), ''), nullif(trim(metadata ->> 'env'), ''), 'unknown')
WHERE site_id IS NULL OR env IS NULL OR trim(site_id) = '' OR trim(env) = '';

ALTER TABLE public.analytics_events
  ALTER COLUMN site_id SET NOT NULL,
  ALTER COLUMN env SET NOT NULL;

ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_env_type_created
  ON public.analytics_events (site_id, env, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_site_created
  ON public.analytics_events (site_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 2) Global event type catalog (extensible without CHECK migrations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_event_types (
  event_key text PRIMARY KEY,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.analytics_event_types (event_key, category, label, description)
VALUES
  ('interaction', 'engagement', 'Interaction', 'Outbound clicks and media plays'),
  ('lead_captured', 'funnel', 'Lead captured', 'Lead form submitted'),
  ('calendar_viewed', 'funnel', 'Calendar viewed', 'Booking calendar embed shown'),
  ('audit_booked', 'funnel', 'Audit booked', 'Booking confirmed')
ON CONFLICT (event_key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3) Site registry + profile (hybrid: repo syncs defaults, DB holds overrides)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analytics_sites (
  site_id text PRIMARY KEY,
  display_name text NOT NULL,
  repo_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.analytics_site_profiles (
  site_id text PRIMARY KEY REFERENCES public.analytics_sites (site_id) ON DELETE CASCADE,
  profile_version int NOT NULL DEFAULT 1,
  config jsonb NOT NULL,
  repo_profile_hash text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_site_profiles_updated
  ON public.analytics_site_profiles (updated_at DESC);

ALTER TABLE public.analytics_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_site_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_event_types ENABLE ROW LEVEL SECURITY;

-- Default profile for sites without repo sync (backward compatible: full funnel + interactions)
INSERT INTO public.analytics_sites (site_id, display_name, repo_key)
VALUES ('unknown', 'Unknown site', NULL)
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO public.analytics_site_profiles (site_id, profile_version, config, repo_profile_hash)
VALUES (
  'unknown',
  1,
  '{
    "display_name": "Unknown site",
    "events": {
      "interaction": { "collect": true, "dashboard": true },
      "lead_captured": { "collect": true, "dashboard": true },
      "calendar_viewed": { "collect": true, "dashboard": true },
      "audit_booked": { "collect": true, "dashboard": true }
    },
    "dashboard": {
      "modules": [
        { "id": "summary_cards", "enabled": true },
        { "id": "interactions", "enabled": true },
        { "id": "funnel", "enabled": true },
        { "id": "funnel_friction", "enabled": true },
        { "id": "utm_sources", "enabled": true, "requires_events": ["lead_captured"] },
        { "id": "utm_campaigns", "enabled": true, "requires_events": ["lead_captured"] },
        { "id": "device_breakdown", "enabled": true },
        { "id": "locale_breakdown", "enabled": true, "requires_events": ["lead_captured"] },
        { "id": "latest_events", "enabled": true }
      ]
    }
  }'::jsonb,
  'legacy-default'
)
ON CONFLICT (site_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4) Generic metrics RPC
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_aggregate_metrics(
  p_since timestamptz,
  p_site_id text,
  p_env text DEFAULT NULL,
  p_event_types text[] DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_site_id text := nullif(trim(p_site_id), '');
BEGIN
  IF v_site_id IS NULL THEN
    RETURN jsonb_build_object('error', 'site_id required');
  END IF;

  WITH filtered AS (
    SELECT *
    FROM public.analytics_events e
    WHERE e.created_at >= p_since
      AND e.site_id = v_site_id
      AND (
        p_env IS NULL
        OR trim(p_env) = ''
        OR e.env = p_env
      )
      AND (
        p_event_types IS NULL
        OR cardinality(p_event_types) = 0
        OR e.event_type = ANY (p_event_types)
      )
  ),
  totals AS (
    SELECT coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS by_type
    FROM (
      SELECT event_type, count(*)::int AS cnt
      FROM filtered
      GROUP BY event_type
    ) t
  ),
  unique_visitors AS (
    SELECT coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS by_type
    FROM (
      SELECT event_type, count(DISTINCT user_hash)::int AS cnt
      FROM filtered
      GROUP BY event_type
    ) u
  ),
  interaction_dims AS (
    SELECT
      coalesce(
        (SELECT jsonb_object_agg(target, c) FROM (
          SELECT coalesce(metadata ->> 'target', 'unknown') AS target, count(*)::int AS c
          FROM filtered WHERE event_type = 'interaction'
          GROUP BY 1
        ) t),
        '{}'::jsonb
      ) AS by_target,
      coalesce(
        (SELECT jsonb_object_agg(placement, c) FROM (
          SELECT coalesce(metadata ->> 'placement', 'unknown') AS placement, count(*)::int AS c
          FROM filtered WHERE event_type = 'interaction'
          GROUP BY 1
        ) p),
        '{}'::jsonb
      ) AS by_placement
  ),
  funnel AS (
    SELECT
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS lead_captured,
      count(*) FILTER (WHERE event_type = 'calendar_viewed')::int AS calendar_viewed,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS audit_booked,
      count(DISTINCT user_hash) FILTER (WHERE event_type = 'lead_captured')::int AS unique_lead_users,
      count(DISTINCT user_hash) FILTER (WHERE event_type = 'audit_booked')::int AS unique_booking_users,
      round(avg(conversion_delta_seconds) FILTER (
        WHERE event_type = 'audit_booked' AND conversion_delta_seconds IS NOT NULL
      )::numeric, 2) AS avg_lead_to_booking_seconds
    FROM filtered
  ),
  utm_source AS (
    SELECT
      coalesce(utm_source, 'direct') AS utm_source,
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS leads,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS bookings
    FROM filtered
    GROUP BY 1
    ORDER BY leads + bookings DESC
    LIMIT 8
  ),
  utm_campaign AS (
    SELECT
      coalesce(utm_campaign, 'unknown') AS utm_campaign,
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS leads,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS bookings
    FROM filtered
    GROUP BY 1
    ORDER BY leads + bookings DESC
    LIMIT 8
  ),
  by_device AS (
    SELECT coalesce(device_type, 'unknown') AS device_type, count(*)::int AS c
    FROM filtered
    GROUP BY 1
  ),
  by_locale AS (
    SELECT
      coalesce(locale, 'unknown') AS locale,
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS leads,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS bookings,
      count(*) FILTER (WHERE event_type = 'calendar_viewed')::int AS calendar_views
    FROM filtered
    GROUP BY 1
    ORDER BY locale
  ),
  latest_rows AS (
    SELECT created_at, event_type, locale, device_type, utm_source, utm_campaign,
           conversion_delta_seconds, page_path
    FROM filtered
    ORDER BY created_at DESC
    LIMIT 50
  )
  SELECT jsonb_build_object(
    'totals', coalesce((SELECT by_type FROM totals), '{}'::jsonb),
    'unique_visitors', coalesce((SELECT by_type FROM unique_visitors), '{}'::jsonb),
    'interaction_dimensions', jsonb_build_object(
      'by_target', (SELECT by_target FROM interaction_dims),
      'by_placement', (SELECT by_placement FROM interaction_dims)
    ),
    'funnel', (
      SELECT jsonb_build_object(
        'lead_captured', lead_captured,
        'calendar_viewed', calendar_viewed,
        'audit_booked', audit_booked,
        'unique_lead_users', unique_lead_users,
        'unique_booking_users', unique_booking_users,
        'avg_lead_to_booking_seconds', avg_lead_to_booking_seconds
      ) FROM funnel
    ),
    'utm', jsonb_build_object(
      'by_source', coalesce(
        (SELECT jsonb_agg(jsonb_build_object(
          'utm_source', utm_source, 'leads', leads, 'bookings', bookings
        )) FROM utm_source),
        '[]'::jsonb
      ),
      'by_campaign', coalesce(
        (SELECT jsonb_agg(jsonb_build_object(
          'utm_campaign', utm_campaign, 'leads', leads, 'bookings', bookings
        )) FROM utm_campaign),
        '[]'::jsonb
      )
    ),
    'by_device', coalesce((SELECT jsonb_object_agg(device_type, c) FROM by_device), '{}'::jsonb),
    'by_locale', coalesce(
      (SELECT jsonb_agg(jsonb_build_object(
        'locale', locale, 'leads', leads, 'bookings', bookings, 'calendar_views', calendar_views
      )) FROM by_locale),
      '[]'::jsonb
    ),
    'latest', coalesce(
      (SELECT jsonb_agg(jsonb_build_object(
        'created_at', created_at,
        'event_type', event_type,
        'locale', locale,
        'device_type', device_type,
        'utm_source', utm_source,
        'utm_campaign', utm_campaign,
        'conversion_delta_seconds', conversion_delta_seconds,
        'page_path', page_path
      ) ORDER BY created_at DESC) FROM latest_rows),
      '[]'::jsonb
    )
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_aggregate_metrics(timestamptz, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_aggregate_metrics(timestamptz, text, text, text[]) TO service_role;

-- ---------------------------------------------------------------------------
-- 5) Backward-compat wrapper for analytics_dashboard_summary (v3 consumers)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_dashboard_summary(
  p_since timestamptz,
  p_env text DEFAULT NULL,
  p_site_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agg jsonb;
  v_site text := coalesce(nullif(trim(p_site_id), ''), 'unknown');
  funnel jsonb;
  interactions jsonb;
BEGIN
  agg := public.analytics_aggregate_metrics(p_since, v_site, p_env, NULL);

  funnel := coalesce(agg -> 'funnel', '{}'::jsonb);
  interactions := jsonb_build_object(
    'total', coalesce((agg -> 'totals' ->> 'interaction')::int, 0),
    'unique_visitors', coalesce((agg -> 'unique_visitors' ->> 'interaction')::int, 0),
    'by_target', coalesce(agg -> 'interaction_dimensions' -> 'by_target', '{}'::jsonb),
    'by_placement', coalesce(agg -> 'interaction_dimensions' -> 'by_placement', '{}'::jsonb)
  );

  RETURN jsonb_build_object(
    'counts', jsonb_build_object(
      'lead_captured', coalesce((funnel ->> 'lead_captured')::int, 0),
      'calendar_viewed', coalesce((funnel ->> 'calendar_viewed')::int, 0),
      'audit_booked', coalesce((funnel ->> 'audit_booked')::int, 0)
    ),
    'unique_users', jsonb_build_object(
      'lead_users', coalesce((funnel ->> 'unique_lead_users')::int, 0),
      'booking_users', coalesce((funnel ->> 'unique_booking_users')::int, 0)
    ),
    'avg_lead_to_booking_seconds', funnel -> 'avg_lead_to_booking_seconds',
    'by_source', coalesce(agg -> 'utm' -> 'by_source', '[]'::jsonb),
    'by_campaign', coalesce(agg -> 'utm' -> 'by_campaign', '[]'::jsonb),
    'by_device', coalesce(agg -> 'by_device', '{}'::jsonb),
    'by_locale', coalesce(agg -> 'by_locale', '[]'::jsonb),
    'latest', coalesce(agg -> 'latest', '[]'::jsonb),
    'interactions', interactions
  );
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_dashboard_summary(timestamptz, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_dashboard_summary(timestamptz, text, text) TO service_role;
