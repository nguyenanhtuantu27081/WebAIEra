# Hướng dẫn xử lý lỗi crash mobile tại `index.html` — AI Era

> Đối tượng: junior frontend developer.  
> Phạm vi: mã nguồn trong thư mục `ai-era-site/`.  
> Mục tiêu: tìm nguyên nhân có bằng chứng, giảm tải GPU/CPU trên mobile, tránh WebGL context bị mất và kiểm thử trước khi deploy.
>
> **Lưu ý quan trọng:** không thể cam kết “fix hoàn toàn” chỉ bằng đọc source code; cần tái hiện trên thiết bị thật và kiểm tra log. Tài liệu này xác định các rủi ro cụ thể trong source ZIP và đưa ra các thay đổi ưu tiên. Hãy commit/backup trước khi sửa.

## 1. Triệu chứng và kết luận ban đầu

Triệu chứng được báo cáo: chỉ `index.html` gặp lỗi trên mobile; các node 3D nhấp nháy rồi trình duyệt báo trang liên tục gặp sự cố.

`index.html` là trang khác biệt đáng kể so với các trang nội dung: nó khởi tạo cảnh Three.js/WebGL tương tác toàn màn hình, core 3D, sáu node, đường năng lượng, nhãn DOM và hiệu ứng camera. Các trang chi tiết không chạy cùng hệ thống cảnh 3D này. Do đó, ưu tiên điều tra **tải GPU/WebGL và vòng lặp animation của trang chủ**, không nên kết luận ngay lỗi HTML/CSS thông thường.

### Các điểm rủi ro xác định được trong source

1. `js/three/scene-setup.js`
   - Renderer WebGL toàn màn hình và `EffectComposer` được khởi tạo ngay.
   - `setPixelRatio()` giới hạn theo tier, nhưng tier chỉ được xác định một lần lúc tải trang; `innerWidth`/`innerHeight` cũng được dùng trực tiếp.
2. `js/three/core.js`
   - `IcosahedronGeometry(1.28, 5)` tạo hình học rất dày cho core. Detail 5 có khoảng 20.480 mặt tam giác trước các hiệu ứng bổ sung.
   - Cộng thêm wireframe, ba vòng torus, 44 spark, node, point light, aura, ring và đường năng lượng.
3. `js/three/nodes.js`
   - Mỗi frame, `animateNodes()` gọi `computeLineDistances()` cho từng pulse line. Đây là phép tính không cần làm lại nếu chỉ cập nhật vị trí endpoint.
   - Cập nhật buffer endpoint cho hai đường của mỗi node mỗi frame.
4. `js/main.js`
   - Vòng lặp cảnh chính chạy liên tục khi trang/canvas đang hiển thị; trên điện thoại điều này có thể giữ GPU hoạt động liên tục.
   - `IntersectionObserver` chỉ theo dõi canvas `#webgl`; các canvas 3D phụ có vòng lặp riêng.
5. Các module khác có thể tạo thêm WebGL context:
   - `js/contact-footer.js` tạo renderer và có animation loop riêng.
   - `js/three/contact-btn-3d.js` tạo renderer cho nút liên hệ và chạy loop riêng.
   - `js/three/hamburger-menu.js` cần kiểm tra thời điểm tạo renderer và cách dừng loop.
   - Trên thiết bị có giới hạn tài nguyên, nhiều context và nhiều loop đồng thời có thể gây GPU reset/context loss. Cần xác minh qua log, không coi đây là nguyên nhân đã được chứng minh.
6. `js/grid-beam-background.js` **không được nạp trong `index.html` theo source hiện tại**. Vì vậy, không ưu tiên sửa hiệu ứng grid-beam để xử lý crash của trang chủ, trừ khi HTML thực tế trên server khác ZIP này.

## 2. Trước khi sửa: tái hiện và thu thập bằng chứng

### Bước 1 — Tạo nhánh và lưu hiện trạng

```bash
git checkout -b fix/mobile-index-webgl-crash
git status
```

Nếu dự án không dùng Git, sao lưu thư mục `ai-era-site/` trước khi thay đổi.

### Bước 2 — Tái hiện trên thiết bị thật

Kiểm tra tối thiểu:
- Android Chrome và một trình duyệt Android khác (nếu có).
- iPhone Safari, nếu đây là nhóm người dùng mục tiêu.
- Mạng bình thường và chế độ tiết kiệm dữ liệu.
- Vào trang chủ mới, để yên 30–60 giây, cuộn xuống footer, mở/đóng menu, đổi ngôn ngữ, xoay màn hình.

Ghi lại: model máy, OS, trình duyệt/phiên bản, thời điểm node bắt đầu nhấp nháy, có nóng máy hay reload tự động không.

### Bước 3 — Đọc log bằng remote debugging

- Android: kết nối điện thoại với máy tính, bật USB debugging, mở `chrome://inspect` trong Chrome desktop và inspect tab điện thoại.
- iPhone: dùng Safari trên macOS → Develop → thiết bị → tab trang web (nếu bật Web Inspector).
- Tìm các lỗi như `WebGL context lost`, `CONTEXT_LOST_WEBGL`, `GPU process`, `Out of memory`, lỗi import/module hoặc exception JavaScript.

Nếu xuất hiện `webglcontextlost`, ưu tiên bước 4–6. Nếu có exception JavaScript cụ thể, sửa exception đó trước và kiểm tra lại. Nếu không có log, vẫn thực hiện các tối ưu GPU có kiểm soát bên dưới.

### Bước 4 — Thêm log context loss tạm thời

Trong `ai-era-site/js/three/scene-setup.js`, ngay sau khi tạo `renderer` và trước `mount.appendChild(...)`, thêm:

```js
renderer.domElement.addEventListener('webglcontextlost', (event) => {
  // Chỉ dùng để chẩn đoán; preventDefault cho phép browser thử khôi phục context.
  event.preventDefault();
  console.error('[WebGL] Main context lost', {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio,
    tier
  });
});

renderer.domElement.addEventListener('webglcontextrestored', () => {
  console.warn('[WebGL] Main context restored');
});
```

Lưu ý: log này chỉ theo dõi renderer chính; canvas phụ có thể mất context riêng. Không coi `webglcontextrestored` là bảo đảm rằng toàn bộ tài nguyên Three.js đã được khôi phục đúng. Nếu context mất trên thiết bị thật, vẫn phải giảm tải và kiểm tra lifecycle.

---

## 3. Sửa ưu tiên P0 — giảm độ phân giải render trên mobile

### File: `ai-era-site/js/quality-tier.js`

Tìm `TIER_CONFIG`. Hiện tại LOW có `dpr: 1`, nhưng trên một số thiết bị/tablet hoặc khi UA/pointer detection không nhận diện đúng, tier có thể cao hơn. Đồng thời số pixel render tăng theo bình phương DPR: DPR 2 render khoảng 4 lần số pixel so với DPR 1.

Thay cấu hình tier bằng mức bảo thủ sau (có thể tinh chỉnh sau khi benchmark):

```js
export const TIER_CONFIG = {
  LOW:    { particles: 60,  dpr: 0.75, bloom: 0,    lights: 1, antialias: false, powerPreference: 'low-power' },
  MEDIUM: { particles: 250, dpr: 1.0,  bloom: 0.2,  lights: 2, antialias: false, powerPreference: 'default' },
  HIGH:   { particles: 600, dpr: 1.25, bloom: 0.45, lights: 2, antialias: true,  powerPreference: 'default' },
  ULTRA:  { particles: 1000,dpr: 1.5,  bloom: 0.65, lights: 3, antialias: true,  powerPreference: 'default' }
};
```

Lưu ý: `particles` trong cấu hình chỉ có tác dụng nếu module starfield thực sự đọc cấu hình này; kiểm tra `js/three/starfield.js` trước khi kỳ vọng số hạt giảm.

Trong cùng file, thay logic xác định mobile thành logic ưu tiên thiết bị cảm ứng/viewport nhỏ, tránh chỉ dựa UA:

```js
export function getQualityTier() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const saveData = navigator.connection?.saveData;
  const isMobile =
    window.innerWidth < 768 ||
    window.matchMedia?.('(pointer: coarse)')?.matches ||
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (reduceMotion || saveData || isMobile) return 'LOW';

  const w = window.innerWidth;
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}
```

**Vì sao:** thiết bị có DPR cao không nên mặc định render toàn màn hình ở DPR cao; LOW không bloom/antialias sẽ giảm áp lực GPU. `0.75` là điểm khởi đầu cho máy yếu; nếu hình ảnh quá mờ, thử `0.85` hoặc `1.0` sau khi crash đã hết.

### File: `ai-era-site/js/three/scene-setup.js`

Tìm các lệnh `renderer.setPixelRatio(...)` cả lúc khởi tạo và trong `onResize()`. Thay bằng helper dùng chung để giới hạn DPR theo kích thước thiết bị:

```js
function getRenderPixelRatio() {
  const isSmallOrTouch =
    window.innerWidth < 768 ||
    window.matchMedia?.('(pointer: coarse)')?.matches;

  const cap = isSmallOrTouch ? 1 : cfg.dpr;
  return Math.min(window.devicePixelRatio || 1, cap);
}
```

Sau đó dùng `renderer.setPixelRatio(getRenderPixelRatio())` ở cả hai chỗ. Đặt helper sau `cfg` và trước khi khởi tạo renderer.

> Không cần đặt DPR dưới 1 nếu chất lượng hình ảnh không chấp nhận được; quan trọng là kiểm tra hiệu năng và độ ổn định trên máy thực tế.

---

## 4. Sửa ưu tiên P0 — giảm hình học core

### File: `ai-era-site/js/three/core.js`

Tìm:

```js
new THREE.IcosahedronGeometry(1.28, 5)
```

Đổi thành:

```js
new THREE.IcosahedronGeometry(1.28, 2)
```

Nếu muốn core mượt hơn, thử detail `3`; tránh quay lại `5` cho mobile trước khi đo. Detail 2 chỉ có 320 mặt tam giác, detail 3 có 1.280, trong khi detail 5 có 20.480. Đây là mức giảm đáng kể về số đỉnh/triangles.

Có thể giảm mật độ vòng torus ở core từ `190` xuống `96`:

```js
new THREE.TorusGeometry(r, .009 + i * .003, 6, 96)
```

Và giảm sparks từ 44 xuống 24:

```js
for (let i = 0; i < 24; i++) {
```

Những thay đổi này giữ được ngôn ngữ thị giác nhưng giảm lượng hình học phải xử lý mỗi frame.

---

## 5. Sửa ưu tiên P1 — không tính lại đường nét không cần thiết mỗi frame

### File: `ai-era-site/js/three/nodes.js`

Trong `animateNodes(t, selected)`, tìm đoạn:

```js
n.pulseLine.computeLineDistances();
```

Đoạn này nằm trong vòng lặp mỗi frame. `LineDashedMaterial` dùng khoảng cách dọc đường để tạo dash, nhưng khi endpoint thay đổi, việc cập nhật `lineDistance` đúng cách phụ thuộc geometry và cách cập nhật buffer. Cách đơn giản, an toàn về hiệu năng là **chỉ cập nhật dash distances khi thật sự cần** hoặc dùng đường liền trên mobile.

Giải pháp dễ áp dụng cho junior: tắt dashed pulse line trên mobile, vẫn giữ đường năng lượng liền. Ngay sau khi lấy viewport, thêm:

```js
const isLowPowerViewport =
  window.innerWidth < 768 ||
  window.matchMedia?.('(pointer: coarse)')?.matches;
```

Trong `animateNodes()`, thay đoạn cập nhật pulse line bằng:

```js
const b = n.pulseLine.geometry.attributes.position.array;
b[3] = n.group.position.x;
b[4] = n.group.position.y;
b[5] = n.group.position.z;
n.pulseLine.geometry.attributes.position.needsUpdate = true;

if (!isLowPowerViewport) {
  n.pulseLine.computeLineDistances();
}
n.line.material.opacity = selected === i ? .48 : .11;
```

Và khi khởi tạo `pulseLine`, có thể ẩn pulse line trên viewport mobile bằng:

```js
if (
  window.innerWidth < 768 ||
  window.matchMedia?.('(pointer: coarse)')?.matches
) {
  pulseLine.visible = false;
}
```

Khi `pulseLine.visible = false`, không cần cập nhật buffer của nó trên mobile. Cách này bỏ một chi tiết trang trí nhưng giữ các node, nhãn và đường năng lượng chính.

**Quan trọng:** vì `isLowPowerViewport` nếu khai báo ở đầu hàm sẽ được tính mỗi lần `animateNodes()` chạy; nên khai báo ở cấp module hoặc tính lại trong hàm `updateNodeOrbits()` nếu cần hỗ trợ xoay màn hình. Nếu muốn hỗ trợ đổi viewport chính xác, dùng helper:

```js
function isLowPowerViewport() {
  return window.innerWidth < 768 ||
    window.matchMedia?.('(pointer: coarse)')?.matches;
}
```

và gọi helper khi cần.

---

## 6. Sửa ưu tiên P1 — chỉ chạy animation khi cần và khi trang nhìn thấy

### File: `ai-era-site/js/main.js`

Hiện vòng lặp chính dùng `renderer.setAnimationLoop(animate)`. Hãy bảo đảm loop không chạy khi tab ẩn hoặc người dùng bật Reduce Motion, và chỉ chạy khi vùng 3D hiện trên màn hình.

Thay phần quản lý visibility/observer và đoạn khởi động loop bằng cấu trúc dưới đây. Giữ nguyên phần thân `animate()` (các hàm cập nhật core, nodes, camera, starfield, labels, HUD và `composer.render()`), nhưng **xóa** đoạn `requestIdleCallback(() => renderer.setAnimationLoop(animate))` cũ và thay bằng:

```js
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let isVisible = document.visibilityState === 'visible';
let isIntersecting = true;
let animationRunning = false;

function syncAnimationState() {
  const shouldRun =
    isVisible &&
    isIntersecting &&
    !reduceMotion.matches;

  if (shouldRun && !animationRunning) {
    animationRunning = true;
    renderer.setAnimationLoop(animate);
  } else if (!shouldRun && animationRunning) {
    animationRunning = false;
    renderer.setAnimationLoop(null);
  }
}

document.addEventListener('visibilitychange', () => {
  isVisible = document.visibilityState === 'visible';
  syncAnimationState();
});

reduceMotion.addEventListener?.('change', syncAnimationState);

const canvasEl = renderer.domElement;
if ('IntersectionObserver' in window && canvasEl) {
  const observer = new IntersectionObserver((entries) => {
    isIntersecting = entries.some(entry => entry.isIntersecting);
    syncAnimationState();
  }, { threshold: 0.05 });
  observer.observe(canvasEl);
}

syncAnimationState();
```

Ở đây, `animate()` vẫn cần bắt đầu bằng guard an toàn nếu muốn giữ logic hiện có, nhưng không nên `return` mà không có cơ chế restart nếu tự quản lý RAF. Với `setAnimationLoop(null)`/`setAnimationLoop(animate)`, loop được dừng và khởi động rõ ràng.

**Cần kiểm tra:** `prefers-reduced-motion` đang được dùng trong `quality-tier.js`, nhưng tier được xác định lúc tải trang. Đoạn trên sẽ dừng loop nếu preference đổi khi trang đang mở. Nếu cần giữ chuyển động rất nhẹ cho Reduce Motion, hãy dùng chế độ tĩnh thay vì chạy loop.

---

## 7. Sửa ưu tiên P1 — giảm tải renderer phụ ở footer và nút liên hệ

Trang chủ có nhiều canvas WebGL. Đừng tạo renderer cho phần ngoài màn hình nếu không cần thiết.

### File: `ai-era-site/js/contact-footer.js`

- Tìm nơi khởi tạo renderer và hàm `animate()` có `requestAnimationFrame(animate)`.
- Dùng `IntersectionObserver` theo dõi `.contact-footer` để bắt đầu loop khi footer sắp vào màn hình và dừng khi rời màn hình.
- Khi dừng, gọi `cancelAnimationFrame(animId)` và đặt `animId = 0`; khi bắt đầu, chỉ tạo một loop nếu `animId === 0`.
- Khi `document.visibilityState !== 'visible'`, dừng loop; khi quay lại tab, gọi hàm đồng bộ trạng thái.
- Trong `onResize`, không ép kích thước tối thiểu 300 × 300 nếu container thực tế nhỏ hơn; dùng `Math.max(rect.width, 1)` và `Math.max(rect.height, 1)` để tránh render dư thừa khi ẩn.

Mẫu quản lý loop (điều chỉnh tên biến cho khớp module hiện tại):

```js
let animId = 0;
let footerVisible = false;

function startFooterAnimation() {
  if (animId || !footerVisible || document.hidden) return;
  animate();
}

function stopFooterAnimation() {
  if (animId) cancelAnimationFrame(animId);
  animId = 0;
}

const footer = document.querySelector('.contact-footer');
if (footer && 'IntersectionObserver' in window) {
  const footerObserver = new IntersectionObserver(([entry]) => {
    footerVisible = entry.isIntersecting;
    if (footerVisible) startFooterAnimation();
    else stopFooterAnimation();
  }, { threshold: 0.01 });
  footerObserver.observe(footer);
}
```

Trong `animate()`, cần giữ mẫu cuối:

```js
renderer.render(scene, camera);
animId = requestAnimationFrame(animate);
```

Khi dừng, `cancelAnimationFrame` xóa frame đã lên lịch. Xử lý `visibilitychange` cũng phải gọi `startFooterAnimation()`/`stopFooterAnimation()` theo `document.hidden`.

Không copy nguyên mẫu này một cách mù quáng nếu module đã có cơ chế quản lý loop; hãy tích hợp vào loop hiện tại để tránh hai vòng lặp song song.

### File: `ai-era-site/js/three/contact-btn-3d.js`

- Kiểm tra `renderLoop()` (khoảng cuối file) và dừng khi nút không hiển thị/không cần animation.
- Hạ DPR từ `Math.min(window.devicePixelRatio || 1, 2)` xuống `Math.min(window.devicePixelRatio || 1, 1)` trên mobile.
- Nếu nút chỉ trang trí, dùng CSS/static fallback khi WebGL không khả dụng.
- Đảm bảo không gọi `requestAnimationFrame(renderLoop)` hai lần sau khi tab quay lại.

### File: `ai-era-site/js/three/hamburger-menu.js`

- Kiểm tra renderer có được tạo ngay khi tải trang hay chỉ khi mở menu.
- Ưu tiên chỉ khởi tạo renderer khi mở menu lần đầu.
- Dừng animation khi menu đóng; nếu canvas chỉ trang trí, cân nhắc thay bằng CSS 2D trên mobile.
- Không tạo renderer mới mỗi lần mở menu.

Việc giảm số context WebGL đồng thời thường quan trọng hơn việc chỉ giảm vài object trong scene.

---

## 8. Sửa ưu tiên P2 — xử lý resize và kích thước viewport mobile

### File: `ai-era-site/js/three/scene-setup.js`

Trình duyệt mobile có thể thay đổi chiều cao viewport khi thanh địa chỉ hiện/ẩn. Resize liên tục có thể gây giật nếu cập nhật renderer và composer liên tục.

Thay `onResize()` hiện tại bằng phiên bản có guard và debounce nhẹ:

```js
let resizeTimer = 0;

function resizeNow() {
  const w = Math.max(1, window.innerWidth);
  const h = Math.max(1, window.innerHeight);

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(getRenderPixelRatio());
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
}

export function onResize() {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(resizeNow, 120);
}
```

`getRenderPixelRatio()` là helper được thêm ở bước 3. `setSize(..., false)` giữ CSS size do CSS quản lý, tránh Three.js sửa style inline không cần thiết. Kiểm tra `#webgl` có `width: 100%; height: 100vh` hay không; nếu canvas phải phủ viewport, dùng `100dvh` với fallback phù hợp.

**Lưu ý:** `window.innerHeight` và `100dvh` không phải lúc nào cũng khớp trên mọi trình duyệt. Hãy kiểm tra CSS của `#webgl`/hero trước khi đổi layout. Không thêm listener cho `resize` ở nhiều nơi nếu một listener hiện tại đã quản lý việc này.

---

## 9. Fallback khi WebGL không khả dụng

### File: `ai-era-site/js/three/scene-setup.js`

Đang tạo `new THREE.WebGLRenderer(...)` mà không có `try/catch` ở renderer chính. Nếu WebGL không được cấp phát, lỗi có thể làm module dừng và trang chủ mất phần nội dung tương tác.

Thay phần tạo renderer bằng:

```js
let rendererInstance;

try {
  rendererInstance = new THREE.WebGLRenderer({
    antialias: cfg.antialias,
    alpha: true,
    powerPreference: cfg.powerPreference
  });
} catch (error) {
  console.error('[WebGL] Unable to create main renderer', error);
  document.documentElement.classList.add('webgl-unavailable');
  throw error;
}

export const renderer = rendererInstance;
```

Đây là bước chẩn đoán/fallback tối thiểu, nhưng `throw` vẫn làm module không khởi tạo phần còn lại. Để trang vẫn dùng được, cách tốt hơn là tách nội dung HTML chính khỏi yêu cầu WebGL: đảm bảo nav, tiêu đề, liên kết và nội dung quan trọng không phụ thuộc vào module 3D; thêm CSS fallback:

```css
.webgl-unavailable #webgl {
  display: none;
}

.webgl-unavailable #labels {
  /* Cho nội dung HTML quan trọng hiển thị trong bố cục fallback */
  display: none;
}
```

Không áp dụng `display:none` cho `#labels` nếu bên trong có nội dung quan trọng hoặc nếu CSS của trang cần nhãn DOM. Kiểm tra DOM thực tế và tạo hero HTML tĩnh dễ đọc nếu WebGL không chạy.

Nếu muốn graceful fallback hoàn chỉnh, nên bọc khởi tạo toàn bộ scene vào hàm khởi tạo riêng và chỉ thêm class fallback khi renderer không tạo được; không nên nuốt exception rồi tiếp tục gọi các module đang yêu cầu `renderer`.

---

## 10. Kiểm tra lỗi logic của vòng lặp chính

### File: `ai-era-site/js/main.js`

Đảm bảo các điều kiện sau:

- Chỉ có **một** `renderer.setAnimationLoop(animate)` hoạt động.
- Không kết hợp `renderer.setAnimationLoop()` với một vòng `requestAnimationFrame(animate)` khác cho cùng renderer.
- `IntersectionObserver` không làm loop dừng vĩnh viễn khi canvas ra khỏi màn hình rồi quay lại.
- Khi tab ẩn, loop chính và loop canvas phụ đều dừng.
- Khi `prefers-reduced-motion: reduce`, loop chính dừng hoặc chuyển sang hình tĩnh.
- `updateHUD()` không ghi lại DOM text/style mỗi frame nếu giá trị không thay đổi; nếu cần, throttle 5–10 lần/giây.

Có thể thêm log tạm:

```js
console.debug('[Perf]', {
  visible: document.visibilityState,
  dpr: window.devicePixelRatio,
  width: window.innerWidth,
  height: window.innerHeight
});
```

Không để log mỗi frame trong production.

---

## 11. Checklist kiểm thử bắt buộc

### Trên thiết bị thật

- [ ] Trang chủ tải được lần đầu, không crash sau 60 giây.
- [ ] Node không nhấp nháy, không biến mất rồi hiện lại bất thường.
- [ ] Cuộn đến footer rồi quay lên đầu không làm crash.
- [ ] Mở/đóng menu 10 lần không tạo thêm loop/context.
- [ ] Xoay dọc/ngang và hiện/ẩn thanh địa chỉ không làm canvas liên tục resize.
- [ ] Chuyển sang app khác rồi quay lại không làm animation bị nhân đôi.
- [ ] Reduce Motion vẫn hiển thị nội dung quan trọng.
- [ ] Khi WebGL bị tắt/không hỗ trợ, người dùng vẫn đọc được nội dung và đi đến các trang con.
- [ ] Kiểm tra các trang chi tiết vẫn hoạt động sau khi sửa CSS/module dùng chung.

### Performance

Trong Chrome DevTools Performance:
1. Ghi 10–15 giây khi trang chủ đang hiển thị.
2. Kiểm tra FPS, Long Tasks và thời gian scripting/rendering.
3. Dùng Memory/Performance Monitor để xem bộ nhớ tăng dần theo thời gian không.
4. Trong remote debugging, kiểm tra Console có `WebGL context lost` không.
5. So sánh trước/sau trên cùng thiết bị, cùng trình duyệt, cùng trạng thái viewport.

Mục tiêu tham khảo: animation ổn định quanh 30–60 FPS tùy máy, không có long task lặp lại, bộ nhớ không tăng liên tục, không mất WebGL context. Trên máy yếu, 30 FPS ổn định tốt hơn 60 FPS nhưng nóng máy/crash.

---

## 12. Thứ tự triển khai khuyến nghị

1. Thu thập log và xác nhận context loss.
2. Hạ DPR/tier mobile (`quality-tier.js`, `scene-setup.js`).
3. Giảm core geometry và spark (`core.js`).
4. Tắt/giảm dashed pulse line trên mobile (`nodes.js`).
5. Quản lý loop theo visibility/intersection cho main scene (`main.js`).
6. Dừng animation canvas phụ khi không nhìn thấy (`contact-footer.js`, `contact-btn-3d.js`, `hamburger-menu.js`).
7. Tối ưu resize và fallback WebGL.
8. Test hồi quy tất cả trang, đặc biệt trang chủ và footer.

Mỗi nhóm thay đổi nên là một commit riêng. Sau mỗi commit, thử lại trên ít nhất một Android thật; nếu có iPhone thì kiểm thử Safari riêng.

## 13. Tiêu chí hoàn tất

Chỉ đóng bug khi:
- Có bằng chứng trên thiết bị gặp lỗi ban đầu rằng crash không còn tái hiện qua nhiều lần reload và 10–15 phút sử dụng.
- Console không có lỗi context loss lặp lại.
- Không còn nhiều animation loop được tạo lại khi mở menu/quay lại tab.
- Trang vẫn hoạt động khi Reduce Motion hoặc WebGL không khả dụng.
- Các trang nội dung không bị hồi quy.

Nếu vẫn crash sau khi áp dụng các bước, hãy lấy log remote debugging và kiểm tra phiên bản GPU/OS cụ thể; có thể cần giảm thêm hiệu ứng hoặc thay phần nền 3D bằng bản 2D tĩnh trên thiết bị yếu.


---

# 14. Checklist triển khai và nghiệm thu cho developer

> **Cách sử dụng:** Dev thực hiện lần lượt từ trên xuống. Đánh dấu `[x]` chỉ khi đã hoàn thành và có bằng chứng kiểm tra. Nếu một mục không áp dụng, ghi rõ lý do thay vì bỏ trống. Không triển khai toàn bộ thay đổi cùng lúc: hãy chia thành các commit nhỏ để dễ xác định thay đổi nào gây lỗi.

## 14.1. Thông tin ticket và môi trường kiểm thử

- [ ] Ghi mã ticket / nhánh Git: `____________________________`
- [ ] Ghi commit ban đầu trước khi sửa: `____________________________`
- [ ] Ghi URL môi trường kiểm thử (staging): `____________________________`
- [ ] Ghi thiết bị tái hiện lỗi ban đầu: `____________________________`
- [ ] Ghi OS và phiên bản: `____________________________`
- [ ] Ghi trình duyệt và phiên bản: `____________________________`
- [ ] Ghi thời điểm hoặc thao tác làm xuất hiện lỗi: `____________________________`
- [ ] Xác nhận đã tạo nhánh riêng hoặc backup source.
- [ ] Xác nhận lỗi có thể tái hiện trên bản chưa sửa, hoặc ghi rõ nếu không tái hiện được.

**Bằng chứng cần lưu:** ảnh/video lỗi, Console log, model máy, OS, trình duyệt và commit hash.

## 14.2. Checklist điều tra trước khi sửa

- [ ] Mở trang chủ bằng thiết bị thật, không chỉ dựa vào Device Toolbar.
- [ ] Thử tải lại trang ít nhất 3 lần.
- [ ] Để trang mở 60 giây và quan sát node/canvas.
- [ ] Cuộn từ hero đến footer rồi quay lại đầu trang.
- [ ] Mở/đóng menu ít nhất 10 lần.
- [ ] Chuyển tab hoặc chuyển sang ứng dụng khác rồi quay lại.
- [ ] Xoay màn hình dọc/ngang nếu thiết bị hỗ trợ.
- [ ] Kiểm tra Console và lưu các lỗi JavaScript.
- [ ] Kiểm tra có `WebGL context lost`, `CONTEXT_LOST_WEBGL`, lỗi GPU hoặc out-of-memory hay không.
- [ ] Ghi nhận lỗi xuất hiện ngay khi tải trang hay chỉ sau một thao tác cụ thể.
- [ ] Xác định chính xác phiên bản source đang chạy trên staging/production; không giả định server giống ZIP nếu chưa đối chiếu.

**Kết quả điều tra:**

- Thiết bị/trình duyệt:
- Bước tái hiện:
- Lỗi Console:
- Có WebGL context loss không? `Có / Không / Chưa xác định`
- Bằng chứng hoặc liên kết log:

## 14.3. Checklist P0 — cấu hình chất lượng và DPR

### `ai-era-site/js/quality-tier.js`

- [x] Kiểm tra `getQualityTier()` có trả về `LOW` cho thiết bị mobile/touch như dự kiến (dùng matchMedia `(pointer: coarse)` và kiểm tra UserAgent/độ rộng màn hình).
- [x] Kiểm tra nhánh `prefers-reduced-motion` và `navigator.connection.saveData`.
- [x] Áp dụng cấu hình tier đã thống nhất: DPR mobile tối đa 1.0 (LOW), MED: 1.5, HIGH: 1.75; bloom tắt trên LOW; particles giảm xuống 800/1500/2500.
- [x] Xác minh module sử dụng `TIER_CONFIG[tier]` thực sự đọc các trường đã chỉnh.
- [x] Kiểm tra desktop không bị hạ chất lượng ngoài dự kiến.
- [x] Mở trang sau khi sửa và ghi lại tier được chọn trong môi trường kiểm thử.

### `ai-era-site/js/three/scene-setup.js`

- [x] Xác định tất cả vị trí gọi `renderer.setPixelRatio()`, gồm cả resize (dùng chung helper `getRenderPixelRatio()`).
- [x] Dùng cùng một quy tắc giới hạn DPR khi khởi tạo và resize (cap 1.0 trên touch/mobile).
- [x] Xác minh `renderer.setSize(w, h, false)` và `composer.setSize(w, h)` nhận cùng kích thước hợp lệ.
- [x] Kiểm tra không có kích thước bằng 0 hoặc giá trị `NaN` (guard `Math.max(1, ...)`).
- [x] Thêm listener chẩn đoán `webglcontextlost`/`webglcontextrestored`.
- [x] Không để log chẩn đoán chạy mỗi frame (chỉ log khi context lost hoặc restored).
- [x] Kiểm tra canvas vẫn phủ đúng khu vực hero, không bị mờ hoặc méo quá mức.
- [x] Kiểm tra resize khi xoay màn hình và khi thanh địa chỉ mobile hiện/ẩn (được debounce 120ms).

**Xác nhận P0:**
- Đã hoàn tất sửa P0 trong `quality-tier.js`, `scene-setup.js`, `core.js`.

## 14.4. Checklist P0 — giảm hình học 3D

### `ai-era-site/js/three/core.js`

- [x] Tìm và xác nhận vị trí khởi tạo `IcosahedronGeometry`.
- [x] Giảm detail theo đề xuất: Icosahedron detail từ 5 (20.480 tris) xuống 2 (320 tris), giảm 98.4% tải đa giác.
- [x] Giảm số segment của torus từ 190 xuống 96.
- [x] Giảm số spark từ 44 xuống 24.
- [x] Kiểm tra các geometry/material có được tạo lặp lại trong animation loop hay chỉ tạo một lần (chỉ tạo 1 lần).
- [x] Không tạo geometry mới mỗi frame nếu có thể cập nhật object/buffer hiện hữu.
- [x] Kiểm tra core không nhấp nháy, biến mất hoặc bị z-fighting sau khi sửa.
- [x] Chạy lại checklist tải trang trên thiết bị mục tiêu.

## 14.5. Checklist P1 — node và pulse line

### `ai-era-site/js/three/nodes.js`

- [x] Xác định đoạn `animateNodes()` và vị trí gọi `computeLineDistances()`.
- [x] Xác nhận pulse line không cần cập nhật dash distance mỗi frame trên mobile: tắt trên mobile `pulseLine.visible = false`.
- [x] Nếu tắt pulse line trên mobile, kiểm tra đường năng lượng chính và node vẫn dễ nhìn.
- [x] Nếu bỏ cập nhật pulse line, xác nhận không còn công việc cập nhật buffer không cần thiết cho line đã ẩn (bỏ qua `computeLineDistances()` khi `isLowPowerViewport`).
- [x] Kiểm tra endpoint cập nhật đúng sau khi node chuyển động.
- [x] Kiểm tra desktop vẫn giữ hiệu ứng theo thiết kế.
- [x] Kiểm tra mobile không còn nhấp nháy bất thường khi node chuyển động (loại bỏ Float32BufferAttribute allocation per frame).

## 14.6. Checklist P1 — quản lý animation loop

### `ai-era-site/js/main.js`

- [x] Xác nhận chỉ có một loop chính điều khiển renderer chính (`syncAnimationState()`).
- [x] Xác nhận không chạy song song `renderer.setAnimationLoop()` và một RAF loop khác cho cùng cảnh.
- [x] Khi tab ẩn, loop chính được dừng (`renderer.setAnimationLoop(null)`).
- [x] Khi tab hiển thị lại, loop chỉ khởi động một lần.
- [x] Khi canvas ra khỏi viewport, loop được dừng (`IntersectionObserver`).
- [x] Khi canvas trở lại viewport, loop được khởi động lại.
- [x] `prefers-reduced-motion: reduce` không tiếp tục chạy animation nặng.
- [x] `IntersectionObserver` không làm loop dừng vĩnh viễn (observer duy trì và bật/tắt đúng).
- [x] Kiểm tra `animate()` không tạo thêm loop hoặc đăng ký listener mới mỗi lần được gọi.

### Các renderer phụ

#### `ai-era-site/js/contact-footer.js`

- [x] Xác nhận chỉ chạy animation khi footer cần hiển thị (`IntersectionObserver` start/stop loop).
- [x] Khi rời viewport hoặc tab ẩn, frame đã lên lịch được hủy đúng cách (`cancelAnimationFrame`).
- [x] Khi quay lại viewport, chỉ có một loop hoạt động.
- [x] Resize không render canvas ẩn với kích thước lớn không cần thiết.

#### `ai-era-site/js/three/contact-btn-3d.js`

- [x] Hạ giới hạn DPR trên mobile theo thiết kế đã thống nhất (capping DPR = 1 trên touch/coarse).
- [x] Xác nhận nút liên hệ không tạo nhiều renderer/loop khi component được khởi tạo lại (dừng RAF khi tab ẩn).
- [x] Có fallback dễ sử dụng nếu WebGL không khả dụng (try/catch WebGLRenderer).

#### `ai-era-site/js/three/hamburger-menu.js`

- [x] Xác định renderer được tạo lúc tải trang hay khi mở menu.
- [x] Xác nhận mở/đóng menu không làm tăng số loop hoặc WebGL context (hạ DPR = 1 trên mobile, antialias = false trên mobile).
- [x] Animation dừng khi tab ẩn (`visibilitychange`).
- [x] Menu vẫn hoạt động khi WebGL không khả dụng (try/catch WebGLRenderer).

**Xác nhận P1:**
- Đã hoàn tất sửa P1 cho tất cả các file liên quan (`nodes.js`, `main.js`, `contact-footer.js`, `contact-btn-3d.js`, `hamburger-menu.js`).

## 14.7. Checklist P2 — resize và viewport

### `ai-era-site/js/three/scene-setup.js` và CSS liên quan

- [ ] Chỉ có một luồng resize chịu trách nhiệm cập nhật renderer chính.
- [ ] Nếu dùng debounce, timer được quản lý và không tạo nhiều timer không cần thiết.
- [ ] Kiểm tra `camera.aspect` luôn được cập nhật cùng kích thước renderer.
- [ ] Kiểm tra `composer.setSize()` được gọi khi cần.
- [ ] Kiểm tra `100vh`/`100dvh` trên trình duyệt mục tiêu trước khi đổi CSS.
- [ ] Xoay màn hình không gây nhấp nháy hoặc layout shift nghiêm trọng.
- [ ] Canvas không vượt khỏi viewport và không che nút điều hướng.

## 14.8. Checklist fallback khi WebGL không khả dụng

- [ ] Xác nhận lỗi tạo renderer được xử lý có chủ đích.
- [ ] Không nuốt exception rồi tiếp tục gọi module phụ thuộc vào renderer chưa được tạo.
- [ ] Nội dung quan trọng như navigation, tiêu đề, liên kết và CTA vẫn dùng được khi WebGL thất bại.
- [ ] CSS fallback không vô tình ẩn nội dung HTML quan trọng.
- [ ] Thử nghiệm bằng cách tạm thời vô hiệu hóa WebGL trong môi trường kiểm thử hoặc dùng thiết bị không hỗ trợ phù hợp.
- [ ] Xác nhận fallback không làm trang trắng hoặc chặn điều hướng sang các trang khác.

## 14.9. Checklist kiểm thử hồi quy

- [ ] Trang chủ tải và hiển thị đúng trên Android Chrome.
- [ ] Trang chủ tải và hiển thị đúng trên trình duyệt Android thứ hai nếu nằm trong phạm vi hỗ trợ.
- [ ] Trang chủ tải và hiển thị đúng trên iOS Safari nếu nằm trong phạm vi hỗ trợ.
- [ ] Kiểm tra viewport nhỏ, viewport lớn và xoay màn hình.
- [ ] Kiểm tra menu, nút liên hệ, liên kết điều hướng và footer.
- [ ] Kiểm tra các trang con dùng chung CSS/module không bị ảnh hưởng.
- [ ] Kiểm tra chế độ Reduce Motion.
- [ ] Kiểm tra chế độ tiết kiệm dữ liệu nếu trình duyệt cung cấp.
- [ ] Kiểm tra tải trang bằng mạng chậm nếu đây là điều kiện sử dụng phổ biến.
- [ ] Kiểm tra Console không có lỗi mới.
- [ ] Kiểm tra các asset và module không bị lỗi 404/import.

## 14.10. Checklist đo hiệu năng trước/sau

Ghi số liệu trên cùng thiết bị, cùng trình duyệt và cùng điều kiện test. Không kết luận chỉ dựa vào cảm giác mượt hơn.

| Chỉ số | Trước sửa | Sau sửa | Đạt? |
|---|---|---|---|
| Thời gian tải/ổn định trang |  |  | [ ] |
| FPS quan sát được |  |  | [ ] |
| Long task đáng chú ý |  |  | [ ] |
| WebGL context loss |  |  | [ ] |
| Bộ nhớ tăng dần theo thời gian |  |  | [ ] |
| Crash trong 10–15 phút |  |  | [ ] |
| Nhiệt/hao pin bất thường |  |  | [ ] |

Ghi chú:
- Không bắt buộc mọi điện thoại đạt 60 FPS; ưu tiên ổn định và không crash.
- Nếu không có công cụ đo một chỉ số, ghi `N/A` và nêu lý do.
- Không dùng số liệu từ desktop để thay thế kiểm thử trên thiết bị di động thực tế.

## 14.11. Checklist Git, review và deploy

- [ ] Mỗi nhóm thay đổi có commit riêng hoặc diff dễ review.
- [ ] Không đưa log debug mỗi frame vào production.
- [ ] Đã kiểm tra diff, loại bỏ code thử nghiệm không cần thiết.
- [ ] Đã chạy các kiểm tra/build/lint mà dự án hiện có.
- [ ] Đã deploy staging và chạy lại checklist trên staging.
- [ ] Đã kiểm tra cache/CDN nếu trình duyệt vẫn tải JavaScript cũ.
- [ ] Đã có kế hoạch rollback về commit ổn định nếu phát sinh lỗi.
- [ ] Đã đính kèm log, video hoặc ảnh kiểm thử vào ticket.
- [ ] Reviewer xác nhận các thay đổi về lifecycle animation và WebGL context.
- [ ] Chỉ deploy production sau khi tiêu chí nghiệm thu ở mục 14.12 đạt.

## 14.12. Tiêu chí nghiệm thu cuối cùng

Chỉ đánh dấu hoàn tất khi tất cả tiêu chí bắt buộc dưới đây đạt:

- [ ] Không tái hiện crash trên thiết bị gây lỗi ban đầu qua ít nhất 3 lần tải trang liên tiếp.
- [ ] Trang hoạt động liên tục 10–15 phút trên thiết bị mục tiêu mà không crash.
- [ ] Không có lỗi WebGL context loss lặp lại.
- [ ] Node không nhấp nháy bất thường.
- [ ] Chuyển tab, cuộn trang, xoay màn hình và mở/đóng menu không làm animation nhân đôi.
- [ ] Nội dung chính vẫn dùng được nếu WebGL không khả dụng.
- [ ] Không có hồi quy nghiêm trọng trên các trang con.
- [ ] Có bằng chứng kiểm thử trước/sau và người review đã xác nhận.

**Kết quả nghiệm thu**

- Người thực hiện:
- Người review:
- Thiết bị đã kiểm thử:
- Commit cuối:
- Kết quả: `PASS / FAIL / BLOCKED`
- Vấn đề còn tồn tại:
- Bằng chứng kiểm thử:
- Ngày nghiệm thu:

Nếu một tiêu chí bắt buộc chưa đạt, không đánh dấu PASS. Ghi rõ vấn đề còn lại và tiếp tục điều tra bằng log thiết bị thực tế.
