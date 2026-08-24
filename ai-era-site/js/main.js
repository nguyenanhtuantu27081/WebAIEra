// js/main.js — Entry point: imports all modules, runs animation loop
import * as THREE from 'three';
import { scene, camera, renderer, composer, onResize } from './three/scene-setup.js';
import { coreGroup, animateCore } from './three/core.js';
import { nodes, animateNodes, projectLabels } from './three/nodes.js';
import { animateStarfield } from './three/starfield.js';
import { initControls, updateCamera, pointer, selected } from './three/camera-controller.js';
import { updateHUD } from './three/hud.js';
import { applyQualityEffects } from './three/effects.js';
import { initCursor } from './cursor.js';
import { initI18n } from './i18n.js';

// Initialise
initControls();
initCursor(() => pointer);
applyQualityEffects();
initI18n();


// Animation loop
const clock = new THREE.Clock();

function animate() {
  const t = clock.getElapsedTime();

  // Core animations (rotation, sparks, halo)
  animateCore(t);

  // Node animations (breathing, energy lines)
  animateNodes(t, selected);

  // Camera (drag, flight, parallax, dolly)
  const camState = updateCamera(t);

  // Starfield drift
  animateStarfield(t);

  // Project 3D labels to screen
  projectLabels(camera, coreGroup, selected);

  // HUD update (throttled)
  updateHUD(camState.cameraDistance, camState.rot, camState.currentLook, camera.position);

  // Render
  composer.render();
}

renderer.setAnimationLoop(animate);

// Window resize
addEventListener('resize', onResize);
