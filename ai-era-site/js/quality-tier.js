// js/quality-tier.js — Quality tier system (step 12)
// Detect device capability and return appropriate render settings

export function getQualityTier() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (w < 768) return 'LOW';
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  LOW:    { particles: 120,  dpr: 1,    bloom: 0,   lights: 1 },
  MEDIUM: { particles: 400,  dpr: 1.25, bloom: 0.35, lights: 2 },
  HIGH:   { particles: 900,  dpr: 1.5,  bloom: 0.7, lights: 2 },
  ULTRA:  { particles: 1600, dpr: 1.75, bloom: 0.9, lights: 3 }
};

