// js/three/core.js — AI Era core mesh, wireframe, halo, orbit rings, neural sparks
import * as THREE from 'three';
import { world } from './scene-setup.js';

// Shared radial glow texture
function radialTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(129,140,248,.35)') {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner);
  g.addColorStop(.16, mid);
  g.addColorStop(.48, 'rgba(99,102,241,.08)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export const glowTex = radialTexture();

// Core group
export const coreGroup = new THREE.Group();
world.add(coreGroup);

// Icosahedron core
export const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.28, 5),
  new THREE.MeshPhysicalMaterial({
    color: 0x11121e,
    metalness: .7,
    roughness: .16,
    clearcoat: 1,
    clearcoatRoughness: .12,
    emissive: 0x34398c,
    emissiveIntensity: 1.45
  })
);
coreGroup.add(core);

// Wireframe overlay
export const coreWire = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.39, 2)),
  new THREE.LineBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: .19 })
);
coreGroup.add(coreWire);

// Halo sprite
export const halo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: glowTex,
  color: 0x8b8cff,
  transparent: true,
  opacity: .68,
  blending: THREE.AdditiveBlending,
  depthWrite: false
}));
halo.scale.set(6.7, 6.7, 1);
coreGroup.add(halo);

// Orbit rings (3)
export const coreRings = [];
[1.72, 2.08, 2.48].forEach((r, i) => {
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(r, .009 + i * .003, 8, 190),
    new THREE.MeshBasicMaterial({
      color: i === 1 ? 0x67e8f9 : 0x818cf8,
      transparent: true,
      opacity: .22 - i * .035
    })
  );
  torus.rotation.set(.48 + i * .41, .22 + i * .62, .12 + i * .29);
  torus.userData.speed = (i % 2 ? -.0017 : .0021) * (i + 1);
  coreGroup.add(torus);
  coreRings.push(torus);
});

// Neural sparks
const sparkGroup = new THREE.Group();
coreGroup.add(sparkGroup);
for (let i = 0; i < 44; i++) {
  const a = Math.random() * Math.PI * 2;
  const b = Math.acos(THREE.MathUtils.randFloatSpread(2));
  const r = THREE.MathUtils.randFloat(1.55, 2.72);
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(THREE.MathUtils.randFloat(.012, .028), 6, 6),
    new THREE.MeshBasicMaterial({
      color: Math.random() > .72 ? 0x67e8f9 : 0xa5b4fc,
      transparent: true,
      opacity: .78
    })
  );
  dot.position.set(
    r * Math.sin(b) * Math.cos(a),
    r * Math.cos(b),
    r * Math.sin(b) * Math.sin(a)
  );
  dot.userData.phase = Math.random() * 6.28;
  sparkGroup.add(dot);
}

// Animate core elements — called every frame from main.js
export function animateCore(t) {
  core.rotation.x = t * .09;
  core.rotation.y = t * .14;
  coreWire.rotation.x = -t * .08;
  coreWire.rotation.z = t * .055;
  halo.material.opacity = .53 + Math.sin(t * 2.05) * .09;

  coreGroup.children.forEach(o => {
    if (o.userData.speed) {
      o.rotation.z += o.userData.speed;
      o.rotation.y -= o.userData.speed * .45;
    }
  });

  sparkGroup.children.forEach(s => {
    s.scale.setScalar(.7 + Math.sin(t * 2 + s.userData.phase) * .28);
  });
}
