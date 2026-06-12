import { DEMO_NOTION_API_KEY, DEMO_NOTION_DATABASE_ID } from 'astro:env/server';
import { Client } from '@notionhq/client';

import { detectDevice } from '@/lib/analyticsUtils';
import { getDemoSupabaseAdmin } from '@/lib/demoSupabase';
import { formatLeadLabel, leadInternalEmail, leadInternalName } from '@/lib/liveDemoLabels';
import { createLeadInNotion, type LeadInput } from '@/lib/notionLeads';

export type DemoStepKey = 'validate' | 'supabase_analytics' | 'notion_crm' | 'resend_notify';

export type DemoStepResult = {
  stepKey: DemoStepKey;
  status: 'success' | 'failed' | 'skipped';
  durationMs: number;
  detail: string;
};

export type DemoRunResult = {
  runId: string;
  leadNumber: number;
  leadLabel: string;
  status: 'success' | 'failed';
  failedStep?: DemoStepKey;
  totalDurationMs: number;
  steps: DemoStepResult[];
};

export type DemoRunInput = {
  locale: 'en' | 'es' | 'ca' | 'pl';
  pagePath: string;
  userAgent: string | null;
};

const NOTION_TIMEOUT_MS = 2500;

function elapsed(start: number): number {
  return Math.max(0, Math.round(performance.now() - start));
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    }),
  ]);
}

async function insertStep(
  runId: string,
  step: DemoStepResult,
  sortOrder: number,
): Promise<void> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) return;
  await supabase.from('demo_pipeline_steps').insert({
    run_id: runId,
    step_key: step.stepKey,
    status: step.status,
    duration_ms: step.durationMs,
    detail: step.detail,
    sort_order: sortOrder,
  });
}

async function finalizeRun(
  runId: string,
  status: 'success' | 'failed',
  failedStep: DemoStepKey | null,
  totalDurationMs: number,
): Promise<void> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) return;
  await supabase
    .from('demo_pipeline_runs')
    .update({
      status,
      failed_step: failedStep,
      total_duration_ms: totalDurationMs,
    })
    .eq('id', runId);
}

export async function runLiveDemoPipeline(input: DemoRunInput): Promise<DemoRunResult> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) {
    throw new Error('Demo Supabase not configured');
  }

  const pipelineStart = performance.now();
  const steps: DemoStepResult[] = [];
  let sortOrder = 0;
  let failedStep: DemoStepKey | undefined;

  const deviceType = detectDevice(input.userAgent);

  const { data: runRow, error: runError } = await supabase
    .from('demo_pipeline_runs')
    .insert({
      status: 'failed',
      locale: input.locale,
      total_duration_ms: 0,
    })
    .select('id, lead_number')
    .single();

  if (runError || !runRow?.id || runRow.lead_number == null) {
    throw new Error(runError?.message ?? 'Failed to create demo run');
  }

  const runId = runRow.id as string;
  const leadNumber = runRow.lead_number as number;
  const leadLabel = formatLeadLabel(leadNumber);

  const pushStep = async (step: DemoStepResult): Promise<boolean> => {
    sortOrder += 1;
    steps.push(step);
    await insertStep(runId, step, sortOrder);
    if (step.status === 'failed') {
      failedStep = step.stepKey;
      return false;
    }
    return true;
  };

  // 1. validate
  const validateStart = performance.now();
  const validateStep: DemoStepResult = {
    stepKey: 'validate',
    status: 'success',
    durationMs: elapsed(validateStart),
    detail: 'Input validated',
  };
  if (!(await pushStep(validateStep))) {
    await finalizeRun(runId, 'failed', failedStep ?? null, elapsed(pipelineStart));
    return {
      runId,
      leadNumber,
      leadLabel,
      status: 'failed',
      failedStep,
      totalDurationMs: elapsed(pipelineStart),
      steps,
    };
  }

  // 2. supabase_analytics
  const analyticsStart = performance.now();
  const { error: analyticsError } = await supabase.from('demo_analytics_events').insert({
    run_id: runId,
    event_type: 'lead_captured',
    locale: input.locale,
    page_path: input.pagePath,
    device_type: deviceType,
  });

  const analyticsOk = !analyticsError;
  const analyticsStep: DemoStepResult = {
    stepKey: 'supabase_analytics',
    status: analyticsOk ? 'success' : 'failed',
    durationMs: elapsed(analyticsStart),
    detail: analyticsOk ? 'lead_captured row inserted' : (analyticsError?.message ?? 'Insert failed'),
  };
  if (!(await pushStep(analyticsStep))) {
    await finalizeRun(runId, 'failed', failedStep ?? null, elapsed(pipelineStart));
    return {
      runId,
      leadNumber,
      leadLabel,
      status: 'failed',
      failedStep,
      totalDurationMs: elapsed(pipelineStart),
      steps,
    };
  }

  // 3. notion_crm
  const notionStart = performance.now();
  let notionStep: DemoStepResult;

  const notionKey = DEMO_NOTION_API_KEY;
  const notionDbId = DEMO_NOTION_DATABASE_ID;

  if (!notionKey || !notionDbId) {
    notionStep = {
      stepKey: 'notion_crm',
      status: 'failed',
      durationMs: elapsed(notionStart),
      detail: 'Demo Notion not configured',
    };
  } else {
    const lead: LeadInput = {
      name: leadInternalName(leadNumber),
      email: leadInternalEmail(leadNumber),
      locale: input.locale,
    };
    try {
      const notion = new Client({ auth: notionKey });
      const result = await withTimeout(
        createLeadInNotion(notion, notionDbId, lead, { source: 'live-demo' }, 'Leads'),
        NOTION_TIMEOUT_MS,
        'Notion',
      );
      notionStep = {
        stepKey: 'notion_crm',
        status: result.ok ? 'success' : 'failed',
        durationMs: elapsed(notionStart),
        detail: result.ok ? 'Notion row created' : 'Notion write failed',
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Notion error';
      notionStep = {
        stepKey: 'notion_crm',
        status: 'failed',
        durationMs: elapsed(notionStart),
        detail: msg.includes('timeout') ? 'Notion API timeout' : msg,
      };
    }
  }

  if (!(await pushStep(notionStep))) {
    const skipped: DemoStepResult = {
      stepKey: 'resend_notify',
      status: 'skipped',
      durationMs: 0,
      detail: 'Skipped after Notion failure',
    };
    await pushStep(skipped);
    await finalizeRun(runId, 'failed', failedStep ?? null, elapsed(pipelineStart));
    return {
      runId,
      leadNumber,
      leadLabel,
      status: 'failed',
      failedStep,
      totalDurationMs: elapsed(pipelineStart),
      steps,
    };
  }

  // 4. resend_notify (simulated)
  const resendStart = performance.now();
  await new Promise((r) => setTimeout(r, 40 + Math.floor(Math.random() * 40)));
  const resendStep: DemoStepResult = {
    stepKey: 'resend_notify',
    status: 'success',
    durationMs: elapsed(resendStart),
    detail: 'Notification simulated (no email sent)',
  };
  await pushStep(resendStep);

  const totalDurationMs = elapsed(pipelineStart);
  await finalizeRun(runId, 'success', null, totalDurationMs);

  return { runId, leadNumber, leadLabel, status: 'success', totalDurationMs, steps };
}

export type DemoDashboardSummary = {
  totals: { captured: number; failed: number };
  recent_runs: Array<{
    id: string;
    lead_number: number;
    status: string;
    failed_step: string | null;
    total_duration_ms: number;
    created_at: string;
    steps: Array<{
      step_key: string;
      status: string;
      duration_ms: number;
      detail: string;
    }>;
  }>;
};

export async function fetchDemoDashboardSummary(): Promise<DemoDashboardSummary | null> {
  const supabase = getDemoSupabaseAdmin();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc('demo_dashboard_summary');
  if (error || !data) {
    console.error('[liveDemo] dashboard summary error:', error?.message);
    return null;
  }
  return data as DemoDashboardSummary;
}
