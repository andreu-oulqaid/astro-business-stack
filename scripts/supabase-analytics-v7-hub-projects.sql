-- Run after supabase-analytics-v6-project-env.sql.
-- Hub project deduplication: one registry row per repo_key, fixed list_sites + overview RPCs.

-- ---------------------------------------------------------------------------
-- 1) Idempotent event + registry cleanup (re-run safe)
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
    AND trim(repo_key) <> ''
    AND site_id <> repo_key
    AND site_id <> 'unknown'
);

DELETE FROM public.analytics_sites
WHERE repo_key IS NOT NULL
  AND trim(repo_key) <> ''
  AND site_id <> repo_key
  AND site_id <> 'unknown';

-- Known hostname aliases without repo_key set
DELETE FROM public.analytics_site_profiles
WHERE site_id IN (
  'stack.ilurodigital.com',
  'stack.andreuog.com',
  'test-iluro.ilurodigital.com',
  'v1.ilurodigital.com'
);

DELETE FROM public.analytics_sites
WHERE site_id IN (
  'stack.ilurodigital.com',
  'stack.andreuog.com',
  'test-iluro.ilurodigital.com',
  'v1.ilurodigital.com'
);

-- ---------------------------------------------------------------------------
-- 2) Integrity helpers
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_sites_repo_key_unique
  ON public.analytics_sites (repo_key)
  WHERE repo_key IS NOT NULL AND trim(repo_key) <> '';

DROP VIEW IF EXISTS public.analytics_project_envs;

CREATE VIEW public.analytics_project_envs
WITH (security_invoker = true) AS
SELECT DISTINCT
  e.site_id AS project_id,
  e.env
FROM public.analytics_events e
WHERE e.site_id <> 'unknown';

REVOKE ALL ON public.analytics_project_envs FROM PUBLIC;
GRANT SELECT ON public.analytics_project_envs TO service_role;

-- ---------------------------------------------------------------------------
-- 3) analytics_list_sites — one row per project (canonical site_id = repo_key)
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
        'site_id', project_id,
        'display_name', display_name,
        'repo_key', project_id
      )
      ORDER BY display_name
    ),
    '[]'::jsonb
  )
  FROM (
    SELECT DISTINCT ON (project_id)
      project_id,
      display_name
    FROM (
      SELECT
        coalesce(nullif(trim(s.repo_key), ''), s.site_id) AS project_id,
        coalesce(p.config ->> 'display_name', s.display_name, s.site_id) AS display_name,
        p.updated_at
      FROM public.analytics_sites s
      LEFT JOIN public.analytics_site_profiles p ON p.site_id = s.site_id
      WHERE s.site_id <> 'unknown'
    ) ranked
    ORDER BY project_id, updated_at DESC NULLS LAST
  ) projects;
$$;

REVOKE ALL ON FUNCTION public.analytics_list_sites() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.analytics_list_sites() TO service_role;

-- ---------------------------------------------------------------------------
-- 4) analytics_admin_overview — events-only project rows (no registry UNION)
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
      p.project_id AS repo_key,
      coalesce(t.totals, '{}'::jsonb) AS totals,
      coalesce(u.unique_visitors, '{}'::jsonb) AS unique_visitors
    FROM (SELECT DISTINCT project_id FROM filtered) p
    LEFT JOIN public.analytics_sites reg ON reg.site_id = p.project_id
    LEFT JOIN public.analytics_site_profiles prof ON prof.site_id = p.project_id
    LEFT JOIN per_project_totals t ON t.project_id = p.project_id
    LEFT JOIN per_project_unique u ON u.project_id = p.project_id
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
