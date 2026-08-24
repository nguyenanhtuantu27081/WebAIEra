export type QualityTier = 'low' | 'medium' | 'high' | 'ultra';

export const QUALITY_PRESETS: Record<QualityTier, {
  particles: number;
  bloom: boolean;
  bloomIntensity: number;
  dpr: [number, number];
  lights: number;
}> = {
  low:    { particles: 300,  bloom: false, bloomIntensity: 0,    dpr: [1, 1],   lights: 1 },
  medium: { particles: 700,  bloom: true,  bloomIntensity: 0.5,  dpr: [1, 1.5], lights: 2 },
  high:   { particles: 1500, bloom: true,  bloomIntensity: 0.8,  dpr: [1, 2],   lights: 3 },
  ultra:  { particles: 2500, bloom: true,  bloomIntensity: 0.95, dpr: [1, 2],   lights: 4 },
};

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';
  const isMobile = window.innerWidth < 768;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return 'low';
  const cores = navigator.hardwareConcurrency ?? 4;
  if (isMobile) return cores >= 6 ? 'medium' : 'low';
  return cores >= 8 ? 'ultra' : cores >= 4 ? 'high' : 'medium';
}
