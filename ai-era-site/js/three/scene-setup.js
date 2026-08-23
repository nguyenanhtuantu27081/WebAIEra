// js/three/scene-setup.js — Scene, camera, renderer, composer, bloom
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';

const tier = getQualityTier();
const cfg = TIER_CONFIG[tier];

// Scene
export const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030305, .022);

// Camera
export const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, .1, 120);
camera.position.set(0, .2, 14.5);

// Renderer
const mount = document.querySelector('#webgl');
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, cfg.dpr));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
mount.appendChild(renderer.domElement);

// Post-processing
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
export const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight), 1.1, .75, .18
);
bloom.strength = cfg.bloom;
bloom.radius = .8;
bloom.threshold = .08;
composer.addPass(bloom);

// Lights
scene.add(new THREE.AmbientLight(0x30304c, .36));
const key = new THREE.PointLight(0x8b8cff, 28, 36, 2);
key.position.set(4, 4, 6);
scene.add(key);

if (cfg.lights >= 2) {
  const cyanLight = new THREE.PointLight(0x67e8f9, 15, 30, 2);
  cyanLight.position.set(-4, -3, 3);
  scene.add(cyanLight);
}

// World group — everything orbits inside this
export const world = new THREE.Group();
scene.add(world);

// Resize handler
export function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, cfg.dpr));
}
