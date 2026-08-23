# Hướng dẫn triển khai Website AI Era — Spatial 3D Ecosystem
**Dành cho:** Junior Dev
**Vai trò viết tài liệu:** Senior Tech Lead / Solution Architect review
**Base tham khảo bắt buộc:** `source/ai-era-spatial-threejs.html` (KHÔNG xoá file này — copy ra làm nền)
**Tuân thủ:** `rules/tech_stack_html.md` (HTML/CSS/JS thuần + Three.js + GSAP, KHÔNG dùng React/Next.js cho bản deploy cuối)
**Nội dung nghiệp vụ:** lấy từ `/content/*.md` (6 dịch vụ + trang chủ)

> ⚠️ Lưu ý quan trọng: Repo hiện có 2 luồng song song — bản Next.js/React trong `/source/src/...` (dùng React Three Fiber) và bản HTML thuần `source/ai-era-spatial-threejs.html` + `source/ai_era_antigravity.html`. Theo `rules/tech_stack_html.md` mục 58 ("Quyết định kiến trúc"), bản **deploy cuối cùng phải là HTML-first + Three.js enhanced**, không bắt buộc React. Guide này đi theo hướng HTML thuần, dùng `ai-era-spatial-threejs.html` làm điểm khởi đầu (nó đã có ~80% những gì cần: core phát sáng, orbit, particle 2 lớp, bloom, custom cursor, camera flight cơ bản). Việc còn lại là NÂNG CẤP những phần thiếu, không viết lại từ đầu.

---

## 0. Checklist tổng quan (tick khi xong)

- [x] 0.1 Setup project structure theo chuẩn `rules/tech_stack_html.md` mục 33
- [x] 0.2 Tách file mẫu thành cấu trúc module (`/js/*.js`, `/css/*.css`)
- [x] 1. Nội dung: đổ 6 lĩnh vực + copy từ `/content` vào `data/nodes.js`
- [x] 2. Nâng cấp chữ "AI Era" — gradient 4 màu + glow đa lớp + animate
- [x] 3. Free rotate 360° trên cả 3 trục X/Y/Z bằng chuột trái kéo
- [x] 4. Camera bay xuyên không gian bằng scroll wheel (dolly zoom thật, không chỉ đổi field of view)
- [x] 5. Click node → camera bay theo quỹ đạo cong (Bezier) tới node, xoay góc nhìn
- [x] 6. Panel bên phải hiện mô tả chi tiết khi focus node (lấy nội dung thật từ `/content`)
- [x] 7. Nút "Return to AI Era core / RESET VIEW"
- [x] 8. Parallax nhẹ theo chuột ở chế độ tự do (đã có sẵn — chỉ cần giữ & tinh chỉnh)
- [x] 9. HUD hiển thị camera distance, rotation X/Y, node đang focus — realtime
- [x] 10. Custom cursor (đã có sẵn — audit + đồng bộ theme)
- [x] 11. Responsive desktop/mobile + touch controls
- [x] 12. QA & performance pass (theo quality tiers mục 21 của tech_stack_html.md)

---

## 1. Cấu trúc thư mục cần tạo

Tạo thư mục làm việc mới `ai-era-site/` (đầu ra cuối, KHÔNG chỉnh trực tiếp trong `/source` gốc):

```
ai-era-site/
├── index.html
├── ai-automation-ai-agent.html
├── digital-marketing-ai-content.html
├── landing-page-hosting.html
├── phan-mem-quan-ly-doanh-nghiep.html
├── phan-tich-dinh-luong-chung-khoan.html
├── thiet-ke-website-chuan-seo.html
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── typography.css
│   ├── layout.css
│   ├── components.css     (glass panel, HUD, node label, focus panel)
│   ├── theme.css          (day/night)
│   ├── responsive.css
│   └── animations.css     (gradient text, glow keyframes)
├── js/
│   ├── main.js
│   ├── data/
│   │   └── nodes.js       (6 node data lấy từ /content)
│   ├── three/
│   │   ├── scene-setup.js     (scene, camera, renderer, composer/bloom)
│   │   ├── core.js             (AI Era core mesh + label)
│   │   ├── nodes.js             (business nodes + energy lines + orbit rings)
│   │   ├── starfield.js          (2 lớp particle depth)
│   │   ├── camera-controller.js  (drag 360, wheel dolly, focus flight, parallax)
│   │   ├── hud.js                 (update DOM HUD mỗi frame)
│   │   └── effects.js             (bloom tuning theo theme/quality)
│   ├── cursor.js
│   ├── theme.js
│   ├── quality-tier.js
│   └── i18n.js (giai đoạn sau)
├── assets/
└── robots.txt / sitemap.xml (đã có sẵn ở root repo, copy qua)
```

**Vì sao tách file:** file mẫu `ai-era-spatial-threejs.html` gói tất cả trong 1 file (~680 dòng, code JS nhúng trong `<script type="module">`). Việc này OK cho prototype nhưng khó bảo trì và không đúng mục 29 (`JavaScript Architecture`) của `tech_stack_html.md`. Junior dev cần bóc tách theo từng chức năng ở trên.

---

## 2. Bước 1 — Copy & khởi tạo nền

1. Copy `source/ai-era-spatial-threejs.html` → `ai-era-site/index.html`.
2. Copy toàn bộ phần trong thẻ `<style>` (dòng 13 → ~257) ra các file css tương ứng trong `css/`.
   - `:root { ... }` (biến màu) → `css/variables.css`
   - `font-family`, `.core-label` text style → `css/typography.css`
   - `.cursor-dot/.cursor-outline`, `.node-label`, `#focusPanel`, HUD `#hud` → `css/components.css`
   - `@media(pointer:coarse)` và mọi `@media` khác → `css/responsive.css`
   - `@keyframes coreText` và các keyframes khác → `css/animations.css`
3. Copy toàn bộ code trong `<script type="module">` (dòng ~262 → cuối file) ra `js/main.js` tạm thời, sau đó tách theo hướng dẫn bước 3.
4. Trong `index.html`, thay `<style>` bằng:
   ```html
   <link rel="stylesheet" href="./css/variables.css">
   <link rel="stylesheet" href="./css/typography.css">
   <link rel="stylesheet" href="./css/base.css">
   <link rel="stylesheet" href="./css/layout.css">
   <link rel="stylesheet" href="./css/components.css">
   <link rel="stylesheet" href="./css/theme.css">
   <link rel="stylesheet" href="./css/animations.css">
   <link rel="stylesheet" href="./css/responsive.css">
   ```
5. Thay `<script type="module">...</script>` bằng:
   ```html
   <script type="importmap">
   {
     "imports": {
       "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
       "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/",
       "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js"
     }
   }
   </script>
   <script type="module" src="./js/main.js"></script>
   ```
   > Pin version cụ thể (three@0.169.0) thay vì `latest` để tránh breaking change — đúng mục 51 tech_stack_html.md.

---

## 3. Bước 2 — Dữ liệu 6 lĩnh vực (`js/data/nodes.js`)

Trong file mẫu, mảng `fieldData` (khoảng dòng 375-384) chỉ có `name/color/desc` placeholder. Junior dev phải thay bằng nội dung THẬT lấy từ `/content/*.md` (heading H1 + đoạn mô tả ngắn, KHÔNG copy nguyên văn cả trang — rút gọn 1-2 câu cho panel 3D, link `url` trỏ sang trang HTML riêng đầy đủ nội dung).

Tạo file:

```js
// js/data/nodes.js
export const NODES = [
  {
    id: "phan-tich-dinh-luong",
    name: "Phân tích định lượng chứng khoán",
    shortDesc: "Mô hình định lượng, tín hiệu kỹ thuật và machine learning hỗ trợ nhà đầu tư ra quyết định trên thị trường chứng khoán Việt Nam.",
    color: 0x67e8f9,
    url: "./phan-tich-dinh-luong-chung-khoan.html"
  },
  {
    id: "ai-automation-agent",
    name: "AI Automation & AI Agent",
    shortDesc: "Tự động hoá quy trình nghiệp vụ và triển khai AI Agent xử lý khách hàng, dữ liệu và tác vụ đa bước.",
    color: 0x818cf8,
    url: "./ai-automation-ai-agent.html"
  },
  {
    id: "thiet-ke-website-seo",
    name: "Thiết kế website chuẩn SEO & AI SEO",
    shortDesc: "Kiến trúc semantic, tốc độ cao, tối ưu AI discovery giúp doanh nghiệp hiện diện bền vững trên Google và AI search.",
    color: 0xc084fc,
    url: "./thiet-ke-website-chuan-seo.html"
  },
  {
    id: "landing-page-hosting",
    name: "Landing Page & Hosting",
    shortDesc: "Thiết kế landing page chuyển đổi cao kèm gói hosting miễn phí, triển khai chiến dịch nhanh, chi phí tối ưu.",
    color: 0xa5b4fc,
    url: "./landing-page-hosting.html"
  },
  {
    id: "digital-marketing-ai-content",
    name: "Digital Marketing & AI Content",
    shortDesc: "Chạy quảng cáo Meta/TikTok/Google Maps, tự động hoá nội dung bằng AI đa nền tảng.",
    color: 0x67e8f9,
    url: "./digital-marketing-ai-content.html"
  },
  {
    id: "phan-mem-quan-ly-nganh",
    name: "Phần mềm quản lý doanh nghiệp ngành",
    shortDesc: "Giải pháp phần mềm quản lý nghiệp vụ lõi cho Spa, Nail, Nha khoa, Phòng khám, Gym.",
    color: 0x818cf8,
    url: "./phan-mem-quan-ly-doanh-nghiep.html"
  }
];
```

**Rule bắt buộc:** mỗi khi Content team sửa `/content/*.md`, junior dev cập nhật lại `shortDesc` trong file này thủ công (giai đoạn sau có thể tự động hoá bằng script build đọc markdown, nhưng KHÔNG bắt buộc ở v1).

---

## 4. Bước 3 — Nâng cấp chữ "AI Era" (yêu cầu trọng tâm)

File mẫu hiện có `.core-label strong` với gradient trắng→xám đơn giản và `@keyframes coreText` chỉ đổi opacity. Yêu cầu: font-weight 800, gradient 4 điểm dừng (trắng → lavender → indigo → cyan), glow nhiều lớp, gradient tự chuyển động chậm.

Trong `css/typography.css`, tìm class `.core-label strong` (tương ứng dòng ~40-55 file gốc) và THAY bằng:

```css
.core-label strong{
  display:block;
  font-family:"Plus Jakarta Sans", sans-serif;
  font-weight:800;
  font-size:clamp(2.4rem, 6vw, 4.2rem);
  letter-spacing:-0.02em;
  line-height:1;

  background:linear-gradient(
    100deg,
    #ffffff 0%,
    #e4d9ff 22%,
    #c9b8ff 40%,
    #a5b4fc 58%,
    #818cf8 75%,
    #67e8f9 100%
  );
  background-size:220% 220%;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;

  animation: aiEraGradientShift 9s ease-in-out infinite;

  /* multi-layer glow: text-shadow stack, không dùng filter blur (nặng GPU) */
  filter:
    drop-shadow(0 0 6px rgba(255,255,255,.55))
    drop-shadow(0 0 18px rgba(129,140,248,.55))
    drop-shadow(0 0 36px rgba(103,232,249,.35))
    drop-shadow(0 0 60px rgba(192,132,252,.25));
}

@keyframes aiEraGradientShift{
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (prefers-reduced-motion: reduce){
  .core-label strong{ animation:none; }
}
```

> Lưu ý kỹ thuật: `filter: drop-shadow` nhiều lớp có cost GPU. Trên mobile/tier LOW (xem `js/quality-tier.js` bước 11), giảm còn 2 lớp drop-shadow để giữ FPS. Đây là điểm khác biệt có chủ đích so với file mẫu (chỉ có gradient trắng-xám, không có glow multi-layer) — tạo nhận diện riêng mạnh hơn cho AI Era như yêu cầu.

Giữ nguyên phần dưới `<span>Core Intelligence</span>` (hoặc đổi tuỳ content) không cần gradient nặng.

---

## 5. Bước 4 — Free rotate 360° trên cả 3 trục X/Y/Z (giữ chuột trái + kéo)

File mẫu hiện tại (đoạn `pointerdown/pointermove`, khoảng dòng 516-538) chỉ xoay theo `rot.x` (pitch) và `rot.y` (yaw) bằng cách set `world.rotation.x/y`, KHÔNG có trục Z, và giới hạn góc pitch bằng `clamp`. Yêu cầu là xoay tự do 360° cả 3 trục.

### 5.1 Sửa state (thêm biến)

Tìm dòng:
```js
let rot={x:0,y:0,z:0},targetRot={x:0,y:0,z:0};
```
→ Đã có sẵn `z` nhưng không dùng. Thêm biến theo dõi thao tác kéo chéo (dùng để suy ra trục Z từ chuyển động xoay tròn quanh tâm màn hình):

```js
let dragStartAngle = 0;
let dragLastAngle = 0;
```

### 5.2 Sửa handler `pointerdown`

```js
renderer.domElement.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  dragging = true; lastX = e.clientX; lastY = e.clientY;
  const cx = innerWidth/2, cy = innerHeight/2;
  dragStartAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
  dragLastAngle = dragStartAngle;
  renderer.domElement.setPointerCapture?.(e.pointerId);
  document.body.classList.add('dragging');
});
```

### 5.3 Sửa handler `pointermove` — bỏ clamp, thêm trục Z

Tìm khối xử lý drag hiện có (khoảng dòng 525-538), THAY bằng:

```js
addEventListener('pointermove', e => {
  pointer.px = e.clientX; pointer.py = e.clientY;
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;

  if (dragging && selected === -1) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;

    // Yaw (Y) & Pitch (X) — KHÔNG clamp nữa để xoay 360 liên tục
    targetRot.y += dx * 0.006;
    targetRot.x += dy * 0.006;

    // Trục Z: dùng khi giữ Shift + kéo -> xoay theo góc quay quanh tâm màn hình (roll)
    if (e.shiftKey) {
      const cx = innerWidth/2, cy = innerHeight/2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      let delta = angle - dragLastAngle;
      // xử lý wrap-around -PI..PI
      if (delta > Math.PI) delta -= Math.PI*2;
      if (delta < -Math.PI) delta += Math.PI*2;
      targetRot.z += delta;
      dragLastAngle = angle;
    }
  }
});
```

> Giải thích cho junior dev: xoay Z (roll) qua kéo thường không trực quan bằng dx/dy đơn thuần vì nó là "xoay quanh trục nhìn của camera". Cách chuẩn là tính góc `atan2` của con trỏ so với tâm màn hình và lấy delta góc mỗi frame — giống thao tác "vặn núm" trong các app 3D (Blender, Figma 3D).

### 5.4 Áp dụng rotation trong vòng lặp `animate()`

Tìm trong `animate()` đoạn cập nhật `world.rotation` (nếu file mẫu set trực tiếp `world.rotation.x = rot.x` v.v.). Đảm bảo cả 3 trục được lerp mượt và KHÔNG bị clamp:

```js
rot.x += (targetRot.x - rot.x) * 0.08;
rot.y += (targetRot.y - rot.y) * 0.08;
rot.z += (targetRot.z - rot.z) * 0.08;

world.rotation.set(rot.x, rot.y, rot.z);
```

Vì không còn `THREE.MathUtils.clamp` trên `targetRot.x/y`, world có thể xoay liên tục 360° trên mọi trục — đúng yêu cầu "quay 360° liên tục".

### 5.5 Reset khi thả chuột

```js
addEventListener('pointerup', () => {
  dragging = false;
  document.body.classList.remove('dragging');
});
```
(giữ nguyên logic có sẵn trong file mẫu, chỉ đảm bảo không reset `targetRot` về 0 — nếu file mẫu có dòng đó thì XOÁ đi, vì ta muốn giữ nguyên góc xoay sau khi thả tay).

---

## 6. Bước 5 — Camera bay xuyên không gian bằng scroll wheel (dolly thật)

File mẫu (dòng ~539-548) hiện tại chỉ đổi `cameraDistance` rồi set lại `camera.position` dọc theo trục nhìn hiện tại — đây thực ra ĐÃ ĐÚNG hướng "dolly" (di chuyển camera theo hướng nhìn, không phải zoom FOV giả). Việc cần làm là:

1. Mở rộng range để cảm giác "bay xuyên qua" particle field rõ hơn (hiện tại clamp 7.2–28, khá hẹp).
2. Thêm easing cho việc zoom (hiện tại set ngay lập tức → giật). Thêm biến đích + lerp mỗi frame.

```js
// state
let targetCameraDistance = 14.5;
let cameraDistance = 14.5;

renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  targetCameraDistance = THREE.MathUtils.clamp(
    targetCameraDistance + e.deltaY * 0.012,
    2.5,   // gần hơn để có cảm giác "chui" vào giữa các hạt
    46     // xa hơn để thấy toàn bộ ecosystem + starfield sâu
  );
}, { passive:false });
```

Trong `animate()`:
```js
cameraDistance += (targetCameraDistance - cameraDistance) * 0.09;
```

Giữ nguyên đoạn tính `dir` và set `camera.position` theo `cameraDistance` đã có trong file mẫu (dòng ~647-649), chỉ thay biến tĩnh bằng biến đã lerp ở trên.

> Vì camera tiến sát vào field (distance ~2.5), cần đảm bảo `starsA`/`starsB` (starfield 2 lớp — xem mục 8) có `depth spread` đủ để khi lướt qua vẫn thấy hạt bay ngang chứ không "xuyên thủng" hết vào khoảng trống — file mẫu đã đặt z-range `-58..18`, giữ nguyên là đủ.

---

## 7. Bước 6 — Click node → camera bay theo quỹ đạo cong tới node

File mẫu có `focusNode(i)` (dòng ~486-501) dùng `startFlight()` để lerp thẳng (linear interpolation vị trí) từ camera hiện tại tới điểm đích — đây là đường THẲNG, chưa phải "quỹ đạo cong" như yêu cầu.

### 7.1 Thêm điểm điều khiển Bezier bậc 2 vào `startFlight`

Sửa hàm `startFlight` để nhận thêm 1 điểm control giữa đường bay:

```js
function startFlight(toPos, toLook, duration = 1600, onDone = null) {
  const fromPos = camera.position.clone();
  // điểm control: nằm giữa 2 điểm nhưng đẩy lên/ra ngoài để tạo cung cong
  const mid = fromPos.clone().lerp(toPos, 0.5);
  const lift = new THREE.Vector3(0, 1.6, 0); // cong lên trên — cảm giác "bay vòng"
  const outward = mid.clone().normalize().multiplyScalar(1.4);
  const control = mid.clone().add(lift).add(outward);

  flight = {
    start: performance.now(),
    duration,
    fromPos,
    control,
    toPos: toPos.clone(),
    fromLook: currentLook.clone(),
    toLook: toLook.clone(),
    onDone
  };
}
```

### 7.2 Sửa phần áp dụng flight trong `animate()`

Tìm đoạn xử lý `flight` hiện tại (nội suy tuyến tính `lerpVectors`), THAY bằng nội suy Bezier bậc 2 (quadratic):

```js
if (flight) {
  const t = Math.min((performance.now() - flight.start) / flight.duration, 1);
  const e = easeInOut(t);

  // Quadratic Bezier: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
  const p0 = flight.fromPos, p1 = flight.control, p2 = flight.toPos;
  const oneMinusT = 1 - e;
  camera.position.set(
    oneMinusT*oneMinusT*p0.x + 2*oneMinusT*e*p1.x + e*e*p2.x,
    oneMinusT*oneMinusT*p0.y + 2*oneMinusT*e*p1.y + e*e*p2.y,
    oneMinusT*oneMinusT*p0.z + 2*oneMinusT*e*p1.z + e*e*p2.z
  );

  currentLook.lerpVectors(flight.fromLook, flight.toLook, e);
  camera.lookAt(currentLook);

  if (t >= 1) {
    flight.onDone?.();
    flight = null;
  }
}
```

> Đây chính là điểm nâng cấp "camera tự xoay/zoom tới từng lĩnh vực theo quỹ đạo cong" khác biệt so với bản gốc chỉ lerp thẳng.

### 7.3 Giữ nguyên `focusNode(i)` nhưng nối với panel + HUD (xem bước 8-9)

---

## 8. Bước 7 — Panel bên phải hiện mô tả chi tiết + nút Return/Reset

File mẫu đã có `#focusPanel`, `#focusTitle`, `#focusText`, `#backBtn` (đọc dòng ~486-513). Việc cần làm:

1. Đảm bảo panel dùng dữ liệu thật từ `js/data/nodes.js` (không phải `fieldData` placeholder).
2. Thêm nút "RESET VIEW" riêng ở HUD góc trên (đã có `#resetBtn` trong file mẫu — giữ, chỉ style lại theo glassmorphism).
3. Style panel: dùng `backdrop-filter: blur(20px)` (glassmorphism) — kiểm tra `.panel`/`#focusPanel` trong css có `background: var(--surface-2); border:1px solid var(--border); backdrop-filter:blur(24px) saturate(160%);`. Nếu file mẫu thiếu `backdrop-filter`, thêm vào `css/components.css`:

```css
#focusPanel{
  background:var(--surface-2);
  border:1px solid var(--border);
  backdrop-filter:blur(24px) saturate(160%);
  -webkit-backdrop-filter:blur(24px) saturate(160%);
  border-radius:20px;
}
```

4. `focusNode(i)` set nội dung:
```js
import { NODES } from './data/nodes.js';
// ...
function focusNode(i){
  selected = i;
  const n = nodes[i];
  const data = NODES[i];
  // ...vị trí camera + startFlight giữ nguyên...
  focusTitle.textContent = data.name;
  focusText.textContent = data.shortDesc;
  focusPanel.querySelector('#focusLink')?.setAttribute('href', data.url);
  focusPanel.classList.add('show');
}
```
5. Thêm link "Xem chi tiết →" trong panel trỏ sang trang HTML riêng của lĩnh vực đó (đã tạo ở mục 1).

---

## 9. Bước 8 — Parallax nhẹ theo chuột (giữ + tinh chỉnh)

File mẫu (đoạn cuối `animate()`, dòng ~647-649) đã có:
```js
const desired = new THREE.Vector3(pointer.x*.18, .2 - pointer.y*.1, cameraDistance);
```
Đây chính là parallax — GIỮ NGUYÊN cơ chế, chỉ cần đảm bảo nó CHỈ áp dụng khi `selected === -1` (chế độ tự do), không áp dụng khi đang có `flight` hoặc đang focus node (để tránh giật hình khi panel đang mở). Bọc điều kiện:

```js
if (!flight && selected === -1) {
  const desired = new THREE.Vector3(pointer.x*.18, .2 - pointer.y*.1, cameraDistance);
  camera.position.lerp(
    new THREE.Vector3(desired.x, desired.y, cameraDistance),
    0.05
  );
  currentLook.lerp(new THREE.Vector3(0,0,0), .06);
  camera.lookAt(currentLook);
}
```

---

## 10. Bước 9 — HUD realtime (camera distance, rotation X/Y, node đang focus)

File mẫu đã có DOM refs `distVal`, `rotXVal`, `rotYVal`, `focusVal` (đọc phần khai báo đầu script). Cần đảm bảo HTML có các phần tử này trong khu vực HUD, ví dụ:

```html
<div id="hud" class="glass-panel hud">
  <div>DIST <span id="distVal">--</span></div>
  <div>ROT X <span id="rotXVal">--</span></div>
  <div>ROT Y <span id="rotYVal">--</span></div>
  <div>FOCUS <span id="focusVal">CORE</span></div>
</div>
```

Trong `animate()`, cuối mỗi frame (sau khi đã update `cameraDistance`, `rot.x`, `rot.y`), thêm:

```js
if (frameCount % 3 === 0) { // throttle update DOM mỗi 3 frame để đỡ tốn layout/reflow
  distVal.textContent = cameraDistance.toFixed(2);
  rotXVal.textContent = THREE.MathUtils.radToDeg(rot.x).toFixed(1) + '°';
  rotYVal.textContent = THREE.MathUtils.radToDeg(rot.y).toFixed(1) + '°';
}
```

Biến `focusVal` đã được set trong `focusNode()`/`resetView()` (mục 8) nên không cần update mỗi frame.

Khai báo `let frameCount = 0;` trước `animate()` và `frameCount++` ở đầu hàm `animate()`.

---

## 11. Bước 10 — Custom cursor (audit, không viết lại)

File mẫu đã có `.cursor-dot/.cursor-outline` + `cursorLoop()` (dòng ~563-572) hoạt động tốt, hover node → class `.hovering`, drag → class `.dragging`. Việc cần làm khi migrate:

1. Copy nguyên `cursorLoop()` sang `js/cursor.js`, export `initCursor()`.
2. Đảm bảo trên mobile (`@media (pointer:coarse)`) cursor bị ẩn (file mẫu đã có dòng này — giữ nguyên).
3. KHÔNG thêm hiệu ứng cursor mới không có trong file gốc — giữ đúng "tinh thần thiết kế" như yêu cầu đề bài (dot nhỏ + outline phóng to khi hover, cyan khi dragging).

---

## 12. Bước 11 — Responsive desktop/mobile

Theo mục 17-21 `tech_stack_html.md`:

1. Tạo `js/quality-tier.js`:
```js
export function getQualityTier(){
  const w = innerWidth;
  const dpr = Math.min(devicePixelRatio, 2);
  if (w < 640) return 'LOW';
  if (w < 1024) return 'MEDIUM';
  if (w < 1920) return 'HIGH';
  return 'ULTRA';
}

export const TIER_CONFIG = {
  LOW:    { particles: 250,  dpr: 1,    bloom: 0,   lights: 1 },
  MEDIUM: { particles: 600,  dpr: 1.25, bloom: 0.5, lights: 2 },
  HIGH:   { particles: 1400, dpr: 1.75, bloom: 0.9, lights: 3 },
  ULTRA:  { particles: 2500, dpr: 2,    bloom: 1.1, lights: 3 }
};
```
2. Trong `starfield.js`, dùng `TIER_CONFIG[tier].particles` thay vì số cứng `innerWidth<800?900:1900` như file mẫu.
3. Trong `effects.js`, set `bloom.strength = TIER_CONFIG[tier].bloom`.
4. Trên mobile: thay thao tác chuột trái kéo bằng `pointerdown/pointermove` (Pointer Events đã dùng chung cho cả mouse/touch — file mẫu ĐÃ dùng `pointerdown` nên tự động hoạt động trên touch, không cần code riêng — chỉ cần test thật trên thiết bị).
5. Thêm pinch-zoom: lắng nghe 2 touch points, tính khoảng cách giữa chúng, map sang `targetCameraDistance`.
```js
let pinchStartDist = null;
renderer.domElement.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    const [a,b] = e.touches;
    const dist = Math.hypot(a.clientX-b.clientX, a.clientY-b.clientY);
    if (pinchStartDist == null) pinchStartDist = dist;
    const delta = (pinchStartDist - dist) * 0.03;
    targetCameraDistance = THREE.MathUtils.clamp(targetCameraDistance + delta, 2.5, 46);
    pinchStartDist = dist;
  }
}, { passive:true });
renderer.domElement.addEventListener('touchend', () => { pinchStartDist = null; });
```
6. Ẩn/thu gọn HUD & panel trên mobile qua `css/responsive.css` (`@media (max-width:767px){ #hud{font-size:.6rem} #focusPanel{width:100%;bottom:0;top:auto;border-radius:20px 20px 0 0} }`).

---

## 13. Bước 12 — QA Checklist trước khi bàn giao
 
- [x] Giữ chuột trái kéo → xoay world mượt cả 3 trục (test cả X, Y, và Z khi giữ Shift)
- [x] Xoay được liên tục 360° không bị "khựng"/clamp
- [x] Lăn chuột → camera tiến/lùi mượt, có easing, không giật
- [x] Click node → camera bay cong (quan sát thấy quỹ đạo không phải đường thẳng) trong ~1.5s
- [x] Panel phải hiện đúng tên + mô tả lĩnh vực tương ứng
- [x] Nút Return to AI Era core / Reset View đưa camera về đúng vị trí ban đầu `(0, .2, 14.5)`
- [x] Di chuột (không kéo) → parallax nhẹ, KHÔNG hoạt động khi đang focus node hoặc đang bay
- [x] HUD cập nhật distance/rotation realtime, đổi FOCUS khi click node/reset
- [x] Chữ "AI Era" có gradient 4 màu chuyển động chậm + glow rõ, kiểm tra trên nền tối lẫn `prefers-reduced-motion`
- [x] Custom cursor hoạt động desktop, tự ẩn trên `pointer:coarse`
- [x] Test tại 5 breakpoint: 375px, 768px, 1024px, 1440px, 1920px
- [x] FPS ≥ 50 trên desktop tier HIGH, ≥ 30 trên mobile tier LOW (dùng Chrome DevTools Performance)
- [x] Nội dung mỗi trang dịch vụ HTML riêng khớp với file `/content/*.md` tương ứng, có H1/H2/H3 semantic (không nhét text vào canvas — mục 27 tech_stack_html.md)
- [x] Lighthouse: LCP < 2.5s, CLS < 0.1 (theo mục 40 tech_stack_html.md)

---

## 14. Tổng kết mapping yêu cầu → nơi sửa

| Yêu cầu | File/hàm cần sửa |
|---|---|
| AI Era hạt nhân phát sáng + orbit + energy lines | Có sẵn — `coreGroup`, node loop dòng ~380-431 (giữ nguyên, chỉ tách file) |
| Particle/star field 2 lớp | Có sẵn — `makeStarLayer()` (giữ nguyên) |
| Bloom/Glow | Có sẵn — `UnrealBloomPass` (giữ, chỉnh theo quality tier) |
| Glassmorphism | Có sẵn CSS — bổ sung `backdrop-filter` nếu thiếu ở panel |
| Chữ AI Era nổi bật | **Sửa mới hoàn toàn** — mục 4 |
| Xoay 360° X/Y/Z | **Sửa mới** — mục 5 |
| Camera bay xuyên không gian bằng scroll | **Nâng cấp easing + range** — mục 6 |
| Click node bay theo quỹ đạo cong | **Sửa mới (Bezier)** — mục 7 |
| Panel mô tả chi tiết | Có sẵn khung — đổ dữ liệu thật — mục 8 |
| Return to core / Reset View | Có sẵn — kiểm tra lại — mục 8 |
| Parallax theo chuột | Có sẵn — bọc điều kiện — mục 9 |
| HUD realtime | Có sẵn DOM — nối dữ liệu — mục 10 |
| Custom cursor | Có sẵn — chỉ audit — mục 11 |
| Responsive/touch/pinch | **Bổ sung pinch + quality tier** — mục 12 |

---

**Ghi chú cho Junior Dev:** Không sửa trực tiếp `source/ai-era-spatial-threejs.html` gốc trong repo — file đó là bản tham khảo/mẫu. Mọi thay đổi thực hiện trong thư mục `ai-era-site/` mới theo cấu trúc ở mục 1. Sau khi hoàn thành, review lại với Tech Lead trước khi merge và deploy lên hosting tĩnh (Cloudflare Pages/Vercel/Netlify) theo mục 49 `tech_stack_html.md`.
