// js/quality-tier.js — Quality tier system
// Detect device capability with improved heuristics (A.3 + F.1)
// Returns appropriate render settings per tier

export function getQualityTier() {
  // Respect user preferences — always LOW for reduced motion or data saver
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const saveData = navigator.connection?.saveData;
  if (reduceMotion || saveData) return 'LOW';

  // Mobile detection via UA + viewport + pointer type
  const isMobile =
    innerWidth < 768 ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    !window.matchMedia?.('(pointer: fine)')?.matches;

  // All mobile → LOW (no Bloom, fewer particles) per A.3
  if (isMobile) return 'LOW';

  // Desktop/laptop: use viewport as rough proxy
  const w = innerWidth;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  LOW:    { particles: 120,  dpr: 1,    bloom: 0,    lights: 1, antialias: false, powerPreference: 'low-power' },
  MEDIUM: { particles: 400,  dpr: 1.25, bloom: 0.35, lights: 2, antialias: true,  powerPreference: 'default' },
  HIGH:   { particles: 900,  dpr: 1.5,  bloom: 0.7,  lights: 2, antialias: true,  powerPreference: 'default' },
  ULTRA:  { particles: 1600, dpr: 1.75, bloom: 0.9,  lights: 3, antialias: true,  powerPreference: 'default' }
};
