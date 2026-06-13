import { getAnalyticsEnv } from '@/lib/analyticsEnv';

export type MetricsEnvParam = 'deploy' | 'all' | 'development' | 'production' | 'staging';

const ENV_PARAMS = new Set<MetricsEnvParam>([
  'all',
  'development',
  'production',
  'staging',
  'deploy',
]);

export type ParsedMetricsEnv = {
  env: MetricsEnvParam;
  envFilterLabel: string;
  rpcEnv: string;
};

export function parseMetricsEnvParam(
  searchParams: URLSearchParams,
  deploymentEnv: string = getAnalyticsEnv(),
): ParsedMetricsEnv {
  const raw = searchParams.get('env');
  let env: MetricsEnvParam = 'deploy';
  if (raw && ENV_PARAMS.has(raw as MetricsEnvParam)) {
    env = raw as MetricsEnvParam;
  }

  const envFilterLabel =
    env === 'deploy' ? deploymentEnv : env === 'all' ? 'all envs' : env;
  const rpcEnv = env === 'deploy' ? deploymentEnv : env === 'all' ? '' : env;

  return { env, envFilterLabel, rpcEnv };
}

export function metricsEnvHref(
  basePath: string,
  filters: { range: '7d' | '30d'; env: MetricsEnvParam },
): string {
  const p = new URLSearchParams();
  p.set('range', filters.range);
  if (filters.env !== 'deploy') {
    p.set('env', filters.env);
  }
  return `${basePath}?${p.toString()}`;
}
