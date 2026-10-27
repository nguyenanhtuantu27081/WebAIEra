# Hướng dẫn xử lý lỗi crash CHỈ xảy ra trên iOS — trang `index.html` (v4, bản của Tech Lead)

> Đối tượng: junior dev. Làm tuần tự từ Bước 0 → Bước 9, tick checklist ở Phần 6.
> Điều kiện: đã áp dụng xong **v3** (`HUONG_DAN_FIX_CRASH_MOBILE_V3_TECHLEAD.md`). Bản v4 chỉ chồng thêm lên v3.
> Bản tham chiếu đã kiểm thử logic: `ai-era-site-v4-reference.zip` (có thể đối chiếu/copy file).

---

## 1. Kết luận của Tech Lead

**Dữ kiện:** dev đã làm đúng theo v3; Android hết lỗi, **iOS vẫn lỗi** (mọi trình duyệt iOS đều dùng chung engine WebKit).

**Suy luận:** cùng một đường code WebGL đã chạy ổn trên Android ⇒ nguyên nhân còn lại nằm ở thứ mà **WebKit xử lý đắt hơn Chromium**, chứ không phải ở Three.js nói chung. Rà soát CSS/DOM theo hướng "WebKit ghét gì" cho ra một ứng viên rất nổi bật:

> **Chữ "AI ERA" ở giữa lõi (`.core-label strong`)** kết hợp đồng thời: `background-clip:text` + **animation `background-position` vô hạn** (9s) + **4 lớp `filter: drop-shadow` chồng nhau** (blur 6 / 18 / 36 / 60px) — và phần tử cha `.core-label` bị **dịch chuyển MỖI FRAME** bằng `left/top` (bởi `projectLabels` trong `nodes.js`), nằm **ngay trên canvas WebGL đang vẽ liên tục**.

Cơ chế (suy luận từ code + hành vi đã biết của WebKit): animation `background-position` không chạy trên compositor, nên mỗi frame WebKit phải **vẽ lại chữ**; `filter` buộc nó render phần tử ra bề mặt trung gian rồi chạy lại **cả 4 bộ lọc blur**; vì cha đổi `left/top` nên còn **layout lại** mỗi frame. Ước lượng thô: vùng lọc ≈ (178px + 2×60px) ≈ 300×300px CSS, ×3 (DPR iPhone) ≈ 900×900 px ≈ 3 MB cho **mỗi** bề mặt trung gian, nhân 4 bộ lọc, nhân 60 lần/giây ⇒ lượng cấp phát/giải phóng bề mặt GPU rất lớn trong tiến trình GPU/WebContent của iOS (vốn bị giới hạn bộ nhớ chặt và bị kill bởi jetsam). Chromium/Skia trên Android cache và xử lý các bộ lọc này hiệu quả hơn nên không vỡ.

**Vì sao v3 chưa cứu được iOS:** v3 giảm tải WebGL và thêm "cầu chì" (crash lần 1 → `SAFE`, lần 2 → `STATIC`), nhưng **không đụng vào lớp CSS này**. Cả `LOW` lẫn `SAFE` vẫn hiển thị `.core-label` nặng ⇒ iOS vẫn crash ở lần 1 và lần 2; chỉ tới lần 3 (`STATIC`, ẩn `#labels`) mới ổn ⇒ dev thấy "vẫn lỗi". Đây cũng là lý do trải nghiệm iOS tệ ngay cả khi cầu chì hoạt động đúng.

**Điều CHƯA được chứng minh (nói thẳng):** đây là ứng viên số 1 **dựa trên code**, chưa được đo trên iPhone. Vì vậy v4 vừa sửa các điểm nghi ngờ **vừa cho công cụ để xác nhận trên thiết bị bằng URL** (Bước 7) — kết quả mới là bằng chứng.

### Các điểm đặc thù iOS được xử lý trong v4 (xếp theo mức nghi ngờ)

| # | Điểm | Vì sao đắt với WebKit | Cách xử lý v4 | Nhóm bật/tắt |
|---|---|---|---|---|
| **I1** | `.core-label strong`: gradient chữ động + 4 `drop-shadow` + cha dịch chuyển bằng `left/top` mỗi frame | Vẽ lại + lọc lại + layout mỗi frame, trên canvas WebGL | Bản nhẹ: gradient **tĩnh**, bỏ `filter`, thay bằng **quầng sáng tĩnh** (`::before` radial-gradient); dịch chuyển nhãn bằng `translate` (compositor) | `fx-off-core` |
| **I2** | `backdrop-filter` phủ lên canvas, **lồng nhau**: `.site-nav` (blur 16) chứa `.lang-switch` (blur 14); thêm `.contact-cta-btn`, `.control`… Chỉ có bản không tiền tố ⇒ iOS ≥ 18 mới bật | WebKit phải blur lại phần canvas phía sau mỗi frame, lồng nhau thì nhân đôi | Tắt toàn bộ `backdrop-filter` trên tier nhẹ, tăng độ đặc của nền để bù | `fx-off-backdrop` |
| **I3** | `.vignette`: `box-shadow: inset 0 0 180px` phủ toàn màn hình, nằm trên canvas | Bóng mờ bán kính 180px ở DPR 3 trên lớp toàn màn hình | Thay bằng `radial-gradient` | `fx-off-vignette` |
| **I4** | Canvas WebGL `alpha:true` (trong suốt) | WebKit phải blend canvas với nội dung DOM phía sau | Thử nghiệm: `?on=opaque` (canvas đặc, `alpha:false`). **Mặc định tắt** — chỉ bật nếu Bước 7 cho thấy cần | `on=opaque` |

Phần còn lại của danh sách nghi phạm (Phần 4.4) chỉ dùng nếu các bước trên chưa đủ.

### 1b. Hồ sơ thiết bị đã xác nhận và ý nghĩa

**Máy lỗi:** iPhone 11 Pro Max, **iOS 27.0.1**, test bằng Chrome, Firefox và Safari.

1. **Cả 3 trình duyệt đều lỗi là hợp lý.** Trên iOS, Chrome và Firefox bắt buộc dùng engine WebKit giống Safari. Vì vậy chúng không phải 3 phép thử độc lập: chỉ cần test **Safari** làm chuẩn, rồi kiểm tra thêm **một** trình duyệt khác để chắc chắn kết quả giống nhau.
2. **Đây là lớp máy yếu nhất trong danh sách iOS 27 hỗ trợ.** iPhone 11 Pro Max dùng chip A13, RAM 4 GB, màn hình 3x (viewport khoảng 414×896 pt). Máy càng ít RAM thì giới hạn bộ nhớ của tiến trình WebContent càng chặt, nên các lớp hiệu ứng tốn bộ nhớ GPU (mục I1–I3 ở trên) càng dễ gây crash. Kiến thức này lấy từ thông số máy, chưa đo trên máy thật.
3. **iOS 27.0.1 là bản rất mới.** WebKit từng có nhiều lỗi hồi quy WebGL biểu hiện đúng thông báo "A problem repeatedly occurred" (ví dụ: iOS 16.4 bị jetsam do bộ nhớ WebGL; iOS 16–18 bị mất WebGL context khi shader dùng từ khoá `flat`, tái hiện được trên iPhone 11). Mình đã kiểm tra shader của Three.js r170: **không thấy** từ khoá `flat` (chưa kiểm tra r185 mà site đang dùng). Mình **chưa tìm thấy** lỗi WebKit công khai nào ở iOS 27 khớp với triệu chứng này, nên chưa thể quy cho hệ điều hành.
4. **Cách tách "lỗi do code của ta" với "lỗi do WebKit 27":** thêm một phép thử chéo ở Bước 7 (dòng F): chạy cùng URL trên **một iPhone khác dùng iOS cũ hơn** (ví dụ iOS 18 hoặc 26). Nếu chỉ iOS 27 bị lỗi, đó là dấu hiệu hồi quy phía WebKit: khi đó vẫn giữ các bản sửa v4 (giảm tải), đồng thời gửi báo cáo cho Apple (Feedback Assistant) kèm URL `?tier=...` tái hiện lỗi.

---

## 2. Dữ liệu cần dev báo lại (trước khi làm — 5 phút)

1. ✅ Đã có: iPhone 11 Pro Max, iOS 27.0.1, Chrome / Firefox / Safari (xem mục 1b).
2. Mở `https://<domain>/?reset=1` rồi `https://<domain>/?tier=STATIC&diag=1`: **trang có còn crash không?** Đây là phép thử quan trọng nhất:
   - **Không crash** ⇒ nguyên nhân nằm trong phần WebGL/lớp phủ (đúng hướng v4).
   - **Vẫn crash** ⇒ nguyên nhân nằm ở phần DOM/CSS còn lại (xem 4.4) — báo ngay cho Tech Lead.
3. Nếu còn: file `JetsamEvent-*` (Cài đặt → Quyền riêng tư & Bảo mật → Phân tích & Cải tiến → Dữ liệu phân tích) gần giờ crash. Cần bật "Chia sẻ phân tích iPhone" mới có file.

---

## 3. Hướng dẫn sửa code từng bước

> Quy ước: **"Áp diff"** = sửa theo diff (dòng `-` xoá, `+` thêm; số dòng chỉ để tham khảo, bám vào ngữ cảnh). Diff so với **code v3**. Sau mỗi bước chạy `node --check` (copy file sang đuôi `.mjs`) và mở desktop xem console có lỗi đỏ không.

### Bước 0 — Chuẩn bị
1. `git checkout -b fix/ios-crash-v4` từ nhánh đã có v3; `git tag backup-before-v4`.
2. Xác nhận v3 đã có: `node tests/quality-tier.test.mjs` → "12 kịch bản đạt"; mở `/?diag=1` thấy `build 20261027.1`.
3. **Quy tắc:** không thêm đoạn phát hiện iOS/mobile riêng ở file khác; chỉ dùng `isIOS()`, `isMobileLike()`, `getTierConfig()`, `getFxOff()` từ `quality-tier.js`.

### Bước 1 — `ai-era-site/js/quality-tier.js` (Áp diff)
**Vì sao:** thêm `isIOS()`; thêm **nhóm hiệu ứng CSS** bật/tắt bằng class trên `<html>` (`fx-off-core`, `fx-off-backdrop`, `fx-off-vignette`) — mặc định bật cả 3 ở tier `STATIC/SAFE/LOW` (tức mọi điện thoại); thêm cờ `opaque` cho bisect. Vẫn là **một nguồn sự thật duy nhất**, chạy một lần khi nạp module.
- `?fx=full` → giữ hiệu ứng đầy đủ (để so sánh với bản cũ).
- `?fxoff=core,backdrop` → chỉ tắt các nhóm liệt kê, **áp dụng cho mọi tier** (kể cả desktop, tiện test).
```diff
--- a/ai-era-site/js/quality-tier.js
+++ b/ai-era-site/js/quality-tier.js
@@ -82,4 +82,10 @@
 // 3) Phát hiện thiết bị — DUY NHẤT một chỗ
 // ---------------------------------------------------------------------------
+// iPhone/iPad (kể cả iPadOS ở chế độ "Desktop website" báo UA là Macintosh). Mọi trình duyệt iOS dùng WebKit.
+export function isIOS() {
+  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
+    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
+}
+
 export function isMobileLike() {
   return window.innerWidth < 768 ||
@@ -120,9 +126,9 @@
 // ---------------------------------------------------------------------------
 const FULL = {
-  webgl: true, postProcessing: true, pulseLines: true, nodeLights: true, physical: true,
+  webgl: true, opaque: false, postProcessing: true, pulseLines: true, nodeLights: true, physical: true,
   chrome3d: true, footer3d: true, coreDetail: 5, ringSegments: 190, ringRadial: 8, sparks: 44, maxFps: 0
 };
 const LITE = {
-  webgl: true, postProcessing: false, pulseLines: false, nodeLights: false, physical: false,
+  webgl: true, opaque: false, postProcessing: false, pulseLines: false, nodeLights: false, physical: false,
   chrome3d: false, footer3d: false, coreDetail: 3, ringSegments: 96, ringRadial: 6, sparks: 24, maxFps: 60
 };
@@ -142,5 +148,6 @@
 const ON_MAP = {
   pulse: { pulseLines: true }, nodelights: { nodeLights: true }, physical: { physical: true },
-  composer: { postProcessing: true, bloom: 0.2 }, chrome3d: { chrome3d: true }, footer3d: { footer3d: true }
+  composer: { postProcessing: true, bloom: 0.2 }, chrome3d: { chrome3d: true }, footer3d: { footer3d: true },
+  opaque: { opaque: true } // canvas không trong suốt (alpha:false) — thử nghiệm cho iOS
 };
 const RESOLVED = { ...TIER_CONFIG[TIER] };
@@ -148,4 +155,25 @@
 
 // ---------------------------------------------------------------------------
+// 5b) Hiệu ứng CSS nặng (đặc biệt với WebKit/iOS) — bật/tắt theo NHÓM bằng class trên <html>
+//   fx-off-core     : chữ "AI ERA" ở giữa: bỏ animation nền + 4 lớp drop-shadow, thay bằng quầng sáng tĩnh
+//   fx-off-backdrop : bỏ mọi backdrop-filter (blur nền) phủ lên canvas WebGL
+//   fx-off-vignette : thay box-shadow inset 180px bằng radial-gradient
+// Mặc định: tắt cả 3 nhóm ở tier STATIC/SAFE/LOW. ?fx=full giữ hiệu ứng đầy đủ (để so sánh);
+// ?fxoff=core,backdrop chỉ tắt các nhóm được liệt kê (để bisect), áp dụng cho mọi tier.
+// ---------------------------------------------------------------------------
+const FX_GROUPS = ['core', 'backdrop', 'vignette'];
+const fxOff = (() => {
+  const q = params.get('fxoff');
+  if (q !== null) return q.split(',').map(s => s.trim().toLowerCase()).filter(g => FX_GROUPS.includes(g));
+  if (params.get('fx') === 'full') return [];
+  return (TIER === 'STATIC' || TIER === 'SAFE' || TIER === 'LOW') ? FX_GROUPS.slice() : [];
+})();
+safe(() => {
+  const cl = document.documentElement.classList;
+  fxOff.forEach(g => cl.add('fx-off-' + g));
+  if (isIOS()) cl.add('is-ios');
+});
+
+// ---------------------------------------------------------------------------
 // 6) API công khai — getter thuần, KHÔNG side-effect
 // ---------------------------------------------------------------------------
@@ -154,3 +182,4 @@
 export function getTierConfig() { return RESOLVED; }
 export function isStaticMode() { return TIER === 'STATIC'; }
-export function getGuardState() { return { ...guard, tier: TIER, reason: tierReason, bisect: [...ON] }; }
+export function getFxOff() { return fxOff.slice(); }
+export function getGuardState() { return { ...guard, tier: TIER, reason: tierReason, bisect: [...ON], fxOff: fxOff.slice(), ios: isIOS() }; }
```

### Bước 2 — CSS: nối khối v4 vào `css/mobile-perf.css` **và** cuối `css/bundle.min.css`
**Vì sao:** thực thi các nhóm ở trên. `index.html` chỉ nạp `bundle.min.css` nên **bắt buộc dán vào bundle** (sau khối v3). Thêm khối này vào cuối cả hai file (giữ nguyên các khối cũ):
```css
/* ============================================
   v4 — Hiệu ứng nặng với WebKit/iOS (điều khiển bằng class trên <html>, xem quality-tier.js)
   ============================================ */

/* Nhãn lõi di chuyển bằng translate → có lớp compositor riêng, không repaint khi di chuyển */
.core-label{will-change:translate}

/* --- fx-off-core: chữ "AI ERA" ở giữa ---
   Bản gốc: gradient chữ (background-clip:text) + animation background-position vô hạn
   + 4 lớp drop-shadow (blur tới 60px) trên phần tử bị dịch chuyển MỖI FRAME, nằm trên canvas WebGL
   → WebKit phải vẽ lại chữ và chạy lại 4 bộ lọc blur mỗi frame. Bản nhẹ: gradient TĨNH + quầng sáng tĩnh. */
html.fx-off-core .core-label strong{
  animation:none;
  filter:none;
  background-size:100% 100%;
}
html.fx-off-core .core-label::before{
  content:"";position:absolute;inset:-26px;border-radius:50%;z-index:-1;pointer-events:none;
  background:radial-gradient(circle,rgba(129,140,248,.30) 0,rgba(103,232,249,.10) 42%,transparent 70%);
}

/* --- fx-off-backdrop: không blur nền phía sau (WebKit phải blur lại canvas 3D mỗi frame) --- */
html.fx-off-backdrop :is(.node-label,.site-nav,.contact-cta-btn,.lang-switch,.menu-toggle,.control,.hud,
  .focus-panel,.site-menu-panel,.contact-footer__close,.contact-item,.contact-footer__card,.cursor-outline){
  -webkit-backdrop-filter:none !important;
  backdrop-filter:none !important;
}
/* nền đặc hơn để bù khi mất blur */
html.fx-off-backdrop .site-nav{background:linear-gradient(180deg,rgba(3,3,5,.94),rgba(3,3,5,.78))}
html.fx-off-backdrop .lang-switch{background:rgba(8,8,14,.88)}
html.fx-off-backdrop .focus-panel,
html.fx-off-backdrop .site-menu-panel{background:rgba(12,14,24,.96)}
html.fx-off-backdrop .contact-item{background:rgba(8,8,16,.82)}
html.fx-off-backdrop .contact-footer__close{background:rgba(8,8,16,.9)}

/* --- fx-off-vignette: box-shadow inset blur 180px toàn màn hình → radial-gradient (rẻ hơn nhiều) --- */
html.fx-off-vignette .vignette{
  box-shadow:none;
  background:radial-gradient(ellipse at center,transparent 56%,rgba(0,0,0,.5) 100%);
}
```
**Lưu ý:** gradient chữ khi tĩnh hiển thị đủ dải màu (trước đây chỉ thấy một phần vì `background-size:220%`) — nhìn hơi khác, chấp nhận được. Panel/nav/nút bớt "kính mờ", nền đặc hơn.

### Bước 3 — `ai-era-site/js/three/nodes.js` (Áp diff)
**Vì sao:** I1 — nhãn lõi `.core-label` dịch chuyển bằng `style.translate` (compositor-only) thay vì `left/top` (layout mỗi frame), chỉ ghi khi giá trị đổi. Có nhánh dự phòng `left/top` cho trình duyệt cũ không có `translate`.
```diff
--- a/ai-era-site/js/three/nodes.js
+++ b/ai-era-site/js/three/nodes.js
@@ -271,4 +271,6 @@
 const HAS_TRANSLATE = typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('translate', '1px 1px');
 let _coreLabel = null;
+let _coreX = NaN;
+let _coreY = NaN;
 let _labelSizesCached = false;
 const _labelDims = [];
@@ -280,5 +282,9 @@
 
 export function projectLabels(camera, coreGroup, selected) {
-  if (!_coreLabel) _coreLabel = document.querySelector('.core-label');
+  if (!_coreLabel) {
+    _coreLabel = document.querySelector('.core-label');
+    // Vị trí thật do style.translate (compositor) quyết định → đưa left/top về 0 một lần
+    if (_coreLabel && HAS_TRANSLATE) { _coreLabel.style.left = '0'; _coreLabel.style.top = '0'; }
+  }
   const w = window.innerWidth;
   const h = window.innerHeight;
@@ -330,6 +336,15 @@
   if (_coreLabel) {
     coreGroup.getWorldPosition(_scratchVec).project(camera);
-    _coreLabel.style.left = Math.round(((_scratchVec.x * .5 + .5) * w) * 10) / 10 + 'px';
-    _coreLabel.style.top = Math.round(((-_scratchVec.y * .5 + .5) * h) * 10) / 10 + 'px';
+    const cx = Math.round(((_scratchVec.x * .5 + .5) * w) * 10) / 10;
+    const cy = Math.round(((-_scratchVec.y * .5 + .5) * h) * 10) / 10;
+    if (cx !== _coreX || cy !== _coreY) {
+      _coreX = cx; _coreY = cy;
+      if (HAS_TRANSLATE) {
+        _coreLabel.style.translate = cx + 'px ' + cy + 'px'; // không layout, không repaint lớp chữ
+      } else {
+        _coreLabel.style.left = cx + 'px';
+        _coreLabel.style.top = cy + 'px';
+      }
+    }
     const op = (_scratchVec.z < 1 && _scratchVec.z > -1 && selected < 0) ? '1' : '.2';
     if (_coreLabel._op !== op) { _coreLabel._op = op; _coreLabel.style.opacity = op; }
```

### Bước 4 — `ai-era-site/js/three/scene-setup.js` (Áp diff)
**Vì sao:** I4 — thêm tuỳ chọn canvas đặc (`alpha:false` + `setClearColor`). **Mặc định tắt**, chỉ bật qua `?on=opaque` để thử trên thiết bị.
```diff
--- a/ai-era-site/js/three/scene-setup.js
+++ b/ai-era-site/js/three/scene-setup.js
@@ -50,5 +50,5 @@
   rendererInstance = new THREE.WebGLRenderer({
     antialias: cfg.antialias,               // false for LOW (mobile DPI already smooth)
-    alpha: true,
+    alpha: !cfg.opaque,
     powerPreference: cfg.powerPreference     // 'low-power' for LOW, 'default' otherwise
   });
@@ -82,4 +82,6 @@
 renderer.setPixelRatio(getRenderPixelRatio());
 renderer.setSize(innerWidth, innerHeight, false);
+// Canvas không trong suốt (chỉ khi bật ?on=opaque): WebKit không phải blend canvas với DOM phía sau.
+if (cfg.opaque) renderer.setClearColor(0x030305, 1);
 mount.appendChild(renderer.domElement);
 
```

### Bước 5 — `main.js`, `diagnostics.js`, `index.html`: nhãn debug + version
1. `js/main.js` — nhãn `?diag=1` hiện thêm `fxOff` và `ios`:
```diff
--- a/ai-era-site/js/main.js
+++ b/ai-era-site/js/main.js
@@ -20,5 +20,5 @@
   const el = document.createElement('pre');
   el.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;margin:0;padding:6px 8px;font:11px/1.35 monospace;color:#0f0;background:rgba(0,0,0,.75);border-radius:6px;pointer-events:none;white-space:pre-wrap;max-width:90vw';
-  el.textContent = `build ${BUILD_VERSION}\ntier ${g.tier} (${g.reason})\nstrikes ${g.strikes || 0} until ${g.until ? new Date(g.until).toISOString() : '-'}\nbisect [${g.bisect}]\ndpr ${devicePixelRatio} vp ${innerWidth}x${innerHeight}`;
+  el.textContent = `build ${BUILD_VERSION}\ntier ${g.tier} (${g.reason})\nstrikes ${g.strikes || 0} until ${g.until ? new Date(g.until).toISOString() : '-'}\nbisect [${g.bisect}]\nfxOff [${g.fxOff}] ios ${g.ios}\ndpr ${devicePixelRatio} vp ${innerWidth}x${innerHeight}`;
   document.body.appendChild(el);
 }
```
2. `js/diagnostics.js` — đổi `BUILD_VERSION` thành `'20261028.1'`:
```diff
--- a/ai-era-site/js/diagnostics.js
+++ b/ai-era-site/js/diagnostics.js
@@ -3,5 +3,5 @@
 const PROJECT_PREFIX = 'ai-era-site';
 const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
-export const BUILD_VERSION = '20261027.1';
+export const BUILD_VERSION = '20261028.1';
 const diagnosticStartedAt = performance.now();
 let logSequence = 0;
```
3. `index.html`: đổi **cả 4** chỗ `?v=20261027.1` thành `?v=20261028.1` (1 CSS + `main.js`, `contact-footer.js`, `menu-init.js`). Hai số version (HTML và `BUILD_VERSION`) **phải trùng nhau**.

### Bước 6 — Cập nhật bộ test `tests/quality-tier.test.mjs`
Lấy nguyên file từ gói tham chiếu (`tests/quality-tier.test.mjs`): giờ có **16 kịch bản** (thêm: tắt đúng 3 nhóm CSS trên điện thoại, desktop không bị tắt, `?fx=full`, `?fxoff=`, phát hiện iOS gồm iPadOS "desktop mode", `?on=opaque`). Chạy:
```bash
node tests/quality-tier.test.mjs     # kỳ vọng: "16 kịch bản đạt"
```

### Bước 7 — Xác nhận trên iPhone thật (bắt buộc, ~15 phút)
**Quan trọng:** giữa các lần thử luôn mở `/?reset=1` trước (nếu không, hình phạt crash 24h có thể khiến trang tự chuyển SAFE/STATIC và làm sai lệch kết quả). Với `?tier=` ép tier thì cầu chì không can thiệp, nhưng strike vẫn được ghi.
Mỗi URL: để yên **5 phút**, thỉnh thoảng chạm/kéo vào scene; ghi lại: có nhấp nháy không, có tự reload không, thời gian tới lỗi, và chụp nhãn `diag`.

| # | URL (thêm `&diag=1`) | Ý nghĩa | Kỳ vọng nếu giả thuyết đúng |
|---|---|---|---|
| A | `/?tier=STATIC` | Không WebGL | Ổn định |
| B | `/?tier=LOW&fx=full` | WebGL nhẹ + **CSS cũ** (nặng) | **Crash / nhấp nháy** (tái hiện lỗi) |
| C | `/?tier=LOW&fxoff=core` | Chỉ sửa I1 | Cải thiện rõ hoặc hết lỗi |
| D | `/?tier=LOW` (mặc định mới: tắt core+backdrop+vignette) | Bản v4 đầy đủ | **Ổn định 5 phút** |
| E | `/?tier=LOW&on=opaque` | D + canvas đặc | Chỉ để so sánh |
| F | URL **D** trên một iPhone khác chạy **iOS cũ hơn** (nếu có) | Tách lỗi do code của ta với lỗi do WebKit 27 | Nếu máy iOS cũ ổn mà iPhone 11 Pro Max lỗi ngay cả với D/A ⇒ nghi hồi quy iOS 27 hoặc giới hạn bộ nhớ máy (Phần 4.4 mục 7) |

**Cách đọc kết quả**
- B crash, C/D ổn ⇒ **I1 là nguyên nhân** → hoàn tất.
- B và C đều crash, D ổn ⇒ I1 chưa đủ, cần thêm I2/I3 (đã nằm trong D) → hoàn tất; ghi lại nhóm nào cần (thử `fxoff=core,backdrop` và `fxoff=core,vignette` để biết).
- D vẫn crash, E ổn ⇒ bật `opaque` mặc định cho tier nhẹ trên iOS (xem Bước 8a).
- A ổn nhưng B–E đều crash ⇒ nguyên nhân nằm trong WebGL đặc thù iOS → Phần 4.4 (mục 1–3).
- A cũng crash ⇒ nguyên nhân ngoài WebGL → Phần 4.4 (mục 4–6).

### Bước 8 — Quyết định sau khi có kết quả Bước 7 (chỉ làm phần phù hợp)
**8a. Nếu cần canvas đặc trên iOS:** trong `quality-tier.js`, ngay sau khi tính `RESOLVED`, thêm: `if (TIER !== 'STATIC' && isIOS() && TIER !== 'MEDIUM' && TIER !== 'HIGH' && TIER !== 'ULTRA') RESOLVED.opaque = true;` (chỉ iPhone/iPad ở tier nhẹ). Cập nhật test và chạy lại. Lưu ý: canvas đặc che mất gradient nền `body` (mờ, rất nhẹ) — kiểm tra bằng mắt.
**8b. Nếu nhóm `backdrop` bị mất quá nhiều "chất kính" ở panel quan trọng:** giữ tắt cho `.site-nav` / `.lang-switch` / `.contact-cta-btn` / `.control`, nhưng chỉ cho phép `.focus-panel` có blur khi `html:not(.is-ios)`.
**8c. Giữ lại các công cụ chẩn đoán** (`?diag`, `?tier`, `?fxoff`, `?on`): không có tác dụng phụ với người dùng thường.

### Bước 9 — Triển khai
1. Staging trước; kiểm tra `/?diag=1` hiện `build 20261028.1`, `fxOff [core,backdrop,vignette]`, `ios true` trên iPhone.
2. Chạy lại Bước 7 trên staging với ít nhất **2 iPhone khác nhau** (một máy cũ nếu có) + Safari và Chrome iOS.
3. Production; theo dõi 48 giờ: tỉ lệ `home_boot` có `tier SAFE/STATIC` (lý do `crash_guard`) trên iOS — phải giảm về ≈ 0.
4. Kế hoạch lùi: `git revert` v4 (v3 vẫn chạy được). Hình phạt người dùng tự hết sau 24h.

---

## 4. Chẩn đoán bổ sung

### 4.1 Công cụ URL (cập nhật so với v3)
| URL | Tác dụng |
|---|---|
| `/?diag=1` | Nhãn xanh: build, tier + lý do, strike, `bisect`, **`fxOff`, `ios`**, DPR, viewport |
| `/?tier=STATIC\|SAFE\|LOW\|MEDIUM\|HIGH\|ULTRA` | Ép tier |
| `/?fx=full` | Giữ hiệu ứng CSS đầy đủ (để tái hiện bản cũ) |
| `/?fxoff=core,backdrop,vignette` | Chỉ tắt các nhóm liệt kê (mọi tier) |
| `/?on=pulse,nodelights,physical,composer,chrome3d,footer3d,opaque` | Bật lại từng nhóm WebGL / canvas đặc |
| `/?reset=1` | Xoá hình phạt crash |

### 4.2 Mô phỏng vòng crash (giữ nguyên v3)
Chạy 2 lần trong console, cách nhau vài giây: `sessionStorage.setItem('aiera_s', JSON.stringify({inflight:true, alive:Date.now(), hidden:false})); location.reload();` → kỳ vọng SAFE rồi STATIC. Xong dùng `/?reset=1`.

### 4.3 Xem trực tiếp trên iPhone bằng Web Inspector (nếu có Mac)
1. iPhone: Cài đặt → Safari → Nâng cao → bật **Web Inspector**. Cắm cáp vào Mac.
2. Mac Safari → menu **Develop** → tên iPhone → trang đang mở.
3. Tab **Timelines** → ghi 10–20 giây: xem có sự kiện **Paint/Layout** lặp lại **mỗi frame** liên quan tới `.core-label` không (trước v4: có; sau v4: nên biến mất).
4. Tab **Layers** (tên/vị trí có thể khác theo phiên bản Safari): xem các lớp compositing và bộ nhớ ước tính; so sánh `?fx=full` với bản mặc định.
5. Tab **Console**: đọc log `[ai-era-site]` (đã có từ `diagnostics.js`).

### 4.4 Nếu các bước trên chưa đủ — nghi phạm còn lại (theo thứ tự)
1. `renderer` DPR/độ phân giải: thử `?tier=SAFE` (DPR 0.75, 30 fps).
2. Số lượng draw call/điểm: giảm `particles` ở `TIER_CONFIG.LOW`/`SAFE`; thử `?tier=SAFE`.
3. WebGL đặc thù iOS (shader/ANGLE-Metal): bật lại từng nhóm bằng `?on=` (đã có từ v3) để tìm nhóm gây lỗi.
4. `.contact-footer__title` (gradient động 6s, footer) và `closeButtonPulse` (animation `box-shadow`) — chỉ ảnh hưởng khi cuộn tới footer.
5. `.logo-img` có `filter: drop-shadow` (tĩnh nhưng đổi khi hover).
6. Kiểm tra bộ nhớ DOM/CSS bằng Timelines; xem `JetsamEvent` để biết có phải bị kill vì bộ nhớ không.
7. **Hồi quy hoặc giới hạn của iOS 27 / máy 4 GB:** nếu mục 1–6 không đổi kết quả và máy iOS cũ hơn vẫn ổn, giữ chế độ nhẹ (`SAFE`/`STATIC`) làm mặc định cho nhóm máy này và gửi báo cáo cho Apple. Trong phần Cài đặt → Safari → Nâng cao có mục cờ tính năng (Feature Flags) liên quan WebGL; tên và vị trí có thể khác ở iOS 27, chỉ nên dùng để thử nghiệm chẩn đoán, không dùng làm giải pháp cho người dùng.

---

## 5. Ma trận kiểm thử (bắt buộc trước khi deploy production)

| Thiết bị | URL | Thời gian | Kỳ vọng |
|---|---|---|---|
| **iPhone 11 Pro Max, iOS 27.0.1 (máy lỗi), Safari** | `/?diag=1` | **10 phút** (để yên, chạm, kéo, xoay màn hình) | Không nhấp nháy, không reload; `tier LOW`, `fxOff [core,backdrop,vignette]`, `ios true` |
| iPhone (Chrome iOS) | `/?diag=1` | 5 phút | Như trên |
| iPhone máy cũ (nếu có) | `/?diag=1` | 5 phút | Như trên |
| iPad (Safari, cả "Desktop website") | `/?diag=1` | 5 phút | `ios true`; không crash |
| iPhone | `/?tier=STATIC` | 1 phút | 6 thẻ giải pháp, không canvas |
| iPhone | `/?fx=full&tier=LOW` | 5 phút | (Chỉ để đối chứng — dự kiến lỗi; **không** triển khai) |
| Android Chrome | `/?diag=1` | 5 phút | Không hồi quy (vẫn ổn); chữ "AI ERA" có quầng sáng tĩnh |
| Desktop Chrome / Safari | mặc định | 3 phút | **Không đổi**: chữ gradient động + glow đầy đủ, blur kính, vignette cũ |

---

## 6. Checklist hoàn thành

**Code**
- [x] v3 đã áp dụng và test v3 đạt trước khi bắt đầu.
- [x] `quality-tier.js`: có `isIOS()`, `getFxOff()`, class `fx-off-*`/`is-ios` được thêm lên `<html>`, `opaque` mặc định `false`.
- [x] Khối CSS v4 có ở **cả** `css/mobile-perf.css` và cuối `css/bundle.min.css`; CSS cân bằng ngoặc (mở trang không vỡ layout).
- [x] `nodes.js`: nhãn lõi dùng `translate` (có nhánh dự phòng `left/top`); `.core-label` được đặt `left:0; top:0` một lần.
- [x] `scene-setup.js`: `alpha: !cfg.opaque`; chỉ `setClearColor` khi `opaque`.
- [x] `grep -rnE "iPhone|iPad|iOS|maxTouchPoints" ai-era-site/js` chỉ còn trong `quality-tier.js` (và nhãn debug trong `main.js`).
- [x] 4 chỗ `?v=` trong `index.html` và `BUILD_VERSION` cùng `20261028.1`.
- [x] Mọi file JS qua `node --check`; desktop không có lỗi đỏ.

**Test tự động**
- [x] `node tests/quality-tier.test.mjs` → "16 kịch bản đạt".

**Test thủ công**
- [ ] Bảng Bước 7 (A–E) đã chạy trên iPhone thật; **đã ghi lại kết quả** (ảnh `diag` + có/không crash + thời gian) vào `docs/`.
- [ ] Ma trận Phần 5 đạt hoàn toàn, gồm ≥ 2 iPhone, trong đó có iPhone 11 Pro Max (iOS 27.0.1); test Safari làm chuẩn và thêm ít nhất 1 trình duyệt khác (Chrome hoặc Firefox) để xác nhận cùng kết quả.
- [ ] Đã chạy dòng F (iPhone khác, iOS cũ hơn) hoặc ghi rõ lý do không có thiết bị; kết quả đã ghi vào `docs/`.
- [ ] Hồi quy desktop: chữ "AI ERA" vẫn gradient động + glow, panel vẫn blur kính, vignette như cũ.
- [ ] Hồi quy Android: không lỗi mới.
- [ ] Đổi ngôn ngữ VI/EN, xoay màn hình trên iPhone: nhãn lõi và nhãn node đúng vị trí.

**Triển khai**
- [ ] Staging đạt → production; theo dõi 48 giờ; tỉ lệ `crash_guard` trên iOS ≈ 0.

---

## 7. Giới hạn đã biết
- **Chưa chạy trên iPhone thật.** Bản tham chiếu đã qua: kiểm tra cú pháp toàn bộ JS, kiểm tra đồ thị import, cân bằng ngoặc CSS và 16 kịch bản logic của `quality-tier.js`. Hiệu quả thực tế với iOS **phải được xác nhận ở Bước 7**.
- Giả thuyết I1 dựa trên phân tích code và hành vi đã biết của WebKit, **không** phải đo đạc. Nếu Bước 7 cho thấy B không crash, đừng đóng ticket — chuyển sang Phần 4.4.
- Trên điện thoại chữ "AI ERA" không còn hiệu ứng chuyển màu và glow nhiều lớp (đổi lấy độ ổn định); panel mất blur kính (nền đặc hơn); vignette hơi khác. Desktop **không đổi**.
- Hình phạt crash 24h vẫn áp dụng (từ v3). Trong lúc test nhớ `?reset=1`.

---

## 8. Phụ lục: file thay đổi so với v3
| File | Loại | Bước |
|---|---|---|
| `js/quality-tier.js` | Sửa | 1 |
| `css/mobile-perf.css`, `css/bundle.min.css` | Nối thêm | 2 |
| `js/three/nodes.js` | Sửa | 3 |
| `js/three/scene-setup.js` | Sửa | 4 |
| `js/main.js`, `js/diagnostics.js`, `index.html` | Sửa | 5 |
| `tests/quality-tier.test.mjs` | Thay thế (16 kịch bản) | 6 |

---

## 9. Nhật ký bằng chứng triển khai thực tế (Execution Evidence v4)

### 9.1 Branch & Môi trường
- **Branch:** `fix/ios-crash-v4` (tạo từ nhánh đã hoàn thiện v3).
- **Thời gian thực hiện:** 2026-10-27.

### 9.2 Danh sách thay đổi đã áp dụng
1. `ai-era-site/js/quality-tier.js`:
   - Bổ sung `isIOS()` nhận diện iPhone, iPad và iPadOS ở chế độ "Desktop website" (`MacIntel` + `maxTouchPoints > 1`).
   - Cung cấp `opaque: false` mặc định trong `FULL`/`LITE` và hỗ trợ bisect `?on=opaque`.
   - Nhóm hiệu ứng CSS `FX_GROUPS = ['core', 'backdrop', 'vignette']`. Mặc định thêm các class `fx-off-core`, `fx-off-backdrop`, `fx-off-vignette` lên `<html>` khi ở tier `STATIC/SAFE/LOW` (tức tất cả thiết bị di động). Hỗ trợ `?fx=full` và `?fxoff=...`. Thêm class `is-ios` khi `isIOS()`.
   - Export thêm `getFxOff()` và bổ sung `fxOff`, `ios` vào `getGuardState()`.
2. `ai-era-site/css/mobile-perf.css` & `ai-era-site/css/bundle.min.css`:
   - `.core-label`: `will-change: translate`.
   - `html.fx-off-core .core-label strong`: tắt animation nền, bỏ filter drop-shadow, giữ quầng sáng tĩnh `::before`.
   - `html.fx-off-backdrop`: tắt `-webkit-backdrop-filter` và `backdrop-filter` trên toàn bộ nhãn, navbar, panel, CTA buttons; tăng độ đặc màu nền để đảm bảo độ tương phản.
   - `html.fx-off-vignette .vignette`: thay thế inset box-shadow 180px bằng `radial-gradient`.
3. `ai-era-site/js/three/nodes.js`:
   - `.core-label` được đặt `left: 0; top: 0` một lần duy nhất; cập nhật tọa độ bằng `style.translate = cx + 'px ' + cy + 'px'` (chỉ ghi DOM khi tọa độ thay đổi).
4. `ai-era-site/js/three/scene-setup.js`:
   - Đặt `alpha: !cfg.opaque` cho `WebGLRenderer` và gọi `renderer.setClearColor(0x030305, 1)` khi cờ `cfg.opaque` được bật.
5. `ai-era-site/js/main.js`, `diagnostics.js`, `index.html`:
   - `#diagOverlay` hiển thị thêm `fxOff [${g.fxOff}] ios ${g.ios}`.
   - `BUILD_VERSION = '20261028.1'` trong `diagnostics.js`.
   - Cập nhật 4 thẻ cache-bust trong `index.html` thành `?v=20261028.1`.
6. `tests/quality-tier.test.mjs`:
   - Mở rộng từ 12 lên 16 kịch bản tự động, kiểm tra trọn vẹn logic iOS detection, iPadOS desktop mode, fxOff trên mobile/desktop, override `?fx=full`/`?fxoff=`, và `?on=opaque`.

### 9.3 Bằng chứng kiểm thử & Audit
- **Bộ Test tự động 16 kịch bản:**
  ```text
  $ node tests/quality-tier.test.mjs
  ========================================
  KẾT QUẢ: 16/16 kịch bản đạt!
  ========================================
  ```
- **Syntax Check toàn bộ JS:**
  ```text
  $ Get-ChildItem -Path ai-era-site/js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
  => Mã thoát: 0 (tất cả file JS hợp lệ cú pháp).
  ```
- **Kiểm tra phát hiện iOS / Mobile:**
  ```text
  $ git grep -nE "iPhone|iPad|iOS|maxTouchPoints" ai-era-site/js
  => Chỉ xuất hiện trong ai-era-site/js/quality-tier.js.
  ```
- **Kiểm tra version đồng bộ:**
  ```text
  index.html:
    <link rel="stylesheet" href="./css/bundle.min.css?v=20261028.1">
    <script type="module" src="./js/main.js?v=20261028.1"></script>
    <script type="module" src="./js/contact-footer.js?v=20261028.1"></script>
    <script type="module" src="./js/menu-init.js?v=20261028.1"></script>
  diagnostics.js:
    BUILD_VERSION = '20261028.1'
  ```

