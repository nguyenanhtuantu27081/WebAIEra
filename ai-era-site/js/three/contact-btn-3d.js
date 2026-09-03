// js/three/contact-btn-3d.js
// 3D holographic quantum beacon for the Contact CTA button
import * as THREE from 'three';

export function initContactBtn3D() {
  const canvas = document.querySelector('#contactBtnCanvas');
  const btn = document.querySelector('#contactShortcut');
  if (!canvas || !btn) return;

  const size = 56;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  // Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    });
  } catch (e) {
    console.warn('WebGL not supported for contact button:', e);
    return;
  }

  renderer.setSize(size, size);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  const coreLight = new THREE.PointLight(0xa855f7, 3, 10);
  coreLight.position.set(0, 0, 0);
  scene.add(coreLight);

  const cyanLight = new THREE.DirectionalLight(0x67e8f9, 2.0);
  cyanLight.position.set(2, 3, 3);
  scene.add(cyanLight);

  // Root group for tilting & animation
  const root = new THREE.Group();
  scene.add(root);

  // 1. Outer Faceted Crystal (Icosahedron)
  const icoGeo = new THREE.IcosahedronGeometry(1.2, 0);
  const icoMat = new THREE.MeshPhysicalMaterial({
    color: 0x818cf8,
    emissive: 0x312e81,
    emissiveIntensity: 0.6,
    metalness: 0.2,
    roughness: 0.1,
    transmission: 0.65,
    thickness: 0.8,
    transparent: true,
    opacity: 0.75,
    wireframe: false
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  root.add(icoMesh);

  // 2. Wireframe Overlay on Crystal
  const wireGeo = new THREE.WireframeGeometry(icoGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: 0xa5b4fc,
    transparent: true,
    opacity: 0.85
  });
  const wireMesh = new THREE.LineSegments(wireGeo, wireMat);
  root.add(wireMesh);

  // 3. Glowing Core Sphere
  const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  root.add(coreMesh);

  // 4. Orbiting Ring 1 (Torus)
  const ring1Geo = new THREE.TorusGeometry(1.68, 0.035, 8, 36);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.85
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI * 0.35;
  ring1.rotation.y = Math.PI * 0.2;
  root.add(ring1);

  // 5. Orbiting Ring 2 (Torus - counter tilted)
  const ring2Geo = new THREE.TorusGeometry(1.85, 0.025, 8, 36);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    transparent: true,
    opacity: 0.7
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = -Math.PI * 0.4;
  ring2.rotation.z = Math.PI * 0.3;
  root.add(ring2);

  // 6. Orbiting Satellites (Tiny luminous nodes)
  const satGroup = new THREE.Group();
  root.add(satGroup);
  const satCount = 4;
  const satMeshes = [];
  for (let i = 0; i < satCount; i++) {
    const sGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const sMat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x67e8f9 : 0xfbcfe8
    });
    const sMesh = new THREE.Mesh(sGeo, sMat);
    satGroup.add(sMesh);
    satMeshes.push(sMesh);
  }

  // Animation State
  let isHovered = false;
  let currentSpeed = 0.02;
  let targetSpeed = 0.02;
  let scaleFactor = 1.0;
  let targetScale = 1.0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let clickBurst = 0;

  // Hover & mouse move listeners
  btn.addEventListener('mouseenter', () => {
    isHovered = true;
    targetSpeed = 0.07;
    targetScale = 1.18;
    wireMat.color.setHex(0x67e8f9);
  });

  btn.addEventListener('mouseleave', () => {
    isHovered = false;
    targetSpeed = 0.02;
    targetScale = 1.0;
    targetTiltX = 0;
    targetTiltY = 0;
    wireMat.color.setHex(0xa5b4fc);
  });

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    targetTiltY = nx * 0.45;
    targetTiltX = -ny * 0.45;
  });

  // Smooth scroll & 3D burst on click
  btn.addEventListener('click', (e) => {
    const target = document.querySelector('#contactFooter');
    if (target) {
      e.preventDefault();
      clickBurst = 1.0;
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Main Render Loop
  let clock = new THREE.Clock();
  let isVisible = true;

  // Pause when tab is not visible
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
  });

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    if (!isVisible) return;

    const t = clock.getElapsedTime();
    const delta = clock.getDelta();

    // Lerp speeds & scales
    currentSpeed += (targetSpeed - currentSpeed) * 0.1;
    scaleFactor += (targetScale - scaleFactor) * 0.12;

    // Burst decay
    if (clickBurst > 0) {
      currentSpeed += clickBurst * 0.15;
      clickBurst *= 0.92;
      if (clickBurst < 0.01) clickBurst = 0;
    }

    // Rotations
    icoMesh.rotation.y += currentSpeed;
    icoMesh.rotation.x += currentSpeed * 0.7;
    wireMesh.rotation.copy(icoMesh.rotation);

    ring1.rotation.z += currentSpeed * 1.4;
    ring2.rotation.z -= currentSpeed * 1.1;

    // Satellites orbital motion
    satMeshes.forEach((mesh, i) => {
      const angle = t * 2.2 + (i * Math.PI * 2) / satCount;
      const radius = 1.8 + 0.2 * Math.sin(t * 3 + i);
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5) * 0.45,
        Math.sin(angle) * radius
      );
    });

    // Core breathing / pulsing
    const pulse = 1.0 + 0.18 * Math.sin(t * 4.5);
    coreMesh.scale.setScalar(pulse);
    coreLight.intensity = (2.2 + 1.2 * Math.sin(t * 4.5)) * (isHovered ? 1.4 : 1.0);

    // Root parallax tilt & scale
    root.rotation.x += (targetTiltX - root.rotation.x) * 0.1;
    root.rotation.y += (targetTiltY - root.rotation.y) * 0.1;
    root.scale.setScalar(scaleFactor);

    renderer.render(scene, camera);
  }

  renderLoop();
}
