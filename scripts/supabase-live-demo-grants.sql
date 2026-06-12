-- Run once if POST /api/demo/run returns "permission denied for table demo_pipeline_runs".
-- The dashboard RPC works via SECURITY DEFINER; direct inserts need explicit grants.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_pipeline_runs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_pipeline_steps TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demo_analytics_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.demo_lead_number_seq TO service_role;
