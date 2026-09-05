export type QualityTier = 'low' | 'mobile-medium' | 'medium' | 'high' | 'ultra';

export const QUALITY_PRESETS: Record<QualityTier, {
  particles: number;
  bloom: boolean;
  bloomIntensity: number;
  dpr: [number, number];
  lights: number;
  geometrySegments: number;
  frameSkip: number;
}> = {
  low:              { particles: 300,  bloom: false, bloomIntensity: 0,    dpr: [1, 1],   lights: 1, geometrySegments: 8,  frameSkip: 2 },
  'mobile-medium':  { particles: 120,  bloom: false, bloomIntensity: 0,    dpr: [1, 1],   lights: 1, geometrySegments: 10, frameSkip: 1 },
  medium:           { particles: 500,  bloom: true,  bloomIntensity: 0.4,  dpr: [1, 1.5], lights: 2, geometrySegments: 16, frameSkip: 0 },
  high:             { particles: 1200, bloom: true,  bloomIntensity: 0.8,  dpr: [1, 2],   lights: 3, geometrySegments: 24, frameSkip: 0 },
  ultra:            { particles: 2000, bloom: true,  bloomIntensity: 0.95, dpr: [1, 2],   lights: 4, geometrySegments: 32, frameSkip: 0 },
};

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'low';
  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as any).connection?.saveData;
  if (reduceMotion || saveData) return 'low';
  if (isMobile) return 'low'; // All mobile defaults to LOW — no Bloom, 300 particles max
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores >= 8 ? 'high' : cores >= 4 ? 'medium' : 'low';
}
