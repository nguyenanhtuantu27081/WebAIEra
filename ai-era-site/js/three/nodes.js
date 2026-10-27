import * as THREE from 'three';
import { world } from './scene-setup.js';
import { glowTex } from './core.js';
import { NODES } from '../data/nodes.js';
import { getCurrentLang, onLanguageChange, nodeTranslations } from '../i18n.js';
import { getTierConfig } from '../quality-tier.js';

const cfg = getTierConfig();
const labelsRoot = document.querySelector('#labels');

// Phải khớp với FOV khai báo ở scene-setup.js (new THREE.PerspectiveCamera(48, ...))
const CAMERA_FOV_DEG = 48;
const CAMERA_FOV_RAD = CAMERA_FOV_DEG * Math.PI / 180;

// Phải khớp với getInitialCameraZ() (scene-setup.js) / getBaseCameraDistance() (camera-controller.js)
// -> nếu 3 nơi này lệch nhau, orbit sẽ tính sai khoảng cách an toàn.
function getCameraDistanceForViewport(w, h) {
  const aspect = w / h;
  if (aspect < 0.6) return 17.5;
  if (aspect < 0.8) return 16.5;
  if (aspect < 1.05) return 15.5;
  if (w < 1100) return 15.0;
  return 14.5;
}

export function getResponsiveOrbits() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  const dist = getCameraDistanceForViewport(w, h);

  // Nửa chiều cao / nửa chiều rộng của frustum camera thấy được tại khoảng cách "dist".
  // Đây là kích thước thật (theo world unit) mà màn hình đang hiển thị được,
  // nên nó TỰ ĐỘNG co giãn theo mọi kích thước màn hình, không chỉ vài breakpoint cố định.
  const halfHeight = Math.tan(CAMERA_FOV_RAD / 2) * dist;
  const halfWidth = halfHeight * aspect;

  // Hệ số an toàn: chừa lề cho bán kính node (~0.26), aura glow (scale 1.55),
  // orbit ring, label DOM, và biên độ trôi nổi khi animate (±0.12 theo Y, ±0.15 theo Z).
  const SAFE_X = 0.60;
  const SAFE_Y = 0.62;

  let orbitX = halfWidth * SAFE_X;
  let orbitY = halfHeight * SAFE_Y;

  // Chặn biên: không để orbit co lại quá gần lõi (node đè lên nhau / đè lên hạt nhân)
  // và không để orbit phình quá to trên desktop rộng (node bay ra rìa quá xa lõi).
  orbitX = Math.max(2.0, Math.min(orbitX, 5.8));
  orbitY = Math.max(2.4, Math.min(orbitY, 3.9));

  return { orbitX, orbitY };
}

// Node ở chỉ số này LUÔN nằm thẳng đứng phía trên hạt nhân (do công thức góc bên dưới
// chia đều 6 node quanh vòng tròn, bắt đầu từ -90°). Trên màn hình hẹp/dọc (điện thoại),
// vị trí trên-cùng này dễ đè lên dòng tiêu đề hero. Kéo riêng node này gần hạt nhân hơn
// (chỉ áp dụng ở màn hình hẹp) để né tiêu đề mà không ảnh hưởng 5 node còn lại.
//
// LƯU Ý: tiêu đề hero tiếng Việt ("Trí tuệ cho mọi quyết định kinh doanh.") dài hơn
// bản tiếng Anh nên thường xuống 3 dòng thay vì 2 dòng trên điện thoại → cần độ dịch
// chuyển LỚN HƠN cho 'vi' so với 'en'. Vì lý do này, 2 hằng số dưới đây phụ thuộc
// vào ngôn ngữ hiện tại chứ không phải 1 giá trị cố định.
const TOP_NODE_INDEX = 3;
const MOBILE_ASPECT_BREAKPOINT = 0.7;

// { pullIn: tỉ lệ khoảng cách còn lại của riêng node trên-cùng, worldOffsetY: dịch cả cụm xuống }
const MOBILE_CLEARANCE = {
  vi: { pullIn: 0.66, worldOffsetY: -0.95 }, // tiêu đề 3 dòng -> cần né nhiều hơn
  en: { pullIn: 0.76, worldOffsetY: -0.55 }, // tiêu đề 2 dòng
};

function getMobileClearance() {
  const lang = getCurrentLang();
  return MOBILE_CLEARANCE[lang] || MOBILE_CLEARANCE.en;
}

function getTopNodePullIn() {
  const aspect = window.innerWidth / window.innerHeight;
  return aspect < MOBILE_ASPECT_BREAKPOINT ? getMobileClearance().pullIn : 1;
}

// Dời toàn bộ cụm node + hạt nhân xuống dưới một chút trên màn hình hẹp/dọc,
// để cụm né được vùng tiêu đề hero cố định phía trên (chỉ dịch theo world unit,
// không ảnh hưởng bố cục desktop).
function getWorldYOffset() {
  const aspect = window.innerWidth / window.innerHeight;
  if (aspect < MOBILE_ASPECT_BREAKPOINT) return getMobileClearance().worldOffsetY;
  return 0;
}

export const nodes = [];
export const labelEls = [];

function getNodeName(i, lang) {
  const tr = nodeTranslations[lang];
  return tr ? tr[i].name : NODES[i].name;
}

export function updateNodeOrbits() {
  const { orbitX, orbitY } = getResponsiveOrbits();
  const pullIn = getTopNodePullIn();
  world.position.y = getWorldYOffset();
  nodes.forEach((n, i) => {
    const a = i / nodes.length * Math.PI * 2 - Math.PI / 2;
    const scale = i === TOP_NODE_INDEX ? pullIn : 1;
    n.base.set(
      Math.cos(a) * orbitX * scale,
      Math.sin(a) * orbitY * scale,
      Math.sin(a * 1.7) * 1.05
    );
  });
}

const initOrbits = getResponsiveOrbits();
const initPullIn = getTopNodePullIn();
world.position.y = getWorldYOffset();

NODES.forEach((d, i) => {
  const a = i / NODES.length * Math.PI * 2 - Math.PI / 2;
  const scale = i === TOP_NODE_INDEX ? initPullIn : 1;
  const base = new THREE.Vector3(
    Math.cos(a) * initOrbits.orbitX * scale,
    Math.sin(a) * initOrbits.orbitY * scale,
    Math.sin(a * 1.7) * 1.05
  );

  const group = new THREE.Group();
  group.position.copy(base);
  world.add(group);

  // Node shell
  const ShellMat = cfg.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.26, 2),
    new ShellMat({
      color: 0x101018,
      emissive: d.color,
      emissiveIntensity: 1.2,
      metalness: .65,
      roughness: .22
    })
  );
  group.add(shell);

  // Point light
  const point = new THREE.PointLight(d.color, 5.5, 5.2, 2);
  if (cfg.nodeLights) group.add(point); // mobile: bỏ 6 PointLight (emissive + aura sprite đã đủ sáng)

  // Aura sprite
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTex,
    color: d.color,
    transparent: true,
    opacity: .52,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }));
  aura.scale.set(1.55, 1.55, 1);
  group.add(aura);

  // Orbit ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(.48, .008, 7, 70),
    new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: .44 })
  );
  ring.rotation.set(1.04, .34, .1);
  group.add(ring);

  // Energy line to core
  const lineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0), base.clone()
  ]);
  const line = new THREE.Line(
    lineGeo,
    new THREE.LineBasicMaterial({ color: d.color, transparent: true, opacity: .12 })
  );
  world.add(line);

  // Pulsing dashed line — chỉ tạo khi tier cho phép. Mobile KHÔNG tạo (không geometry, không update).
  let pulseLine = null;
  if (cfg.pulseLines) {
    const pulseGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), base.clone()
    ]);
    const pulseMat = new THREE.LineDashedMaterial({
      color: d.color, transparent: true, opacity: .22,
      dashSize: .09, gapSize: .16
    });
    pulseLine = new THREE.Line(pulseGeo, pulseMat);
    pulseLine.computeLineDistances(); // CHỈ 1 lần: tạo attribute 'lineDistance'
    world.add(pulseLine);
  }

  // DOM label — uses current language
  const lang = getCurrentLang();
  const el = document.createElement('div');
  el.className = 'node-label';
  el.style.left = '0';  // vị trí thật do style.translate quyết định
  el.style.top = '0';
  el.style.setProperty('--node-color', '#' + d.color.toString(16).padStart(6, '0'));
  el.innerHTML = `<span class="node-label-name">${getNodeName(i, lang)}</span>`;
  labelsRoot.appendChild(el);
  labelEls.push(el);

  const n = {
    ...d, index: i, group, shell, aura, ring,
    line, pulseLine, base, el, phase: i * 1.21
  };
  nodes.push(n);

  // Hover cursor class
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// Update node label names when language changes
onLanguageChange((lang) => {
  nodes.forEach((n, i) => {
    const nameEl = n.el.querySelector('.node-label-name');
    if (nameEl) nameEl.textContent = getNodeName(i, lang);
  });
  invalidateLabelSizes();
  updateNodeOrbits();
});

// Animate nodes — called every frame
export function animateNodes(t, selected) {
  nodes.forEach((n, i) => {
    n.group.position.copy(n.base);
    n.group.position.y += Math.sin(t * .72 + n.phase) * .12;
    n.group.position.z += Math.cos(t * .57 + n.phase) * .15;

    const pulse = 1 + Math.sin(t * 2 + n.phase) * .14 + (selected === i ? .18 : 0);
    n.shell.scale.setScalar(pulse);
    n.aura.material.opacity = (selected === i ? .9 : .48) + Math.sin(t * 1.6 + n.phase) * .06;
    n.ring.rotation.z += .004 * (i % 2 ? 1 : -1);
    n.ring.rotation.y += .0014;

    // Update energy line endpoints
    const a = n.line.geometry.attributes.position.array;
    a[3] = n.group.position.x;
    a[4] = n.group.position.y;
    a[5] = n.group.position.z;
    n.line.geometry.attributes.position.needsUpdate = true;

    if (n.pulseLine) {
      const b = n.pulseLine.geometry.attributes.position.array;
      b[3] = n.group.position.x;
      b[4] = n.group.position.y;
      b[5] = n.group.position.z;
      n.pulseLine.geometry.attributes.position.needsUpdate = true;

      // KHÔNG gọi computeLineDistances() mỗi frame (tạo BufferAttribute + GL buffer mới → rò rỉ).
      const ld = n.pulseLine.geometry.attributes.lineDistance;
      if (ld && ld.array) {
        ld.array[1] = Math.hypot(b[3], b[4], b[5]);
        ld.needsUpdate = true;
      }
    }
    n.line.material.opacity = selected === i ? .48 : .11;
  });
}

// ---------------------------------------------------------------------------
// Label projection: không DOM query mỗi frame, không layout thrashing, chỉ ghi khi giá trị đổi
// ---------------------------------------------------------------------------
const _scratchVec = new THREE.Vector3();
const HAS_TRANSLATE = typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('translate', '1px 1px');
let _coreLabel = null;
let _labelSizesCached = false;
const _labelDims = [];

export function invalidateLabelSizes() {
  _labelSizesCached = false;
}
if (typeof document !== 'undefined' && document.fonts?.ready?.then) {
  document.fonts.ready.then(invalidateLabelSizes);
}

export function projectLabels(camera, coreGroup, selected) {
  if (!_coreLabel && typeof document !== 'undefined') {
    _coreLabel = document.querySelector('.core-label');
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  const clampToViewport = w < 900;

  // Đọc kích thước MỘT lần theo batch (chỉ đọc, không ghi xen kẽ → tối đa 1 lần layout)
  if (clampToViewport && !_labelSizesCached) {
    _labelDims.length = 0;
    nodes.forEach((n) => {
      _labelDims.push({
        halfW: (n.el.offsetWidth || 100) / 2 + 10,
        halfH: (n.el.offsetHeight || 28) / 2 + 6,
      });
    });
    _labelSizesCached = true;
  }

  nodes.forEach((n, i) => {
    n.group.getWorldPosition(_scratchVec);
    _scratchVec.project(camera);
    let x = (_scratchVec.x * .5 + .5) * w;
    let y = (-_scratchVec.y * .5 + .5) * h;
    const facing = _scratchVec.z < 1 && _scratchVec.z > -1;

    if (clampToViewport) {
      const dim = _labelDims[i] || { halfW: 60, halfH: 20 };
      x = Math.max(dim.halfW, Math.min(w - dim.halfW, x));
      y = Math.max(dim.halfH + 50, Math.min(h - dim.halfH - 60, y));
    }

    const rx = Math.round(x * 10) / 10;
    const ry = Math.round(y * 10) / 10;
    if (rx !== n._lx || ry !== n._ly) {
      n._lx = rx; n._ly = ry;
      if (HAS_TRANSLATE) {
        n.el.style.translate = rx + 'px ' + ry + 'px'; // compositor-only, không kích hoạt layout
      } else {
        n.el.style.left = rx + 'px';
        n.el.style.top = ry + 'px';
      }
    }
    if (n._facing !== facing) {
      n._facing = facing;
      n.el.style.opacity = facing ? '1' : '0';
      n.el.style.pointerEvents = facing ? 'auto' : 'none';
    }
  });

  if (_coreLabel) {
    coreGroup.getWorldPosition(_scratchVec).project(camera);
    _coreLabel.style.left = Math.round(((_scratchVec.x * .5 + .5) * w) * 10) / 10 + 'px';
    _coreLabel.style.top = Math.round(((-_scratchVec.y * .5 + .5) * h) * 10) / 10 + 'px';
    const op = (_scratchVec.z < 1 && _scratchVec.z > -1 && selected < 0) ? '1' : '.2';
    if (_coreLabel._op !== op) {
      _coreLabel._op = op;
      _coreLabel.style.opacity = op;
    }
  }
}

