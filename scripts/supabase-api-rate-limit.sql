-- Production API rate limits (run on analytics Supabase after supabase-analytics-base.sql).
-- Advisory lock namespace: app_id=2 (production APIs), lock_id=hashtext(route).

CREATE TABLE IF NOT EXISTS public.api_rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text NOT NULL,
  ip_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limit_events_route_ip_created
  ON public.api_rate_limit_events (route, ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_rate_limit_events_route_created
  ON public.api_rate_limit_events (route, created_at DESC);

CREATE OR REPLACE FUNCTION public.api_try_consume_quota(
  p_route text,
  p_ip_hash text,
  p_max int,
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
  v_oldest_ip timestamptz;
BEGIN
  v_window_start := v_now - (p_window_minutes || ' minutes')::interval;

  -- Production API namespace (2, route hash) — isolated from demo locks (1, 1)
  PERFORM pg_advisory_xact_lock(2, hashtext(p_route));

  SELECT count(*)::int INTO v_ip_count
  FROM api_rate_limit_events
  WHERE route = p_route AND ip_hash = p_ip_hash AND created_at >= v_window_start;

  IF v_ip_count >= p_max THEN
    SELECT min(created_at) INTO v_oldest_ip
    FROM api_rate_limit_events
    WHERE route = p_route AND ip_hash = p_ip_hash AND created_at >= v_window_start;
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'ip',
      'retry_after_sec', greatest(1, ceil(extract(epoch from (v_oldest_ip + (p_window_minutes || ' minutes')::interval - v_now)))::int)
    );
  END IF;

  INSERT INTO api_rate_limit_events (route, ip_hash, created_at) VALUES (p_route, p_ip_hash, v_now);

  IF random() < 0.05 THEN
    DELETE FROM api_rate_limit_events
    WHERE created_at < (v_now - interval '48 hours');
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', p_max - (v_ip_count + 1),
    'max', p_max
  );
END;
$$;

REVOKE ALL ON FUNCTION public.api_try_consume_quota(text, text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.api_try_consume_quota(text, text, int, int) TO service_role;

ALTER TABLE public.api_rate_limit_events ENABLE ROW LEVEL SECURITY;
