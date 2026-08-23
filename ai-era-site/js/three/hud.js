// js/three/hud.js — Update HUD DOM elements (throttled)
import * as THREE from 'three';

const distVal = document.querySelector('#distVal');
const rotXVal = document.querySelector('#rotXVal');
const rotYVal = document.querySelector('#rotYVal');

let frameCount = 0;

export function updateHUD(cameraDistance, rot, currentLook, cameraPos) {
  frameCount++;
  // Throttle DOM updates to every 3 frames to reduce layout/reflow
  if (frameCount % 3 !== 0) return;

  distVal.textContent = cameraPos.distanceTo(currentLook).toFixed(1);
  rotXVal.textContent = THREE.MathUtils.radToDeg(rot.x).toFixed(1) + '°';
  rotYVal.textContent = THREE.MathUtils.radToDeg(rot.y).toFixed(1) + '°';
}
