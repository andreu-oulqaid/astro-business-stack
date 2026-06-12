-- Live demo sandbox schema (separate Supabase project from production analytics).
-- Run in the demo Supabase SQL editor, then run supabase-live-demo-seed.sql.
-- Runs are identified only by lead_number (lead1, lead2, …) — no PII stored.

CREATE SEQUENCE IF NOT EXISTS public.demo_lead_number_seq START 1;

CREATE TABLE IF NOT EXISTS public.demo_pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_number integer NOT NULL UNIQUE DEFAULT nextval('public.demo_lead_number_seq'),
  status text NOT NULL CHECK (status IN ('success', 'failed')),
  failed_step text,
  locale text NOT NULL DEFAULT 'en',
  total_duration_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_pipeline_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.demo_pipeline_runs (id) ON DELETE CASCADE,
  step_key text NOT NULL CHECK (
    step_key IN ('validate', 'supabase_analytics', 'notion_crm', 'resend_notify')
  ),
  status text NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
  duration_ms integer NOT NULL DEFAULT 0,
  detail text NOT NULL DEFAULT '',
  sort_order smallint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.demo_analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES public.demo_pipeline_runs (id) ON DELETE CASCADE,
  event_type text NOT NULL DEFAULT 'lead_captured',
  locale text NOT NULL DEFAULT 'en',
  page_path text NOT NULL DEFAULT '/',
  device_type text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_pipeline_runs_created_at
  ON public.demo_pipeline_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_pipeline_runs_lead_number
  ON public.demo_pipeline_runs (lead_number DESC);

CREATE INDEX IF NOT EXISTS idx_demo_pipeline_steps_run_id
  ON public.demo_pipeline_steps (run_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_demo_analytics_events_run_id
  ON public.demo_analytics_events (run_id);

ALTER TABLE public.demo_pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_pipeline_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_analytics_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.demo_dashboard_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  WITH totals AS (
    SELECT
      count(*) FILTER (WHERE status = 'success')::int AS captured,
      count(*) FILTER (WHERE status = 'failed')::int AS failed
    FROM demo_pipeline_runs
  ),
  recent AS (
    SELECT
      r.id,
      r.lead_number,
      r.status,
      r.failed_step,
      r.total_duration_ms,
      r.created_at,
      coalesce(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'step_key', s.step_key,
              'status', s.status,
              'duration_ms', s.duration_ms,
              'detail', s.detail
            )
            ORDER BY s.sort_order
          )
          FROM demo_pipeline_steps s
          WHERE s.run_id = r.id
        ),
        '[]'::jsonb
      ) AS steps
    FROM demo_pipeline_runs r
    ORDER BY r.lead_number DESC
    LIMIT 15
  )
  SELECT jsonb_build_object(
    'totals',
    (SELECT jsonb_build_object('captured', captured, 'failed', failed) FROM totals),
    'recent_runs',
    coalesce(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'lead_number', lead_number,
          'status', status,
          'failed_step', failed_step,
          'total_duration_ms', total_duration_ms,
          'created_at', created_at,
          'steps', steps
        )
        ORDER BY lead_number DESC
      ) FROM recent),
      '[]'::jsonb
    )
  )
  INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.demo_dashboard_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.demo_dashboard_summary() TO service_role;

-- PostgREST inserts use service_role JWT (RLS enabled, no policies — grants required)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_pipeline_runs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_pipeline_steps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_analytics_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.demo_lead_number_seq TO service_role;
