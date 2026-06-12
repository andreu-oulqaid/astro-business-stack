import type { LogoKey } from '@/config/logoMarks';
import dockerMarkBlue from '@/assets/external_logos/Docker-Logos-1/docker-logos/SVG/docker-mark-ocean-blue.svg';
import dockerMarkWhite from '@/assets/external_logos/Docker-Logos-1/docker-logos/SVG/docker-mark-white.svg';

export type LogoThemeSources = {
  src: string;
  darkSrc?: string;
};

/** Theme-aware logo sources (e.g. Docker blue in light, white in dark). */
export function getLogoThemeSources(key: LogoKey, fallbackSrc: string): LogoThemeSources {
  if (key === 'docker') {
    return { src: dockerMarkBlue.src, darkSrc: dockerMarkWhite.src };
  }
  return { src: fallbackSrc };
}

export { dockerMarkBlue, dockerMarkWhite };
