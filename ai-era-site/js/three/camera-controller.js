// js/three/camera-controller.js
// Handles: drag 360° X/Y/Z, wheel dolly, Bezier flight, parallax, pinch-zoom
import * as THREE from 'three';
import { camera, renderer, world } from './scene-setup.js';
import { coreGroup } from './core.js';
import { nodes, labelEls } from './nodes.js';
import { NODES } from '../data/nodes.js';
import { getCurrentLang, nodeTranslations } from '../i18n.js';

// ----- DOM refs -----
const focusPanel = document.querySelector('#focusPanel');
const focusTitle = document.querySelector('#focusTitle');
const focusText = document.querySelector('#focusText');
const focusLink = document.querySelector('#focusLink');
const nodeNum = document.querySelector('#nodeNum');
const focusVal = document.querySelector('#focusVal');

// ----- State -----
export let pointer = { x: 0, y: 0, px: innerWidth / 2, py: innerHeight / 2 };
let dragging = false, lastX = 0, lastY = 0;
let rot = { x: 0, y: 0, z: 0 };
let targetRot = { x: 0, y: 0, z: 0 };
let dragLastAngle = 0;

let targetCameraDistance = 14.5;
let cameraDistance = 14.5;
export let selected = -1;
let flight = null;

const currentLook = new THREE.Vector3(0, 0, 0);
const targetLook = new THREE.Vector3(0, 0, 0);

const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2();

function easeInOut(t) {
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ----- Bezier flight (step 7) -----
function startFlight(toPos, toLook, duration = 1600, onDone = null) {
  const fromPos = camera.position.clone();
  // Control point: midpoint lifted upward + pushed outward for arc
  const mid = fromPos.clone().lerp(toPos, 0.5);
  const lift = new THREE.Vector3(0, 1.6, 0);
  const outward = mid.clone().normalize().multiplyScalar(1.4);
  const control = mid.clone().add(lift).add(outward);

  flight = {
    start: performance.now(),
    duration,
    fromPos,
    control,
    toPos: toPos.clone(),
    fromLook: currentLook.clone(),
    toLook: toLook.clone(),
    onDone
  };
}

// ----- Focus / Reset (step 8) -----
function focusNode(i) {
  selected = i;
  const n = nodes[i];
  const data = NODES[i];
  const wp = n.group.getWorldPosition(new THREE.Vector3());
  const outward = wp.clone().normalize();
  const toPos = wp.clone().add(outward.multiplyScalar(3.25)).add(new THREE.Vector3(0, .45, 1.1));
  targetLook.copy(wp);
  startFlight(toPos, wp, 1500);

  // Use current language for focus panel content
  const lang = getCurrentLang();
  const tr = nodeTranslations[lang];
  const nodeName = tr ? tr[i].name : data.name;
  const nodeDesc = tr ? tr[i].shortDesc : data.shortDesc;

  labelEls.forEach((el, j) => el.classList.toggle('active', j === i));
  focusTitle.textContent = nodeName;
  focusText.textContent = nodeDesc;
  if (focusLink) focusLink.setAttribute('href', data.url);
  nodeNum.textContent = String(i + 1).padStart(2, '0');
  focusVal.textContent = `NODE 0${i + 1}`;
  focusPanel.classList.add('show');
}

function resetView() {
  selected = -1;
  targetRot.x = targetRot.y = targetRot.z = 0;
  targetLook.set(0, 0, 0);
  startFlight(new THREE.Vector3(0, .2, 14.5), new THREE.Vector3(0, 0, 0), 1350);
  labelEls.forEach(el => el.classList.remove('active'));
  focusVal.textContent = 'CORE';
  focusPanel.classList.remove('show');
  targetCameraDistance = 14.5;
}

// ----- Init event listeners -----
export function initControls() {
  document.querySelector('#resetBtn').onclick = resetView;
  document.querySelector('#backBtn').onclick = resetView;

  // Drag rotate (step 5) — 360° on X/Y, Shift+drag for Z
  renderer.domElement.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    const cx = innerWidth / 2, cy = innerHeight / 2;
    dragLastAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    renderer.domElement.setPointerCapture?.(e.pointerId);
    document.body.classList.add('dragging');
  });

  addEventListener('pointerup', () => {
    dragging = false;
    document.body.classList.remove('dragging');
  });

  addEventListener('pointermove', e => {
    pointer.px = e.clientX;
    pointer.py = e.clientY;
    pointer.x = (e.clientX / innerWidth - .5) * 2;
    pointer.y = (e.clientY / innerHeight - .5) * 2;
    mouseNDC.set(pointer.x, -pointer.y);

    if (dragging && !flight) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      // Yaw (Y) & Pitch (X) — NO clamp for 360° continuous rotation
      targetRot.y += dx * 0.006;
      targetRot.x += dy * 0.006;

      // Roll (Z) — Shift + drag rotates around camera forward axis
      if (e.shiftKey) {
        const cx = innerWidth / 2, cy = innerHeight / 2;
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
        let delta = angle - dragLastAngle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        targetRot.z += delta;
        dragLastAngle = angle;
      } else {
        // Subtle Z from cross-drag (same as original)
        targetRot.z += (dx * pointer.y - dy * pointer.x) * .0012;
      }
    }
  });

  // Wheel dolly (step 6) — smooth easing + expanded range
  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault();
    if (flight) flight = null;
    selected = -1;
    focusPanel.classList.remove('show');
    labelEls.forEach(el => el.classList.remove('active'));
    focusVal.textContent = 'FREE';
    targetCameraDistance = THREE.MathUtils.clamp(
      targetCameraDistance + e.deltaY * 0.012,
      2.5,  // closer — "fly into" particle field
      46    // farther — see full ecosystem + deep starfield
    );
  }, { passive: false });

  // Click node (raycasting)
  renderer.domElement.addEventListener('click', e => {
    if (dragging) return;
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(nodes.map(n => n.shell), false);
    if (hits.length) {
      const idx = nodes.findIndex(n => n.shell === hits[0].object);
      if (idx >= 0) focusNode(idx);
    }
  });

  // Label click
  nodes.forEach((n, i) => {
    n.el.addEventListener('click', e => { e.stopPropagation(); focusNode(i); });
  });

  // Pinch-zoom for mobile (step 12)
  let pinchStartDist = null;
  renderer.domElement.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinchStartDist == null) pinchStartDist = dist;
      const delta = (pinchStartDist - dist) * 0.03;
      targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + delta, 2.5, 46);
      pinchStartDist = dist;
    }
  }, { passive: true });
  renderer.domElement.addEventListener('touchend', () => { pinchStartDist = null; });
}

// ----- Per-frame camera update -----
export function updateCamera(t) {
  // Subtle pointer steering when not dragging/focused
  if (!dragging && selected < 0 && !flight) {
    targetRot.y += pointer.x * .00012;
    targetRot.x += pointer.y * .00007;
  }

  // Smooth lerp rotation — NO clamp, 360° continuous
  rot.x += (targetRot.x - rot.x) * .07;
  rot.y += (targetRot.y - rot.y) * .07;
  rot.z += (targetRot.z - rot.z) * .055;
  world.rotation.set(rot.x, rot.y, rot.z);

  // Smooth camera distance lerp (step 6)
  cameraDistance += (targetCameraDistance - cameraDistance) * 0.09;

  // Cinematic Bezier flight (step 7)
  if (flight) {
    const raw = (performance.now() - flight.start) / flight.duration;
    const q = Math.min(1, raw);
    const e = easeInOut(q);

    // Quadratic Bezier: B(t) = (1-t)²·P0 + 2(1-t)t·P1 + t²·P2
    const p0 = flight.fromPos, p1 = flight.control, p2 = flight.toPos;
    const oneMinusT = 1 - e;
    camera.position.set(
      oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * e * p1.x + e * e * p2.x,
      oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * e * p1.y + e * e * p2.y,
      oneMinusT * oneMinusT * p0.z + 2 * oneMinusT * e * p1.z + e * e * p2.z
    );

    currentLook.lerpVectors(flight.fromLook, flight.toLook, e);

    if (q >= 1) {
      camera.position.copy(flight.toPos);
      currentLook.copy(flight.toLook);
      const cb = flight.onDone;
      flight = null;
      if (cb) cb();
    }
  } else if (selected < 0) {
    // Free-flight parallax (step 9) — only when not focused/flying
    const desired = new THREE.Vector3(pointer.x * .18, .2 - pointer.y * .1, cameraDistance);
    camera.position.lerp(desired, .035);
    currentLook.lerp(new THREE.Vector3(0, 0, 0), .06);
  } else {
    currentLook.lerp(targetLook, .08);
  }

  camera.lookAt(currentLook);

  return { cameraDistance, rot, currentLook };
}
