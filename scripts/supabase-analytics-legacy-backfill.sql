-- One-time: run in Supabase SQL Editor after analytics_events exists and inserts set metadata.env.
-- Tags legacy rows so per-env filters and RPC match real traffic. Safe to re-run (only NULL env rows).
-- Change '"production"' if your historical events should align with another ANALYTICS_ENV label.

UPDATE public.analytics_events
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{env}', '"production"')
WHERE metadata->>'env' IS NULL;
