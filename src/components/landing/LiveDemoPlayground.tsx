import { useCallback, useEffect, useRef, useState } from 'react';

import { TerminalFeed, type FeedLine } from '@/components/ui/marketing/TerminalDemo/TerminalFeed';
import { formatLeadLabel } from '@/lib/liveDemoLabels';

const POLL_INTERVAL_MS = 45_000;
const MIN_STEP_DELAY_MS = 200;
const SPINNER_DELAY_MS = 400;

export type LiveDemoLabels = {
  runButton: string;
  running: string;
  attemptsLeft: string;
  captured: string;
  failed: string;
  recentActivity: string;
  noActivity: string;
  rateLimited: string;
  pipelineError: string;
  terminal: {
    idle: string;
    received: string;
    writingAnalytics: string;
    supabaseOk: string;
    syncingNotion: string;
    notionOk: string;
    notionFailed: string;
    sendingNotify: string;
    resendOk: string;
    resendSkipped: string;
    complete: string;
    failed: string;
  };
};

export type LiveDemoLocale = 'en' | 'es' | 'ca' | 'pl';

type DemoStep = {
  stepKey: string;
  status: string;
  durationMs: number;
  detail: string;
};

type RecentRun = {
  id: string;
  lead_number: number;
  status: string;
  total_duration_ms: number;
  created_at: string;
};

type StatsResponse = {
  ok: boolean;
  totals?: { captured: number; failed: number };
  recent_runs?: RecentRun[];
  quota?: { remaining: number; max: number };
};

export type LiveDemoPlaygroundProps = {
  labels: LiveDemoLabels;
  locale: LiveDemoLocale;
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stepsToFeedLines(
  leadLabel: string,
  steps: DemoStep[],
  totalMs: number,
  status: string,
  labels: LiveDemoLabels,
): FeedLine[] {
  const lines: FeedLine[] = [
    { text: `◇ ${labels.terminal.received.replace('{lead}', leadLabel)}`, type: 'prompt-label' },
  ];

  for (const step of steps) {
    if (step.stepKey === 'validate') continue;

    if (step.stepKey === 'supabase_analytics') {
      lines.push({ text: labels.terminal.writingAnalytics, type: 'spinner' });
      lines.push({
        text: `✔ ${labels.terminal.supabaseOk} (${step.durationMs}ms)`,
        type: step.status === 'success' ? 'ok-line' : 'result-line',
      });
    }

    if (step.stepKey === 'notion_crm') {
      lines.push({ text: labels.terminal.syncingNotion, type: 'spinner' });
      lines.push({
        text:
          step.status === 'success'
            ? `✔ ${labels.terminal.notionOk} (${step.durationMs}ms)`
            : `✘ ${labels.terminal.notionFailed} (${step.durationMs}ms)`,
        type: step.status === 'success' ? 'ok-line' : 'result-line',
      });
    }

    if (step.stepKey === 'resend_notify') {
      if (step.status === 'skipped') {
        lines.push({ text: `○ ${labels.terminal.resendSkipped}`, type: 'result-line' });
      } else {
        lines.push({ text: labels.terminal.sendingNotify, type: 'spinner' });
        lines.push({
          text: `✔ ${labels.terminal.resendOk} (${step.durationMs}ms)`,
          type: 'ok-line',
        });
      }
    }
  }

  if (status === 'success') {
    lines.push({
      text: `└ ${labels.terminal.complete.replace('{ms}', String(totalMs))}`,
      type: 'outro',
    });
  } else {
    lines.push({
      text: `└ ${labels.terminal.failed}`,
      type: 'result-line',
    });
  }

  return lines;
}

async function animateFeedLines(
  lines: FeedLine[],
  setFeedLines: (lines: FeedLine[]) => void,
): Promise<void> {
  const acc: FeedLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    acc.push(lines[i]);
    setFeedLines([...acc]);

    if (i >= lines.length - 1) break;

    const line = lines[i];
    const next = lines[i + 1];
    let waitMs = MIN_STEP_DELAY_MS;

    if (line.type === 'spinner') {
      waitMs = SPINNER_DELAY_MS;
    } else if (next.type === 'spinner') {
      waitMs = 280;
    }

    await delay(waitMs);
  }
}

export default function LiveDemoPlayground({ labels, locale }: LiveDemoPlaygroundProps) {
  const [running, setRunning] = useState(false);
  const [feedLines, setFeedLines] = useState<FeedLine[]>([]);
  const [captured, setCaptured] = useState(0);
  const [failed, setFailed] = useState(0);
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [formError, setFormError] = useState<string | undefined>();
  const [honeypot, setHoneypot] = useState('');
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [quotaMax, setQuotaMax] = useState(5);

  const fetchInFlight = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const statsLoadedRef = useRef(false);

  const clearProgressTimers = useCallback(() => {
    for (const id of progressTimersRef.current) {
      clearTimeout(id);
    }
    progressTimersRef.current = [];
  }, []);

  const scheduleProgress = useCallback((ms: number, fn: () => void) => {
    const id = setTimeout(fn, ms);
    progressTimersRef.current.push(id);
  }, []);

  const startOptimisticProgress = useCallback(() => {
    clearProgressTimers();
    setFeedLines([
      { text: `◇ ${labels.terminal.received.replace('{lead}', '…')}`, type: 'prompt-label' },
    ]);

    if (prefersReducedMotion()) return;

    scheduleProgress(350, () => {
      setFeedLines((prev) => [...prev, { text: labels.terminal.writingAnalytics, type: 'spinner' }]);
    });
    scheduleProgress(800, () => {
      setFeedLines((prev) => [...prev, { text: labels.terminal.syncingNotion, type: 'spinner' }]);
    });
    scheduleProgress(1250, () => {
      setFeedLines((prev) => [...prev, { text: labels.terminal.sendingNotify, type: 'spinner' }]);
    });
  }, [clearProgressTimers, labels, scheduleProgress]);

  const applyStats = useCallback((data: StatsResponse) => {
    if (!data.ok) return false;
    if (data.totals) {
      setCaptured(data.totals.captured);
      setFailed(data.totals.failed);
    }
    if (data.recent_runs) {
      setRecentRuns(data.recent_runs);
    }
    if (data.quota) {
      setQuotaRemaining(data.quota.remaining);
      setQuotaMax(data.quota.max);
    }
    return true;
  }, []);

  const fetchStats = useCallback(async (): Promise<void> => {
    if (fetchInFlight.current) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    fetchInFlight.current = true;
    try {
      const res = await fetch('/api/demo/stats');
      const data = (await res.json()) as StatsResponse;
      const ok = res.ok && applyStats(data);
      if (ok) {
        statsLoadedRef.current = true;
        setStatsError(false);
      } else if (!statsLoadedRef.current) {
        setStatsError(true);
      }
    } catch {
      if (!statsLoadedRef.current) {
        setStatsError(true);
      }
    } finally {
      setStatsLoading(false);
      fetchInFlight.current = false;
    }
  }, [applyStats]);

  const schedulePoll = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

    pollTimerRef.current = setTimeout(() => {
      void fetchStats().finally(() => schedulePoll());
    }, POLL_INTERVAL_MS);
  }, [fetchStats]);

  useEffect(() => {
    void fetchStats().then(() => schedulePoll());

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      } else {
        void fetchStats().then(() => schedulePoll());
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      clearProgressTimers();
    };
  }, [fetchStats, schedulePoll, clearProgressTimers]);

  const handleRun = async () => {
    setFormError(undefined);
    setRunning(true);
    startOptimisticProgress();

    try {
      const res = await fetch('/api/demo/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale,
          page_path: window.location.pathname,
          company: honeypot,
        }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        leadLabel?: string;
        status?: string;
        totalDurationMs?: number;
        steps?: DemoStep[];
      };

      clearProgressTimers();

      if (res.status === 429) {
        setFormError(labels.rateLimited);
        setFeedLines([]);
        await fetchStats();
        return;
      }

      if (!data.ok || !data.steps || !data.leadLabel) {
        setFormError(data.error === 'rate_limited' ? labels.rateLimited : labels.pipelineError);
        setFeedLines([]);
        return;
      }

      const finalLines = stepsToFeedLines(
        data.leadLabel,
        data.steps,
        data.totalDurationMs ?? 0,
        data.status ?? 'failed',
        labels,
      );

      if (prefersReducedMotion()) {
        setFeedLines(finalLines);
      } else {
        setFeedLines([]);
        await animateFeedLines(finalLines, setFeedLines);
      }

      await fetchStats();
      schedulePoll();
    } catch {
      clearProgressTimers();
      setFormError(labels.pipelineError);
      setFeedLines([]);
    } finally {
      setRunning(false);
    }
  };

  const quotaText =
    !statsLoading && quotaRemaining != null
      ? labels.attemptsLeft
          .replace('{remaining}', String(quotaRemaining))
          .replace('{max}', String(quotaMax))
      : '…';

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="space-y-5">
        <div className="hidden" aria-hidden="true">
          <label htmlFor="live-demo-company">Company</label>
          <input
            id="live-demo-company"
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => void handleRun()}
          disabled={running || statsLoading}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2.5 text-sm font-semibold text-on-brand transition hover:bg-brand-600 disabled:opacity-60"
        >
          {running ? labels.running : labels.runButton}
        </button>

        {formError ? <p className="text-xs text-error">{formError}</p> : null}

        {statsError && !statsLoading ? (
          <p className="text-xs text-error">{labels.pipelineError}</p>
        ) : null}

        <div className="rounded-lg border border-border bg-background-secondary/80 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs font-medium tabular-nums text-foreground-muted">{quotaText}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs font-medium text-foreground-muted">{labels.captured}</p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-green-700 dark:text-green-400">
                {statsLoading ? '…' : captured}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground-muted">{labels.failed}</p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-error">
                {statsLoading ? '…' : failed}
              </p>
            </div>
          </div>
        </div>

        <ul className="max-h-28 space-y-1 overflow-y-auto text-xs text-foreground-muted sm:max-h-40 sm:space-y-2 lg:max-h-48">
            {statsLoading ? (
              <li className="rounded border border-border px-2 py-1 text-foreground-muted sm:py-1.5">…</li>
            ) : recentRuns.length === 0 ? (
              <li className="rounded border border-border px-2 py-1 sm:py-1.5">{labels.noActivity}</li>
            ) : (
              recentRuns.map((run) => (
                <li
                  key={run.id}
                  className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1 sm:py-1.5"
                >
                  <span className="truncate font-mono font-medium text-foreground">
                    {formatLeadLabel(run.lead_number)}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatTime(run.created_at)} ·{' '}
                    <span className={run.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-error'}>
                      {run.status}
                    </span>
                    <span className="hidden sm:inline"> · {run.total_duration_ms}ms</span>
                  </span>
                </li>
              ))
            )}
        </ul>
      </div>

      <TerminalFeed lines={feedLines} chromeLabel="pipeline" idleHint={labels.terminal.idle} />
    </div>
  );
}
