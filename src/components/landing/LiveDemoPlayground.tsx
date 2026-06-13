import { useCallback, useEffect, useRef, useState } from 'react';

import { TerminalFeed, type FeedLine } from '@/components/ui/marketing/TerminalDemo/TerminalFeed';
import { formatLeadLabel } from '@/lib/liveDemoLabels';

const POLL_INTERVAL_MS = 45_000;
const MIN_STEP_DELAY_MS = 200;
const SPINNER_DELAY_MS = 400;
const TURNSTILE_TIMEOUT_MS = 10_000;
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      size?: 'invisible' | 'normal' | 'compact';
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
    },
  ) => string;
  execute: (widgetId: string) => void;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onTurnstileLoad?: () => void;
  }
}

export type LiveDemoLabels = {
  runButton: string;
  running: string;
  attemptsLeft: string;
  captured: string;
  failed: string;
  avgCaptureTime: string;
  recentActivity: string;
  noActivity: string;
  rateLimited: string;
  pipelineError: string;
  challengeRunning: string;
  captchaFailed: string;
  captchaRequired: string;
    terminal: {
    idle: string;
    checkingQuota: string;
    quotaOk: string;
    quotaDenied: string;
    received: string;
    validatingInput: string;
    validateOk: string;
    writingAnalytics: string;
    supabaseOk: string;
    syncingNotion: string;
    notionOk: string;
    notionFailed: string;
    sendingNotify: string;
    resendOk: string;
    resendSkipped: string;
    runMetadata: string;
    complete: string;
    failed: string;
  };
};

export type LiveDemoLocale = 'en' | 'es' | 'ca' | 'pl';

type DemoStep = {
  stepKey?: string;
  step_key?: string;
  status: string;
  durationMs?: number;
  duration_ms?: number;
  detail: string;
};

type NormalizedStep = {
  key: string;
  status: string;
  durationMs: number;
};

function normalizeStep(step: DemoStep): NormalizedStep {
  return {
    key: step.stepKey ?? step.step_key ?? '',
    status: step.status,
    durationMs: step.durationMs ?? step.duration_ms ?? 0,
  };
}

function pipelineOverheadMs(totalMs: number, steps: NormalizedStep[]): number {
  const stepSum = steps.reduce((sum, step) => sum + step.durationMs, 0);
  return Math.max(0, totalMs - stepSum);
}

function gateDurationFrom(data: PipelineFetchResult['data'], fallbackMs: number): number {
  return typeof data.gateDurationMs === 'number' ? data.gateDurationMs : fallbackMs;
}

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
  captchaEnabled?: boolean;
  turnstileSiteKey?: string;
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

function formatTerminalTimestamp(): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return '';
  }
}

function replaceLastSpinner(lines: FeedLine[], replacement: FeedLine): FeedLine[] {
  const idx = lines.findLastIndex((line) => line.type === 'spinner');
  if (idx === -1) return [...lines, replacement];
  const next = [...lines];
  next[idx] = replacement;
  return next;
}

type PipelineFetchResult = {
  res: Response;
  data: {
    ok: boolean;
    error?: string;
    leadLabel?: string;
    status?: string;
    gateDurationMs?: number;
    totalDurationMs?: number;
    steps?: DemoStep[];
  };
};

type TerminalRunOutcome = 'success' | 'rate_limited' | 'captcha_required' | 'captcha_failed' | 'error';

async function animateSingleStep(
  lines: FeedLine[],
  labels: LiveDemoLabels,
  setFeedLines: (lines: FeedLine[]) => void,
  reduced: boolean,
  spinnerText: string,
  doneLine: FeedLine,
): Promise<FeedLine[]> {
  if (reduced) {
    return [...lines, doneLine];
  }
  const next = [...lines, { text: spinnerText, type: 'spinner' as const }];
  setFeedLines(next);
  await delay(SPINNER_DELAY_MS);
  const resolved = replaceLastSpinner(next, doneLine);
  setFeedLines(resolved);
  await delay(MIN_STEP_DELAY_MS);
  return resolved;
}

async function animatePipelineSteps(
  lines: FeedLine[],
  steps: DemoStep[],
  labels: LiveDemoLabels,
  setFeedLines: (lines: FeedLine[]) => void,
  reduced: boolean,
): Promise<FeedLine[]> {
  let acc = lines;
  const normalized = steps.map(normalizeStep);

  for (const step of normalized) {
    if (step.key === 'validate') {
      acc = await animateSingleStep(
        acc,
        labels,
        setFeedLines,
        reduced,
        labels.terminal.validatingInput,
        {
          text: `✔ ${labels.terminal.validateOk} (${step.durationMs}ms)`,
          type: step.status === 'success' ? 'ok-line' : 'result-line',
        },
      );
      continue;
    }

    if (step.key === 'supabase_analytics') {
      acc = await animateSingleStep(
        acc,
        labels,
        setFeedLines,
        reduced,
        labels.terminal.writingAnalytics,
        {
          text: `✔ ${labels.terminal.supabaseOk} (${step.durationMs}ms)`,
          type: step.status === 'success' ? 'ok-line' : 'result-line',
        },
      );
      continue;
    }

    if (step.key === 'notion_crm') {
      acc = await animateSingleStep(
        acc,
        labels,
        setFeedLines,
        reduced,
        labels.terminal.syncingNotion,
        {
          text:
            step.status === 'success'
              ? `✔ ${labels.terminal.notionOk} (${step.durationMs}ms)`
              : `✘ ${labels.terminal.notionFailed} (${step.durationMs}ms)`,
          type: step.status === 'success' ? 'ok-line' : 'result-line',
        },
      );
      continue;
    }

    if (step.key === 'resend_notify') {
      if (step.status === 'skipped') {
        acc = [...acc, { text: `○ ${labels.terminal.resendSkipped}`, type: 'result-line' }];
        setFeedLines(acc);
        if (!reduced) await delay(MIN_STEP_DELAY_MS);
      } else {
        acc = await animateSingleStep(
          acc,
          labels,
          setFeedLines,
          reduced,
          labels.terminal.sendingNotify,
          {
            text: `✔ ${labels.terminal.resendOk} (${step.durationMs}ms)`,
            type: 'ok-line',
          },
        );
      }
    }
  }

  return acc;
}

async function runTerminalSequence(
  labels: LiveDemoLabels,
  setFeedLines: (lines: FeedLine[]) => void,
  fetchPromise: Promise<PipelineFetchResult>,
): Promise<TerminalRunOutcome> {
  const reduced = prefersReducedMotion();
  const requestStartedAt = performance.now();
  let lines: FeedLine[] = [
    {
      text: `[${formatTerminalTimestamp()}] ${labels.terminal.checkingQuota}`,
      type: 'spinner',
    },
  ];
  setFeedLines(lines);

  const fetchResult = await fetchPromise;
  const requestMs = Math.round(performance.now() - requestStartedAt);
  const gateDoneAt = formatTerminalTimestamp();
  const { res, data } = fetchResult;
  const gateDuration = gateDurationFrom(data, requestMs);

  if (res.status === 429 || data.error === 'rate_limited') {
    lines = replaceLastSpinner(lines, {
      text: `[${gateDoneAt}] ${labels.terminal.quotaDenied} (${gateDuration}ms)`,
      type: 'result-line',
    });
    setFeedLines(lines);
    return 'rate_limited';
  }

  if (!data.ok || !data.steps || !data.leadLabel) {
    const err = data.error;
    if (err === 'captcha_required') {
      lines = replaceLastSpinner(lines, {
        text: `[${gateDoneAt}] ${labels.captchaRequired} (${gateDuration}ms)`,
        type: 'result-line',
      });
      setFeedLines(lines);
      return 'captcha_required';
    }
    if (err === 'captcha_failed') {
      lines = replaceLastSpinner(lines, {
        text: `[${gateDoneAt}] ${labels.captchaFailed} (${gateDuration}ms)`,
        type: 'result-line',
      });
      setFeedLines(lines);
      return 'captcha_failed';
    }
    lines = replaceLastSpinner(lines, {
      text: `[${gateDoneAt}] ${labels.terminal.failed} (${gateDuration}ms)`,
      type: 'result-line',
    });
    setFeedLines(lines);
    return 'error';
  }

  lines = replaceLastSpinner(lines, {
    text: `[${gateDoneAt}] ${labels.terminal.quotaOk} (${gateDuration}ms)`,
    type: 'ok-line',
  });
  lines.push({
    text: `◇ ${labels.terminal.received.replace('{lead}', data.leadLabel)}`,
    type: 'prompt-label',
  });
  setFeedLines([...lines]);
  if (!reduced) await delay(MIN_STEP_DELAY_MS);

  lines = await animatePipelineSteps(lines, data.steps, labels, setFeedLines, reduced);

  const overheadMs = pipelineOverheadMs(data.totalDurationMs ?? 0, data.steps.map(normalizeStep));
  if (overheadMs >= 20) {
    lines.push({
      text: `○ ${labels.terminal.runMetadata.replace('{ms}', String(overheadMs))}`,
      type: 'result-line',
    });
    setFeedLines(lines);
    if (!reduced) await delay(MIN_STEP_DELAY_MS);
  }

  lines.push({
    text:
      data.status === 'success'
        ? `└ ${labels.terminal.complete.replace('{ms}', String(data.totalDurationMs ?? 0))}`
        : `└ ${labels.terminal.failed}`,
    type: data.status === 'success' ? 'outro' : 'result-line',
  });
  setFeedLines(lines);
  return 'success';
}

function formatAvgMs(ms: number | null): string {
  if (ms == null) return 'N/A';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function avgCaptureMs(runs: RecentRun[]): number | null {
  const success = runs.filter((r) => r.status === 'success');
  if (success.length === 0) return null;
  const total = success.reduce((sum, r) => sum + r.total_duration_ms, 0);
  return Math.round(total / success.length);
}

function quotaSlotClass(remaining: number, slotIndex: number): string {
  if (slotIndex >= remaining) {
    return 'bg-foreground-muted/20 dark:bg-foreground-muted/15';
  }
  if (remaining <= 1) return 'bg-error';
  if (remaining <= 3) return 'bg-warning';
  return 'bg-green-600 dark:bg-green-500';
}

function QuotaMeter({
  remaining,
  max,
  label,
  loading,
}: {
  remaining: number | null;
  max: number;
  label: string;
  loading: boolean;
}) {
  if (loading || remaining == null) {
    return (
      <div className="flex w-full flex-col gap-2">
        <p className="text-xs font-medium tabular-nums text-foreground-muted">…</p>
        <div className="flex w-full gap-1.5">
          {Array.from({ length: max }, (_, i) => (
            <div key={i} className="h-2.5 flex-1 rounded-full bg-foreground-muted/15" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-medium tabular-nums text-foreground-muted">{label}</p>
      <div
        className="flex w-full gap-1.5"
        role="img"
        aria-label={label}
      >
        {Array.from({ length: max }, (_, i) => (
          <div
            key={i}
            className={`h-2.5 min-w-0 flex-1 rounded-full transition-colors ${quotaSlotClass(remaining, i)}`}
          />
        ))}
      </div>
    </div>
  );
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + TURNSTILE_TIMEOUT_MS;
      const tick = () => {
        if (window.turnstile) {
          resolve();
          return;
        }
        if (Date.now() > deadline) {
          reject(new Error('turnstile_load_timeout'));
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  return new Promise((resolve, reject) => {
    window.onTurnstileLoad = () => resolve();
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('turnstile_script_error'));
    document.head.appendChild(script);
    setTimeout(() => reject(new Error('turnstile_load_timeout')), TURNSTILE_TIMEOUT_MS);
  });
}

export default function LiveDemoPlayground({
  labels,
  locale,
  captchaEnabled = false,
  turnstileSiteKey,
}: LiveDemoPlaygroundProps) {
  const [running, setRunning] = useState(false);
  const [challenging, setChallenging] = useState(false);
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
  const statsLoadedRef = useRef(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);
  const turnstileTokenRef = useRef<{
    resolve: (token: string) => void;
    reject: (err: Error) => void;
  } | null>(null);
  const turnstileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!captchaEnabled || !turnstileSiteKey || !turnstileContainerRef.current) return;

    let cancelled = false;

    const mountWidget = async () => {
      try {
        await loadTurnstileScript();
        if (cancelled || !turnstileContainerRef.current || !window.turnstile) return;

        if (turnstileWidgetIdRef.current) {
          window.turnstile.remove(turnstileWidgetIdRef.current);
          turnstileWidgetIdRef.current = null;
        }

        turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          size: 'invisible',
          callback: (token) => {
            if (turnstileTimeoutRef.current) {
              clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
            turnstileTokenRef.current?.resolve(token);
            turnstileTokenRef.current = null;
          },
          'error-callback': () => {
            if (turnstileTimeoutRef.current) {
              clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
            turnstileTokenRef.current?.reject(new Error('turnstile_error'));
            turnstileTokenRef.current = null;
          },
          'expired-callback': () => {
            if (turnstileTimeoutRef.current) {
              clearTimeout(turnstileTimeoutRef.current);
              turnstileTimeoutRef.current = null;
            }
            turnstileTokenRef.current?.reject(new Error('turnstile_expired'));
            turnstileTokenRef.current = null;
          },
        });
      } catch {
        // Widget mount errors surface on run attempt
      }
    };

    void mountWidget();

    return () => {
      cancelled = true;
      if (turnstileTimeoutRef.current) clearTimeout(turnstileTimeoutRef.current);
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [captchaEnabled, turnstileSiteKey]);

  const requestTurnstileToken = useCallback(async (): Promise<string> => {
    if (!captchaEnabled || !turnstileSiteKey) {
      throw new Error('captcha_not_configured');
    }

    await loadTurnstileScript();
    if (!window.turnstile || !turnstileWidgetIdRef.current) {
      throw new Error('turnstile_unavailable');
    }

    return new Promise((resolve, reject) => {
      turnstileTokenRef.current = { resolve, reject };
      turnstileTimeoutRef.current = setTimeout(() => {
        turnstileTokenRef.current?.reject(new Error('turnstile_timeout'));
        turnstileTokenRef.current = null;
        turnstileTimeoutRef.current = null;
      }, TURNSTILE_TIMEOUT_MS);

      try {
        window.turnstile!.execute(turnstileWidgetIdRef.current!);
      } catch {
        if (turnstileTimeoutRef.current) clearTimeout(turnstileTimeoutRef.current);
        turnstileTokenRef.current = null;
        reject(new Error('turnstile_execute_failed'));
      }
    });
  }, [captchaEnabled, turnstileSiteKey]);

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
    };
  }, [fetchStats, schedulePoll]);

  const handleRun = async () => {
    setFormError(undefined);

    let captchaToken: string | undefined;

    if (captchaEnabled) {
      setChallenging(true);
      try {
        captchaToken = await requestTurnstileToken();
      } catch {
        setFormError(labels.captchaFailed);
        setChallenging(false);
        return;
      }
      setChallenging(false);
    }

    setRunning(true);
    setFeedLines([]);

    const fetchPromise = fetch('/api/demo/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locale,
        page_path: window.location.pathname,
        company: honeypot,
        ...(captchaToken ? { captcha_token: captchaToken } : {}),
      }),
    }).then(async (res) => ({
      res,
      data: (await res.json()) as PipelineFetchResult['data'],
    }));

    try {
      const outcome = await runTerminalSequence(labels, setFeedLines, fetchPromise);

      if (captchaEnabled && turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }

      if (outcome === 'rate_limited') {
        setFormError(labels.rateLimited);
        await fetchStats();
        return;
      }

      if (outcome === 'captcha_required') {
        setFormError(labels.captchaRequired);
        return;
      }

      if (outcome === 'captcha_failed') {
        setFormError(labels.captchaFailed);
        return;
      }

      if (outcome === 'error') {
        setFormError(labels.pipelineError);
        return;
      }

      await fetchStats();
      schedulePoll();
    } catch {
      if (captchaEnabled && turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.reset(turnstileWidgetIdRef.current);
      }
      setFormError(labels.pipelineError);
      setFeedLines([]);
    } finally {
      setChallenging(false);
      setRunning(false);
    }
  };

  const quotaText =
    !statsLoading && quotaRemaining != null
      ? labels.attemptsLeft
          .replace('{remaining}', String(quotaRemaining))
          .replace('{max}', String(quotaMax))
      : '…';

  const avgMs = avgCaptureMs(recentRuns);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="w-full space-y-5">
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

        {captchaEnabled ? (
          <div ref={turnstileContainerRef} className="hidden" aria-hidden="true" />
        ) : null}

        <div className="w-full rounded-lg border border-border bg-background-secondary/80 px-4 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4 md:flex-row">
            <button
              type="button"
              onClick={() => void handleRun()}
              disabled={running || challenging || statsLoading}
              className="order-2 inline-flex shrink-0 items-center justify-center rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:opacity-60 dark:bg-brand-500 dark:text-white dark:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_4px_16px_-4px_rgba(0,0,0,0.55)] dark:hover:bg-brand-400 md:order-1"
            >
              {challenging ? labels.challengeRunning : running ? labels.running : labels.runButton}
            </button>
            <div className="order-1 min-w-0 flex-1 md:order-2">
              <QuotaMeter
                remaining={quotaRemaining}
                max={quotaMax}
                label={quotaText}
                loading={statsLoading}
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
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
            <div>
              <p className="text-xs font-medium text-foreground-muted">{labels.avgCaptureTime}</p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-foreground">
                {statsLoading ? '…' : formatAvgMs(avgMs)}
              </p>
            </div>
          </div>
          {formError ? <p className="mt-3 border-t border-border pt-3 text-xs text-error">{formError}</p> : null}
          {statsError && !statsLoading ? (
            <p className="mt-3 border-t border-border pt-3 text-xs text-error">{labels.pipelineError}</p>
          ) : null}
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
