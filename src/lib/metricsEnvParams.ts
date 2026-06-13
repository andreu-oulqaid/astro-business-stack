export type MetricsEnvParam = 'all' | 'development' | 'production' | 'staging';

const ENV_PARAMS = new Set<MetricsEnvParam>(['all', 'development', 'production', 'staging']);

const DEFAULT_ENV: MetricsEnvParam = 'production';

export type ParsedMetricsEnv = {
  env: MetricsEnvParam;
  envFilterLabel: string;
  rpcEnv: string;
};

export function parseMetricsEnvParam(searchParams: URLSearchParams): ParsedMetricsEnv {
  const raw = searchParams.get('env');
  let env: MetricsEnvParam = DEFAULT_ENV;
  if (raw && ENV_PARAMS.has(raw as MetricsEnvParam)) {
    env = raw as MetricsEnvParam;
  }

  const envFilterLabel = env === 'all' ? 'All environments' : capitalizeEnv(env);
  const rpcEnv = env === 'all' ? '' : env;

  return { env, envFilterLabel, rpcEnv };
}

function capitalizeEnv(env: string): string {
  return env.charAt(0).toUpperCase() + env.slice(1);
}

export function metricsEnvHref(
  basePath: string,
  filters: { env: MetricsEnvParam; searchParams?: URLSearchParams },
): string {
  const p = new URLSearchParams(filters.searchParams?.toString() ?? '');
  if (filters.env !== DEFAULT_ENV) {
    p.set('env', filters.env);
  } else {
    p.delete('env');
  }
  return `${basePath}?${p.toString()}`;
}

export const METRICS_ENV_OPTIONS: MetricsEnvParam[] = ['all', 'development', 'production'];

export const DEFAULT_METRICS_ENV = DEFAULT_ENV;

export function envFilterLabel(env: MetricsEnvParam): string {
  return env === 'all' ? 'All environments' : capitalizeEnv(env);
}

export function envShortLabel(env: MetricsEnvParam): string {
  if (env === 'all') return 'All';
  if (env === 'development') return 'Development';
  if (env === 'production') return 'Production';
  return capitalizeEnv(env);
}
