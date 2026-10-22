// js/quality-tier.js — Quality tier system
// Detect device capability with improved heuristics (A.3 + F.1)
// Returns appropriate render settings per tier
// FIX: mobile-index-webgl-crash — conservative tier config to reduce GPU pressure

export function getQualityTier() {
  // Respect user preferences — always LOW for reduced motion or data saver
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const saveData = navigator.connection?.saveData;
  const isMobile =
    window.innerWidth < 768 ||
    window.matchMedia?.('(pointer: coarse)')?.matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (reduceMotion || saveData || isMobile) return 'LOW';

  // Desktop/laptop: use viewport as rough proxy
  const w = window.innerWidth;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  LOW:    { particles: 60,   dpr: 0.75, bloom: 0,    lights: 1, antialias: false, powerPreference: 'low-power' },
  MEDIUM: { particles: 250,  dpr: 1.0,  bloom: 0.2,  lights: 2, antialias: false, powerPreference: 'default' },
  HIGH:   { particles: 600,  dpr: 1.25, bloom: 0.45, lights: 2, antialias: true,  powerPreference: 'default' },
  ULTRA:  { particles: 1000, dpr: 1.5,  bloom: 0.65, lights: 3, antialias: true,  powerPreference: 'default' }
};
