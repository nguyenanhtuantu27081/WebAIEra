# Hướng dẫn xử lý DỨT ĐIỂM lỗi crash / nhấp nháy trên mobile — trang `index.html` (v3, bản của Tech Lead)

> Đối tượng: junior dev. Làm tuần tự từ Bước 0 → Bước 11, tick checklist ở Phần 6.
> Codebase gốc để sửa: bản `WebAIEra_1.zip` (đã có bản vá v2 của đội). Bản tham chiếu đã chạy thử logic: `ai-era-site-v3-reference.zip` (có thể đối chiếu/copy file).
> Tài liệu này thay thế các phần về crash-guard trong hai file hướng dẫn trước (`HUONG_DAN_FIX_CRASH_MOBILE_STEP_BY_STEP.md`, `LOG_HUONG_DAN_DIEU_TRA_CRASH_MOBILE.md`) khi có mâu thuẫn.

---

## 1. Kết luận của Tech Lead (đọc kỹ)

**Bản v2 của đội đã sửa đúng phần lớn nguyên nhân GPU, nhưng:**

1. Đưa vào **lỗi mới nghiêm trọng** (bộ phát hiện crash tự kích hoạt sai ngay cả khi KHÔNG crash; canvas sai kích thước sau resize; nút Liên hệ trống trên mobile; giảm chất lượng desktop ngoài ý muốn…) — chi tiết ở mục 2.3.
2. **Vẫn "mù"**: `diagnostics.js` có gọi `sendBeacon` nhưng `window.__AXIOM_INGEST_ENDPOINT__` không được gán ở đâu trong repo → log chỉ ra `console`, không có dữ liệu thực địa nào về thiết bị crash.
3. **Thiếu cầu chì cuối cùng.** Dù còn nguyên nhân GPU nào sót lại mà ta chưa biết, người dùng vẫn bị kẹt trong vòng crash. Cơ chế "SAFE" của v2 chỉ giảm tải nhẹ, và (do lỗi L1 ở mục 2.3) hoạt động ngẫu nhiên.

**Điều CHƯA được chứng minh (nói thẳng):** chưa ai tái hiện và đo được trên điện thoại thật, nên chưa thể khẳng định *một* nguyên nhân duy nhất. Vì vậy phương án v3 không đặt cược vào việc đoán nguyên nhân, mà dựa trên 3 lớp:

| Lớp | Mục tiêu | Cách làm |
|---|---|---|
| 1. Giảm tải | Loại các nguồn tải/rò rỉ đã biết | Đã có ở v2 (lineDistance, composer, grain…) + sửa các lỗi còn lại (Bước 2–6, 8) |
| 2. Một nguồn sự thật | Cùng 1 tier cho mọi module, không side-effect | Viết lại `quality-tier.js` (Bước 1) |
| 3. Cầu chì | **Đảm bảo không còn vòng crash**: crash 1 lần → `SAFE`; crash lần 2 → `STATIC` (không WebGL, trang vẫn dùng được) | Bước 1 + Bước 7 |

Cộng thêm **công cụ chẩn đoán** (Bước 9–10): `?diag=1`, `?tier=…`, `?on=…` và endpoint nhận log, để lần sau biết chính xác nhóm nào gây crash.

---

## 2. Phân tích chi tiết

### 2.1 Chuỗi nhân quả của triệu chứng
"Nhấp nháy → trình duyệt tự reload → *Đã có sự cố xảy ra liên tục*" nghĩa là tiến trình render (WebContent trên iOS / renderer trên Android) bị hệ điều hành kill vì bộ nhớ/GPU, trình duyệt reload, lại bị kill, đến lần thứ ba thì hiện thông báo. "Nhấp nháy" là canvas bị xoá khi WebGL context bị mất rồi được dựng lại. Mọi trình duyệt mobile đều bị vì iOS dùng chung WebKit, Android dùng chung Chromium/GPU process.

### 2.2 Những gì bản v2 đã làm ĐÚNG (giữ nguyên)
- Ghi `lineDistance` trực tiếp thay vì gọi `computeLineDistances()` mỗi frame (đã xác minh trong source Three.js: mỗi lần gọi tạo `BufferAttribute` mới).
- Mobile không dùng `EffectComposer`; đặt `LinearSRGB + NoToneMapping` để màu giống bản cũ.
- Xử lý `webglcontextlost/restored`; không tạo WebGL context phụ cho hamburger/nút Liên hệ/footer trên mobile.
- Ẩn `.grain` và các `backdrop-filter` trên mobile.
- Dừng vòng lặp khi tab ẩn; thêm telemetry nội bộ.

### 2.3 Lỗi mới / tồn đọng trong bản v2 (có bằng chứng)

| # | Lỗi | Hậu quả | Bằng chứng |
|---|---|---|---|
| **L1** | `getQualityTier()` gọi `checkCrashLoop()` **mỗi lần được gọi**, và hàm này ghi bộ đếm crash. Trang index gọi hàm này **5 lần** (`scene-setup`, `starfield`, `effects`, `hamburger-menu`, `contact-btn-3d`) | Một lần tải **bình thường, không crash** vẫn bị tính là crash 2 lần → các module sau thấy tier `SAFE`, trong khi `scene-setup` thấy tier khác. Desktop bị tắt bloom (vì `effects.js` đọc SAFE), mất nút 3D; cờ `aiera_safe_mode` còn lưu lại nếu người dùng rời trang trước 15s → lần sau cả trang chạy SAFE | Mô phỏng bằng Node với đúng file `quality-tier.js` của đội: kết quả bên dưới |
| **L2** | `renderer.setSize(innerWidth, innerHeight)` lúc khởi tạo (ghi style px inline) nhưng `resizeNow()` dùng `setSize(w,h,false)` (không cập nhật style) | Sau khi xoay màn hình / thanh địa chỉ co giãn, buffer đổi kích thước nhưng canvas vẫn giữ kích thước CSS cũ → hình méo/lệch, node lệch khỏi nhãn | `scene-setup.js` dòng ~88 và ~186; style inline đè CSS `#webgl canvas{width:100%;height:100%}` |
| **L3** | `contact-btn-3d.js` trên mobile: `return` sớm nhưng **không ẩn canvas, không có hình thay thế** | Nút Liên hệ hiển thị một vòng tròn **trống** trên mobile | `contact-btn-3d.js` đầu hàm; CSS của v2 không có orb thay thế |
| **L4** | `core.js` giảm `Icosahedron 5→2`, Torus, sparks cho **mọi tier** | Desktop bị hạ chất lượng hình học (lõi thành đa diện thấy rõ cạnh) | diff `core.js` v2 so với bản gốc |
| **L5** | `prefers-reduced-motion` → `syncAnimationState()` **không bao giờ chạy** vòng lặp, cũng không vẽ khung nào | Người dùng bật "Reduce Motion" (iOS) thấy **canvas trống** | `main.js` v2 |
| **L6** | `clock.stop()`/`clock.start()` khi tab ẩn/hiện; `start()` đặt `elapsedTime = 0` | Mỗi lần quay lại tab, mọi animation nhảy về thời điểm 0 (giật) | Three.js `Clock.start()` |
| **L7** | Phát hiện mobile/DPR ở **3+ nơi** (`quality-tier`, `scene-setup`, `nodes`, `hamburger`, `contact-btn`) với tiêu chí khác nhau (`<768`, `pointer:coarse`, UA); DPR mobile = 1 bất kể tier (SAFE `dpr:0.75` bị bỏ qua) | Các module không thống nhất; khó debug | diff `scene-setup.js`, `nodes.js` |
| **L8** | Không có đường gửi log (`__AXIOM_INGEST_ENDPOINT__` không được gán). Không có giới hạn số log | Không có dữ liệu thiết bị crash; nếu sau này bật endpoint, một vòng lặp lỗi có thể gửi vô hạn | `grep` toàn repo; `diagnostics.js` |
| **L9** | Guard dao động: timer 15s xoá cờ SAFE → lần sau lại chạy chế độ đầy đủ → crash lại; guard dùng `sessionStorage` + `localStorage` lẫn lộn; không có mức "không WebGL" | Vòng "crash – SAFE – crash"; không có lối thoát cuối cùng | `quality-tier.js` v2 |
| **L10** | `projectLabels` vẫn ghi `left/top` mỗi frame cho cả 6 nhãn (kích hoạt layout), `document.querySelector('.core-label')` mỗi frame; cache kích thước nhãn không bị vô hiệu khi **đổi ngôn ngữ / font tải xong** | Tốn CPU; sai vị trí clamp sau đổi ngôn ngữ | `nodes.js` v2 |
| **L11** | Debounce resize **hai nơi** (150ms trong `scene-setup`, nhưng `updateNodeOrbits()` chạy ngay) | Camera/canvas cập nhật trễ 150ms so với vị trí node → giật khi resize | `main.js`, `scene-setup.js` v2 |
| **L12** | Mobile vẫn có 6 `PointLight` + `MeshPhysicalMaterial` (clearcoat) + `pulseLine` vẫn được tạo (chỉ `visible=false`) và vẫn cập nhật mỗi frame | Shader fragment nặng hơn cần thiết; công việc vô ích | `nodes.js`, `core.js` v2 |
| **L13** | `theme.js` import `scene-setup.js` | Import `theme.js` **sẽ tạo WebGL renderer** — bản STATIC tuyệt đối không được import nó | `js/theme.js` dòng 2 |

**Bằng chứng L1** (chạy `node` với file `quality-tier.js` của đội, mô phỏng desktop 1440px, KHÔNG crash, gọi hàm đúng thứ tự các module):
```
scene-setup      -> HIGH
starfield        -> HIGH
effects          -> SAFE      <== cùng một lần tải, đã đổi tier
hamburger-menu   -> SAFE
contact-btn-3d   -> SAFE
localStorage sau 1 lần tải bình thường: { aiera_crash_count: '2', aiera_safe_mode: '1' }
```

### 2.4 Danh sách nghi phạm còn lại (xếp theo khả năng) và cách loại trừ
1. **Rò rỉ GL buffer do `computeLineDistances()` mỗi frame** — đã xác minh, đã sửa ở v2.
2. **Áp lực bộ nhớ GPU do nhiều WebGL context / composer / overdraw** — đã giảm ở v2; v3 đảm bảo mobile chỉ có đúng 1 context.
3. **Compositing CSS đè lên WebGL** (`backdrop-filter`, `mix-blend-mode` của `.grain`) — đã tắt trên mobile ở v2.
4. **Máy test KHÔNG chạy bản mới** (cache/CDN). Cách loại trừ: nhãn `?diag=1` hiện số build (Bước 7).
5. **Nguyên nhân không thuộc WebGL** (DOM/CSS nặng). Cách loại trừ: mở `?tier=STATIC` — nếu vẫn crash thì không phải WebGL (xem 4.4).

**Quy trình quyết định sau khi triển khai v3** (làm trên điện thoại đang bị lỗi, dùng `?diag=1` để thấy tier):
`?tier=STATIC` ổn định? → **có**: WebGL là nguyên nhân; thử `?tier=SAFE` → `?tier=LOW` → rồi bật lại **từng nhóm** bằng `?tier=LOW&on=pulse`, `&on=nodelights`, `&on=physical`, `&on=composer`, `&on=chrome3d`, `&on=footer3d` để tìm đúng nhóm. → **không**: bỏ qua WebGL, xem 4.4.

---

## 3. Hướng dẫn sửa code từng bước

> Quy ước: **"Dán nguyên file"** = thay toàn bộ nội dung. **"Áp diff"** = sửa theo diff (dòng `-` xoá, `+` thêm; số dòng chỉ để tham khảo, bám vào ngữ cảnh). Diff so với **code hiện tại của đội (v2)**. Sau mỗi bước chạy `node --check` (copy file sang đuôi `.mjs` rồi check) và mở trang desktop xem console có lỗi đỏ không.

### Bước 0 — Chuẩn bị
1. Tạo nhánh mới từ nhánh hiện tại: `git checkout -b fix/mobile-crash-v3`.
2. Sao lưu: `git tag backup-before-v3`.
3. Tạo thư mục `tests/` ở **gốc repo** (ngang hàng `ai-era-site/`, KHÔNG đặt trong `ai-era-site/` vì thư mục đó được phục vụ công khai).
4. **Quy tắc cho toàn bộ bước sau:** không thêm bất kỳ đoạn phát hiện mobile / viewport / pointer nào mới; luôn dùng `isMobileLike()`, `getQualityTier()`, `getTierConfig()` từ `quality-tier.js`.

### Bước 1 — Viết lại `ai-era-site/js/quality-tier.js` (Dán nguyên file)
**Vì sao:** sửa L1, L7, L9; thêm mức `STATIC`; tier được tính **một lần** khi module được nạp; getter không có side-effect.
**Cơ chế phát hiện crash** (đã được kiểm thử, xem Bước 10):
- Mỗi tab ghi `sessionStorage.aiera_s = {inflight, alive, hidden}` mỗi 4 giây; `pagehide` (thoát sạch) đặt `inflight:false`.
- Lần tải sau thấy `inflight:true`, tab **đang ở foreground** (`hidden:false`) và nhịp tim cuối < 120 giây ⇒ lần trước **chết đột ngột** ⇒ ghi 1 "strike" vào `localStorage.aiera_g` kèm hạn **24 giờ**.
- 1 strike ⇒ `SAFE`; ≥ 2 strike ⇒ `STATIC`. Hình phạt ghi ở `localStorage` nên **mọi tab** đều áp dụng. Tab bị OS kill khi đang ở nền **không** bị tính. Không còn timer xoá cờ → hết dao động.
- `?reset=1` xoá hình phạt (dùng khi test).

```js
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

const params = new URLSearchParams(location.search);
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
  writeJSON(sessionStore, SESSION_KEY, { inflight: true, alive: Date.now(), hidden: document.hidden });
}
beat();
setInterval(beat, HEARTBEAT_MS);
document.addEventListener('visibilitychange', beat);
addEventListener('pagehide', () => writeJSON(sessionStore, SESSION_KEY, { inflight: false, alive: Date.now() }));
addEventListener('pageshow', (e) => { if (e.persisted) beat(); });

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
export function isMobileLike() {
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

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) { tierReason = 'reduced_motion'; return 'LOW'; }
  if (navigator.connection?.saveData) { tierReason = 'save_data'; return 'LOW'; }
  if (isMobileLike()) { tierReason = 'mobile'; return 'LOW'; }

  tierReason = 'desktop';
  const w = window.innerWidth;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}
const TIER = computeTier();

// ---------------------------------------------------------------------------
// 5) Cấu hình theo tier
// ---------------------------------------------------------------------------
const FULL = {
  webgl: true, postProcessing: true, pulseLines: true, nodeLights: true, physical: true,
  chrome3d: true, footer3d: true, coreDetail: 5, ringSegments: 190, ringRadial: 8, sparks: 44, maxFps: 0
};
const LITE = {
  webgl: true, postProcessing: false, pulseLines: false, nodeLights: false, physical: false,
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

// Bisect trên thiết bị thật: ?on=pulse,nodelights,physical,composer,chrome3d,footer3d
// bật lại TỪNG nhóm trong tier hiện tại để tìm nhóm gây crash. Chỉ dùng khi điều tra.
const ON = new Set((params.get('on') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
const ON_MAP = {
  pulse: { pulseLines: true }, nodelights: { nodeLights: true }, physical: { physical: true },
  composer: { postProcessing: true, bloom: 0.2 }, chrome3d: { chrome3d: true }, footer3d: { footer3d: true }
};
const RESOLVED = { ...TIER_CONFIG[TIER] };
if (TIER !== 'STATIC') ON.forEach((k) => { if (ON_MAP[k]) Object.assign(RESOLVED, ON_MAP[k]); });

// ---------------------------------------------------------------------------
// 6) API công khai — getter thuần, KHÔNG side-effect
// ---------------------------------------------------------------------------
export function getQualityTier() { return TIER; }
export function getTierReason() { return tierReason; }
export function getTierConfig() { return RESOLVED; }
export function isStaticMode() { return TIER === 'STATIC'; }
export function getGuardState() { return { ...guard, tier: TIER, reason: tierReason, bisect: [...ON] }; }
```
**Kiểm tra:** `node tests/quality-tier.test.mjs` (tạo ở Bước 10) — 12 kịch bản phải đạt.

### Bước 2 — `ai-era-site/js/three/scene-setup.js` (Áp diff)
**Vì sao:** L2 (setSize), L7 (DPR từ cấu hình tier), L11 (bỏ debounce thứ hai), import `reportContextLost` đưa lên đầu file.
```diff
--- a/ai-era-site/js/three/scene-setup.js
+++ b/ai-era-site/js/three/scene-setup.js
@@ -6,28 +6,22 @@
 import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
 import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
-import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';
+import { getQualityTier, getTierConfig, getTierReason, reportContextLost } from '../quality-tier.js';
 import { logDiagInfo, logDiagWarn, logDiagError } from '../diagnostics.js';
 
 export const tier = getQualityTier();
-const cfg = TIER_CONFIG[tier];
+const cfg = getTierConfig();
 
 logDiagInfo('render_quality_selected', {
   tier,
+  reason: getTierReason(),
   configuredDpr: cfg.dpr,
   antialias: cfg.antialias,
   bloom: cfg.bloom,
-  pointerCoarse: window.matchMedia?.('(pointer: coarse)')?.matches ?? null,
-  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? null,
-  saveData: navigator.connection?.saveData ?? null,
 });
 
 // --- DPR helper: cap pixel ratio on mobile/touch to reduce GPU fill-rate ---
+// DPR luôn lấy từ cấu hình tier (LOW=1, SAFE=0.75...), không tự phát hiện mobile ở đây.
 function getRenderPixelRatio() {
-  const isSmallOrTouch =
-    window.innerWidth < 768 ||
-    window.matchMedia?.('(pointer: coarse)')?.matches;
-
-  const cap = isSmallOrTouch ? 1 : cfg.dpr;
-  return Math.min(window.devicePixelRatio || 1, cap);
+  return Math.min(window.devicePixelRatio || 1, cfg.dpr);
 }
 
@@ -72,6 +66,4 @@
 export const renderer = rendererInstance;
 
-import { reportContextLost } from '../quality-tier.js';
-
 export let contextLost = false;
 
@@ -86,6 +78,8 @@
 }
 
-renderer.setSize(innerWidth, innerHeight);
+// updateStyle=false: kích thước hiển thị do CSS (#webgl canvas {width:100%;height:100%}) quyết định.
+// Nếu để true, three ghi style px inline → resize sau đó (updateStyle=false) sẽ bị canvas giữ CSS size cũ.
 renderer.setPixelRatio(getRenderPixelRatio());
+renderer.setSize(innerWidth, innerHeight, false);
 mount.appendChild(renderer.domElement);
 
@@ -172,6 +166,5 @@
 scene.add(world);
 
-// Resize handler — FIX: debounced to avoid rapid resize on mobile address-bar toggle
-let resizeTimer = 0;
+// Resize handler — debounce được thực hiện MỘT chỗ duy nhất ở three-app.js
 let lastResizeLogAt = 0;
 
@@ -204,6 +197,5 @@
 
 export function onResize() {
-  window.clearTimeout(resizeTimer);
-  resizeTimer = window.setTimeout(resizeNow, 150);
+  resizeNow();
 }
 
```
**Kiểm tra:** mở desktop, đổi kích thước cửa sổ → canvas luôn phủ kín, node đúng vị trí nhãn.

### Bước 3 — `ai-era-site/js/three/core.js` (Áp diff)
**Vì sao:** L4 — độ chi tiết lấy từ `cfg` theo tier (desktop trở lại đúng như bản gốc: 5 / 190 / 8 / 44), mobile nhẹ, bỏ clearcoat trên mobile.
```diff
--- a/ai-era-site/js/three/core.js
+++ b/ai-era-site/js/three/core.js
@@ -3,4 +3,7 @@
 import * as THREE from 'three';
 import { world } from './scene-setup.js';
+import { getTierConfig } from '../quality-tier.js';
+
+const cfg = getTierConfig();
 
 // Shared radial glow texture
@@ -27,14 +30,16 @@
 // Icosahedron core
 export const core = new THREE.Mesh(
-  new THREE.IcosahedronGeometry(1.28, 2),
-  new THREE.MeshPhysicalMaterial({
-    color: 0x11121e,
-    metalness: .7,
-    roughness: .16,
-    clearcoat: 1,
-    clearcoatRoughness: .12,
-    emissive: 0x34398c,
-    emissiveIntensity: 1.45
-  })
+  new THREE.IcosahedronGeometry(1.28, cfg.coreDetail),
+  cfg.physical
+    ? new THREE.MeshPhysicalMaterial({
+        color: 0x11121e, metalness: .7, roughness: .16,
+        clearcoat: 1, clearcoatRoughness: .12,
+        emissive: 0x34398c, emissiveIntensity: 1.45
+      })
+    // Mobile: bỏ lớp clearcoat (tốn fragment shader), giữ nguyên các thông số còn lại
+    : new THREE.MeshStandardMaterial({
+        color: 0x11121e, metalness: .7, roughness: .16,
+        emissive: 0x34398c, emissiveIntensity: 1.45
+      })
 );
 coreGroup.add(core);
@@ -42,5 +47,5 @@
 // Wireframe overlay
 export const coreWire = new THREE.LineSegments(
-  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.39, 1)),
+  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.39, Math.max(1, cfg.coreDetail - 3))),
   new THREE.LineBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: .19 })
 );
@@ -63,5 +68,5 @@
 [1.72, 2.08, 2.48].forEach((r, i) => {
   const torus = new THREE.Mesh(
-    new THREE.TorusGeometry(r, .009 + i * .003, 6, 96),
+    new THREE.TorusGeometry(r, .009 + i * .003, cfg.ringRadial, cfg.ringSegments),
     new THREE.MeshBasicMaterial({
       color: i === 1 ? 0x67e8f9 : 0x818cf8,
@@ -79,5 +84,5 @@
 const sparkGroup = new THREE.Group();
 coreGroup.add(sparkGroup);
-for (let i = 0; i < 24; i++) {
+for (let i = 0; i < cfg.sparks; i++) {
   const a = Math.random() * Math.PI * 2;
   const b = Math.acos(THREE.MathUtils.randFloatSpread(2));
```

### Bước 4 — `ai-era-site/js/three/nodes.js` (Áp diff)
**Vì sao:** L10, L12. Mobile: không tạo `pulseLine`, không có 6 `PointLight`, vật liệu `MeshStandardMaterial`; nhãn dùng `style.translate` (không layout), chỉ ghi DOM khi giá trị đổi, cache kích thước nhãn và vô hiệu khi đổi ngôn ngữ / font tải xong.
```diff
--- a/ai-era-site/js/three/nodes.js
+++ b/ai-era-site/js/three/nodes.js
@@ -1,4 +1,3 @@
 // js/three/nodes.js — 6 business ecosystem nodes + energy lines + labels
-// FIX: mobile-index-webgl-crash — hide pulse lines on mobile, stop per-frame computeLineDistances
 import * as THREE from 'three';
 import { world } from './scene-setup.js';
@@ -6,12 +5,9 @@
 import { NODES } from '../data/nodes.js';
 import { getCurrentLang, onLanguageChange, nodeTranslations } from '../i18n.js';
+import { getTierConfig } from '../quality-tier.js';
 
-const labelsRoot = document.querySelector('#labels');
+const cfg = getTierConfig();
 
-// FIX: module-level low-power detection to skip pulse line work on mobile
-function isLowPowerViewport() {
-  return window.innerWidth < 768 ||
-    window.matchMedia?.('(pointer: coarse)')?.matches;
-}
+const labelsRoot = document.querySelector('#labels');
 
 // Phải khớp với FOV khai báo ở scene-setup.js (new THREE.PerspectiveCamera(48, ...))
@@ -136,7 +132,8 @@
 
   // Node shell
+  const ShellMat = cfg.physical ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
   const shell = new THREE.Mesh(
     new THREE.IcosahedronGeometry(.26, 2),
-    new THREE.MeshPhysicalMaterial({
+    new ShellMat({
       color: 0x101018,
       emissive: d.color,
@@ -150,5 +147,5 @@
   // Point light
   const point = new THREE.PointLight(d.color, 5.5, 5.2, 2);
-  group.add(point);
+  if (cfg.nodeLights) group.add(point); // mobile: bỏ 6 PointLight (emissive + aura sprite đã đủ sáng)
 
   // Aura sprite
@@ -182,19 +179,18 @@
   world.add(line);
 
-  // Pulsing dashed line
-  const pulseGeo = new THREE.BufferGeometry().setFromPoints([
-    new THREE.Vector3(0, 0, 0), base.clone()
-  ]);
-  const pulseMat = new THREE.LineDashedMaterial({
-    color: d.color, transparent: true, opacity: .22,
-    dashSize: .09, gapSize: .16
-  });
-  const pulseLine = new THREE.Line(pulseGeo, pulseMat);
-  pulseLine.computeLineDistances();
-  // FIX: hide pulse line on mobile to avoid per-frame VRAM leak from computeLineDistances
-  if (isLowPowerViewport()) {
-    pulseLine.visible = false;
+  // Pulsing dashed line — chỉ tạo khi tier cho phép. Mobile KHÔNG tạo (không geometry, không update).
+  let pulseLine = null;
+  if (cfg.pulseLines) {
+    const pulseGeo = new THREE.BufferGeometry().setFromPoints([
+      new THREE.Vector3(0, 0, 0), base.clone()
+    ]);
+    const pulseMat = new THREE.LineDashedMaterial({
+      color: d.color, transparent: true, opacity: .22,
+      dashSize: .09, gapSize: .16
+    });
+    pulseLine = new THREE.Line(pulseGeo, pulseMat);
+    pulseLine.computeLineDistances(); // CHỈ 1 lần: tạo attribute 'lineDistance'
+    world.add(pulseLine);
   }
-  world.add(pulseLine);
 
   // DOM label — uses current language
@@ -202,4 +198,6 @@
   const el = document.createElement('div');
   el.className = 'node-label';
+  el.style.left = '0';  // vị trí thật do style.translate (compositor) quyết định, xem projectLabels
+  el.style.top = '0';
   el.style.setProperty('--node-color', '#' + d.color.toString(16).padStart(6, '0'));
   el.innerHTML = `<span class="node-label-name">${getNodeName(i, lang)}</span>`;
@@ -224,4 +222,5 @@
     if (nameEl) nameEl.textContent = getNodeName(i, lang);
   });
+  invalidateLabelSizes(); // độ rộng nhãn đổi theo ngôn ngữ
   // Tiêu đề hero đổi độ dài theo ngôn ngữ (VI thường dài hơn, xuống 3 dòng trên mobile)
   // -> tính lại vị trí node/hạt nhân để né đúng theo ngôn ngữ mới.
@@ -249,14 +248,14 @@
     n.line.geometry.attributes.position.needsUpdate = true;
 
-    const b = n.pulseLine.geometry.attributes.position.array;
-    b[3] = n.group.position.x;
-    b[4] = n.group.position.y;
-    b[5] = n.group.position.z;
-    n.pulseLine.geometry.attributes.position.needsUpdate = true;
-
-    // FIX: Update dashed line distance without recreating GPU buffers or calling computeLineDistances() per-frame
-    // Line has exactly 2 points: [0, 0, 0] at origin and [b[3], b[4], b[5]] at node
-    const ld = n.pulseLine.geometry.attributes.lineDistance;
-    if (ld && ld.array) {
+    if (n.pulseLine) {
+      const b = n.pulseLine.geometry.attributes.position.array;
+      b[3] = n.group.position.x;
+      b[4] = n.group.position.y;
+      b[5] = n.group.position.z;
+      n.pulseLine.geometry.attributes.position.needsUpdate = true;
+
+      // KHÔNG gọi computeLineDistances() mỗi frame (tạo BufferAttribute + GL buffer mới → rò rỉ).
+      // Line có đúng 2 điểm, điểm đầu ở gốc → ghi thẳng vào mảng có sẵn.
+      const ld = n.pulseLine.geometry.attributes.lineDistance;
       ld.array[1] = Math.hypot(b[3], b[4], b[5]);
       ld.needsUpdate = true;
@@ -266,7 +265,10 @@
 }
 
-// Reusable scratch vectors for projecting labels
+// ---------------------------------------------------------------------------
+// Label projection: không DOM query mỗi frame, không layout thrashing, chỉ ghi khi giá trị đổi
+// ---------------------------------------------------------------------------
 const _scratchVec = new THREE.Vector3();
-const _scratchCore = new THREE.Vector3();
+const HAS_TRANSLATE = typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('translate', '1px 1px');
+let _coreLabel = null;
 let _labelSizesCached = false;
 const _labelDims = [];
@@ -275,12 +277,14 @@
   _labelSizesCached = false;
 }
+document.fonts?.ready?.then(invalidateLabelSizes);
 
-// Project labels onto screen space with smart boundary clamping and cached DOM sizes
 export function projectLabels(camera, coreGroup, selected) {
-  const coreLabel = document.querySelector('.core-label');
+  if (!_coreLabel) _coreLabel = document.querySelector('.core-label');
   const w = window.innerWidth;
   const h = window.innerHeight;
+  const clampToViewport = w < 900;
 
-  if (!_labelSizesCached) {
+  // Đọc kích thước MỘT lần theo batch (chỉ đọc, không ghi xen kẽ → tối đa 1 lần layout)
+  if (clampToViewport && !_labelSizesCached) {
     _labelDims.length = 0;
     nodes.forEach((n) => {
@@ -300,6 +304,5 @@
     const facing = _scratchVec.z < 1 && _scratchVec.z > -1;
 
-    // Viewport safety margin: clamp label coordinates so they never clip off screen
-    if (w < 900) {
+    if (clampToViewport) {
       const dim = _labelDims[i] || { halfW: 60, halfH: 20 };
       x = Math.max(dim.halfW, Math.min(w - dim.halfW, x));
@@ -307,17 +310,28 @@
     }
 
-    n.el.style.left = x + 'px';
-    n.el.style.top = y + 'px';
-    n.el.style.opacity = facing ? '1' : '0';
-    n.el.style.pointerEvents = facing ? 'auto' : 'none';
+    const rx = Math.round(x * 10) / 10;
+    const ry = Math.round(y * 10) / 10;
+    if (rx !== n._lx || ry !== n._ly) {
+      n._lx = rx; n._ly = ry;
+      if (HAS_TRANSLATE) {
+        n.el.style.translate = rx + 'px ' + ry + 'px'; // compositor-only, không kích hoạt layout
+      } else {
+        n.el.style.left = rx + 'px';
+        n.el.style.top = ry + 'px';
+      }
+    }
+    if (n._facing !== facing) {
+      n._facing = facing;
+      n.el.style.opacity = facing ? '1' : '0';
+      n.el.style.pointerEvents = facing ? 'auto' : 'none';
+    }
   });
 
-  if (coreLabel) {
-    coreGroup.getWorldPosition(_scratchCore);
-    _scratchCore.project(camera);
-    coreLabel.style.left = ((_scratchCore.x * .5 + .5) * w) + 'px';
-    coreLabel.style.top = ((-_scratchCore.y * .5 + .5) * h) + 'px';
-    coreLabel.style.opacity = (_scratchCore.z < 1 && _scratchCore.z > -1 && selected < 0) ? '1' : '.2';
+  if (_coreLabel) {
+    coreGroup.getWorldPosition(_scratchVec).project(camera);
+    _coreLabel.style.left = Math.round(((_scratchVec.x * .5 + .5) * w) * 10) / 10 + 'px';
+    _coreLabel.style.top = Math.round(((-_scratchVec.y * .5 + .5) * h) * 10) / 10 + 'px';
+    const op = (_scratchVec.z < 1 && _scratchVec.z > -1 && selected < 0) ? '1' : '.2';
+    if (_coreLabel._op !== op) { _coreLabel._op = op; _coreLabel.style.opacity = op; }
   }
 }
-
```
**Lưu ý:** `translate` cần Chrome ≥ 104 / iOS ≥ 14.5; máy cũ hơn tự rơi về `left/top` (đã có nhánh dự phòng). Nhãn có `left:0;top:0` inline để `translate` đặt đúng chỗ.

### Bước 5 — `effects.js` và `starfield.js` (Áp diff)
**Vì sao:** thôi dùng `getQualityTier()` + `TIER_CONFIG` rời rạc (L1/L7).
```diff
--- a/ai-era-site/js/three/effects.js
+++ b/ai-era-site/js/three/effects.js
@@ -1,10 +1,10 @@
 // js/three/effects.js — Bloom tuning per quality tier
 import { bloom } from './scene-setup.js';
-import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';
+import { getQualityTier, getTierConfig } from '../quality-tier.js';
 
 export function applyQualityEffects() {
   if (!bloom) return;
   const tier = getQualityTier();
-  const cfg = TIER_CONFIG[tier];
+  const cfg = getTierConfig();
   bloom.strength = cfg.bloom;
 
```
```diff
--- a/ai-era-site/js/three/starfield.js
+++ b/ai-era-site/js/three/starfield.js
@@ -2,8 +2,7 @@
 import * as THREE from 'three';
 import { scene } from './scene-setup.js';
-import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';
+import { getTierConfig } from '../quality-tier.js';
 
-const tier = getQualityTier();
-const cfg = TIER_CONFIG[tier];
+const cfg = getTierConfig();
 
 function makeStarLayer(count, spread, size, opacity) {
```

### Bước 6 — Hamburger, nút Liên hệ, footer (Áp diff)
**Vì sao:** L3, L7. Nút Liên hệ trên mobile ẩn canvas và bật orb CSS (CSS ở Bước 8); footer thêm class `is-static` để có nền CSS thay cho WebGL.
```diff
--- a/ai-era-site/js/three/hamburger-menu.js
+++ b/ai-era-site/js/three/hamburger-menu.js
@@ -3,5 +3,5 @@
 // Morphs between 3 horizontal bars and an X icon with purple-indigo glow.
 import * as THREE from 'three';
-import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';
+import { getTierConfig, isMobileLike } from '../quality-tier.js';
 import { logDiagInfo, logDiagError, logDiagWarn } from '../diagnostics.js';
 
@@ -10,11 +10,10 @@
 
   // Don't create WebGL context if button is hidden or chrome3d is disabled in tier
-  const tier = getQualityTier();
-  if (TIER_CONFIG[tier]?.chrome3d === false || window.getComputedStyle(button).display === 'none') {
+  if (!getTierConfig().chrome3d || window.getComputedStyle(button).display === 'none') {
     return;
   }
 
   const size = 26;
-  const isMobile = window.innerWidth < 768 || window.matchMedia?.('(pointer: coarse)')?.matches;
+  const isMobile = isMobileLike();
   const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
 
```
```diff
--- a/ai-era-site/js/three/contact-btn-3d.js
+++ b/ai-era-site/js/three/contact-btn-3d.js
@@ -3,5 +3,5 @@
 // FIX: mobile-index-webgl-crash — lower DPR on mobile, stop loop when tab hidden
 import * as THREE from 'three';
-import { getQualityTier, TIER_CONFIG } from '../quality-tier.js';
+import { getTierConfig, isMobileLike } from '../quality-tier.js';
 import { logDiagInfo, logDiagError, logDiagWarn } from '../diagnostics.js';
 
@@ -11,7 +11,9 @@
   if (!canvas || !btn) return;
 
-  // Don't create WebGL context if chrome3d is disabled in tier (mobile/SAFE)
-  const tier = getQualityTier();
-  if (TIER_CONFIG[tier]?.chrome3d === false) {
+  // Tier không cho phép WebGL phụ (mobile/SAFE/STATIC): KHÔNG tạo renderer.
+  // Ẩn canvas trống và bật orb CSS (xem css: .contact-cta-btn--lite). Link #contactFooter vẫn hoạt động.
+  if (!getTierConfig().chrome3d) {
+    btn.classList.add('contact-cta-btn--lite');
+    canvas.style.display = 'none';
     return;
   }
@@ -19,8 +21,5 @@
   const size = 56;
   // FIX: cap DPR to 1 on mobile to reduce GPU load for decorative canvas
-  const isSmallOrTouch =
-    window.innerWidth < 768 ||
-    window.matchMedia?.('(pointer: coarse)')?.matches;
-  const dpr = Math.min(window.devicePixelRatio || 1, isSmallOrTouch ? 1 : 2);
+  const dpr = Math.min(window.devicePixelRatio || 1, isMobileLike() ? 1 : 2);
 
   // Scene & Camera
```
```diff
--- a/ai-era-site/js/contact-footer.js
+++ b/ai-era-site/js/contact-footer.js
@@ -2,5 +2,5 @@
 // FIX: mobile-index-webgl-crash — start/stop animation based on visibility
 import * as THREE from 'three';
-import { getQualityTier, TIER_CONFIG } from './quality-tier.js';
+import { getTierConfig } from './quality-tier.js';
 import { logDiagInfo, logDiagError, logDiagWarn } from './diagnostics.js';
 
@@ -330,7 +330,7 @@
     if (footerVisible) {
       if (!mounted) {
-        const tier = getQualityTier();
-        if (TIER_CONFIG[tier]?.footer3d === false) {
-          // Disable 3D footer for mobile/SAFE tier, use CSS background fallback
+        if (!getTierConfig().footer3d) {
+          // Mobile/SAFE/STATIC: không tạo WebGL context thứ 2 — dùng nền CSS tĩnh
+          container.classList.add('is-static');
           return;
         }
```

### Bước 7 — Tách entry point: `main.js` → `three-app.js` + `main.js` mới + `static-fallback.js`
**Vì sao:** đây là "cầu chì" (lớp 3). `main.js` cũ import Three.js ở cấp cao nhất nên WebGL luôn được tạo trước khi ta kịp quyết định. Tách ra để quyết định **trước**, chỉ `import()` phần WebGL khi tier ≠ `STATIC`.

**7.1** Đổi tên (giữ lịch sử git): `git mv ai-era-site/js/main.js ai-era-site/js/three-app.js`, rồi áp diff dưới đây lên `three-app.js` (sửa L5, L6, L11; bỏ khởi tạo diagnostics và log "stage" vì `main.js` mới sẽ làm):
```diff
--- a/ai-era-site/js/main.js (bản cũ)
+++ b/ai-era-site/js/three-app.js (bản mới)
@@ -1,21 +1,8 @@
-// js/main.js — Entry point: imports all modules, runs animation loop
-// FIX: mobile-index-webgl-crash — proper animation lifecycle with syncAnimationState
+// js/three-app.js — Toàn bộ ứng dụng WebGL của trang chủ.
+// CHỈ được nạp bằng dynamic import() từ main.js khi tier != STATIC.
 import * as THREE from 'three';
-import { initDiagnostics, logDiagInfo } from './diagnostics.js';
-
-// Khởi tạo logging chẩn đoán sớm
-initDiagnostics();
-logDiagInfo('home_module_start', {
-  userAgent: navigator.userAgent,
-  online: navigator.onLine,
-  hardwareConcurrency: navigator.hardwareConcurrency ?? null,
-  deviceMemoryGB: navigator.deviceMemory ?? null,
-  saveData: navigator.connection?.saveData ?? null,
-});
-
-logDiagInfo('home_init_stage', { stage: 'before-scene-init' });
+import { logDiagInfo } from './diagnostics.js';
 import { scene, camera, renderer, composer, usePostProcessing, contextLost, onResize, tier } from './three/scene-setup.js';
-import { TIER_CONFIG } from './quality-tier.js';
-logDiagInfo('home_init_stage', { stage: 'after-scene-init' });
+import { getTierConfig } from './quality-tier.js';
 
 import { coreGroup, animateCore } from './three/core.js';
@@ -38,5 +25,5 @@
 applyQualityEffects();
 
-logDiagInfo('home_init_stage', { stage: 'all-modules-initialized' });
+logDiagInfo('home_init_stage', { stage: 'all-modules-initialized', tier });
 
 // Animation loop & pause state (Checklist F.7)
@@ -65,7 +52,7 @@
     !reduceMotion.matches;
 
+  // KHÔNG gọi clock.stop()/start(): start() đặt elapsedTime về 0 → animation nhảy giật mỗi lần quay lại tab.
   if (shouldRun && !animationRunning) {
     animationRunning = true;
-    clock.start();
     renderer.setAnimationLoop(animate);
     logAnimationState('running');
@@ -73,5 +60,4 @@
     animationRunning = false;
     renderer.setAnimationLoop(null);
-    clock.stop();
     logAnimationState('paused', {
       isVisible,
@@ -80,4 +66,10 @@
     });
   }
+  // prefers-reduced-motion: không chạy vòng lặp, nhưng PHẢI vẽ 1 khung tĩnh (nếu không canvas trống)
+  if (reduceMotion.matches) renderOneFrame();
+}
+
+function renderOneFrame() {
+  requestAnimationFrame(() => animate(Number.MAX_SAFE_INTEGER));
 }
 
@@ -127,5 +119,5 @@
 
 // FPS throttle per tier (e.g. SAFE = 30 FPS, LOW = 60 FPS)
-const maxFps = TIER_CONFIG[tier]?.maxFps || 0;
+const maxFps = getTierConfig().maxFps || 0;
 const MIN_FRAME_MS = maxFps > 0 ? (1000 / maxFps - 2) : 0;
 let lastFrameTs = 0;
@@ -133,5 +125,5 @@
 function animate(ts) {
   if (contextLost) return;
-  if (MIN_FRAME_MS > 0 && typeof ts === 'number') {
+  if (MIN_FRAME_MS > 0 && typeof ts === 'number' && ts !== Number.MAX_SAFE_INTEGER) {
     if (ts - lastFrameTs < MIN_FRAME_MS) return;
     lastFrameTs = ts;
@@ -171,9 +163,22 @@
 
 // Window resize
-function handleWindowResize() {
+// Debounce 150ms MỘT chỗ duy nhất. Trên mobile, thanh địa chỉ co/giãn khi cuộn bắn resize liên tục;
+// cấp phát lại drawing buffer mỗi lần gây giật + áp lực bộ nhớ GPU.
+let resizeTimer = 0;
+let lastW = innerWidth;
+let lastH = innerHeight;
+function applyResize() {
+  if (innerWidth === lastW && innerHeight === lastH) return;
+  lastW = innerWidth;
+  lastH = innerHeight;
   invalidateLabelSizes();
   onResize();
   updateNodeOrbits();
   onCameraResize();
+  if (!animationRunning) renderOneFrame();
+}
+function handleWindowResize() {
+  clearTimeout(resizeTimer);
+  resizeTimer = setTimeout(applyResize, 150);
 }
 addEventListener('resize', handleWindowResize, { passive: true });
```

**7.2** Tạo `ai-era-site/js/main.js` mới (Dán nguyên file; `index.html` vẫn trỏ `./js/main.js` nên **không cần sửa đường dẫn**). Nó cũng cung cấp `?diag=1` hiện nhãn debug trên màn hình:
```js
// js/main.js — Entry point NHẸ của trang chủ.
// Chỉ import quality-tier + diagnostics (không kéo Three.js). Quyết định chế độ TRƯỚC khi tạo bất kỳ
// WebGL context nào, để một thiết bị đã crash không bao giờ phải chạy lại đường code gây crash.
import { initDiagnostics, logDiagInfo, logDiagError, BUILD_VERSION } from './diagnostics.js';
import { getQualityTier, getTierReason, getGuardState, isStaticMode } from './quality-tier.js';

initDiagnostics();
logDiagInfo('home_boot', {
  userAgent: navigator.userAgent, // chỉ gửi 1 lần ở home_boot
  tier: getQualityTier(),
  reason: getTierReason(),
  guard: getGuardState(),
  deviceMemoryGB: navigator.deviceMemory ?? null,
  hardwareConcurrency: navigator.hardwareConcurrency ?? null,
});

// ?diag=1: hiện nhãn debug trên màn hình (dùng khi test trên điện thoại không có remote debugging)
if (new URLSearchParams(location.search).get('diag') === '1') {
  const g = getGuardState();
  const el = document.createElement('pre');
  el.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;margin:0;padding:6px 8px;font:11px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.75);border-radius:6px;pointer-events:none;white-space:pre-wrap;max-width:90vw';
  el.textContent = `build ${BUILD_VERSION}\ntier ${g.tier} (${g.reason})\nstrikes ${g.strikes || 0} until ${g.until ? new Date(g.until).toISOString() : '-'}\nbisect [${g.bisect}]\ndpr ${devicePixelRatio} vp ${innerWidth}x${innerHeight}`;
  document.body.appendChild(el);
}

async function startStatic(why) {
  document.documentElement.classList.add('no-webgl');
  try {
    const { initStaticFallback } = await import('./static-fallback.js');
    initStaticFallback();
    logDiagInfo('home_static_started', { why });
  } catch (err) {
    logDiagError('home_static_failed', { message: String(err?.message || err) });
  }
}

if (isStaticMode()) {
  startStatic(getTierReason());
} else {
  import('./three-app.js').catch((err) => {
    // Lỗi tạo renderer / module → không để trang trắng: chuyển sang bản tĩnh
    logDiagError('home_three_app_failed', { message: String(err?.message || err), name: String(err?.name || '') });
    startStatic('three_app_failed');
  });
}
```

**7.3** Tạo `ai-era-site/js/static-fallback.js` (Dán nguyên file). **Tuyệt đối không import `three`, `scene-setup.js`, `theme.js`** (L13):
```js
// js/static-fallback.js — Bản KHÔNG WebGL của trang chủ (tier STATIC hoặc khi WebGL lỗi).
// Tuyệt đối không import three, scene-setup, theme.js (theme.js kéo theo scene-setup → tạo WebGL).
import { NODES } from './data/nodes.js';
import { initI18n, getCurrentLang, onLanguageChange, nodeTranslations } from './i18n.js';

function nodeName(i, lang) {
  const tr = nodeTranslations?.[lang];
  return tr ? tr[i].name : NODES[i].name;
}
function nodeDesc(i, lang) {
  const tr = nodeTranslations?.[lang];
  return (tr && tr[i].shortDesc) || NODES[i].shortDesc;
}

export function initStaticFallback() {
  initI18n();

  const host = document.createElement('section');
  host.className = 'static-nodes';
  host.setAttribute('aria-label', 'AI Era solutions');
  const lang0 = getCurrentLang();
  NODES.forEach((d, i) => {
    const a = document.createElement('a');
    a.className = 'static-node';
    a.href = d.url;
    a.style.setProperty('--node-color', '#' + d.color.toString(16).padStart(6, '0'));
    a.innerHTML = '<strong class="static-node-name"></strong><span class="static-node-desc"></span>';
    a.querySelector('.static-node-name').textContent = nodeName(i, lang0);
    a.querySelector('.static-node-desc').textContent = nodeDesc(i, lang0);
    host.appendChild(a);
  });

  const intro = document.querySelector('.intro');
  (intro?.parentNode || document.body).insertBefore(host, intro ? intro.nextSibling : null);

  onLanguageChange((lang) => {
    host.querySelectorAll('.static-node').forEach((a, i) => {
      a.querySelector('.static-node-name').textContent = nodeName(i, lang);
      a.querySelector('.static-node-desc').textContent = nodeDesc(i, lang);
    });
  });
}
```
**Kiểm tra:** mở `/?tier=STATIC` → không có canvas, thấy tiêu đề + 6 thẻ giải pháp, bấm thẻ sang đúng trang con; DevTools → Elements không có `<canvas>` nào trong `#webgl`.

### Bước 8 — CSS: tạo `ai-era-site/css/mobile-perf.css` và NỐI vào cuối `css/bundle.min.css`
**Vì sao:** orb CSS cho nút Liên hệ (L3), nền tĩnh footer, giao diện STATIC, `will-change: translate` cho nhãn. **`index.html` chỉ nạp `bundle.min.css`; repo không có script build**, nên `mobile-perf.css` chỉ có tác dụng nếu nội dung của nó được **dán vào cuối bundle** (sau khối `/* === mobile-perf.css overrides === */` mà v2 đã thêm — giữ khối đó). Thêm dòng tiêu đề `/* === mobile-perf.css (v3) === */` trước nội dung. Khi sửa file này sau này **phải sửa cả hai nơi**.
```css
/* ============================================
   AI Era — Mobile / GPU performance + fallback (nạp CUỐI bundle)
   ============================================ */

/* Nhãn node di chuyển bằng thuộc tính `translate` (compositor-only), không còn left/top */
.node-label{will-change:translate,opacity}

/* ----- Nút Liên hệ: orb CSS thay cho WebGL canvas (mobile/SAFE/STATIC) ----- */
.contact-cta-btn--lite .contact-cta-canvas-wrap::before{
  content:"";position:absolute;inset:9px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#fff 0,#c7d2fe 14%,#818cf8 45%,#312e81 100%);
  box-shadow:0 0 14px rgba(129,140,248,.75);
  animation:cta-orb-pulse 2.4s ease-in-out infinite;
}
.contact-cta-btn--lite .contact-cta-canvas-wrap::after{
  content:"";position:absolute;inset:3px;border-radius:50%;
  border:1.5px solid transparent;
  border-top-color:#67e8f9;border-right-color:rgba(192,132,252,.7);
  animation:cta-orb-spin 3.2s linear infinite;
}
@keyframes cta-orb-pulse{0%,100%{transform:scale(.92);opacity:.9}50%{transform:scale(1.06);opacity:1}}
@keyframes cta-orb-spin{to{transform:rotate(360deg)}}

/* ----- Footer: nền tĩnh khi không dùng WebGL ----- */
.contact-footer__canvas.is-static{
  background:
    radial-gradient(circle at 20% 30%,rgba(129,140,248,.16),transparent 45%),
    radial-gradient(circle at 80% 70%,rgba(103,232,249,.10),transparent 45%),
    radial-gradient(circle at 55% 20%,rgba(192,132,252,.10),transparent 40%);
}

/* ----- Chế độ STATIC (không WebGL): danh sách 6 giải pháp dạng thẻ ----- */
.no-webgl #webgl,.no-webgl #labels,.no-webgl .hud,.no-webgl .focus-panel{display:none !important}
.no-webgl body{cursor:auto}
.no-webgl .spatial-hero{height:0}
.no-webgl .intro{
  position:relative;left:auto;top:auto;max-width:680px;
  margin:112px auto 0;padding:0 20px;pointer-events:auto;
}
.static-nodes{
  position:relative;z-index:20;display:grid;
  grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;
  max-width:1100px;margin:28px auto 40px;padding:0 20px;
}
.static-node{
  display:flex;flex-direction:column;gap:6px;padding:16px 18px;border-radius:16px;
  border:1px solid color-mix(in srgb,var(--node-color) 45%,transparent);
  background:rgba(10,10,18,.9);color:#e5e7eb;text-decoration:none;
}
.static-node-name{font-size:1rem;color:#fff}
.static-node-desc{font-size:.85rem;line-height:1.45;color:#a1a1b0}

@media (prefers-reduced-motion:reduce){
  .contact-cta-btn--lite .contact-cta-canvas-wrap::before,
  .contact-cta-btn--lite .contact-cta-canvas-wrap::after{animation:none}
}
```
**Kiểm tra:** trên mobile (hoặc DevTools giả lập thiết bị), nút Liên hệ có orb phát sáng xoay, không còn vòng tròn trống.

### Bước 9 — Version, giới hạn log, đường gửi log
1. `index.html`: đổi **cả 4** chỗ `?v=20261026.3` thành `?v=20261027.1` (1 CSS + `main.js`, `contact-footer.js`, `menu-init.js`) và đổi `BUILD_VERSION` trong `js/diagnostics.js` thành `'20261027.1'`. Hai số **phải trùng nhau**; mỗi lần deploy tiếp theo tăng cả hai.
2. `diagnostics.js` (Áp diff — giới hạn 300 log/phiên, riêng `error` luôn được gửi):
```diff
--- a/ai-era-site/js/diagnostics.js
+++ b/ai-era-site/js/diagnostics.js
@@ -3,7 +3,9 @@
 const PROJECT_PREFIX = 'ai-era-site';
 const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
-export const BUILD_VERSION = '20261026.3';
+export const BUILD_VERSION = '20261027.1';
 const diagnosticStartedAt = performance.now();
 let logSequence = 0;
+let emittedCount = 0;
+const MAX_EVENTS_PER_SESSION = 300; // chặn log tràn (vòng lặp lỗi); riêng level 'error' luôn được gửi
 
 /**
@@ -12,4 +14,6 @@
  */
 function emitLog(level, event, details = {}) {
+  if (emittedCount >= MAX_EVENTS_PER_SESSION && level !== 'error') return;
+  emittedCount++;
   logSequence++;
   const prefixedEvent = `${PROJECT_PREFIX}:${event}`;
```
3. **Đường gửi log (bắt buộc để không còn "mù")** — cần người phụ trách pipeline Axiom xác nhận trước khi làm:
   - Hỏi: Axiom hiện thu gì, endpoint nhận log từ trình duyệt là gì, token ở đâu.
   - Thêm vào `<head>` của `index.html`, **trước** các thẻ `<script type="module">`: `<script>window.__AXIOM_INGEST_ENDPOINT__ = '/_diag';</script>`
   - Thêm vào `nginx.conf` (khung mẫu, thay `COLLECTOR` bằng địa chỉ thật; **token chỉ nằm phía server, không đưa vào JS**; `limit_req_zone` phải đặt ở đầu file conf.d, ngoài `server {}`):
```nginx
limit_req_zone $binary_remote_addr zone=diag:10m rate=5r/s;
# ... bên trong server { ... }
location = /_diag {
    limit_except POST { deny all; }
    limit_req zone=diag burst=20 nodelay;
    client_max_body_size 8k;
    proxy_pass http://COLLECTOR;          # do người phụ trách pipeline cung cấp
    proxy_set_header Authorization "Bearer <TOKEN_PHIA_SERVER>";  # ví dụ; tuỳ cách pipeline xác thực
}
```
   - Hiện nginx chưa có CSP nên không bị chặn; nếu sau này thêm CSP phải cho phép endpoint này.
   - Chưa có endpoint ⇒ **không kết luận gì từ việc không thấy log**; dùng remote debugging (Phần 4).

### Bước 10 — Tạo bộ test tự động `tests/quality-tier.test.mjs`
File này mô phỏng storage + nhiều lần tải, **không cần trình duyệt**. Lấy nguyên file từ gói tham chiếu `tests/quality-tier.test.mjs` (12 kịch bản: desktop không bị phạt oan; thoát sạch không bị phạt; crash lần 1 → SAFE; lần 2 → STATIC; tab mới vẫn áp dụng; tab chết khi ở nền không tính; hết hạn 24h; `?reset=1`; `?tier=`; `?on=`; context-lost chỉ tính 1 lần). Chạy:
```bash
node tests/quality-tier.test.mjs     # kỳ vọng: "12 kịch bản đạt"
```
Nên chạy lệnh này trước mỗi lần commit có đụng tới `quality-tier.js`.

### Bước 11 — Triển khai và theo dõi
1. Deploy **staging trước**; kiểm tra `?diag=1` hiện đúng `build 20261027.1`.
2. Chạy toàn bộ Phần 5 (ma trận kiểm thử) trên thiết bị thật.
3. Deploy production; theo dõi 48 giờ (mục 4.3).
4. Kế hoạch lùi: `git revert` các commit v3 và deploy lại (bản v2 chạy được). Không cần xoá localStorage người dùng: hình phạt tự hết sau 24h.

---

## 4. Chẩn đoán & vận hành

### 4.1 Công cụ trên URL (dành cho QA/dev)
| URL | Tác dụng |
|---|---|
| `/?diag=1` | Hiện nhãn xanh: số build, tier, lý do, số strike, hạn phạt, viewport |
| `/?tier=STATIC` (hoặc `SAFE`, `LOW`, `MEDIUM`, `HIGH`, `ULTRA`) | Ép tier (so sánh trên cùng thiết bị) |
| `/?tier=LOW&on=pulse,nodelights,physical,composer,chrome3d,footer3d` | Bật lại **từng nhóm** trong tier hiện tại để bisect |
| `/?reset=1` | Xoá hình phạt crash |
| `/?safe=1`, `/?static=1`, `/?lite=1` | Tương thích cũ (SAFE / STATIC / LOW) |

Lưu ý: trên điện thoại, tier mặc định **đã là `LOW`** nên `?lite=1` không khác mặc định; muốn so sánh dùng `?tier=` hoặc so với **bản cũ** (deploy bản cũ lên URL staging).

### 4.2 Mô phỏng vòng crash mà không cần crash thật
Mở console (hoặc remote debugging) và chạy 2 lần liên tiếp (cách nhau vài giây):
```js
sessionStorage.setItem('aiera_s', JSON.stringify({inflight:true, alive:Date.now(), hidden:false})); location.reload();
```
Kỳ vọng với `?diag=1`: lần 1 → `tier SAFE (crash_guard)`; lần 2 → `tier STATIC (crash_guard)`. Xong dùng `/?reset=1`.

### 4.3 Dữ liệu cần xem sau khi có endpoint log
- Số event `webgl_context_lost` theo `tier` và theo `userAgent` (từ `home_boot`).
- `main_animation_sample.approximateFps` theo tier (kỳ vọng LOW ≥ 45).
- Tỉ lệ `tier = SAFE/STATIC` (lý do `crash_guard`) trên tổng `home_boot`: đây là **số người dùng bị crash**; kỳ vọng giảm dần về ≈ 0.
- `home_three_app_failed`, `webgl_renderer_create_failed`.

### 4.4 Nếu `?tier=STATIC` VẪN crash
Khi đó nguyên nhân không nằm ở WebGL. Việc cần làm: (a) iOS: Cài đặt → Quyền riêng tư & Bảo mật → Phân tích & Cải tiến → Dữ liệu phân tích, tìm file `JetsamEvent-*` gần giờ crash để xem tiến trình WebContent có bị kill vì giới hạn bộ nhớ không (cần bật chia sẻ dữ liệu phân tích); (b) Android: `adb logcat | grep -iE "chromium|gpu|crash"`; (c) loại trừ từng khối CSS nặng trong DevTools: `.vignette` (inset box-shadow toàn màn hình), SVG filter của `.grain`, blur của `.site-nav`; (d) kiểm tra ảnh/video lớn (hiện repo không có asset nặng nào).

---

## 5. Ma trận kiểm thử thủ công (bắt buộc trước khi deploy production)

| Thiết bị / trình duyệt | URL | Thời gian | Kỳ vọng |
|---|---|---|---|
| iPhone Safari | mặc định + `?diag=1` | **10 phút** để yên + cuộn lên/xuống | Không reload, không nhấp nháy, tier `LOW (mobile)` |
| iPhone Chrome | mặc định | 5 phút | Như trên |
| Android Chrome | mặc định + `?diag=1` | **10 phút** | Như trên |
| Android Firefox / Samsung Internet | mặc định | 5 phút | Như trên |
| iPhone (bật Reduce Motion) | mặc định | 1 phút | Thấy 1 khung tĩnh của scene (không trống) |
| Mọi thiết bị mobile | `?tier=STATIC` | 1 phút | Không canvas; 6 thẻ giải pháp hoạt động; đổi ngôn ngữ VI/EN được |
| Mọi thiết bị mobile | mô phỏng crash 2 lần (4.2) | — | SAFE rồi STATIC như 4.2 |
| Desktop Chrome | mặc định | 3 phút | Giống bản gốc: có bloom, nút CTA 3D, line đứt nét, lõi mịn |
| Desktop Safari | mặc định | 3 phút | Như trên |
| Desktop Chrome, thu hẹp < 768px | mặc định (tier `LOW` do viewport) | 2 phút | Orb CSS ở nút Liên hệ; không crash |

Với Android qua `chrome://inspect` → Performance monitor: **JS heap phẳng**, số DOM nodes phẳng, FPS trung vị ≥ 45 sau 10 phút.

---

## 6. Checklist hoàn thành (tick từng mục, reviewer ký)

**Code**
- [ ] `quality-tier.js` dán đúng; tier được tính 1 lần; `getQualityTier()` không side-effect.
- [ ] `grep -rn "TIER_CONFIG\[" ai-era-site/js` không còn kết quả ngoài `quality-tier.js`.
- [ ] `grep -rnE "innerWidth *< *768|pointer: *coarse" ai-era-site/js` chỉ còn trong `quality-tier.js`.
- [ ] `scene-setup.js`: `renderer.setSize(..., false)` ở cả khởi tạo lẫn resize; DPR lấy từ `cfg.dpr`.
- [ ] `core.js`, `nodes.js`: chi tiết/pulse/light/vật liệu lấy từ `cfg`; desktop vẫn 5/190/8/44.
- [ ] `nodes.js`: không còn `computeLineDistances()` trong `animateNodes`; mobile không tạo `pulseLine`.
- [ ] Nút Liên hệ mobile có orb CSS (không vòng tròn trống); footer có nền `is-static`.
- [ ] `main.js` mới nhẹ (không import `three`); `three-app.js` chỉ nạp bằng `import()`.
- [ ] `static-fallback.js` không import `three` / `scene-setup` / `theme`.
- [ ] CSS đã **dán vào cuối `bundle.min.css`** (giữ khối v2), `mobile-perf.css` giống nhau ở hai nơi.
- [ ] 4 chỗ `?v=` trong `index.html` và `BUILD_VERSION` cùng bằng `20261027.1`.
- [ ] Tất cả file JS qua `node --check`; mở desktop không có lỗi đỏ trong console.

**Test tự động**
- [ ] `node tests/quality-tier.test.mjs` → "12 kịch bản đạt".

**Test thủ công** (Phần 5)
- [ ] Mọi dòng của ma trận đạt, lưu ảnh chụp `?diag=1` của từng thiết bị.
- [ ] Soak 10 phút iPhone + Android: không reload, JS heap phẳng.
- [ ] Mô phỏng crash: SAFE → STATIC; `?reset=1` khôi phục.
- [ ] Hồi quy desktop: bloom, hamburger ẩn đúng thiết kế, nút CTA 3D, footer particle (cuộn tới thì chạy, cuộn đi thì dừng).
- [ ] Đổi ngôn ngữ VI/EN: nhãn node đúng vị trí, không tràn mép màn hình mobile.
- [ ] Xoay màn hình: canvas phủ kín, không méo.

**Chẩn đoán**
- [ ] Đã hỏi người phụ trách pipeline và gán `window.__AXIOM_INGEST_ENDPOINT__` + nginx `/_diag`; thấy event `home_boot` trong dashboard.
- [ ] Có dashboard/truy vấn cho mục 4.3.

**Triển khai**
- [ ] Staging đạt toàn bộ → mới deploy production; có người trực 48 giờ đầu.
- [ ] Ghi kết quả vào `docs/` (thiết bị, tier, có/không crash, ảnh).

---

## 7. Giới hạn đã biết của v3 (để reviewer không bị bất ngờ)
- **Chưa chạy trong trình duyệt thật.** Bản tham chiếu đã qua: kiểm tra cú pháp toàn bộ file JS, kiểm tra đồ thị import (mọi tên import có tương ứng export), và 12 kịch bản logic của `quality-tier.js`. Phần render (màu, vị trí nhãn, orb CSS, bản STATIC) **cần xem bằng mắt** ở Phần 5.
- Mobile dùng `MeshStandardMaterial` (không clearcoat) và lõi ít chia lưới hơn nên **nhìn hơi khác** bản desktop; đã chủ ý để giảm tải.
- Crash-guard dựa trên heartbeat ở trình duyệt nên **không bắt được** trường hợp OS kill tab khi tab đang ở nền (cố ý không tính, tránh phạt oan) và trường hợp người dùng chờ > 120 giây mới tải lại sau crash (lần crash kế tiếp sẽ bị bắt).
- Hình phạt 24 giờ áp dụng cho cả trình duyệt đó (mọi tab). Muốn thử lại chế độ đầy đủ: `?reset=1`.
- `?on=` và `?tier=` chỉ để điều tra; có thể giữ trong production vì không có tác dụng phụ với người dùng thường.
- Nguyên nhân gốc trên thiết bị thật vẫn cần được **xác nhận bằng dữ liệu** (Phần 4). Nếu sau v3 vẫn còn người dùng ở `STATIC`, đó là tín hiệu để điều tra thiết bị cụ thể (hãng, chip, phiên bản OS) từ log `home_boot`.

---

## 8. Phụ lục: danh sách file thay đổi
| File | Loại | Bước |
|---|---|---|
| `js/quality-tier.js` | Viết lại | 1 |
| `js/three/scene-setup.js`, `core.js`, `nodes.js`, `effects.js`, `starfield.js` | Sửa | 2–5 |
| `js/three/hamburger-menu.js`, `contact-btn-3d.js`, `js/contact-footer.js` | Sửa | 6 |
| `js/main.js` | Viết lại (mới, nhẹ) | 7 |
| `js/three-app.js` | Đổi tên từ `main.js` + sửa | 7 |
| `js/static-fallback.js` | Mới | 7 |
| `css/mobile-perf.css`, `css/bundle.min.css` | Mới / nối thêm | 8 |
| `index.html`, `js/diagnostics.js`, `nginx.conf` | Sửa | 9 |
| `tests/quality-tier.test.mjs` | Mới | 10 |
