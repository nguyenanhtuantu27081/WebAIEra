// js/three/starfield.js — 2-layer deep-space particle field + grid rings
import * as THREE from 'three';
import { scene } from './scene-setup.js';
import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';

const tier = getQualityTier();
const cfg = TIER_CONFIG[tier];

function makeStarLayer(count, spread, size, opacity) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    p[i * 3] = THREE.MathUtils.randFloatSpread(spread);
    p[i * 3 + 1] = THREE.MathUtils.randFloatSpread(spread * .65);
    p[i * 3 + 2] = THREE.MathUtils.randFloat(-58, 18);
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({
    color: 0xa5b4fc, size, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  return pts;
}

// Use quality tier for particle count instead of hardcoded values
export const starsA = makeStarLayer(cfg.particles, 42, .025, .58);
export const starsB = makeStarLayer(Math.round(cfg.particles * .35), 55, .055, .28);

// Subtle perspective grid rings
export const gridGroup = new THREE.Group();
scene.add(gridGroup);
for (let z = -36; z < 8; z += 4) {
  const r = new THREE.Mesh(
    new THREE.RingGeometry(8.5, 8.53, 96),
    new THREE.MeshBasicMaterial({
      color: 0x818cf8, transparent: true, opacity: .022, side: THREE.DoubleSide
    })
  );
  r.position.z = z;
  r.rotation.x = Math.PI / 2;
  gridGroup.add(r);
}

// Animate starfield — called every frame
export function animateStarfield(t) {
  starsA.rotation.y = t * .004;
  starsB.rotation.y = -t * .003;
  starsA.position.z = (t * .17) % 7;
  starsB.position.z = (t * .28) % 9;
}
