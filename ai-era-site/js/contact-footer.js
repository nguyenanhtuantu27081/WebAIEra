// js/contact-footer.js — Three.js particle-network constellation for footer
import * as THREE from 'three';

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 2.8;
const SPREAD_X = 18;
const SPREAD_Y = 6;
const SPREAD_Z = 5;
const DRIFT_SPEED = 0.12;

// Palette matching AI Era theme
const PALETTE = [
  new THREE.Color(0x818cf8), // indigo
  new THREE.Color(0xa5b4fc), // indigo-2
  new THREE.Color(0x67e8f9), // cyan
  new THREE.Color(0xc084fc), // purple
];

let renderer, scene, camera, particles, lineMesh;
let mouseX = 0, mouseY = 0;
let animId = null;
let mounted = false;

// Particle data arrays
const positions = new Float32Array(PARTICLE_COUNT * 3);
const velocities = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);

// Line data (max possible connections)
const MAX_LINES = PARTICLE_COUNT * 12;
const linePositions = new Float32Array(MAX_LINES * 6); // 2 vertices * 3 coords per line
const lineColors = new Float32Array(MAX_LINES * 6);

function initParticles() {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3]     = (Math.random() - 0.5) * SPREAD_X;
    positions[i3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i3 + 2] = (Math.random() - 0.5) * SPREAD_Z;

    velocities[i3]     = (Math.random() - 0.5) * DRIFT_SPEED;
    velocities[i3 + 1] = (Math.random() - 0.5) * DRIFT_SPEED;
    velocities[i3 + 2] = (Math.random() - 0.5) * DRIFT_SPEED * 0.3;

    const col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    sizes[i] = THREE.MathUtils.randFloat(1.5, 4.0);
  }
}

function createScene(container) {
  const rect = container.getBoundingClientRect();
  const w = Math.max(rect.width, 300);
  const h = Math.max(rect.height, 300);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 80);
  camera.position.set(0, 0, 12);

  // Init particles
  initParticles();

  // Point cloud
  const pointGeo = new THREE.BufferGeometry();
  pointGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  pointGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for soft glowing points
  const pointMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(devicePixelRatio, 1.5) },
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uPixelRatio;
      void main() {
        vColor = color;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        float pulse = 0.8 + 0.2 * sin(uTime * 1.5 + position.x * 2.0 + position.y * 3.0);
        gl_PointSize = size * pulse * uPixelRatio * (8.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
        // Fade based on depth
        vAlpha = smoothstep(40.0, 5.0, -mvPos.z) * pulse;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = exp(-d * 4.0) * 0.8 + smoothstep(0.5, 0.0, d) * 0.5;
        gl_FragColor = vec4(vColor, glow * vAlpha * 0.7);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  particles = new THREE.Points(pointGeo, pointMat);
  scene.add(particles);

  // Connection lines
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  lineMesh = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineMesh);
}

function updateParticles(dt) {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    // Move
    positions[i3]     += velocities[i3] * dt;
    positions[i3 + 1] += velocities[i3 + 1] * dt;
    positions[i3 + 2] += velocities[i3 + 2] * dt;

    // Wrap around
    const halfX = SPREAD_X * 0.5;
    const halfY = SPREAD_Y * 0.5;
    const halfZ = SPREAD_Z * 0.5;

    if (positions[i3] > halfX) positions[i3] = -halfX;
    if (positions[i3] < -halfX) positions[i3] = halfX;
    if (positions[i3 + 1] > halfY) positions[i3 + 1] = -halfY;
    if (positions[i3 + 1] < -halfY) positions[i3 + 1] = halfY;
    if (positions[i3 + 2] > halfZ) positions[i3 + 2] = -halfZ;
    if (positions[i3 + 2] < -halfZ) positions[i3 + 2] = halfZ;
  }

  particles.geometry.attributes.position.needsUpdate = true;

  // Update connections
  let lineIdx = 0;
  const maxDist2 = CONNECTION_DISTANCE * CONNECTION_DISTANCE;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const ix = positions[i * 3];
    const iy = positions[i * 3 + 1];
    const iz = positions[i * 3 + 2];

    for (let j = i + 1; j < PARTICLE_COUNT; j++) {
      if (lineIdx >= MAX_LINES) break;

      const jx = positions[j * 3];
      const jy = positions[j * 3 + 1];
      const jz = positions[j * 3 + 2];

      const dx = ix - jx;
      const dy = iy - jy;
      const dz = iz - jz;
      const dist2 = dx * dx + dy * dy + dz * dz;

      if (dist2 < maxDist2) {
        const li = lineIdx * 6;
        linePositions[li]     = ix;
        linePositions[li + 1] = iy;
        linePositions[li + 2] = iz;
        linePositions[li + 3] = jx;
        linePositions[li + 4] = jy;
        linePositions[li + 5] = jz;

        // Blend colors from both particles
        const fade = 1 - Math.sqrt(dist2) / CONNECTION_DISTANCE;
        lineColors[li]     = colors[i * 3] * fade;
        lineColors[li + 1] = colors[i * 3 + 1] * fade;
        lineColors[li + 2] = colors[i * 3 + 2] * fade;
        lineColors[li + 3] = colors[j * 3] * fade;
        lineColors[li + 4] = colors[j * 3 + 1] * fade;
        lineColors[li + 5] = colors[j * 3 + 2] * fade;

        lineIdx++;
      }
    }
    if (lineIdx >= MAX_LINES) break;
  }

  lineMesh.geometry.attributes.position.needsUpdate = true;
  lineMesh.geometry.attributes.color.needsUpdate = true;
  lineMesh.geometry.setDrawRange(0, lineIdx * 2);
}

function animate() {
  if (!mounted) return;

  const t = performance.now() * 0.001;
  const dt = Math.min(1 / 30, 0.016);

  updateParticles(dt);

  // Mouse parallax (subtle)
  camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.6 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  // Gentle rotation
  particles.rotation.y = t * 0.015;
  particles.rotation.x = Math.sin(t * 0.08) * 0.05;
  lineMesh.rotation.copy(particles.rotation);

  // Update shader time
  particles.material.uniforms.uTime.value = t;

  renderer.render(scene, camera);
  animId = requestAnimationFrame(animate);
}

function onResize(container) {
  if (!camera || !renderer) return;
  const rect = container.getBoundingClientRect();
  const w = Math.max(rect.width, 300);
  const h = Math.max(rect.height, 300);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function onMouseMove(e) {
  const footer = document.querySelector('.contact-footer');
  if (!footer) return;
  const rect = footer.getBoundingClientRect();
  mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
  mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
}

/**
 * Initialize the contact footer Three.js scene.
 * Uses IntersectionObserver to lazy-init only when footer is visible.
 */
export function initContactFooter() {
  const container = document.querySelector('.contact-footer__canvas');
  if (!container) return;

  // Close (X) button — scroll back to AI ERA core (#top)
  const closeBtn = document.getElementById('contactClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const topEl = document.getElementById('top');
      if (topEl) {
        topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !mounted) {
        mounted = true;
        createScene(container);
        animate();

        // Mouse tracking
        window.addEventListener('mousemove', onMouseMove, { passive: true });

        // Resize
        const ro = new ResizeObserver(() => onResize(container));
        ro.observe(container);

        observer.disconnect();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(container);
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContactFooter);
} else {
  initContactFooter();
}
