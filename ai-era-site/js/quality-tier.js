// js/quality-tier.js — NGUỒN SỰ THẬT DUY NHẤT cho chất lượng render + chống crash-loop.
//
// QUY TẮC SẮT:
//  1. Module này được evaluate ĐÚNG 1 LẦN (ES module singleton). Tier được tính ngay ở đây
//     và KHÔNG ĐỔI trong suốt vòng đời trang. getQualityTier() chỉ là getter thuần, không side-effect.
//  2. Không file nào khác được tự phát hiện mobile / viewport / pointer. Luôn dùng isMobileLike(),
//     getQualityTier(), getTierConfig().
//  3. Các mức: STATIC (không WebGL) < SAFE < LOW < MEDIUM < HIGH < ULTRA.

const SESSION_KEY = 'aiera_s';       // sessionStorage: trạng thái của TAB này  { inflight, alive, hidden }
const LOCAL_KEY = 'aiera_g';         // localStorage: hình phạt dùng chung mọi tab { strikes, until }
const CRASH_WINDOW_MS = 120000;      // lần tải trước "sống" trong 120s gần đây mà không thoát sạch => crash
const PENALTY_MS = 24 * 60 * 60 * 1000;
const HEARTBEAT_MS = 4000;
const VALID = ['STATIC', 'SAFE', 'LOW', 'MEDIUM', 'HIGH', 'ULTRA'];

function safe(fn, fallback) { try { return fn(); } catch (_) { return fallback; } }
function readJSON(getStore, key) {
  return safe(() => JSON.parse(getStore().getItem(key) || '{}') || {}, {});
}
function writeJSON(getStore, key, val) {
  safe(() => getStore().setItem(key, JSON.stringify(val)));
}
const sessionStore = () => window.sessionStorage;
const localStore = () => window.localStorage;

const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
const now = Date.now();

// ---------------------------------------------------------------------------
// 1) Phát hiện crash của lần tải trước (chạy 1 lần duy nhất)
// ---------------------------------------------------------------------------
if (params.get('reset') === '1') {
  safe(() => localStorage.removeItem(LOCAL_KEY));
  safe(() => sessionStorage.removeItem(SESSION_KEY));
}

const sess = readJSON(sessionStore, SESSION_KEY);
const guard = readJSON(localStore, LOCAL_KEY);
let guardDirty = false;

// Tab chết đột ngột khi đang ở foreground: không có pagehide → inflight vẫn true,
// và heartbeat cuối cùng còn rất mới. Tab bị OS kill lúc đang ở nền (hidden) KHÔNG tính là crash.
if (sess.inflight && !sess.hidden && now - (sess.alive || 0) < CRASH_WINDOW_MS) {
  guard.strikes = (guard.strikes || 0) + 1;
  guard.until = now + PENALTY_MS;
  guard.lastCrashAt = now;
  guardDirty = true;
}
if (guard.until && now > guard.until) { // hết hạn phạt
  guard.strikes = 0;
  guard.until = 0;
  guardDirty = true;
}
if (guardDirty) writeJSON(localStore, LOCAL_KEY, guard);

// ---------------------------------------------------------------------------
// 2) Heartbeat: chứng minh trang còn sống; pagehide = thoát sạch
// ---------------------------------------------------------------------------
function beat() {
  const isHidden = typeof document !== 'undefined' ? !!document.hidden : false;
  writeJSON(sessionStore, SESSION_KEY, { inflight: true, alive: Date.now(), hidden: isHidden });
}
beat();
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(beat, HEARTBEAT_MS);
  if (timer && typeof timer.unref === 'function') {
    timer.unref();
  }
}
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('visibilitychange', beat);
}
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('pagehide', () => writeJSON(sessionStore, SESSION_KEY, { inflight: false, alive: Date.now() }));
  window.addEventListener('pageshow', (e) => { if (e.persisted) beat(); });
}

// WebGL context lost = tín hiệu crash mạnh → lần tải sau hạ mức. Chỉ tính 1 lần/trang.
let contextLostReported = false;
export function reportContextLost() {
  if (contextLostReported) return;
  contextLostReported = true;
  const g = readJSON(localStore, LOCAL_KEY);
  g.strikes = (g.strikes || 0) + 1;
  g.until = Date.now() + PENALTY_MS;
  g.lastCrashAt = Date.now();
  writeJSON(localStore, LOCAL_KEY, g);
}

// ---------------------------------------------------------------------------
// 3) Phát hiện thiết bị — DUY NHẤT một chỗ
// ---------------------------------------------------------------------------
// iPhone/iPad (kể cả iPadOS ở chế độ "Desktop website" báo UA là Macintosh). Mọi trình duyệt iOS dùng WebKit.
export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
}

export function isMobileLike() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 ||
    !!window.matchMedia?.('(pointer: coarse)')?.matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ---------------------------------------------------------------------------
// 4) Chọn tier (1 lần) + lý do
// ---------------------------------------------------------------------------
let tierReason = '';
function computeTier() {
  const q = (params.get('tier') || '').toUpperCase();
  if (VALID.includes(q)) { tierReason = 'query:tier'; return q; }
  if (params.get('static') === '1') { tierReason = 'query:static'; return 'STATIC'; }
  if (params.get('safe') === '1') { tierReason = 'query:safe'; return 'SAFE'; }

  if (guard.until && guard.until > now) {
    tierReason = 'crash_guard';
    return (guard.strikes || 0) >= 2 ? 'STATIC' : 'SAFE';
  }
  if (params.get('lite') === '1') { tierReason = 'query:lite'; return 'LOW'; }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    tierReason = 'reduced_motion'; return 'LOW';
  }
  if (typeof navigator !== 'undefined' && navigator.connection?.saveData) {
    tierReason = 'save_data'; return 'LOW';
  }
  // V5: iOS luôn vào SAFE (30fps, 0.75DPR, ít particles) thay vì LOW.
  // WebKit có giới hạn bộ nhớ chặt hơn Chromium nhiều (jetsam limit ~1.3GB trên iPhone 4GB RAM).
  if (isMobileLike() && isIOS()) {
    tierReason = 'ios_mobile'; return 'SAFE';
  }
  if (isMobileLike()) {
    tierReason = 'mobile'; return 'LOW';
  }

  tierReason = 'desktop';
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}
const TIER = computeTier();

// ---------------------------------------------------------------------------
// 5) Cấu hình theo tier
// ---------------------------------------------------------------------------
const FULL = {
  webgl: true, opaque: false, postProcessing: true, pulseLines: true, nodeLights: true, physical: true,
  chrome3d: true, footer3d: true, coreDetail: 5, ringSegments: 190, ringRadial: 8, sparks: 44, maxFps: 0
};
const LITE = {
  webgl: true, opaque: false, postProcessing: false, pulseLines: false, nodeLights: false, physical: false,
  chrome3d: false, footer3d: false, coreDetail: 3, ringSegments: 96, ringRadial: 6, sparks: 24, maxFps: 60
};

export const TIER_CONFIG = {
  STATIC: { ...LITE, webgl: false, particles: 0, dpr: 1, bloom: 0, lights: 0, antialias: false, powerPreference: 'low-power', maxFps: 0 },
  SAFE:   { ...LITE, coreDetail: 2, ringSegments: 64, sparks: 12, particles: 40, dpr: 0.75, bloom: 0, lights: 1, antialias: false, powerPreference: 'low-power', maxFps: 30 },
  LOW:    { ...LITE, particles: 90, dpr: 1, bloom: 0, lights: 1, antialias: false, powerPreference: 'low-power' },
  MEDIUM: { ...FULL, particles: 250, dpr: 1.0, bloom: 0.2, lights: 2, antialias: false, powerPreference: 'default', maxFps: 60 },
  HIGH:   { ...FULL, particles: 600, dpr: 1.25, bloom: 0.45, lights: 2, antialias: true, powerPreference: 'default' },
  ULTRA:  { ...FULL, particles: 1000, dpr: 1.5, bloom: 0.65, lights: 3, antialias: true, powerPreference: 'default' }
};

// Bisect trên thiết bị thật: ?on=pulse,nodelights,physical,composer,chrome3d,footer3d,opaque
// bật lại TỪNG nhóm trong tier hiện tại để tìm nhóm gây crash. Chỉ dùng khi điều tra.
const ON = new Set((params.get('on') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
const ON_MAP = {
  pulse: { pulseLines: true }, nodelights: { nodeLights: true }, physical: { physical: true },
  composer: { postProcessing: true, bloom: 0.2 }, chrome3d: { chrome3d: true }, footer3d: { footer3d: true },
  opaque: { opaque: true } // canvas không trong suốt (alpha:false) — thử nghiệm cho iOS
};
const RESOLVED = { ...TIER_CONFIG[TIER] };
if (TIER !== 'STATIC') ON.forEach((k) => { if (ON_MAP[k]) Object.assign(RESOLVED, ON_MAP[k]); });

// ---------------------------------------------------------------------------
// 5b) Hiệu ứng CSS nặng (đặc biệt với WebKit/iOS) — bật/tắt theo NHÓM bằng class trên <html>
//   fx-off-core     : chữ "AI ERA" ở giữa: bỏ animation nền + 4 lớp drop-shadow, thay bằng quầng sáng tĩnh
//   fx-off-backdrop : bỏ mọi backdrop-filter (blur nền) phủ lên canvas WebGL
//   fx-off-vignette : thay box-shadow inset 180px bằng radial-gradient
// Mặc định: tắt cả 3 nhóm ở tier STATIC/SAFE/LOW. ?fx=full giữ hiệu ứng đầy đủ (để so sánh);
// ?fxoff=core,backdrop chỉ tắt các nhóm được liệt kê (để bisect), áp dụng cho mọi tier.
// ---------------------------------------------------------------------------
const FX_GROUPS = ['core', 'backdrop', 'vignette'];
const fxOff = (() => {
  const q = params.get('fxoff');
  if (q !== null) return q.split(',').map(s => s.trim().toLowerCase()).filter(g => FX_GROUPS.includes(g));
  if (params.get('fx') === 'full') return [];
  return (TIER === 'STATIC' || TIER === 'SAFE' || TIER === 'LOW') ? FX_GROUPS.slice() : [];
})();
safe(() => {
  if (typeof document !== 'undefined' && document.documentElement) {
    const cl = document.documentElement.classList;
    fxOff.forEach(g => cl.add('fx-off-' + g));
    if (isIOS()) cl.add('is-ios');
  }
});

// ---------------------------------------------------------------------------
// 6) API công khai — getter thuần, KHÔNG side-effect
// ---------------------------------------------------------------------------
export function getQualityTier() { return TIER; }
export function getTierReason() { return tierReason; }
export function getTierConfig() { return RESOLVED; }
export function isStaticMode() { return TIER === 'STATIC'; }
export function getFxOff() { return fxOff.slice(); }
export function getGuardState() { return { ...guard, tier: TIER, reason: tierReason, bisect: [...ON], fxOff: fxOff.slice(), ios: isIOS() }; }
