// js/three/effects.js — Bloom tuning per quality tier
import { bloom } from './scene-setup.js';
import { getTierConfig } from '../quality-tier.js';

export function applyQualityEffects() {
  if (!bloom) return;
  const cfg = getTierConfig();
  bloom.strength = cfg.bloom;
}
