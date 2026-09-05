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
import { initTheme } from './theme.js';
import { initContactBtn3D } from './three/contact-btn-3d.js';

// Initialise UI controls & i18n & theme immediately
initI18n();
initTheme();
initControls();
initContactBtn3D();
initCursor(() => pointer);
applyQualityEffects();

// Animation loop & pause state (Checklist F.7)
const clock = new THREE.Clock();
let isVisible = document.visibilityState === 'visible';
let isIntersecting = true;

document.addEventListener('visibilitychange', () => {
  isVisible = document.visibilityState === 'visible';
});

// Pause render loop when canvas/hero scrolls out of view
const canvasEl = renderer.domElement;
if ('IntersectionObserver' in window && canvasEl) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isIntersecting = entry.isIntersecting;
    });
  }, { threshold: 0.05 });
  observer.observe(canvasEl);
}

function animate() {
  // F.7: Skip calculations & render when tab hidden or scrolled out of view
  if (!isVisible || !isIntersecting) return;

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

// Start rendering loop via requestAnimationFrame / requestIdleCallback
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    renderer.setAnimationLoop(animate);
  }, { timeout: 800 });
} else {
  requestAnimationFrame(() => {
    renderer.setAnimationLoop(animate);
  });
}

// Window resize
addEventListener('resize', onResize, { passive: true });

// Contact footer close button — scroll back to top
const closeBtn = document.getElementById('contactClose');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    const top = document.getElementById('top');
    if (top) {
      top.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}
