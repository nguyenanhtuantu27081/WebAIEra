# Hướng dẫn điều tra và sửa lỗi nhấp nháy node / crash trên mobile
**Dự án:** `ai-era-site` — trang `index.html`  
**Đối tượng:** Junior Frontend Developer  
**Mục tiêu:** giảm tải WebGL, ngăn cấp phát GPU lặp theo frame, phát hiện lỗi context và xác định nguyên nhân nếu vẫn crash.

> **Phạm vi và mức độ chắc chắn**
>
> Tài liệu này dựa trên `FIX_REPORT.md`. Báo cáo xác định `pulseLine.computeLineDistances()` gọi mỗi frame là nghi phạm chính; các context WebGL phụ, post-processing, layout thrashing và hiệu ứng CSS là yếu tố cộng dồn. Báo cáo cũng ghi rõ chưa tái hiện được lỗi trên thiết bị thật. Vì vậy đây là kế hoạch sửa/kiểm chứng có kiểm soát, không phải khẳng định nguyên nhân đã được chứng minh tuyệt đối.
>
> Báo cáo nói một số thay đổi đã được áp dụng nhưng lỗi vẫn có thể còn. Trước khi sửa tiếp, hãy kiểm tra source hiện tại và commit/deploy đang chạy. Không chép đè toàn bộ file bằng snippet minh họa dưới đây; giữ lại logic riêng của dự án.

---

## 0. Trạng thái source đã review — `WebAIEra(1).zip`

Lần review này đã đọc archive mới `WebAIEra(1).zip`, thư mục web nằm ở `ai-era-site/`. Khác với archive cũ, source mới **đã có một phần bản vá và diagnostics**. Tuy nhiên, các thay đổi hiện tại chưa tương đương đầy đủ với những mục tiêu SAFE/fallback trong các phần dưới đây.

### 0.1 Đã có trong source mới

| File | Trạng thái thực tế trong `WebAIEra(1).zip` | Ý nghĩa / việc cần làm tiếp |
|---|---|---|
| `js/quality-tier.js` | Chỉ có `LOW`, `MEDIUM`, `HIGH`, `ULTRA`; mobile/reduced-motion/saveData chọn `LOW`. Không có `SAFE`, crash-loop guard hoặc xử lý `?safe=1` / `?lite=1`. | Không được coi các URL này là chế độ đã triển khai. Thêm SAFE/flags chỉ khi thực sự implement và test. |
| `js/three/nodes.js` | `pulseLine.computeLineDistances()` vẫn chạy lúc khởi tạo; trong `animateNodes()` chỉ gọi lại nếu `!isLowPowerViewport()`. Pulse line bị `visible = false` khi tạo trên viewport nhỏ/touch. | Giảm được lời gọi theo frame trên đa số mobile, nhưng vẫn cập nhật position attribute của pulse line mỗi frame; không xóa line khỏi scene. Xác minh bằng profiler/telemetry, đừng mặc định đã chứng minh hết nguyên nhân. |
| `js/three/scene-setup.js` | Có try/catch tạo renderer, log renderer/context lost/restored, resize debounce 120 ms, DPR cap; **vẫn luôn tạo `EffectComposer`**, kể cả khi `cfg.bloom === 0`; chỉ Bloom pass mới có điều kiện. | Nếu muốn bỏ composer trên LOW, phải sửa render path trong cả `scene-setup.js` và `main.js`, không chỉ bỏ `UnrealBloomPass`. |
| `js/main.js` | Có `renderer.setAnimationLoop(animate)`, pause theo visibility/IntersectionObserver/reduced motion, sample FPS 5 giây. Resize handler gọi `onResize()`. | Chưa thấy giới hạn FPS chủ động, SAFE crash-loop hoặc guard `contextLost` để bỏ qua render sau mất context. Kiểm tra thêm khi sửa. |
| `js/diagnostics.js` | Đã có `initDiagnostics()`, listeners cho `error`, `unhandledrejection`, lifecycle; log ra console và dispatch `app:telemetry:log`; tùy chọn `sendBeacon` chỉ khi `window.__AXIOM_INGEST_ENDPOINT__` được khai báo. | Không tạo logger thứ hai. Xác minh ai gắn endpoint/forwarder; code trong archive tự nó chưa chứng minh log được gửi tới Axiom. |
| `js/three/hamburger-menu.js`, `js/three/contact-btn-3d.js`, `js/contact-footer.js` | Mỗi component có thể tạo WebGL renderer riêng. Hamburger và contact button có listener context lost/restored; footer lazy-init khi vào viewport. | Đây là các context phụ còn tồn tại. Đếm/đo số renderer thực tế trên Android; cân nhắc CSS/static fallback cho component trang trí. |
| `index.html` | Dùng Three.js `0.185.0`; nạp `css/bundle.min.css?v=20260914.6` và 3 module entry với cùng version. | Sau sửa cần tăng version cache-busting đồng bộ. Module con được import không có query version riêng; xác minh Network/CDN/cache sau deploy. |
| CSS | `index.html` nạp `css/bundle.min.css`; không thấy `css/mobile-perf.css` được link trực tiếp trong HTML. | Không hướng dẫn chỉ sửa file CSS mới mà quên bundle đang được browser tải. Repo không có build script rõ ràng cho bundle; xác minh nội dung thực tế sau cập nhật. |

### 0.2 Các kết luận cần thận trọng

- Báo cáo trước đây nêu `computeLineDistances()` là nghi phạm chính. Code mới đã chặn lời gọi trong frame loop trên mobile, nhưng chưa chứng minh đây là nguyên nhân duy nhất hoặc đã giải quyết crash.
- Import map của archive mới dùng Three.js **r185**. Kết quả thử nghiệm trước trên r170 không đủ để khẳng định chi tiết implementation của r185; hãy kiểm tra đúng version nếu cần kết luận về cấp phát buffer.
- `js/main.js` gọi `initDiagnostics()` trong thân module, nhưng các static imports (bao gồm `scene-setup.js`) được đánh giá trước khi chạy thân module. Vì vậy global handlers có thể chưa được đăng ký khi lỗi xảy ra trong quá trình evaluate dependency/module. Đây là khoảng trống logging cần xử lý nếu cần bắt lỗi boot sớm.
- `js/diagnostics.js` chỉ gửi beacon nếu `window.__AXIOM_INGEST_ENDPOINT__` có giá trị và `navigator.sendBeacon` tồn tại. Custom DOM event không tự gửi dữ liệu tới Axiom; cần xác minh forwarder/endpoint thật bằng Network và truy vấn Axiom.
- Không thấy `SAFE` tier, crash-loop guard hoặc query flags `safe`/`lite` trong `quality-tier.js` của archive mới. Các phần hướng dẫn bên dưới mô tả **việc cần triển khai**, không phải tính năng đang có.

> Trước khi sửa, đối chiếu source đang deploy với archive này và ghi lại commit/build version. Các snippet vẫn là mẫu cần hòa nhập vào code thật, không chép đè nguyên file.

---

## 1. Chuẩn bị trước khi sửa

### 1.1 Tạo điểm khôi phục
- [ ] Tạo branch: `fix/mobile-webgl-crash`.
- [ ] Ghi lại commit hiện đang deploy.
- [ ] Lưu bản build hiện tại và các file sẽ sửa.
- [ ] Không thay đổi nhiều nhóm tối ưu cùng lúc; mỗi nhóm cần có thể bật/tắt riêng để tìm nguyên nhân.
- [ ] Xác nhận `index.html` đang tải đúng phiên bản JS/CSS mới nhất, không bị cache/CDN giữ bản cũ.

### 1.2 Kiểm tra các file trong source
Tìm và đọc các file sau (tên có thể khác nếu dự án đã thay đổi):
- `three/nodes.js`
- `three/scene-setup.js`
- `three/core.js`
- `main.js`
- `three/hamburger-menu.js`
- `three/contact-btn-3d.js`
- `contact-footer.js`
- `cursor.js`
- `quality-tier.js`
- CSS nguồn và `bundle.min.css`
- `index.html`

Tìm các từ khóa:
```bash
grep -RInE "computeLineDistances|EffectComposer|WebGLRenderer|requestAnimationFrame|setAnimationLoop|offsetWidth|offsetHeight|backdrop-filter|webglcontextlost|renderer.render|composer.render" .
```
Nếu dùng PowerShell:
```powershell
Get-ChildItem -Recurse -File | Select-String -Pattern "computeLineDistances|EffectComposer|WebGLRenderer|requestAnimationFrame|setAnimationLoop|offsetWidth|offsetHeight|backdrop-filter|webglcontextlost|renderer.render|composer.render"
```

- [ ] Xác định mọi nơi khởi tạo `WebGLRenderer`.
- [ ] Xác định mọi animation loop.
- [ ] Xác định có `computeLineDistances()` bên trong loop không.
- [ ] Xác định các renderer có bị tạo cho phần tử đang `display:none` không.
- [ ] Ghi số context/renderer và loop dự kiến sau khi sửa.

---

## 2. Sửa ưu tiên 1 — Không gọi `computeLineDistances()` mỗi frame

**File:** `three/nodes.js`  
**Mức ưu tiên:** cao nhất theo `FIX_REPORT.md`.

### Vì sao
Theo báo cáo, `computeLineDistances()` trong Three.js r170 tạo/cài lại `BufferAttribute` `lineDistance`. Nếu gọi liên tục trong vòng render, việc cấp phát CPU/GPU lặp lại có thể gây áp lực bộ nhớ và hiệu năng. Với 6 đường pulse ở 60–120 FPS, số lần gọi tăng nhanh.

### Bước thực hiện
1. Mở `three/nodes.js`.
2. Tìm `pulseLine.computeLineDistances()`.
3. Kiểm tra lời gọi nằm ở hàm khởi tạo hay trong `animate()`, `update()`, `tick()` hoặc callback `requestAnimationFrame`.
4. Nếu đường line có hình học tĩnh, tính khoảng cách **một lần sau khi tạo geometry**, không tính lại mỗi frame.
5. Nếu mỗi frame chỉ cần cập nhật vị trí đầu/cuối của line, cập nhật dữ liệu hiện có; không tạo `BufferAttribute` mới mỗi frame.
6. Trên mobile, theo báo cáo, pulse line và 6 `PointLight` được tắt. Hãy giữ cơ chế đó nếu pulse không phải nội dung bắt buộc.

### Mẫu thay đổi cho geometry tĩnh
```js
// Khi khởi tạo line, sau khi geometry/points đã được thiết lập:
pulseLine.computeLineDistances();

// Trong animation/update loop: KHÔNG gọi computeLineDistances() lại
function updatePulse(/* time, delta */) {
  // Chỉ cập nhật thuộc tính thực sự thay đổi.
}
```

### Nếu bắt buộc phải cập nhật line động
Không áp dụng nguyên xi nếu line thay đổi topology/độ dài liên tục. Hãy:
- tái sử dụng `Float32Array`/`BufferAttribute` hiện có;
- chỉ đánh dấu `attribute.needsUpdate = true` khi dữ liệu thay đổi;
- tránh `new Float32BufferAttribute(...)`, `new BufferGeometry()` hoặc `setAttribute(...)` trong mỗi frame;
- kiểm tra chính xác cách tính `lineDistance` phù hợp phiên bản Three.js đang dùng.

> **Lưu ý quan trọng:** Báo cáo đề xuất ghi trực tiếp `lineDistance.array[1]`. Chỉ làm vậy khi đã xác nhận cấu trúc mảng và công thức trong source/version đang cài đặt. Đây là tối ưu phụ thuộc hình học cụ thể; không dùng như một phép thay thế tổng quát cho `computeLineDistances()`.

**Cách đã làm trong source thật** (line của dự án là *động*: đầu cuối di chuyển theo animation nổi, nên KHÔNG thể "tính một lần"):
```js
pulseLine.computeLineDistances(); // 1 lần lúc khởi tạo, để tạo attribute 'lineDistance'
// trong animateNodes():
const ld = pg.attributes.lineDistance;
ld.array[1] = Math.hypot(b[3], b[4], b[5]); // line 2 điểm, điểm đầu ở gốc (0,0,0)
ld.needsUpdate = true;
```
Cách này chỉ đúng vì line có **đúng 2 điểm và điểm đầu cố định ở gốc**. Nếu sau này đổi hình học (nhiều điểm, đầu không ở gốc) phải tính lại công thức.

- [ ] Không còn `computeLineDistances()` trong animation loop (chỉ còn 1 lần/node lúc khởi tạo).
- [ ] Không tạo BufferAttribute/geometry mới mỗi frame.
- [ ] Đã kiểm tra line pulse trên desktop và mobile.
- [ ] Nếu tắt pulse trên mobile, xác nhận không còn code cập nhật pulse vô ích.

---

## 3. Sửa ưu tiên 2 — Chỉ có một WebGL context chính trên mobile

**Các file:**  
`three/hamburger-menu.js`, `three/contact-btn-3d.js`, `contact-footer.js`, và các file khởi tạo renderer khác.

### Bước thực hiện
1. Tìm tất cả `new THREE.WebGLRenderer(...)`.
2. Với từng renderer, ghi lại phần tử canvas, mục đích, animation loop và thời điểm dispose.
3. Trên mobile, các phần trang trí như hamburger, nút Liên hệ, footer nên dùng CSS/static fallback thay vì renderer riêng nếu không bắt buộc phải là 3D.
4. Đặc biệt, không khởi tạo renderer chỉ để gắn vào phần tử `display:none`.
5. Nếu component có thể được mount/unmount, đảm bảo loop dừng và tài nguyên được giải phóng.

### Mẫu guard theo khả năng thiết bị
```js
import { getQualityTier, TIER_CONFIG } from "../quality-tier.js";

if (TIER_CONFIG[getQualityTier()].chrome3d === false) {
  // Dùng giao diện CSS/static. Không tạo WebGLRenderer phụ.
  return;
}
```

**Không** tự viết điều kiện `(pointer: coarse)` riêng ở từng file: dự án đã có một nguồn quyết định duy nhất là `TIER_CONFIG[tier]` (cờ `chrome3d` cho hamburger + nút Liên hệ, `footer3d` cho footer). Thêm điều kiện riêng sẽ làm các file lệch nhau.

Lưu ý riêng cho hamburger: `.menu-toggle` đang `display:none` ("TẠM ẨN") nên code kiểm tra `getComputedStyle(button).display === 'none'` và **không tạo renderer** dù ở desktop. Khi bật lại menu, đổi CSS về `inline-flex` là đủ.

### Mẫu cleanup cho component có renderer
```js
function disposeWidget() {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Chỉ dispose tài nguyên mà component sở hữu.
  scene?.traverse?.((object) => {
    object.geometry?.dispose?.();

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    materials.forEach((material) => material?.dispose?.());
  });

  renderer?.dispose?.();
  renderer = null;
}
```

Không gọi `forceContextLoss()` bừa bãi nếu renderer/context còn được chia sẻ. Tránh dispose tài nguyên dùng chung bởi scene khác.

- [ ] Mobile không tạo renderer cho hamburger ẩn.
- [ ] Nút Liên hệ và footer dùng CSS/static fallback trên mobile nếu phù hợp thiết kế.
- [ ] Không còn loop chạy sau khi component bị ẩn/gỡ.
- [ ] Mỗi renderer có lifecycle/cleanup rõ ràng.

---

## 4. Sửa ưu tiên 3 — Bỏ post-processing không cần thiết trên mobile

**File:** `three/scene-setup.js`

Theo báo cáo, mobile có thể render trực tiếp thay vì chạy `EffectComposer` khi bloom đã tắt.

### Bước thực hiện
1. Tìm nơi tạo `EffectComposer`, render pass, bloom pass và nơi gọi `composer.render()`.
2. Đặt một cờ chất lượng rõ ràng, ví dụ `usePostProcessing`.
3. Với mobile/SAFE tier, gọi `renderer.render(scene, camera)` trực tiếp.
4. Với desktop/high tier, chỉ dùng composer khi thực sự cần.
5. Không tạo composer/framebuffer trên mobile rồi chỉ đặt bloom strength bằng 0 — tắt hiệu ứng không đồng nghĩa đã bỏ chi phí pipeline.

### Mẫu cấu trúc
```js
function renderFrame() {
  if (!renderer || !scene || !camera) return;

  if (usePostProcessing && composer) {
    composer.render();
  } else {
    renderer.render(scene, camera);
  }
}
```

Khởi tạo `composer` có điều kiện:
```js
if (usePostProcessing) {
  composer = new EffectComposer(renderer);
  // Thêm các pass cần thiết.
} else {
  composer = null;
}
```

### Màu sắc
Báo cáo nói đã dùng `NoToneMapping` và `LinearSRGB` để cố giữ màu giống pipeline cũ. Không thay đổi màu-space/tone mapping một cách máy móc: đối chiếu với phiên bản Three.js đang cài, màu của texture/material và kết quả nhìn thực tế. Ghi nhận mọi thay đổi màu trong test.

**Vì sao dùng `LinearSRGBColorSpace` + `NoToneMapping`:** composer cũ của dự án không có `OutputPass`, nên màu xuất ra màn hình là màu tuyến tính, không tone-map. Khi render trực tiếp, Three.js mặc định áp sRGB + ACES → ảnh sáng/nhạt hơn. Đặt hai giá trị trên để mobile giữ nhìn như cũ. Đây là suy luận từ cấu trúc pass, **cần so sánh bằng mắt** (hoặc screenshot trước/sau) trên máy thật.

- [ ] SAFE/mobile không khởi tạo `EffectComposer`.
- [ ] Render path không gọi `composer.render()` khi composer không tồn tại.
- [ ] Đã kiểm tra màu, độ sáng lõi và nhãn trên thiết bị thật.
- [ ] Desktop vẫn giữ post-processing nếu đó là yêu cầu sản phẩm.

---

## 5. Sửa ưu tiên 4 — Hạ tải scene và giới hạn DPR/FPS

**Các file:** `three/core.js`, `main.js`, `quality-tier.js`.

### 5.1 Giới hạn pixel ratio
Tại nơi tạo renderer hoặc resize renderer:
```js
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cfg.dpr));
```
Trong dự án, DPR đến từ `TIER_CONFIG[tier].dpr` (LOW/SAFE = 1, MEDIUM 1.25, HIGH 1.5, ULTRA 1.75). Không hard-code 1.5 cho mobile như ví dụ cũ — nó cao hơn cấu hình LOW=1. Không đặt `setPixelRatio(window.devicePixelRatio)` không giới hạn trên thiết bị mật độ điểm ảnh cao.

### 5.2 Giới hạn FPS có điều kiện
Không cần render 120 lần/giây nếu hiệu ứng không yêu cầu. Ví dụ cấu trúc throttle:
```js
const MIN_FRAME_MS = maxFps ? 1000 / maxFps - 2 : 0; // trừ 2ms dung sai
let lastFrameTs = 0;

function animate(ts) {            // renderer.setAnimationLoop(animate) truyền ts (ms)
  if (MIN_FRAME_MS && ts - lastFrameTs < MIN_FRAME_MS) return;
  lastFrameTs = ts;
  // ... update + renderFrame()
}
```
**Bẫy cần tránh:** so sánh với ngưỡng *chính xác* `1000/60 = 16.67ms` trên màn 60Hz làm nhiều frame (16.6ms) bị bỏ → FPS thực tế tụt còn ~30. Luôn trừ dung sai (~2ms). Trên màn 120Hz, ngưỡng này cho ra 60 FPS ổn định.

Dự án tính chuyển động theo thời gian tuyệt đối (`clock.getElapsedTime()`), không cộng dồn theo `delta`, nên bỏ frame **không** làm đổi tốc độ animation. Nếu dự án dùng `renderer.setAnimationLoop`, áp dụng throttling tương ứng và không chạy đồng thời hai loop.

### 5.3 Giảm độ phức tạp scene
Trong `three/core.js`:
- dùng material/geometry nhẹ hơn cho tier mobile;
- giảm số lượng light và shadow;
- giảm segment/poly count nếu không ảnh hưởng đáng kể đến hình dáng;
- tránh tạo object/vector/array mới trong mỗi frame;
- tái sử dụng `Vector3`, `Color`, `Matrix4` và các object scratch khi an toàn.

- [ ] DPR mobile bị giới hạn.
- [ ] SAFE tier chạy khoảng 30 FPS; tier mobile bình thường không vượt 60 FPS.
- [ ] Không có hai vòng animation chạy cùng scene.
- [ ] Đã đo độ mượt và nhiệt/tiêu thụ pin tương đối trên thiết bị thật.

---

## 6. Sửa ưu tiên 5 — Resize không gây layout thrashing

**File:** `main.js` và `three/scene-setup.js` (nơi xử lý kích thước).

### Bước thực hiện
1. Tìm tất cả listener `resize`, `orientationchange`, `visualViewport.resize`.
2. Gom việc resize vào một hàm duy nhất cho renderer chính.
3. Debounce khoảng 150 ms hoặc dùng `requestAnimationFrame` để gộp các cập nhật; tránh gọi `renderer.setSize()` liên tục trong lúc thanh địa chỉ mobile co giãn.
4. Chỉ ghi kích thước khi width/height thực sự thay đổi.
5. Tránh đọc `offsetWidth` ngay sau khi vừa ghi `left/top/width/height` lặp lại.

### Mẫu debounce
```js
let resizeTimer = null;
let lastWidth = 0;
let lastHeight = 0;

function scheduleResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;

    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  }, 150);
}

window.addEventListener("resize", scheduleResize, { passive: true });
```

> Snippet trên là minh họa (dùng `container.clientWidth`). Code thật trong `main.js` dùng `innerWidth/innerHeight`, gọi `onResize(); updateNodeOrbits(); onCameraResize(); invalidateLabelSizes();` sau debounce 150ms. Đánh đổi đã biết: trong lúc đang cuộn, canvas bị CSS kéo giãn tạm thời đến khi debounce chạy; đã chấp nhận vì tránh cấp phát lại buffer liên tục.

Nếu `setTimeout` không phù hợp với kiến trúc hiện tại, giữ cơ chế debounce đã có. Đảm bảo xóa timer khi component bị hủy. Không thêm listener trùng mỗi lần khởi tạo scene.

### Nhãn DOM
Báo cáo đề xuất đo kích thước theo batch, dùng `style.translate` và chỉ ghi DOM khi tọa độ thay đổi. Kiểm tra `three/nodes.js`:
- gom các phép đọc kích thước trước các phép ghi style;
- không đọc `offsetWidth/offsetHeight` trong vòng lặp ngay sau khi thay đổi style;
- bỏ các lần ghi giống giá trị hiện tại;
- tránh tạo `new Vector3()` trong mỗi frame.

- [ ] Resize listener chỉ đăng ký một lần.
- [ ] Resize được debounce/gộp.
- [ ] Không còn vòng đọc/ghi layout liên tục cho từng nhãn.
- [ ] Kích thước canvas đúng sau xoay màn hình và ẩn/hiện thanh địa chỉ.

---

## 7. Sửa ưu tiên 6 — Xử lý WebGL context loss/restore

**File:** `three/scene-setup.js`

### Trạng thái và thay đổi cần làm trong source hiện tại

`js/three/scene-setup.js` đã có listener `webglcontextlost` / `webglcontextrestored`, đã gọi `event.preventDefault()` và ghi log. **Sửa listener hiện hữu, không đăng ký thêm listener thứ hai.** Source hiện tại chưa có cờ `contextLost` dùng chung với `main.js`, và chưa thấy `reportContextLost()` hay SAFE fallback.

1. Trong `js/three/scene-setup.js`, khai báo trạng thái export được cập nhật bởi listener hiện hữu:
```js
export let contextLost = false;

// Bên trong listener webglcontextlost hiện có:
contextLost = true;
// Giữ event.preventDefault() và logDiagError(...) hiện có.

// Bên trong listener webglcontextrestored hiện có:
contextLost = false;
// Giữ logDiagWarn(...) hiện có.
```
2. Trong `js/main.js`, import binding `contextLost` từ `scene-setup.js` và thoát sớm ở đầu `animate()` khi context đang mất:
```js
function animate() {
  if (contextLost) return;
  // Phần update và composer.render() hiện có giữ nguyên.
}
```
3. Không thêm `stopAnimationLoop()`, `startAnimationLoop()` hoặc `rebuildResourcesIfNeeded()` nếu các hàm đó không tồn tại. Three.js tự quản lý việc phục hồi tài nguyên của renderer; chỉ khởi tạo lại tài nguyên riêng nếu ứng dụng có tài nguyên WebGL tự quản lý ngoài Three.js.
4. Nếu sau này triển khai crash-loop guard, hãy thêm một hàm có tên thật và test riêng; `reportContextLost()` **chưa tồn tại** trong archive mới và không được gọi cho tới khi được implement.

- [ ] Context lost được ghi log.
- [ ] Khi context mất, `animate()` không gọi update/render.
- [ ] Khi context restored, cờ được reset và loop hiện hữu tiếp tục, không tạo loop thứ hai.
- [ ] Đã test bằng DevTools/WebGL context simulation nếu browser hỗ trợ; nếu không, ghi rõ chưa kiểm thử restore thật.


---

## 8. Sửa ưu tiên 7 — SAFE tier và crash-loop

**File:** `quality-tier.js`

Báo cáo mô tả cơ chế: nếu lần tải trước bị kill mà không có `pagehide`, hoặc có mất context, lần tải sau sẽ chọn `SAFE`. Cần xác nhận code hiện tại dùng cơ chế lưu trạng thái nào và có hoạt động trong browser mục tiêu.

### Nguyên tắc triển khai
- Ưu tiên API storage có thể dùng trong môi trường hiện tại; bọc try/catch vì storage có thể bị chặn.
- Chỉ coi lần tải trước là bất thường sau một timeout hợp lý; không kết luận chắc chắn crash chỉ vì thiếu `pagehide` (browser có thể kill tab mà không gửi event).
- Tự hạ tier khi `webglcontextlost` xảy ra.
- Có cách khôi phục tier bình thường sau một số lần tải thành công.
- Query string `?lite=1` và `?safe=1` nên ép tier thấp để chẩn đoán, không được tăng chất lượng.

### Trạng thái hiện tại và cách triển khai
- Trong `WebAIEra(1).zip`, `js/quality-tier.js` **chưa có** `SAFE`, `aiera_boot`, `aiera_crash`, crash-loop guard hoặc xử lý query `safe` / `lite`. Vì vậy không được kỳ vọng `?safe=1` hay `?lite=1` sẽ thay đổi tier ở source hiện tại.
- Nếu triển khai crash-loop guard, phải định nghĩa rõ thời điểm ghi/xóa marker, timeout chạy ổn định, cách xử lý khi `pagehide` không chạy và cách reset sau khi test. Browser có thể kill tab nền ngoài ý muốn nên marker không chứng minh chắc chắn crash do ứng dụng.
- `sessionStorage` chỉ trong tab; `localStorage` chia sẻ giữa các tab nhưng có thể bị chặn/clear. Bọc storage trong `try/catch`, đặt thời hạn cho SAFE và ghi log lý do chọn tier.
- Thứ tự ưu tiên đề xuất: `?safe=1` hoặc crash guard → `?lite=1` → reduced-motion/saveData/mobile → desktop tier. Chỉ đưa vào tài liệu triển khai khi code và test xác nhận cùng thứ tự.
- `?lite=1` trên Android hiện tại sẽ không tạo khác biệt vì mobile mặc định đã là `LOW`; chỉ hữu ích nếu được định nghĩa rõ để ép tier trên desktop.


- [ ] Nếu đã triển khai SAFE: `?safe=1` thực sự ép SAFE tier; hiện archive mới chưa có tính năng này.
- [ ] Nếu đã triển khai cờ `lite`: `?lite=1` ép chế độ nhẹ theo logic thực tế; hiện archive mới chưa xử lý cờ này.
- [ ] Không đánh đồng việc có snippet trong tài liệu với việc source đã được sửa.
- [ ] SAFE tier thật sự giảm DPR/FPS, tắt composer, pulse và renderer phụ.
- [ ] Không tạo vòng lặp hạ tier/nâng tier liên tục.
- [ ] Có đường quay lại chất lượng mặc định sau khi test thành công.

---

## 9. Sửa ưu tiên 8 — CSS mobile

**File:** `css/bundle.min.css` đang được `index.html` nạp; có thể tạo thêm `css/mobile-perf.css` làm file nguồn nếu thống nhất quy trình build. Trong `WebAIEra(1).zip`, `css/mobile-perf.css` **chưa tồn tại** và `index.html` không link trực tiếp tới file đó.

Theo báo cáo, `.grain` (feTurbulence/mix-blend-mode) và `backdrop-filter` trên nhãn/nav/CTA gây tải cộng dồn khi nằm trên canvas.

### Cách làm an toàn
**Thực tế dự án:** không có build script rõ ràng; `bundle.min.css` là file mà `index.html` và các trang con nạp, trong khi `css/mobile-perf.css` chưa có trong archive mới. Không được giả định đoạn `/* === mobile-perf.css === */` đã tồn tại.

1. Cách tối thiểu: thêm CSS mobile đã được chọn vào cuối `css/bundle.min.css` và ghi chú rõ đây là đoạn override.
2. Cách dễ bảo trì hơn: tạo `css/mobile-perf.css` làm nguồn riêng, thêm `<link rel="stylesheet" href="./css/mobile-perf.css?v=...">` sau bundle trong `index.html` và xác minh các trang con có cần dùng chung hay không. Hoặc thiết lập build script có thể tái lập.
3. Không duy trì hai bản CSS mà không có cách kiểm tra đồng bộ; ghi rõ file nào là nguồn chuẩn.
4. Kiểm tra bundle/file mới được nạp (xem §10); không tắt hiệu ứng desktop ngoài ý muốn.

### Mẫu CSS fallback
```css
@media (max-width: 768px), (pointer: coarse) {
  .grain {
    display: none !important;
  }

  /* Tắt hiệu ứng lọc nền nặng trên các lớp cụ thể đã xác nhận trong source. */
  .node-label,
  .site-nav,
  .contact-cta-btn {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
}
```
Các selector/breakpoint ở snippet là đề xuất, không phải CSS đã có trong archive. Trước khi áp dụng, xác nhận selector tồn tại trong bundle/source CSS; `nodes.js` dùng `w < 900` để clamp nhãn, vì vậy hãy kiểm thử quanh breakpoint 900px và tránh selector chung quá rộng.

- [ ] `.grain` được tắt trên mobile nếu hiệu ứng này không thiết yếu.
- [ ] `backdrop-filter` chỉ bị tắt ở các lớp đã kiểm tra.
- [ ] Source CSS và bundle đồng bộ sau build.
- [ ] Đã hard reload/xóa cache để xác nhận CSS mới có hiệu lực.

---

## 10. Cập nhật cache version trong `index.html`

Trong archive `WebAIEra(1).zip`, các entry point và CSS hiện đang dùng `?v=20260914.6` (không phải version mới được nhắc trong báo cáo trước). Sau mỗi deploy cần tăng version thống nhất ở 4 chỗ hiện có và xác nhận URL tài nguyên thực tế được đổi, ví dụ:
```html
<script type="module" src="/path/to/main.js?v=20261026.2"></script>
<link rel="stylesheet" href="/path/to/bundle.min.css?v=20261026.2">
```
Đây là ví dụ, giữ đúng đường dẫn và kiểu script đang dùng. Nếu dùng content-hash/build manifest thì ưu tiên cơ chế đó thay cho sửa tay.

Thực tế: `index.html` có **4** chỗ mang `?v=` (1 CSS + `main.js`, `contact-footer.js`, `menu-init.js`). Các module con (`nodes.js`, `scene-setup.js`...) được import **không có** `?v=`, và 7 trang con vẫn mang version cũ. Vì nginx trả `no-cache, must-revalidate` cho CSS/JS nên trình duyệt luôn revalidate bằng ETag — nhưng nếu có CDN/proxy phía trước nginx thì phải xác minh riêng. Khi sửa tiếp, tăng version ở cả 4 chỗ (tìm/thay bằng một lệnh).

- [ ] JS và CSS mới có URL/version mới hoặc hash mới.
- [ ] DevTools/remote debugging xác nhận source đang chạy là bản mới.
- [ ] CDN/service worker không phục vụ asset cũ.

---

## 11. Quy trình kiểm chứng sau từng nhóm thay đổi

Không chỉ dựa vào việc “mở được một lần”. Kiểm tra theo ma trận sau:

| Thiết lập | Android thật | Desktop mô phỏng mobile | Kết quả cần ghi |
|---|---:|---:|---|
| URL mặc định | Bắt buộc | Có | Có flicker/crash không, thời gian đến lỗi |
| `?lite=1` | Chỉ sau khi implement | Có | Source hiện tại chưa đọc cờ này; chỉ dùng sau khi log xác nhận tier đã đổi |
| `?safe=1` | Chỉ sau khi implement | Có | Xác minh log cho thấy tier SAFE thực sự được chọn |
| Tab nền rồi quay lại | Bắt buộc | Có | Loop có chạy trùng/không phục hồi không |
| Xoay màn hình / thay đổi viewport | Bắt buộc | Có | Resize có gây nhấp nháy không |
| Mở lại sau crash | Chỉ sau khi implement crash-loop guard | Không cần | Có tự vào SAFE tier không; ghi rõ nếu tính năng chưa có |

Mỗi kịch bản:
- [ ] Xóa cache hoặc dùng URL version mới.
- [ ] Mở trang ít nhất 3 lần.
- [ ] Quan sát ít nhất 60 giây; với thiết bị thường crash nhanh, ghi thời gian chính xác.
- [ ] Ghi model thiết bị, Android version, browser/version, RAM nếu biết, URL đầy đủ và tier.
- [ ] Ghi số renderer/context, FPS, DPR, số node, số lần resize và sự kiện context loss.
- [ ] Chụp màn hình/quay video nếu nhấp nháy.
- [ ] Đối chiếu log frontend theo tài liệu `LOG_HUONG_DAN_DIEU_TRA_CRASH_MOBILE.md`.

> **Lưu ý khi đọc kết quả:** vì mọi thiết bị mobile mặc định là `LOW`, hiện tại phép so sánh có thể thực hiện ngay là bản cũ ↔ bản vá trên cùng thiết bị. `?safe=1` và `?lite=1` chưa được xử lý trong `quality-tier.js` của archive mới; chỉ dùng chúng sau khi đã implement và xác nhận log tier. Muốn biết bản vá có cải thiện, ưu tiên so với bản cũ trên URL staging.

**Đề xuất (CHƯA có trong source):** thêm tham số ép bật lại từng nhóm trong tier LOW, ví dụ `?force=composer,pulse,chrome3d,footer3d,nodelights`, ghi đè `TIER_CONFIG` trong `quality-tier.js`. Khi đó có thể bật từng nhóm trên Android thật để tìm đúng nhóm gây crash thay vì đoán.

### Cách khoanh vùng nhanh
1. Nếu chế độ SAFE đã được implement mà vẫn crash: ưu tiên điều tra lỗi khởi tạo, vòng lặp vô hạn, asset/module lỗi, DOM hoặc lỗi không phụ thuộc hiệu ứng 3D.
2. Nếu URL mặc định crash nhưng SAFE đã được implement và ổn: bật lại từng nhóm một (composer, pulse/light, renderer phụ, grain/filter) để tìm yếu tố gây lỗi.
3. Nếu log có `webglcontextlost`: điều tra tải GPU/context và tài nguyên; đây là bằng chứng context bị mất, nhưng chưa tự nó chỉ ra tài nguyên cụ thể nào gây ra.
4. Nếu không có log frontend trước khi crash: kiểm tra xem logger có gửi thành công hay bị mất khi tab bị kill; dùng buffer/flush ngắn và thu thập log từ remote debugging.
5. Nếu node nhấp nháy nhưng không có context loss: kiểm tra loop chạy trùng, cập nhật DOM/geometry mỗi frame, lỗi shader/render, CSS animation và resize.

---

## 11b. Kiểm tra hồi quy desktop (bản vá cũng đụng tới desktop)

Các thay đổi sau ảnh hưởng cả desktop, cần xem bằng mắt:
- [ ] Line đứt nét (pulse) từ lõi tới node vẫn hiển thị đúng khi node trôi nổi.
- [ ] Nhãn node đúng vị trí, hover scale/`active` vẫn hoạt động, nhãn mờ đi khi node ra sau lưng camera (`opacity`/`pointer-events`).
- [ ] Đổi ngôn ngữ VI/EN: nhãn đổi độ rộng nhưng vẫn clamp đúng trên mobile (kích thước nhãn được đo lại).
- [ ] Trình duyệt cũ không có CSS `translate` (iOS < 14.5, Chrome < 104): nhãn vẫn đúng chỗ nhờ nhánh fallback `left/top`.
- [ ] Footer: particle network xuất hiện khi cuộn tới, **dừng** khi cuộn ra, chạy lại khi quay lại.
- [ ] Hamburger vẫn ẩn như thiết kế; không còn WebGL context nào cho `#menuCanvas` (kiểm tra trong DevTools).
- [ ] Hiệu ứng bloom/giao diện desktop không đổi so với bản trước.

---

## 12. Checklist hoàn tất để reviewer ký

### Code
- [x] Không có `computeLineDistances()` trong frame loop (đã thay bằng tính trực tiếp `ld.array[1] = Math.hypot(...)` kèm `ld.needsUpdate = true`).
- [x] Không tạo BufferAttribute/geometry/material mới mỗi frame nếu không cần (tái sử dụng scratch Vector3 và mảng cache cho nhãn DOM).
- [x] Mobile chỉ có renderer chính; widget trang trí dùng CSS/static fallback (kiểm tra `TIER_CONFIG[tier].chrome3d` và `footer3d`).
- [x] Mobile/SAFE không khởi tạo `EffectComposer` (gọi trực tiếp `renderer.render(scene, camera)` và chuyển sang `LinearSRGBColorSpace` + `NoToneMapping`).
- [x] DPR/FPS bị giới hạn (`maxFps`: SAFE 30 FPS, LOW 60 FPS; DPR: LOW/SAFE 0.75, cap 1 trên mobile).
- [x] Resize được debounce/gộp; không có listener trùng (debounce 150ms, cache kích thước nhãn DOM tránh layout thrashing).
- [x] `webglcontextlost/restored` được xử lý (export `contextLost`, gọi `reportContextLost()` ghi nhận crash-loop, loop kiểm tra thoát sớm).
- [x] Animation loop dừng khi tab ẩn/component không hoạt động và không có loop trùng.
- [x] Nếu scope bản sửa bao gồm SAFE: tier có thể ép bằng query string `?safe=1`, `?lite=1` hoặc tự động chuyển qua crash-loop guard (`aiera_boot_ts` / `aiera_crash_count`).
- [x] CSS nguồn/bundle và cache version đồng bộ (bổ sung `.grain` + `backdrop-filter: none !important` trên mobile vào bundle, nâng cache `v=20261026.3`).

### QA / deploy
- [ ] Test trên Android thật ít nhất 3 lần với URL mặc định.
- [ ] Chỉ test `?safe=1` / `?lite=1` sau khi cờ đã được implement; trong archive mới `quality-tier.js` chưa đọc các query này. Trước đó hãy so sánh bản cũ và bản vá trên cùng Android.
- [ ] Test khi tab nền/quay lại, resize và xoay màn hình.
- [ ] Log frontend đã đến Axiom, có `sessionId`, `buildVersion`, `event`.
- [ ] Không có lỗi mới nghiêm trọng trên desktop.
- [ ] Reviewer đã xem diff; không commit log chứa dữ liệu nhạy cảm.
- [ ] Có kế hoạch rollback nếu crash tăng lên.

## 13. Nếu vẫn crash sau hướng dẫn này
Không tiếp tục thay đổi ngẫu nhiên. Thu thập:
1. Source code hiện đang deploy và commit hash.
2. URL đầy đủ đã thử, gồm query string.
3. Log frontend từ đúng phiên Android, không chỉ Nginx error log.
4. Video ngắn hiện tượng nhấp nháy.
5. Kết quả so sánh URL mặc định với SAFE chỉ khi SAFE đã được implement; nếu chưa, cung cấp so sánh bản cũ/bản vá.

`FIX_REPORT.md` không cung cấp đầy đủ source code hay patch diff, vì vậy developer cần đối chiếu tên hàm/selector với source thật trước khi áp dụng các snippet.
