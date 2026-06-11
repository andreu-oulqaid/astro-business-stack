-- Run in Supabase SQL Editor before using calendar_viewed + dashboard RPC.
-- 1) Allow event type calendar_viewed
ALTER TABLE public.analytics_events
  DROP CONSTRAINT IF EXISTS analytics_events_event_type_check;

ALTER TABLE public.analytics_events
  ADD CONSTRAINT analytics_events_event_type_check
  CHECK (
    event_type = ANY (
      ARRAY[
        'lead_captured'::text,
        'audit_booked'::text,
        'calendar_viewed'::text
      ]
    )
  );

-- 2) Optional: faster filtering by env
CREATE INDEX IF NOT EXISTS idx_analytics_events_env_created
  ON public.analytics_events ((metadata ->> 'env'), created_at DESC);

-- 3) Single-call dashboard aggregates (avoids row-limit bias in the app)
CREATE OR REPLACE FUNCTION public.analytics_dashboard_summary(
  p_since timestamptz,
  p_env text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH filtered AS (
    SELECT *
    FROM public.analytics_events e
    WHERE e.created_at >= p_since
      AND (
        p_env IS NULL
        OR trim(p_env) = ''
        OR e.metadata ->> 'env' = p_env
      )
  ),
  counts AS (
    SELECT
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS lead_captured,
      count(*) FILTER (WHERE event_type = 'calendar_viewed')::int AS calendar_viewed,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS audit_booked
    FROM filtered
  ),
  uniq AS (
    SELECT
      count(DISTINCT user_hash) FILTER (WHERE event_type = 'lead_captured')::int AS lead_users,
      count(DISTINCT user_hash) FILTER (WHERE event_type = 'audit_booked')::int AS booking_users
    FROM filtered
  ),
  avg_delta AS (
    SELECT round(avg(conversion_delta_seconds)::numeric, 2) AS avg_seconds
    FROM filtered
    WHERE event_type = 'audit_booked'
      AND conversion_delta_seconds IS NOT NULL
  ),
  by_source AS (
    SELECT
      coalesce(utm_source, 'direct') AS utm_source,
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS leads,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS bookings
    FROM filtered
    GROUP BY 1
  ),
  by_source_top AS (
    SELECT *
    FROM by_source
    ORDER BY leads + bookings DESC
    LIMIT 8
  ),
  by_campaign AS (
    SELECT
      coalesce(utm_campaign, 'unknown') AS utm_campaign,
      count(*) FILTER (WHERE event_type = 'lead_captured')::int AS leads,
      count(*) FILTER (WHERE event_type = 'audit_booked')::int AS bookings
    FROM filtered
    GROUP BY 1
  ),
  by_campaign_top AS (
    SELECT *
    FROM by_campaign
    ORDER BY leads + bookings DESC
    LIMIT 8
  ),
  by_device AS (
    SELECT
      coalesce(device_type, 'unknown') AS device_type,
      count(*)::int AS c
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
  ),
  latest_rows AS (
    SELECT
      created_at,
      event_type,
      locale,
      device_type,
      utm_source,
      utm_campaign,
      conversion_delta_seconds,
      page_path
    FROM filtered
    ORDER BY created_at DESC
    LIMIT 50
  ),
  latest AS (
    SELECT
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'created_at', created_at,
            'event_type', event_type,
            'locale', locale,
            'device_type', device_type,
            'utm_source', utm_source,
            'utm_campaign', utm_campaign,
            'conversion_delta_seconds', conversion_delta_seconds,
            'page_path', page_path
          )
          ORDER BY created_at DESC
        ),
        '[]'::jsonb
      ) AS events
    FROM latest_rows
  )
  SELECT jsonb_build_object(
    'counts',
    (SELECT jsonb_build_object(
      'lead_captured', lead_captured,
      'calendar_viewed', calendar_viewed,
      'audit_booked', audit_booked
    ) FROM counts),
    'unique_users',
    (SELECT jsonb_build_object('lead_users', lead_users, 'booking_users', booking_users) FROM uniq),
    'avg_lead_to_booking_seconds',
    (SELECT avg_seconds FROM avg_delta),
    'by_source',
    coalesce(
      (SELECT jsonb_agg(
        jsonb_build_object('utm_source', utm_source, 'leads', leads, 'bookings', bookings)
        ORDER BY leads + bookings DESC
      ) FROM by_source_top),
      '[]'::jsonb
    ),
    'by_campaign',
    coalesce(
      (SELECT jsonb_agg(
        jsonb_build_object('utm_campaign', utm_campaign, 'leads', leads, 'bookings', bookings)
        ORDER BY leads + bookings DESC
      ) FROM by_campaign_top),
      '[]'::jsonb
    ),
    'by_device',
    coalesce((SELECT jsonb_object_agg(device_type, c) FROM by_device), '{}'::jsonb),
    'by_locale',
    coalesce(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'locale', locale,
          'leads', leads,
          'bookings', bookings,
          'calendar_views', calendar_views
        )
        ORDER BY locale
      ) FROM by_locale),
      '[]'::jsonb
    ),
    'latest',
    (SELECT events FROM latest)
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_dashboard_summary(timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_dashboard_summary(timestamptz, text) TO service_role;
