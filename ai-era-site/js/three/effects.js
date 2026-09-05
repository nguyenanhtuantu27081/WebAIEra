// js/three/effects.js — Bloom tuning per quality tier
import { bloom } from './scene-setup.js';
import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';

export function applyQualityEffects() {
  if (!bloom) return;
  const tier = getQualityTier();
  const cfg = TIER_CONFIG[tier];
  bloom.strength = cfg.bloom;

  // On LOW tier, also reduce bloom radius for performance
  if (tier === 'LOW') {
    bloom.radius = 0;
    bloom.threshold = 1; // effectively disable bloom
  }
}
