-- Seed historical demo pipeline runs (run after supabase-live-demo-schema.sql).
-- Safe to re-run: deletes prior seed rows by fixed UUIDs.

DELETE FROM public.demo_pipeline_runs
WHERE id IN (
  'a1000001-0000-4000-8000-000000000001',
  'a1000001-0000-4000-8000-000000000002',
  'a1000001-0000-4000-8000-000000000003',
  'a1000001-0000-4000-8000-000000000004',
  'a1000001-0000-4000-8000-000000000005',
  'a1000001-0000-4000-8000-000000000006',
  'a1000001-0000-4000-8000-000000000007',
  'a1000001-0000-4000-8000-000000000008',
  'a1000001-0000-4000-8000-000000000009',
  'a1000001-0000-4000-8000-000000000010',
  'a1000001-0000-4000-8000-000000000011',
  'a1000001-0000-4000-8000-000000000012',
  'a1000001-0000-4000-8000-000000000013',
  'a1000001-0000-4000-8000-000000000014',
  'a1000001-0000-4000-8000-000000000015',
  'a1000001-0000-4000-8000-000000000016',
  'a1000001-0000-4000-8000-000000000017',
  'a1000001-0000-4000-8000-000000000018',
  'a1000001-0000-4000-8000-000000000019',
  'a1000001-0000-4000-8000-000000000020'
);

INSERT INTO public.demo_pipeline_runs (id, lead_number, status, failed_step, locale, total_duration_ms, created_at)
VALUES
  ('a1000001-0000-4000-8000-000000000001', 1, 'success', NULL, 'en', 548, now() - interval '6 days'),
  ('a1000001-0000-4000-8000-000000000002', 2, 'success', NULL, 'es', 612, now() - interval '5 days 4 hours'),
  ('a1000001-0000-4000-8000-000000000003', 3, 'success', NULL, 'ca', 489, now() - interval '4 days 12 hours'),
  ('a1000001-0000-4000-8000-000000000004', 4, 'failed', 'notion_crm', 'pl', 312, now() - interval '4 days'),
  ('a1000001-0000-4000-8000-000000000005', 5, 'success', NULL, 'en', 701, now() - interval '3 days 8 hours'),
  ('a1000001-0000-4000-8000-000000000006', 6, 'success', NULL, 'en', 523, now() - interval '3 days'),
  ('a1000001-0000-4000-8000-000000000007', 7, 'success', NULL, 'es', 578, now() - interval '2 days 18 hours'),
  ('a1000001-0000-4000-8000-000000000008', 8, 'failed', 'supabase_analytics', 'en', 145, now() - interval '2 days 6 hours'),
  ('a1000001-0000-4000-8000-000000000009', 9, 'success', NULL, 'ca', 634, now() - interval '2 days'),
  ('a1000001-0000-4000-8000-000000000010', 10, 'success', NULL, 'pl', 501, now() - interval '36 hours'),
  ('a1000001-0000-4000-8000-000000000011', 11, 'success', NULL, 'en', 467, now() - interval '30 hours'),
  ('a1000001-0000-4000-8000-000000000012', 12, 'success', NULL, 'es', 589, now() - interval '24 hours'),
  ('a1000001-0000-4000-8000-000000000013', 13, 'failed', 'notion_crm', 'en', 2789, now() - interval '18 hours'),
  ('a1000001-0000-4000-8000-000000000014', 14, 'success', NULL, 'en', 445, now() - interval '12 hours'),
  ('a1000001-0000-4000-8000-000000000015', 15, 'success', NULL, 'es', 556, now() - interval '8 hours'),
  ('a1000001-0000-4000-8000-000000000016', 16, 'success', NULL, 'en', 498, now() - interval '5 hours'),
  ('a1000001-0000-4000-8000-000000000017', 17, 'success', NULL, 'ca', 612, now() - interval '3 hours'),
  ('a1000001-0000-4000-8000-000000000018', 18, 'success', NULL, 'pl', 534, now() - interval '90 minutes'),
  ('a1000001-0000-4000-8000-000000000019', 19, 'success', NULL, 'en', 471, now() - interval '45 minutes'),
  ('a1000001-0000-4000-8000-000000000020', 20, 'success', NULL, 'es', 603, now() - interval '15 minutes');

SELECT setval(
  'public.demo_lead_number_seq',
  GREATEST((SELECT max(lead_number) FROM public.demo_pipeline_runs), 1)
);

-- Steps for successful runs (template timings)
INSERT INTO public.demo_pipeline_steps (run_id, step_key, status, duration_ms, detail, sort_order)
SELECT r.id, v.step_key, v.status, v.duration_ms, v.detail, v.sort_order
FROM public.demo_pipeline_runs r
CROSS JOIN LATERAL (
  VALUES
    ('validate', 'success', 3, 'Input validated', 1),
    ('supabase_analytics', 'success', (40 + (random() * 80)::int), 'lead_captured row inserted', 2),
    ('notion_crm', 'success', (200 + (random() * 400)::int), 'Notion row created', 3),
    ('resend_notify', 'success', (30 + (random() * 50)::int), 'Notification simulated (no email sent)', 4)
) AS v(step_key, status, duration_ms, detail, sort_order)
WHERE r.status = 'success';

-- Failed run: supabase_analytics failure
INSERT INTO public.demo_pipeline_steps (run_id, step_key, status, duration_ms, detail, sort_order)
VALUES
  ('a1000001-0000-4000-8000-000000000008', 'validate', 'success', 2, 'Input validated', 1),
  ('a1000001-0000-4000-8000-000000000008', 'supabase_analytics', 'failed', 120, 'Insert rejected', 2),
  ('a1000001-0000-4000-8000-000000000008', 'notion_crm', 'skipped', 0, 'Skipped after analytics failure', 3),
  ('a1000001-0000-4000-8000-000000000008', 'resend_notify', 'skipped', 0, 'Skipped after analytics failure', 4);

-- Failed runs: notion_crm failure
INSERT INTO public.demo_pipeline_steps (run_id, step_key, status, duration_ms, detail, sort_order)
VALUES
  ('a1000001-0000-4000-8000-000000000004', 'validate', 'success', 3, 'Input validated', 1),
  ('a1000001-0000-4000-8000-000000000004', 'supabase_analytics', 'success', 87, 'lead_captured row inserted', 2),
  ('a1000001-0000-4000-8000-000000000004', 'notion_crm', 'failed', 2500, 'Notion API timeout', 3),
  ('a1000001-0000-4000-8000-000000000004', 'resend_notify', 'skipped', 0, 'Skipped after Notion failure', 4),
  ('a1000001-0000-4000-8000-000000000013', 'validate', 'success', 2, 'Input validated', 1),
  ('a1000001-0000-4000-8000-000000000013', 'supabase_analytics', 'success', 94, 'lead_captured row inserted', 2),
  ('a1000001-0000-4000-8000-000000000013', 'notion_crm', 'failed', 2680, 'Notion API timeout', 3),
  ('a1000001-0000-4000-8000-000000000013', 'resend_notify', 'skipped', 0, 'Skipped after Notion failure', 4);

INSERT INTO public.demo_analytics_events (run_id, event_type, locale, page_path, device_type, created_at)
SELECT r.id, 'lead_captured', r.locale, '/', 'desktop', r.created_at
FROM public.demo_pipeline_runs r
WHERE r.status = 'success'
   OR r.id IN (
     'a1000001-0000-4000-8000-000000000004',
     'a1000001-0000-4000-8000-000000000008',
     'a1000001-0000-4000-8000-000000000013'
   );
