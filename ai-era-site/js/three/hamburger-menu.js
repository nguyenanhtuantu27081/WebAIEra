// js/three/hamburger-menu.js
// 3D hamburger icon using Three.js lines in an OrthographicCamera scene
// Morphs between 3 horizontal bars and an X icon with purple-indigo glow.
import * as THREE from 'three';
import { logDiagInfo, logDiagError, logDiagWarn } from '../diagnostics.js';

export function initHamburgerMenu(canvas, panel, button) {
  if (!canvas || !panel || !button) return;

  const size = 26;
  const isMobile = window.innerWidth < 768 || window.matchMedia?.('(pointer: coarse)')?.matches;
  const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  const scene = new THREE.Scene();
  // Orthographic camera covering [-1, 1] bounds
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.set(0, 0, 2);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'low-power'
    });
  } catch (e) {
    logDiagError('webgl_renderer_create_failed', {
      renderer: 'hamburger-menu',
      message: String(e?.message || e)
    });
    console.warn('WebGL not supported for hamburger menu:', e);
    return;
  }

  renderer.setSize(size, size);
  renderer.setPixelRatio(dpr);

  logDiagInfo('webgl_renderer_created', {
    renderer: 'hamburger-menu',
    dpr,
    size
  });

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    logDiagError('webgl_context_lost', {
      renderer: 'hamburger-menu',
      statusMessage: e.statusMessage || 'unknown'
    });
  });

  canvas.addEventListener('webglcontextrestored', () => {
    logDiagWarn('webgl_context_restored', {
      renderer: 'hamburger-menu'
    });
  });

  // Line materials with purple/indigo glow
  const colorNormal = 0xa5b4fc; // Indigo-2

  function createLineMaterial(opacity = 0.9) {
    return new THREE.LineBasicMaterial({
      color: colorNormal,
      transparent: true,
      opacity: opacity,
      linewidth: 2
    });
  }

  // Top, middle, bottom line geometries
  const lineWidth = 0.65;
  const yOffset = 0.42;

  function createLineGeo(y) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -lineWidth, y, 0,
       lineWidth, y, 0
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }

  const topGeo = createLineGeo(yOffset);
  const midGeo = createLineGeo(0);
  const botGeo = createLineGeo(-yOffset);

  const topMat = createLineMaterial(0.95);
  const midMat = createLineMaterial(0.85);
  const botMat = createLineMaterial(0.95);

  const topLine = new THREE.Line(topGeo, topMat);
  const midLine = new THREE.Line(midGeo, midMat);
  const botLine = new THREE.Line(botGeo, botMat);

  const group = new THREE.Group();
  group.add(topLine);
  group.add(midLine);
  group.add(botLine);
  scene.add(group);

  let isOpen = false;
  let progress = 0; // 0 = closed (bars), 1 = open (X)
  let targetProgress = 0;

  function updateLines(p) {
    // Morph:
    // Top bar: y goes from yOffset -> 0, rotates from 0 -> 45deg (Math.PI / 4)
    // Bot bar: y goes from -yOffset -> 0, rotates from 0 -> -45deg (-Math.PI / 4)
    // Mid bar: opacity goes from 0.85 -> 0, scale.x goes 1 -> 0

    topLine.position.y = yOffset * (1 - p);
    topLine.rotation.z = (Math.PI / 4) * p;

    botLine.position.y = -yOffset * (1 - p);
    botLine.rotation.z = -(Math.PI / 4) * p;

    midMat.opacity = Math.max(0, 0.85 * (1 - p * 1.4));
    midLine.scale.x = Math.max(0.01, 1 - p);

    // Dynamic color shift on open
    const r = THREE.MathUtils.lerp(0xa5 / 255, 0xc0 / 255, p);
    const g = THREE.MathUtils.lerp(0xb4 / 255, 0x84 / 255, p);
    const b = THREE.MathUtils.lerp(0xfc / 255, 0xfc / 255, p);
    topMat.color.setRGB(r, g, b);
    botMat.color.setRGB(r, g, b);
  }

  function toggleMenu(forceState) {
    if (typeof forceState === 'boolean') {
      isOpen = forceState;
    } else {
      isOpen = !isOpen;
    }

    targetProgress = isOpen ? 1 : 0;
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) {
      panel.classList.add('open');
      panel.removeAttribute('hidden');
    } else {
      panel.classList.remove('open');
      setTimeout(() => {
        if (!isOpen) panel.setAttribute('hidden', '');
      }, 250);
    }
  }

  // Click button to toggle
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (isOpen && !panel.contains(e.target) && !button.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Esc key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleMenu(false);
    }
  });

  // Close when clicking a menu link
  panel.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Render & animation loop with lifecycle management
  let lastTime = performance.now();
  let rafId = null;
  let isRunning = false;

  function animate() {
    if (!isRunning) return;
    rafId = requestAnimationFrame(animate);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Smooth easing toward targetProgress
    const speed = 10;
    progress += (targetProgress - progress) * Math.min(1, dt * speed);
    updateLines(progress);

    // Subtle breathing glow when closed
    if (progress < 0.05) {
      const breath = 0.8 + Math.sin(now * 0.003) * 0.18;
      topMat.opacity = breath;
      midMat.opacity = breath * 0.9;
      botMat.opacity = breath;
    }

    renderer.render(scene, camera);
  }

  function startLoop() {
    if (isRunning) return;
    isRunning = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(animate);
  }

  function stopLoop() {
    if (!isRunning) return;
    isRunning = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  startLoop();
}
