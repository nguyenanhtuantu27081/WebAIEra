// js/main.js — Entry point: imports all modules, runs animation loop
// FIX: mobile-index-webgl-crash — proper animation lifecycle with syncAnimationState
import * as THREE from 'three';
import { initDiagnostics, logDiagInfo } from './diagnostics.js';

// Khởi tạo logging chẩn đoán sớm
initDiagnostics();
logDiagInfo('home_module_start', {
  userAgent: navigator.userAgent,
  online: navigator.onLine,
  hardwareConcurrency: navigator.hardwareConcurrency ?? null,
  deviceMemoryGB: navigator.deviceMemory ?? null,
  saveData: navigator.connection?.saveData ?? null,
});

logDiagInfo('home_init_stage', { stage: 'before-scene-init' });
import { scene, camera, renderer, composer, usePostProcessing, contextLost, onResize, tier } from './three/scene-setup.js';
import { TIER_CONFIG } from './quality-tier.js';
logDiagInfo('home_init_stage', { stage: 'after-scene-init' });

import { coreGroup, animateCore } from './three/core.js';
import { nodes, animateNodes, projectLabels, updateNodeOrbits, invalidateLabelSizes } from './three/nodes.js';
import { animateStarfield } from './three/starfield.js';
import { initControls, updateCamera, pointer, selected, onCameraResize } from './three/camera-controller.js';
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

logDiagInfo('home_init_stage', { stage: 'all-modules-initialized' });

// Animation loop & pause state (Checklist F.7)
// FIX: proper start/stop lifecycle instead of return-inside-loop
const clock = new THREE.Clock();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isVisible = document.visibilityState === 'visible';
let isIntersecting = true;
let animationRunning = false;
let lastLoggedAnimationState = null;

function logAnimationState(state, details = {}) {
  if (state === lastLoggedAnimationState) return;
  lastLoggedAnimationState = state;
  logDiagInfo('main_animation_state', {
    state,
    visibility: document.visibilityState,
    ...details,
  });
}

function syncAnimationState() {
  const shouldRun =
    isVisible &&
    isIntersecting &&
    !reduceMotion.matches;

  if (shouldRun && !animationRunning) {
    animationRunning = true;
    clock.start();
    renderer.setAnimationLoop(animate);
    logAnimationState('running');
  } else if (!shouldRun && animationRunning) {
    animationRunning = false;
    renderer.setAnimationLoop(null);
    clock.stop();
    logAnimationState('paused', {
      isVisible,
      isIntersecting,
      reduceMotion: reduceMotion.matches
    });
  }
}

document.addEventListener('visibilitychange', () => {
  isVisible = document.visibilityState === 'visible';
  syncAnimationState();
});

reduceMotion.addEventListener?.('change', syncAnimationState);

// Pause render loop when canvas/hero scrolls out of view
const canvasEl = renderer.domElement;
if ('IntersectionObserver' in window && canvasEl) {
  const observer = new IntersectionObserver((entries) => {
    isIntersecting = entries.some(entry => entry.isIntersecting);
    syncAnimationState();
  }, { threshold: 0.05 });
  observer.observe(canvasEl);
}

// 5-second frame sample diagnostics
let sampleStart = performance.now();
let sampleFrames = 0;
let lastSampleLog = sampleStart;

function recordMainFrameSample() {
  sampleFrames++;
  const now = performance.now();

  if (now - lastSampleLog < 5000) return;

  const elapsed = now - sampleStart;
  const approximateFps = elapsed > 0
    ? Math.round((sampleFrames * 1000) / elapsed)
    : null;

  logDiagInfo('main_animation_sample', {
    approximateFps,
    sampleWindowMs: Math.round(elapsed),
    frames: sampleFrames,
  });

  sampleStart = now;
  sampleFrames = 0;
  lastSampleLog = now;
}

// FPS throttle per tier (e.g. SAFE = 30 FPS, LOW = 60 FPS)
const maxFps = TIER_CONFIG[tier]?.maxFps || 0;
const MIN_FRAME_MS = maxFps > 0 ? (1000 / maxFps - 2) : 0;
let lastFrameTs = 0;

function animate(ts) {
  if (contextLost) return;
  if (MIN_FRAME_MS > 0 && typeof ts === 'number') {
    if (ts - lastFrameTs < MIN_FRAME_MS) return;
    lastFrameTs = ts;
  }

  recordMainFrameSample();
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

  // Render — bypass EffectComposer when post-processing is disabled
  if (usePostProcessing && composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}

// Start animation with proper lifecycle
syncAnimationState();

// Window resize
function handleWindowResize() {
  invalidateLabelSizes();
  onResize();
  updateNodeOrbits();
  onCameraResize();
}
addEventListener('resize', handleWindowResize, { passive: true });

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

