-- Run after supabase-analytics-v4-profiles.sql.
-- Multi-site admin hub: site registry listing + cross-site overview RPC.

CREATE INDEX IF NOT EXISTS idx_analytics_events_env_site_created
  ON public.analytics_events (env, site_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 1) List registered sites (hub site picker)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_list_sites()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    jsonb_agg(
      jsonb_build_object(
        'site_id', s.site_id,
        'display_name', coalesce(p.config ->> 'display_name', s.display_name),
        'repo_key', s.repo_key
      )
      ORDER BY coalesce(p.config ->> 'display_name', s.display_name)
    ),
    '[]'::jsonb
  )
  FROM public.analytics_sites s
  LEFT JOIN public.analytics_site_profiles p ON p.site_id = s.site_id
  WHERE s.site_id <> 'unknown';
$$;

REVOKE ALL ON FUNCTION public.analytics_list_sites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_list_sites() TO service_role;

-- ---------------------------------------------------------------------------
-- 2) Cross-site overview (hub "All sites" view)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.analytics_admin_overview(
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
      AND e.site_id <> 'unknown'
      AND (
        p_env IS NULL
        OR trim(p_env) = ''
        OR e.env = p_env
      )
  ),
  per_site_totals AS (
    SELECT
      site_id,
      coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS totals
    FROM (
      SELECT site_id, event_type, count(*)::int AS cnt
      FROM filtered
      GROUP BY site_id, event_type
    ) t
    GROUP BY site_id
  ),
  per_site_unique AS (
    SELECT
      site_id,
      coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS unique_visitors
    FROM (
      SELECT site_id, event_type, count(DISTINCT user_hash)::int AS cnt
      FROM filtered
      GROUP BY site_id, event_type
    ) u
    GROUP BY site_id
  ),
  site_rows AS (
    SELECT
      s.site_id,
      coalesce(p.config ->> 'display_name', s.display_name) AS display_name,
      coalesce(t.totals, '{}'::jsonb) AS totals,
      coalesce(u.unique_visitors, '{}'::jsonb) AS unique_visitors
    FROM public.analytics_sites s
    LEFT JOIN public.analytics_site_profiles p ON p.site_id = s.site_id
    LEFT JOIN per_site_totals t ON t.site_id = s.site_id
    LEFT JOIN per_site_unique u ON u.site_id = s.site_id
    WHERE s.site_id <> 'unknown'
      AND (
        t.totals IS NOT NULL
        OR u.unique_visitors IS NOT NULL
        OR EXISTS (
          SELECT 1 FROM filtered f WHERE f.site_id = s.site_id
        )
      )
  ),
  global_totals AS (
    SELECT coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS by_type
    FROM (
      SELECT event_type, count(*)::int AS cnt
      FROM filtered
      GROUP BY event_type
    ) g
  ),
  global_unique AS (
    SELECT coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS by_type
    FROM (
      SELECT event_type, count(DISTINCT user_hash)::int AS cnt
      FROM filtered
      GROUP BY event_type
    ) gu
  )
  SELECT jsonb_build_object(
    'sites', coalesce(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'site_id', site_id,
          'display_name', display_name,
          'totals', totals,
          'unique_visitors', unique_visitors
        )
        ORDER BY display_name
      ) FROM site_rows),
      '[]'::jsonb
    ),
    'global_totals', coalesce((SELECT by_type FROM global_totals), '{}'::jsonb),
    'global_unique_visitors', coalesce((SELECT by_type FROM global_unique), '{}'::jsonb)
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_admin_overview(timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_admin_overview(timestamptz, text) TO service_role;
