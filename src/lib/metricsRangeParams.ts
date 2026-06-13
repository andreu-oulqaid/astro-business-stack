export type MetricsRangeParam = '1d' | '7d' | '30d' | '90d';

const RANGE_PARAMS = new Set<MetricsRangeParam>(['1d', '7d', '30d', '90d']);

const RANGE_DAYS: Record<MetricsRangeParam, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const RANGE_LABELS: Record<MetricsRangeParam, string> = {
  '1d': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

const RANGE_SHORT_LABELS: Record<MetricsRangeParam, string> = {
  '1d': '24h',
  '7d': '7d',
  '30d': '30d',
  '90d': '90d',
};

export type ParsedMetricsRange = {
  range: MetricsRangeParam;
  sinceIso: string;
  queryLabel: string;
  shortLabel: string;
};

export function parseMetricsRangeParam(searchParams: URLSearchParams): ParsedMetricsRange {
  const raw = searchParams.get('range');
  const range: MetricsRangeParam =
    raw && RANGE_PARAMS.has(raw as MetricsRangeParam) ? (raw as MetricsRangeParam) : '30d';
  const days = RANGE_DAYS[range];
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  return {
    range,
    sinceIso,
    queryLabel: RANGE_LABELS[range],
    shortLabel: RANGE_SHORT_LABELS[range],
  };
}

export function metricsRangeHref(
  basePath: string,
  filters: { range: MetricsRangeParam; searchParams?: URLSearchParams },
): string {
  const p = new URLSearchParams(filters.searchParams?.toString() ?? '');
  p.set('range', filters.range);
  return `${basePath}?${p.toString()}`;
}

export const METRICS_RANGE_OPTIONS: MetricsRangeParam[] = ['1d', '7d', '30d', '90d'];

export function rangeShortLabel(range: MetricsRangeParam): string {
  return RANGE_SHORT_LABELS[range];
}

export function rangeQueryLabel(range: MetricsRangeParam): string {
  return RANGE_LABELS[range];
}
