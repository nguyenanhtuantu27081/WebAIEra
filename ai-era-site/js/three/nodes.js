// js/three/nodes.js — 6 business ecosystem nodes + energy lines + labels
import * as THREE from 'three';
import { world } from './scene-setup.js';
import { glowTex } from './core.js';
import { NODES } from '../data/nodes.js';
import { getCurrentLang, onLanguageChange, nodeTranslations } from '../i18n.js';

const labelsRoot = document.querySelector('#labels');

// Phải khớp với FOV khai báo ở scene-setup.js (new THREE.PerspectiveCamera(48, ...))
const CAMERA_FOV_DEG = 48;
const CAMERA_FOV_RAD = CAMERA_FOV_DEG * Math.PI / 180;

// Phải khớp với getInitialCameraZ() (scene-setup.js) / getBaseCameraDistance() (camera-controller.js)
// -> nếu 3 nơi này lệch nhau, orbit sẽ tính sai khoảng cách an toàn.
function getCameraDistanceForViewport(w, h) {
  const aspect = w / h;
  if (aspect < 0.6) return 17.5;
  if (aspect < 0.8) return 16.5;
  if (aspect < 1.05) return 15.5;
  if (w < 1100) return 15.0;
  return 14.5;
}

export function getResponsiveOrbits() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  const dist = getCameraDistanceForViewport(w, h);

  // Nửa chiều cao / nửa chiều rộng của frustum camera thấy được tại khoảng cách "dist".
  // Đây là kích thước thật (theo world unit) mà màn hình đang hiển thị được,
  // nên nó TỰ ĐỘNG co giãn theo mọi kích thước màn hình, không chỉ vài breakpoint cố định.
  const halfHeight = Math.tan(CAMERA_FOV_RAD / 2) * dist;
  const halfWidth = halfHeight * aspect;

  // Hệ số an toàn: chừa lề cho bán kính node (~0.26), aura glow (scale 1.55),
  // orbit ring, label DOM, và biên độ trôi nổi khi animate (±0.12 theo Y, ±0.15 theo Z).
  const SAFE_X = 0.60;
  const SAFE_Y = 0.62;

  let orbitX = halfWidth * SAFE_X;
  let orbitY = halfHeight * SAFE_Y;

  // Chặn biên: không để orbit co lại quá gần lõi (node đè lên nhau / đè lên hạt nhân)
  // và không để orbit phình quá to trên desktop rộng (node bay ra rìa quá xa lõi).
  orbitX = Math.max(2.0, Math.min(orbitX, 5.8));
  orbitY = Math.max(2.4, Math.min(orbitY, 3.9));

  return { orbitX, orbitY };
}

export const nodes = [];
export const labelEls = [];

function getNodeName(i, lang) {
  const tr = nodeTranslations[lang];
  return tr ? tr[i].name : NODES[i].name;
}

export function updateNodeOrbits() {
  const { orbitX, orbitY } = getResponsiveOrbits();
  nodes.forEach((n, i) => {
    const a = i / nodes.length * Math.PI * 2 - Math.PI / 2;
    n.base.set(
      Math.cos(a) * orbitX,
      Math.sin(a) * orbitY,
      Math.sin(a * 1.7) * 1.05
    );
  });
}

const initOrbits = getResponsiveOrbits();

NODES.forEach((d, i) => {
  const a = i / NODES.length * Math.PI * 2 - Math.PI / 2;
  const base = new THREE.Vector3(
    Math.cos(a) * initOrbits.orbitX,
    Math.sin(a) * initOrbits.orbitY,
    Math.sin(a * 1.7) * 1.05
  );

  const group = new THREE.Group();
  group.position.copy(base);
  world.add(group);

  // Node shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.26, 2),
    new THREE.MeshPhysicalMaterial({
      color: 0x101018,
      emissive: d.color,
      emissiveIntensity: 1.2,
      metalness: .65,
      roughness: .22
    })
  );
  group.add(shell);

  // Point light
  const point = new THREE.PointLight(d.color, 5.5, 5.2, 2);
  group.add(point);

  // Aura sprite
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: d.color,
    transparent: true,
    opacity: .52,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  aura.scale.set(1.55, 1.55, 1);
  group.add(aura);

  // Orbit ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.48, .008, 7, 70),
    new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: .44 })
  );
  ring.rotation.set(1.04, .34, .1);
  group.add(ring);

  // Energy line to core
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), base.clone()
  ]);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: d.color, transparent: true, opacity: .12 })
  );
  world.add(line);

  // Pulsing dashed line
  const pulseGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), base.clone()
  ]);
  const pulseMat = new THREE.LineDashedMaterial({
    color: d.color, transparent: true, opacity: .22,
    dashSize: .09, gapSize: .16
  });
  const pulseLine = new THREE.Line(pulseGeo, pulseMat);
  pulseLine.computeLineDistances();
  world.add(pulseLine);

  // DOM label — uses current language
  const lang = getCurrentLang();
  const el = document.createElement('div');
  el.className = 'node-label';
  el.style.setProperty('--node-color', '#' + d.color.toString(16).padStart(6, '0'));
  el.innerHTML = `<span class="node-label-name">${getNodeName(i, lang)}</span>`;
  labelsRoot.appendChild(el);
  labelEls.push(el);

  const n = {
    ...d, index: i, group, shell, aura, ring,
    line, pulseLine, base, el, phase: i * 1.21
  };
  nodes.push(n);

  // Hover cursor class
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Update node label names when language changes
onLanguageChange((lang) => {
  nodes.forEach((n, i) => {
    const nameEl = n.el.querySelector('.node-label-name');
    if (nameEl) nameEl.textContent = getNodeName(i, lang);
  });
});

// Animate nodes — called every frame
export function animateNodes(t, selected) {
  nodes.forEach((n, i) => {
    n.group.position.copy(n.base);
    n.group.position.y += Math.sin(t * .72 + n.phase) * .12;
    n.group.position.z += Math.cos(t * .57 + n.phase) * .15;

    const pulse = 1 + Math.sin(t * 2 + n.phase) * .14 + (selected === i ? .18 : 0);
    n.shell.scale.setScalar(pulse);
    n.aura.material.opacity = (selected === i ? .9 : .48) + Math.sin(t * 1.6 + n.phase) * .06;
    n.ring.rotation.z += .004 * (i % 2 ? 1 : -1);
    n.ring.rotation.y += .0014;

    // Update energy line endpoints
    const a = n.line.geometry.attributes.position.array;
    a[3] = n.group.position.x;
    a[4] = n.group.position.y;
    a[5] = n.group.position.z;
    n.line.geometry.attributes.position.needsUpdate = true;

    const b = n.pulseLine.geometry.attributes.position.array;
    b[3] = n.group.position.x;
    b[4] = n.group.position.y;
    b[5] = n.group.position.z;
    n.pulseLine.geometry.attributes.position.needsUpdate = true;
    n.pulseLine.computeLineDistances();
    n.line.material.opacity = selected === i ? .48 : .11;
  });
}

// Project labels onto screen space with smart boundary clamping
export function projectLabels(camera, coreGroup, selected) {
  const coreLabel = document.querySelector('.core-label');
  const w = window.innerWidth;
  const h = window.innerHeight;

  nodes.forEach((n) => {
    const wp = n.group.getWorldPosition(new THREE.Vector3());
    const p = wp.clone().project(camera);
    let x = (p.x * .5 + .5) * w;
    let y = (-p.y * .5 + .5) * h;
    const facing = p.z < 1 && p.z > -1;

    // Viewport safety margin: clamp label coordinates so they never clip off screen
    if (w < 900) {
      const halfW = (n.el.offsetWidth || 100) / 2 + 10;
      const halfH = (n.el.offsetHeight || 28) / 2 + 6;
      x = Math.max(halfW, Math.min(w - halfW, x));
      y = Math.max(halfH + 50, Math.min(h - halfH - 60, y));
    }

    n.el.style.left = x + 'px';
    n.el.style.top = y + 'px';
    n.el.style.opacity = facing ? '1' : '0';
    n.el.style.pointerEvents = facing ? 'auto' : 'none';
  });

  const cp = coreGroup.getWorldPosition(new THREE.Vector3()).project(camera);
  coreLabel.style.left = ((cp.x * .5 + .5) * w) + 'px';
  coreLabel.style.top = ((-cp.y * .5 + .5) * h) + 'px';
  coreLabel.style.opacity = (cp.z < 1 && cp.z > -1 && selected < 0) ? '1' : '.2';
}

