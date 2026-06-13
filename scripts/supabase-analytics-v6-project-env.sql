-- Run after supabase-analytics-v5-admin-hub.sql.
-- Canonical project ids (repo_key), env breakdown in aggregates, project-grouped hub overview.

-- ---------------------------------------------------------------------------
-- 1) Backfill legacy hostname site_ids → repo_key
-- ---------------------------------------------------------------------------
UPDATE public.analytics_events e
SET site_id = s.repo_key
FROM public.analytics_sites s
WHERE e.site_id = s.site_id
  AND s.repo_key IS NOT NULL
  AND trim(s.repo_key) <> ''
  AND e.site_id <> s.repo_key;

UPDATE public.analytics_events
SET site_id = 'astro-business-stack'
WHERE site_id IN ('stack.ilurodigital.com', 'stack.andreuog.com');

UPDATE public.analytics_events
SET site_id = 'iluro-prod'
WHERE site_id IN ('test-iluro.ilurodigital.com', 'v1.ilurodigital.com');

-- ---------------------------------------------------------------------------
-- 2) Consolidate analytics_sites registry onto canonical project ids
-- ---------------------------------------------------------------------------
INSERT INTO public.analytics_sites (site_id, display_name, repo_key, updated_at)
SELECT DISTINCT ON (s.repo_key)
  s.repo_key AS site_id,
  coalesce(p.config ->> 'display_name', s.display_name, s.repo_key) AS display_name,
  s.repo_key,
  now()
FROM public.analytics_sites s
LEFT JOIN public.analytics_site_profiles p ON p.site_id = s.site_id
WHERE s.repo_key IS NOT NULL
  AND trim(s.repo_key) <> ''
  AND s.site_id <> 'unknown'
ORDER BY s.repo_key, p.updated_at DESC NULLS LAST
ON CONFLICT (site_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  repo_key = EXCLUDED.repo_key,
  updated_at = now();

INSERT INTO public.analytics_site_profiles (site_id, profile_version, config, repo_profile_hash, updated_at)
SELECT DISTINCT ON (s.repo_key)
  s.repo_key AS site_id,
  p.profile_version,
  p.config,
  p.repo_profile_hash,
  now()
FROM public.analytics_sites s
JOIN public.analytics_site_profiles p ON p.site_id = s.site_id
WHERE s.repo_key IS NOT NULL
  AND trim(s.repo_key) <> ''
  AND s.site_id <> s.repo_key
ORDER BY s.repo_key, p.updated_at DESC
ON CONFLICT (site_id) DO NOTHING;

DELETE FROM public.analytics_site_profiles
WHERE site_id IN (
  SELECT site_id FROM public.analytics_sites
  WHERE repo_key IS NOT NULL
    AND site_id <> repo_key
    AND site_id <> 'unknown'
);

DELETE FROM public.analytics_sites
WHERE repo_key IS NOT NULL
  AND site_id <> repo_key
  AND site_id <> 'unknown';

-- ---------------------------------------------------------------------------
-- 3) analytics_aggregate_metrics — add by_env when p_env is open (all envs)
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
  by_env jsonb := '{}'::jsonb;
  v_site_id text := nullif(trim(p_site_id), '');
  v_env text := nullif(trim(p_env), '');
  env_row record;
  slice jsonb;
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
        v_env IS NULL
        OR e.env = v_env
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
           conversion_delta_seconds, page_path, env
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
        'page_path', page_path,
        'env', env
      ) ORDER BY created_at DESC) FROM latest_rows),
      '[]'::jsonb
    )
  )
  INTO result;

  IF v_env IS NULL THEN
    FOR env_row IN
      SELECT DISTINCT e.env
      FROM public.analytics_events e
      WHERE e.created_at >= p_since
        AND e.site_id = v_site_id
        AND (
          p_event_types IS NULL
          OR cardinality(p_event_types) = 0
          OR e.event_type = ANY (p_event_types)
        )
      ORDER BY e.env
    LOOP
      slice := public.analytics_aggregate_metrics(
        p_since,
        v_site_id,
        env_row.env,
        p_event_types
      );
      IF slice ? 'by_env' THEN
        slice := slice - 'by_env';
      END IF;
      by_env := by_env || jsonb_build_object(env_row.env, slice);
    END LOOP;
    result := result || jsonb_build_object('by_env', by_env);
  END IF;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.analytics_aggregate_metrics(timestamptz, text, text, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_aggregate_metrics(timestamptz, text, text, text[]) TO service_role;

-- ---------------------------------------------------------------------------
-- 4) analytics_admin_overview — group by project (repo_key)
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
  v_env text := nullif(trim(p_env), '');
BEGIN
  WITH filtered AS (
    SELECT
      e.*,
      coalesce(nullif(trim(s.repo_key), ''), e.site_id) AS project_id
    FROM public.analytics_events e
    LEFT JOIN public.analytics_sites s ON s.site_id = e.site_id
    WHERE e.created_at >= p_since
      AND e.site_id <> 'unknown'
      AND (
        v_env IS NULL
        OR e.env = v_env
      )
  ),
  per_project_totals AS (
    SELECT
      project_id,
      coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS totals
    FROM (
      SELECT project_id, event_type, count(*)::int AS cnt
      FROM filtered
      GROUP BY project_id, event_type
    ) t
    GROUP BY project_id
  ),
  per_project_unique AS (
    SELECT
      project_id,
      coalesce(jsonb_object_agg(event_type, cnt), '{}'::jsonb) AS unique_visitors
    FROM (
      SELECT project_id, event_type, count(DISTINCT user_hash)::int AS cnt
      FROM filtered
      GROUP BY project_id, event_type
    ) u
    GROUP BY project_id
  ),
  project_rows AS (
    SELECT
      p.project_id AS site_id,
      coalesce(
        prof.config ->> 'display_name',
        reg.display_name,
        p.project_id
      ) AS display_name,
      coalesce(reg.repo_key, p.project_id) AS repo_key,
      coalesce(t.totals, '{}'::jsonb) AS totals,
      coalesce(u.unique_visitors, '{}'::jsonb) AS unique_visitors
    FROM (SELECT DISTINCT project_id FROM filtered) p
    LEFT JOIN public.analytics_sites reg ON reg.site_id = p.project_id
    LEFT JOIN public.analytics_site_profiles prof ON prof.site_id = p.project_id
    LEFT JOIN per_project_totals t ON t.project_id = p.project_id
    LEFT JOIN per_project_unique u ON u.project_id = p.project_id
    UNION
    SELECT
      s.site_id,
      coalesce(prof.config ->> 'display_name', s.display_name, s.site_id) AS display_name,
      coalesce(s.repo_key, s.site_id) AS repo_key,
      coalesce(t.totals, '{}'::jsonb) AS totals,
      coalesce(u.unique_visitors, '{}'::jsonb) AS unique_visitors
    FROM public.analytics_sites s
    LEFT JOIN public.analytics_site_profiles prof ON prof.site_id = s.site_id
    LEFT JOIN per_project_totals t ON t.project_id = s.site_id
    LEFT JOIN per_project_unique u ON u.project_id = s.site_id
    WHERE s.site_id <> 'unknown'
      AND NOT EXISTS (SELECT 1 FROM filtered f WHERE f.project_id = s.site_id)
      AND (t.totals IS NOT NULL OR u.unique_visitors IS NOT NULL)
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
          'repo_key', repo_key,
          'totals', totals,
          'unique_visitors', unique_visitors
        )
        ORDER BY display_name
      ) FROM project_rows WHERE totals <> '{}'::jsonb OR unique_visitors <> '{}'::jsonb),
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
