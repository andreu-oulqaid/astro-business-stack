import { EVENT_TYPE_LABELS } from '@/lib/metricsModules';

export type KpiItem = {
  label: string;
  value: number | string;
  secondary?: string;
};

export function kpiItemsFromTotals(
  totals: Record<string, number>,
  uniqueVisitors: Record<string, number> = {},
): KpiItem[] {
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      label: EVENT_TYPE_LABELS[key] ?? key,
      value: count,
      secondary:
        uniqueVisitors[key] != null ? `Unique: ${uniqueVisitors[key]}` : undefined,
    }));
}
