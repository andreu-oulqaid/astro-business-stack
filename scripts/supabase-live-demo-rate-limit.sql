-- Live demo rate limits (run after supabase-live-demo-schema.sql).
-- Advisory lock namespace: app_id=1 (demo), lock_id=1 (global quota).

CREATE TABLE IF NOT EXISTS public.demo_rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_demo_rate_limit_events_ip_created
  ON public.demo_rate_limit_events (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_demo_rate_limit_events_created
  ON public.demo_rate_limit_events (created_at DESC);

CREATE OR REPLACE FUNCTION public.demo_try_consume_quota(
  p_ip_hash text,
  p_ip_max int,
  p_global_max int,
  p_window_minutes int DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_ip_count int;
  v_global_count int;
  v_oldest_ip timestamptz;
  v_oldest_global timestamptz;
BEGIN
  v_window_start := v_now - (p_window_minutes || ' minutes')::interval;

  -- Demo app namespace (1, 1) — isolated from production API locks (2, hashtext(route))
  PERFORM pg_advisory_xact_lock(1, 1);

  SELECT count(*)::int INTO v_global_count
  FROM demo_rate_limit_events
  WHERE created_at >= v_window_start;

  IF v_global_count >= p_global_max THEN
    SELECT min(created_at) INTO v_oldest_global
    FROM demo_rate_limit_events
    WHERE created_at >= v_window_start;
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'global',
      'retry_after_sec', greatest(1, ceil(extract(epoch from (v_oldest_global + (p_window_minutes || ' minutes')::interval - v_now)))::int)
    );
  END IF;

  SELECT count(*)::int INTO v_ip_count
  FROM demo_rate_limit_events
  WHERE ip_hash = p_ip_hash AND created_at >= v_window_start;

  IF v_ip_count >= p_ip_max THEN
    SELECT min(created_at) INTO v_oldest_ip
    FROM demo_rate_limit_events
    WHERE ip_hash = p_ip_hash AND created_at >= v_window_start;
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'ip',
      'retry_after_sec', greatest(1, ceil(extract(epoch from (v_oldest_ip + (p_window_minutes || ' minutes')::interval - v_now)))::int)
    );
  END IF;

  INSERT INTO demo_rate_limit_events (ip_hash, created_at) VALUES (p_ip_hash, v_now);

  IF random() < 0.05 THEN
    DELETE FROM demo_rate_limit_events
    WHERE created_at < (v_now - interval '48 hours');
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_ip_max - (v_ip_count + 1),
    'max', p_ip_max,
    'global_remaining', p_global_max - (v_global_count + 1),
    'global_max', p_global_max
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.demo_quota_status(
  p_ip_hash text,
  p_ip_max int,
  p_global_max int,
  p_window_minutes int DEFAULT 60
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_ip_count int;
  v_global_count int;
BEGIN
  v_window_start := v_now - (p_window_minutes || ' minutes')::interval;

  SELECT count(*)::int INTO v_global_count
  FROM demo_rate_limit_events
  WHERE created_at >= v_window_start;

  SELECT count(*)::int INTO v_ip_count
  FROM demo_rate_limit_events
  WHERE ip_hash = p_ip_hash AND created_at >= v_window_start;

  RETURN jsonb_build_object(
    'remaining', greatest(0, least(p_ip_max - v_ip_count, p_global_max - v_global_count)),
    'max', p_ip_max,
    'global_remaining', greatest(0, p_global_max - v_global_count),
    'global_max', p_global_max
  );
END;
$$;

REVOKE ALL ON FUNCTION public.demo_try_consume_quota(text, int, int, int) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.demo_quota_status(text, int, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.demo_try_consume_quota(text, int, int, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.demo_quota_status(text, int, int, int) TO service_role;
