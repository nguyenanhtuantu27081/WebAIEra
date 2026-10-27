// js/three/scene-setup.js — Scene, camera, renderer, composer, bloom
// Optimized: conditional antialias, powerPreference, and Bloom per tier (A.6 + F.6)
// FIX: mobile-index-webgl-crash — DPR helper, context loss listener, debounced resize, try/catch renderer
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { getQualityTier, getTierConfig, getTierReason, reportContextLost } from '../quality-tier.js';
import { logDiagInfo, logDiagWarn, logDiagError } from '../diagnostics.js';

export const tier = getQualityTier();
const cfg = getTierConfig();

logDiagInfo('render_quality_selected', {
  tier,
  reason: getTierReason(),
  configuredDpr: cfg.dpr,
  antialias: cfg.antialias,
  bloom: cfg.bloom,
});

// --- DPR helper: cap pixel ratio from tier config ---
function getRenderPixelRatio() {
  return Math.min(window.devicePixelRatio || 1, cfg.dpr);
}

// Scene
export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030305, .022);

// Camera — initial distance adapts to viewport aspect ratio
function getInitialCameraZ() {
  const aspect = innerWidth / innerHeight;
  if (aspect < 0.6) return 17.5;
  if (aspect < 0.8) return 16.5;
  if (aspect < 1.05) return 15.5;
  if (innerWidth < 1100) return 15.0;
  return 14.5;
}
export const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 120);
camera.position.set(0, .2, getInitialCameraZ());

// Renderer — A.6: antialias and powerPreference now tier-dependent
// FIX: wrapped in try/catch for graceful fallback when WebGL unavailable
const mount = document.querySelector('#webgl');

let rendererInstance;
try {
  rendererInstance = new THREE.WebGLRenderer({
    antialias: cfg.antialias,               // false for LOW (mobile DPI already smooth)
    alpha: !cfg.opaque,
    powerPreference: cfg.powerPreference     // 'low-power' for LOW, 'default' otherwise
  });
} catch (error) {
  logDiagError('webgl_renderer_create_failed', {
    renderer: 'main',
    name: String(error?.name || 'Error'),
    message: String(error?.message || error).slice(0, 1000),
    tier,
  });
  console.error('[WebGL] Unable to create main renderer', error);
  document.documentElement.classList.add('webgl-unavailable');
  throw error;
}
export const renderer = rendererInstance;

export let contextLost = false;

// Color space & Tone mapping: match linear output when bypassing composer
if (cfg.postProcessing === false) {
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
} else {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
}

// updateStyle=false: kích thước hiển thị do CSS (#webgl canvas {width:100%;height:100%}) quyết định.
renderer.setPixelRatio(getRenderPixelRatio());
renderer.setSize(innerWidth, innerHeight, false);
// Canvas không trong suốt (chỉ khi bật ?on=opaque): WebKit không phải blend canvas với DOM phía sau.
if (cfg.opaque) renderer.setClearColor(0x030305, 1);
mount.appendChild(renderer.domElement);

logDiagInfo('webgl_renderer_created', {
  renderer: 'main',
  tier,
  configuredDpr: cfg.dpr,
  actualDpr: renderer.getPixelRatio(),
  antialias: cfg.antialias,
  powerPreference: cfg.powerPreference,
  postProcessing: Boolean(cfg.postProcessing),
  canvasWidth: renderer.domElement.width,
  canvasHeight: renderer.domElement.height,
});

// --- WebGL context loss diagnostic listeners ---
renderer.domElement.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  contextLost = true;
  reportContextLost();
  logDiagError('webgl_context_lost', {
    renderer: 'main',
    statusMessage: event.statusMessage || 'unknown',
    canvasWidth: renderer.domElement.width,
    canvasHeight: renderer.domElement.height,
    tier
  });
  console.error('[WebGL] Main context lost', {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio,
    tier
  });
});

renderer.domElement.addEventListener('webglcontextrestored', () => {
  contextLost = false;
  logDiagWarn('webgl_context_restored', {
    renderer: 'main',
    canvasWidth: renderer.domElement.width,
    canvasHeight: renderer.domElement.height,
  });
  console.warn('[WebGL] Main context restored');
});

// Post-processing — only create EffectComposer if tier enables postProcessing (desktop/high tier)
export const usePostProcessing = Boolean(cfg.postProcessing);
let composerInstance = null;
export let bloom = null;

if (usePostProcessing) {
  composerInstance = new EffectComposer(renderer);
  composerInstance.addPass(new RenderPass(scene, camera));

  if (cfg.bloom > 0) {
    bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight), 1.1, .75, .18
    );
    bloom.strength = cfg.bloom;
    bloom.radius = .8;
    bloom.threshold = .08;
    composerInstance.addPass(bloom);
  }
}
export const composer = composerInstance;

// Lights
export const ambientLight = new THREE.AmbientLight(0x30304c, .36);
scene.add(ambientLight);

export const keyLight = new THREE.PointLight(0x8b8cff, 28, 36, 2);
keyLight.position.set(4, 4, 6);
scene.add(keyLight);

export let cyanLight = null;
if (cfg.lights >= 2) {
  cyanLight = new THREE.PointLight(0x67e8f9, 15, 30, 2);
  cyanLight.position.set(-4, -3, 3);
  scene.add(cyanLight);
}

// World group — everything orbits inside this
export const world = new THREE.Group();
scene.add(world);

// Resize handler — debounce được thực hiện MỘT chỗ duy nhất ở three-app.js
let lastResizeLogAt = 0;

function resizeNow() {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.setSize(w, h, false);
  if (usePostProcessing && composer) {
    composer.setSize(w, h);
  }

  const now = Date.now();
  if (now - lastResizeLogAt >= 2000) {
    lastResizeLogAt = now;
    logDiagInfo('webgl_resize', {
      renderer: 'main',
      width: w,
      height: h,
      dpr: renderer.getPixelRatio(),
      canvasWidth: renderer.domElement.width,
      canvasHeight: renderer.domElement.height,
    });
  }
}

export function onResize() {
  resizeNow();
}

