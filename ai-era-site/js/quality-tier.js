// js/quality-tier.js — Quality tier system (step 12)
// Detect device capability and return appropriate render settings

export function getQualityTier() {
  const w = innerWidth;
  if (w < 640) return 'LOW';
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  LOW:    { particles: 250,  dpr: 1,    bloom: 0,   lights: 1 },
  MEDIUM: { particles: 600,  dpr: 1.25, bloom: 0.5, lights: 2 },
  HIGH:   { particles: 1400, dpr: 1.75, bloom: 0.9, lights: 3 },
  ULTRA:  { particles: 2500, dpr: 2,    bloom: 1.1, lights: 3 }
};
