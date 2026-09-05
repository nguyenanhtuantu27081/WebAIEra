# Hướng dẫn khắc phục Hiệu suất trang (PageSpeed Insights) — aiera.vn

**Đối tượng:** Junior Dev
**Nguồn đo:** https://pagespeed.web.dev/analysis/https-aiera-vn/4ly1ler5l0?hl=vi&form_factor=mobile (Mobile)
**Nguồn code review:** `source/` (Next.js 14 + React Three Fiber)

---

## 0. TÓM TẮT SỐ LIỆU & MỨC ĐỘ NGHIÊM TRỌNG

### 0.1. Kết quả đo Mobile
| Chỉ số | Kết quả đo | Ngưỡng "Tốt" (Google) | Mức độ |
|---|---|---|---|
| First Contentful Paint (FCP) | 3,8 giây | ≤ 1,8s | 🔴 Kém |
| Largest Contentful Paint (LCP) | 4,7 giây | ≤ 2,5s | 🔴 Kém |
| Total Blocking Time (TBT) | **15.850 mili giây** | ≤ 200ms | 🔴🔴🔴 Cực kỳ nghiêm trọng |
| Cumulative Layout Shift (CLS) | 0,374 | ≤ 0,1 | 🔴 Kém |
| Speed Index | 10,6 giây | ≤ 3,4s | 🔴 Kém |

### 0.2. Kết quả đo Desktop (bổ sung 05/09/2026)
**Điểm Hiệu suất tổng: 47/100** — nguồn: https://pagespeed.web.dev/analysis/https-aiera-vn/tluhre9d4j?hl=vi&form_factor=desktop

| Chỉ số | Kết quả đo | Ngưỡng "Tốt" (Google) | Mức độ |
|---|---|---|---|
| First Contentful Paint (FCP) | 0,8 giây | ≤ 1,8s | 🟢 Tốt |
| Largest Contentful Paint (LCP) | 0,8 giây | ≤ 2,5s | 🟢 Tốt |
| Total Blocking Time (TBT) | **12.400 mili giây** | ≤ 200ms | 🔴🔴🔴 Cực kỳ nghiêm trọng |
| Cumulative Layout Shift (CLS) | 0,241 | ≤ 0,1 | 🟠 Trung bình |
| Speed Index | 7,0 giây | ≤ 3,4s | 🔴 Kém |

**Nhận định quan trọng:** FCP và LCP trên Desktop đều **xanh (rất nhanh — 0,8s)**, nghĩa là HTML/CSS ban đầu paint gần như ngay lập tức — nội dung chữ, layout tĩnh không phải vấn đề. Nhưng **TBT vẫn cực cao (12,4 giây)** và **Speed Index vẫn kém (7,0s)** dù máy tính có cấu hình mạnh hơn mobile rất nhiều. Điều này **xác nhận thêm** giả thuyết đã nêu ở Mục 1: ngay sau khi HTML paint xong, main thread bị **JavaScript của cảnh 3D chiếm dụng liên tục nhiều giây** (chẩn đoán đo được: "Giảm thời gian thực thi JS — **17 giây**", "Giảm thiểu công việc theo chuỗi chính — **31,9 giây**"), khiến trang tuy "trông có vẻ load xong" (FCP/LCP xanh) nhưng **không phản hồi được thao tác** trong hơn 12 giây tiếp theo — trải nghiệm thực tế người dùng vẫn rất tệ dù ảnh chụp màn hình ban đầu trông ổn.

→ Nguyên nhân gốc rễ **giống hệt bản Mobile** (xem Mục 1), chỉ khác ở chỗ: trên Desktop, `detectQualityTier()` cho máy có `hardwareConcurrency >= 8` (rất phổ biến với laptop/PC hiện nay) tier cao nhất **`'ultra'`** — tải particle tối đa + Bloom + dpr cao nhất — nên dù CPU/GPU desktop mạnh hơn mobile, vẫn bị quá tải bởi khối lượng công việc lớn hơn tương ứng. Xem **Checklist G** để xử lý riêng cho tier `'ultra'`/Desktop.

**TBT = 15,85 giây là con số bất thường nghiêm trọng** (bình thường 1 trang kém cũng chỉ vài trăm–vài nghìn mili giây). Con số này đồng nghĩa trình duyệt di động bị "đơ" gần 16 giây, không phản hồi được thao tác chạm của người dùng. Đây là chỉ số cần ưu tiên xử lý **số 1**, và may mắn là **1 nguyên nhân gốc rễ duy nhất** gây ra gần như toàn bộ vấn đề.

---

## 1. NGUYÊN NHÂN GỐC RỄ (xác định qua review code)

### 🔴 Nguyên nhân chính: Cảnh 3D WebGL (React Three Fiber) chạy full-tải trên MỌI thiết bị, kể cả điện thoại yếu

File `src/components/three/AiEraScene.tsx` được trang chủ load qua:
```ts
const AiEraScene = dynamic(() => import('@/components/three/AiEraScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-background" />,
});
```
→ Đây là bước đúng (tách bundle, không SSR), **nhưng chưa đủ**: ngay khi trang load xong, component này **luôn được mount ngay lập tức cho mọi người dùng** — không có cơ chế tắt/giảm tải nào cho mobile yếu.

Bên trong `AiEraScene.tsx`, mỗi lần render tạo ra:
- 1 `<Canvas>` WebGL với `antialias: true`, `powerPreference: 'high-performance'` — rất tốn GPU/CPU trên mobile.
- 2 `pointLight` + 1 `ambientLight` + fog.
- `<AiEraCore />`, 6× `<BusinessNode />`, `<CameraController />`.
- `<ParticleField tier={tier} />` — vẽ **300–2.500 particle** tùy tier, chạy `useFrame()` (tức là **chạy lại mỗi frame, 60 lần/giây**) để xoay + di chuyển vị trí.
- `<Effects />` (nếu tier ≠ `low`) — bật **Bloom post-processing** (`@react-three/postprocessing`), một trong những hiệu ứng tốn GPU nhất trong Three.js vì phải render lại toàn màn hình nhiều lần (multi-pass).

`src/lib/three/quality-tiers.ts` có cơ chế `detectQualityTier()` để giảm tải theo thiết bị:
```ts
if (isMobile) return cores >= 6 ? 'medium' : 'low';
```
→ Vấn đề: **rất nhiều điện thoại tầm trung/cao hiện nay đều báo `hardwareConcurrency >= 6`** (kể cả máy tầm trung giá rẻ), nên phần lớn user mobile vẫn rơi vào tier `medium` = **700 particle + Bloom bật** — vẫn rất nặng. `hardwareConcurrency` không phản ánh đúng hiệu năng GPU thực tế (chỉ đếm số nhân CPU, không đo GPU) → thuật toán detect tier hiện tại **không đáng tin cậy** để quyết định có nên bật Bloom hay không.

Ngoài ra, `World` component bên trong scene lắng nghe `pointermove` trên toàn `window` và tính toán rotation mỗi frame — chạy song song cùng vòng lặp render Three.js, cộng dồn thêm tải CPU liên tục kể cả khi người dùng không tương tác.

**→ Đây chính là nguyên nhân của:**
- TBT 15,85s (chẩn đoán "Giảm thiểu công việc theo chuỗi chính — 48,2 giây", "Giảm thời gian thực thi JavaScript — 2,0 giây", "Tránh các tác vụ dài trong luồng chính — 20 tác vụ").
- LCP 4,7s / FCP 3,8s / Speed Index 10,6s (main thread bận xử lý WebGL nên không rảnh để paint nội dung HTML/CSS của Hero).
- "Rút gọn JavaScript — tiết kiệm 189 KiB" và "Giảm JavaScript không dùng — 221 KiB": do bundle `three` + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` + `gsap` rất nặng (tổng các thư viện này thường 400–800 KB minified), và nhiều phần (drei helpers, postprocessing passes không dùng tới) bị bundle dư thừa.

### 🟠 Nguyên nhân phụ #1: CLS 0,374 (thay đổi bố cục)
- `<Hero>` dùng class `animate-fade-in` (CSS `@keyframes fadeIn` trong `globals.css`) — kiểm tra lại keyframe này có animate `opacity` thuần hay có động cả `transform`/kích thước gây dịch layout.
- Placeholder loading của `AiEraScene` là `<div className="fixed inset-0 ...">` (positioning `fixed`) — về lý thuyết không đẩy layout, nhưng cần kiểm tra khi Canvas thật mount vào có làm co giãn `<main>` hoặc đẩy nội dung bên dưới hay không (do Canvas thường set `position: absolute` qua CSS của `@react-three/fiber`, nếu thiếu `width/height` cố định trên container cha dễ gây shift).
- Font `Plus_Jakarta_Sans` dùng `next/font` với `display: 'swap'` (đã đúng chuẩn) — nhưng **swap vẫn có thể gây CLS nhẹ** nếu không khai báo `fallback` font có metrics gần giống (xem Checklist B.3).

### 🟠 Nguyên nhân phụ #2: "Tránh các ảnh động không được ghép" (Non-composited animations) — 4 phần tử
`CustomCursor.tsx` dùng GSAP `.to()` animate cursor theo `x`/`y` — nếu GSAP không set `transform` (dùng biến đổi CSS `left/top` mặc định) thì đây là animation **không composited** (bắt buộc reflow mỗi frame). Cần kiểm tra & ép GSAP dùng `transform: translate3d`.

### 🟠 Nguyên nhân phụ #3: Cache Policy — 14 KiB
Chẩn đoán "Sử dụng thời gian hữu dụng của bộ nhớ đệm hiệu quả — Mức tiết kiệm ước tính 14 KiB" cho thấy có asset tĩnh (ảnh, font, hoặc JS chunk) chưa được set `Cache-Control` dài hạn ở tầng hosting/CDN.

### 🟢 Điểm đã làm đúng (giữ nguyên, không sửa)
- Dùng `next/font` self-host Google Fonts với `display: 'swap'` — đúng best practice, tránh render-blocking do font external.
- Dùng `dynamic(..., { ssr: false })` để tách 3D scene khỏi bundle SSR chính — đúng hướng, chỉ cần bổ sung thêm điều kiện tải (Checklist A).

---

## CHECKLIST A — Giảm tải JavaScript luồng chính (ưu tiên #1, xử lý trước tiên)

> Mục tiêu: đưa TBT từ 15.850ms xuống dưới 300ms. Đây là nhóm việc quan trọng nhất — làm xong riêng nhóm A có thể cải thiện 80–90% toàn bộ điểm số.

### A.1. Tắt hẳn cảnh 3D nặng trên mobile, thay bằng ảnh/gradient tĩnh (khuyến nghị mạnh nhất)
Thiết bị di động có màn hình nhỏ, hiệu ứng 3D xoay 360° gần như không mang lại giá trị trải nghiệm tương xứng với chi phí hiệu suất phải trả. Đề xuất:

```tsx
// src/app/[locale]/page.tsx
'use client'; // chỉ phần cần thiết, xem lại A.5 để tối ưu thêm

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AiEraScene = dynamic(() => import('@/components/three/AiEraScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-background" />,
});

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(true); // mặc định coi là mobile để tránh mount nhầm trước khi đo
  useEffect(() => {
    setIsMobile(window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches);
  }, []);
  return isMobile;
}

export default function HomePage() {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <div
          className="fixed inset-0 z-0 bg-background bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]"
          aria-hidden
        />
      ) : (
        <AiEraScene />
      )}
      {/* ... phần còn lại giữ nguyên ... */}
    </>
  );
}
```
> Có thể thay gradient CSS bằng **1 ảnh JPG/WebP tĩnh** chụp lại cảnh 3D (poster image, dùng `next/image`) để vẫn giữ được thẩm mỹ thương hiệu mà không tốn JS runtime.

### A.2. Nếu vẫn muốn giữ 3D trên mobile: trì hoãn tải đến sau khi LCP đã paint xong
Không mount ngay khi trang load — chỉ mount sau khi nội dung chính (Hero text) đã hiển thị, dùng `requestIdleCallback` hoặc trì hoãn theo `IntersectionObserver`/timeout:
```tsx
const [ready, setReady] = useState(false);
useEffect(() => {
  const id = ('requestIdleCallback' in window)
    ? (window as any).requestIdleCallback(() => setReady(true), { timeout: 2000 })
    : setTimeout(() => setReady(true), 300);
  return () => clearTimeout(id as any);
}, []);
// chỉ render <AiEraScene /> khi ready === true
```

### A.3. Sửa `detectQualityTier()` — không tin `hardwareConcurrency` một mình
```ts
// src/lib/three/quality-tiers.ts
export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'low';
  const isMobile = window.innerWidth < 768 || /Android|iPhone|iPad/i.test(navigator.userAgent);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as any).connection?.saveData;
  if (reduceMotion || saveData) return 'low';
  if (isMobile) return 'low'; // mặc định LOW cho mọi mobile, không dựa vào core count
  const cores = navigator.hardwareConcurrency ?? 4;
  return cores >= 8 ? 'high' : cores >= 4 ? 'medium' : 'low';
}
```
> Bỏ hẳn tier `ultra` khỏi mobile, và **hạ mặc định mobile về `low`** (300 particle, **tắt Bloom hoàn toàn**) — đây là thay đổi 1 dòng nhưng ảnh hưởng lớn tới GPU load.

### A.4. Giảm/point tối ưu `ParticleField` và tắt Bloom trên tier thấp
- `low` tier hiện đã tắt bloom (`bloom: false`) — đúng, giữ nguyên.
- Cân nhắc giảm tiếp `medium.particles` từ 700 → 400 nếu vẫn dùng cho tablet/laptop yếu.
- Trong `ParticleField.tsx`, particle dùng `useFrame` chạy 60 lần/giây kể cả khi camera đứng yên — cân nhắc dùng `useFrame` với **throttle** (chỉ update mỗi 2–3 frame) cho particle field vì chuyển động rất chậm, mắt người không phân biệt được sai khác.

### A.5. Tối ưu import — tránh kéo dư thừa `@react-three/drei`
Kiểm tra `AiEraCore.tsx`, `BusinessNode.tsx`, `CameraController.tsx` có import nguyên `@react-three/drei` (`import * as drei` hoặc import cả package) hay chỉ import đúng named export cần dùng (`import { Html } from '@react-three/drei'`). Import kiểu named-export giúp tree-shaking hiệu quả hơn, giảm trực tiếp phần "JavaScript không dùng — 221 KiB".

### A.6. Loại bỏ `powerPreference: 'high-performance'` + cân nhắc `antialias` theo tier
```tsx
<Canvas
  camera={{ position: [0, 0.2, 14.5], fov: 48, near: 0.1, far: 120 }}
  dpr={preset.dpr}
  gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'default' }}
  ...
>
```
`powerPreference: 'high-performance'` ép trình duyệt ưu tiên GPU rời (nếu có) — trên laptop 2 GPU việc này có thể tốt, nhưng trên mobile **không có khái niệm GPU rời**, cờ này không giúp ích và có thể khiến trình duyệt chọn nhầm cấu hình context nặng hơn cần thiết. Đổi về `'default'`.

### A.7. Bundle Analyzer — đo lại sau khi sửa
```bash
npm install --save-dev @next/bundle-analyzer
```
```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(withNextIntl(nextConfig));
```
Chạy `ANALYZE=true npm run build`, xác nhận chunk `three`/`@react-three/*` **không còn nằm trong bundle tải ngay khi vào trang trên mobile** (phải nằm trong 1 chunk tách riêng chỉ tải khi `AiEraScene` thực sự được mount).

---

## CHECKLIST B — Khắc phục Cumulative Layout Shift (CLS 0,374 → mục tiêu ≤ 0,1)

### B.1. Kiểm tra `@keyframes fadeIn` trong `globals.css`
```css
@keyframes fadeIn { /* kiểm tra nội dung thật trong file */ }
```
- Đảm bảo animation chỉ đổi `opacity` (và `transform` nếu cần), **không** đổi `height`, `margin`, `padding`, hay từ `display: none` → `block` (những thuộc tính này luôn gây layout shift).
- Nếu cần hiệu ứng "trượt lên", dùng `transform: translateY()` thay vì `margin-top`/`top`.

### B.2. Container cho `AiEraScene`/placeholder phải có kích thước cố định
Đảm bảo `<Canvas>` khi mount không làm đẩy các phần tử phía dưới. Bọc trong container với `position: fixed; inset: 0` nhất quán cả lúc loading lẫn lúc render thật (đã đúng ở placeholder, cần xác nhận `Canvas` của `@react-three/fiber` cũng nhận đúng class/style tương tự, không tự ý set `position: relative` mặc định).

### B.3. Khai báo `adjustFontFallback`/fallback font cho `next/font`
```ts
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
  adjustFontFallback: true, // mặc định đã true với next/font/google, xác nhận không bị override
});
```
`next/font` tự động tạo fallback font có metrics (chiều rộng ký tự) khớp với font thật để giảm CLS khi font swap — xác nhận cấu hình chưa bị tắt.

### B.4. Ảnh & icon phải luôn khai báo `width`/`height` hoặc dùng `next/image`
Rà lại toàn bộ `<img>` thường (nếu có) trong `Header`, `Footer`, `GlassCard`... chuyển sang `next/image` với `width`/`height` tường minh để trình duyệt reserve đúng không gian trước khi ảnh tải xong.

### B.5. Đo lại bằng Chrome DevTools → Performance → Experience → Layout Shift regions
Sau khi sửa B.1–B.4, record lại 1 phiên load trang trên Chrome DevTools (mobile emulation, 4G throttle) để xác nhận vùng nào còn shift, lặp lại tới khi CLS < 0,1.

---

## CHECKLIST C — Yêu cầu chặn hiển thị (Render-blocking) & Critical Path

### C.1. Kiểm tra CSS
- `globals.css` build qua Tailwind — đảm bảo `next build` đã tự động tối ưu/purge CSS không dùng (Tailwind v3 mặc định làm điều này qua `content` config trong `tailwind.config.ts` — xác nhận đường dẫn `content` bao phủ đúng `src/**/*.{ts,tsx}`).
- Không import thêm CSS framework/icon-font nặng nào khác ngoài Tailwind nếu không cần thiết.

### C.2. Preconnect cho font/CDN ảnh (nếu dùng domain ngoài)
Vì đã dùng `next/font` self-host nên không cần preconnect tới Google Fonts nữa (đã tối ưu sẵn). Chỉ cần preconnect nếu có gọi CDN ảnh riêng (`cdn.aiera.vn` — nhớ đồng bộ đúng domain thật theo phần SEO đã sửa trước đó):
```tsx
<link rel="preconnect" href="https://cdn.aiera.vn" />
```

### C.3. Script bên thứ ba (Analytics, Chat widget...)
Nếu có gắn Google Analytics/Facebook Pixel/chat widget, đảm bảo dùng `next/script` với `strategy="afterInteractive"` hoặc `"lazyOnload"`, **không** để mặc định (blocking).

---

## CHECKLIST D — Chính sách Cache (14 KiB)

### D.1. Với static assets tự host (`public/`, `_next/static`)
Next.js tự động set cache dài hạn (`immutable`) cho file trong `_next/static` khi deploy đúng cách (Vercel tự làm; nếu tự host bằng Nginx/Node server, cần cấu hình thủ công):
```nginx
location /_next/static/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* \.(jpg|jpeg|png|webp|svg|woff2)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### D.2. Với ảnh động qua `next/image` + `remotePatterns` (cdn.aiera.vn)
Đảm bảo server gốc trả về header `Cache-Control` hợp lý (tối thiểu vài ngày, khuyến nghị 1 năm cho ảnh không đổi tên khi cập nhật — dùng versioned filename nếu cần đổi).

---

## CHECKLIST E — Ảnh động không được ghép (Non-composited animations)

### E.1. Sửa `CustomCursor.tsx` — ép GSAP dùng `transform`
```tsx
const handleMove = (e: MouseEvent) => {
  gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.05, force3D: true });
  gsap.to(outlineRef.current, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out', force3D: true });
};
```
`force3D: true` ép GSAP dùng `translate3d()` (composited, chạy trên GPU compositor thread, không gây reflow) thay vì `left/top`. Đồng thời kiểm tra CSS `.cursor-dot`/`.cursor-outline` trong `globals.css` phải dùng `position: fixed` + `will-change: transform` (không dùng `top/left` để định vị qua JS).

### E.2. Rà soát 3 phần tử animation còn lại
PageSpeed báo "tìm thấy 4 phần tử ảnh động" không composited — sau khi sửa CustomCursor (2 phần tử: dot + outline), tiếp tục kiểm tra:
- `.animate-pulse-glow` (badge chấm tròn trong Hero) — xác nhận `@keyframes pulse-glow` chỉ animate `opacity`/`box-shadow` hay có động `width/height`. Nếu dùng `box-shadow` để tạo hiệu ứng "glow", đây **cũng là thuộc tính không composited** — cân nhắc thay bằng `transform: scale()` kết hợp `opacity` của 1 pseudo-element blur sẵn.
- `MagneticButton.tsx` — component "hút chuột" thường dùng GSAP/框架 animate `x/y` theo con trỏ — áp dụng `force3D: true` tương tự E.1.

---

## CHECKLIST F — GIỮ 3D TRÊN MOBILE NHƯNG TỐI ƯU (thay vì tắt hẳn ở A.1)

> Dùng checklist này **thay cho A.1** nếu yêu cầu nghiệp vụ là **bắt buộc giữ trải nghiệm 3D trên mobile** (ví dụ vì đây là điểm nhấn thương hiệu). Mục tiêu: đưa GPU/CPU load trên mobile xuống mức chấp nhận được (TBT < 1–2s thay vì 15,85s) mà **vẫn hiển thị scene 3D tương tác được**, chấp nhận giảm bớt độ chi tiết/hiệu ứng so với desktop. Có thể kết hợp cả A.1 (fallback ảnh tĩnh) cho nhóm máy quá yếu + Checklist F cho nhóm máy mobile tầm trung/cao — xem F.7.

### F.1. Đo GPU thật thay vì đoán qua `hardwareConcurrency`
`navigator.hardwareConcurrency` chỉ đếm nhân CPU, không phản ánh GPU — dùng thư viện chuyên dụng để phân loại chính xác hơn:
```bash
npm install detect-gpu
```
```ts
// src/lib/three/quality-tiers.ts
import { getGPUTier } from 'detect-gpu';

export async function detectQualityTierAsync(): Promise<QualityTier> {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as any).connection?.saveData;
  if (reduceMotion || saveData) return 'low';

  const gpuTier = await getGPUTier({ mobileBenchmarkPercentages: [0, 50, 30, 20] });
  // gpuTier.tier: 0 (không hỗ trợ/rất yếu) → 3 (mạnh)
  if (gpuTier.tier <= 1) return 'low';
  if (gpuTier.tier === 2) return 'mobile-medium'; // xem preset mới ở F.2
  return window.innerWidth < 768 ? 'mobile-medium' : 'medium';
}
```
`detect-gpu` benchmark dựa trên danh sách hiệu năng GPU thực tế (cả mobile GPU: Adreno, Mali, Apple GPU...) chính xác hơn nhiều so với đếm core CPU. Vì hàm này là **async** (tải bảng benchmark), cần loading state ngắn trước khi mount `Canvas` — chấp nhận được vì cũng đang trì hoãn theo A.2.

### F.2. Thêm preset riêng cho mobile — nhẹ hơn cả tier `low` hiện tại
```ts
export const QUALITY_PRESETS = {
  low:            { particles: 300,  bloom: false, bloomIntensity: 0,   dpr: [1, 1],   lights: 1, geometrySegments: 8,  frameSkip: 2 },
  'mobile-medium':{ particles: 120,  bloom: false, bloomIntensity: 0,   dpr: [1, 1],   lights: 1, geometrySegments: 10, frameSkip: 1 },
  medium:         { particles: 500,  bloom: true,  bloomIntensity: 0.4, dpr: [1, 1.5], lights: 2, geometrySegments: 16, frameSkip: 0 },
  high:           { particles: 1200, bloom: true,  bloomIntensity: 0.8, dpr: [1, 2],   lights: 3, geometrySegments: 24, frameSkip: 0 },
};
```
- **`particles` giảm mạnh** (700 → 120 cho mobile) — particle field chỉ mang tính trang trí nền, giảm 80% số lượng gần như không ai nhận ra trên màn hình nhỏ.
- **`bloom: false` bắt buộc trên mọi tier mobile** — Bloom (`EffectComposer` multi-pass) thường là **chi phí GPU lớn nhất** trong toàn bộ scene, lớn hơn cả số lượng particle. Thay bằng "glow giả" rẻ hơn (xem F.3).
- **`geometrySegments`** (tham số mới) — dùng để giảm số polygon của sphere/torus trong `AiEraCore.tsx`/`BusinessNode.tsx` (xem F.4).
- **`frameSkip`** (tham số mới) — dùng để bỏ bớt frame update cho animation phụ (xem F.5).

### F.3. Thay Bloom postprocessing bằng "glow giả" rẻ hơn cho mobile
Bloom thật (`@react-three/postprocessing`) yêu cầu render toàn màn hình nhiều lần (multi-pass), rất tốn trên mobile GPU. Thay thế bằng kỹ thuật rẻ hơn nhiều: dùng `Sprite` với texture glow radial + `additive blending` — vốn đã có sẵn trong code (`haloRef`, `auraRef` trong `AiEraCore.tsx`/`BusinessNode.tsx` đã dùng `THREE.Sprite`).
```tsx
// AiEraScene.tsx
{preset.bloom && <Effects intensity={preset.bloomIntensity} />}
{/* Trên mobile (preset.bloom === false), hiệu ứng "glow" đã đến từ chính các Sprite
    halo/aura có sẵn trong AiEraCore & BusinessNode — không cần EffectComposer */}
```
→ Không cần code thêm gì mới ở đây, chỉ cần **chắc chắn không mount `<Effects />`** khi `preset.bloom === false` (điều kiện đã có sẵn), và tăng nhẹ opacity/scale của các Sprite halo hiện có trên mobile để bù lại phần thiếu sáng so với Bloom thật.

### F.4. Giảm độ chi tiết hình học (LOD) theo tier — sửa `AiEraCore.tsx` & `BusinessNode.tsx`
Hiện tại `coreRef`, `torusRefs`, geometry của sphere/torus dùng số segment cố định (không đổi theo thiết bị). Sửa để nhận `segments` từ preset:
```tsx
// AiEraCore.tsx
export default function AiEraCore({ segments = 32 }: { segments?: number }) {
  const coreGeometry = useMemo(
    () => new THREE.IcosahedronGeometry(1.4, segments > 16 ? 2 : 1), // giảm subdivision thay vì sphere segments cao
    [segments]
  );
  // ...
}
```
```tsx
// AiEraScene.tsx — truyền segments xuống
<AiEraCore segments={preset.geometrySegments} />
```
Giảm subdivision của icosahedron/sphere từ mức 2–3 (desktop, mượt) xuống 0–1 (mobile) giảm số lượng vertex/polygon phải xử lý mỗi frame đáng kể mà mắt thường trên màn hình nhỏ khó nhận ra khác biệt.

### F.5. Throttle animation phụ (torus/spark) — không cần update mỗi frame
Các hiệu ứng phụ như xoay vòng torus, nhấp nháy spark (trong `AiEraCore.tsx`) không cần chạy đúng 60fps để vẫn mượt mắt — dùng bộ đếm frame để bỏ bớt:
```tsx
const frameCount = useRef(0);
useFrame((state) => {
  frameCount.current++;
  if (preset.frameSkip > 0 && frameCount.current % (preset.frameSkip + 1) !== 0) return; // bỏ bớt frame
  // ... phần code animate torus/spark giữ nguyên
});
```
Với `frameSkip: 2` (mobile), animation phụ chỉ update ~20 lần/giây thay vì 60 lần/giây — giảm 2/3 khối lượng tính toán JS cho phần này, gần như không nhận ra bằng mắt vì đây là chuyển động chậm/xoay đều.

### F.6. Dùng `frameloop="demand"` + tạm dừng khi không cần thiết
Mặc định React Three Fiber render liên tục 60fps kể cả khi scene đứng yên hoàn toàn (không ai tương tác). Trên mobile, đổi sang chế độ **chỉ render khi cần** kết hợp `invalidate()`:
```tsx
<Canvas
  frameloop="demand"
  camera={{ position: [0, 0.2, 14.5], fov: 48, near: 0.1, far: 120 }}
  dpr={preset.dpr}
  gl={{ antialias: false, alpha: true, powerPreference: tier.startsWith('mobile') ? 'low-power' : 'default' }}
>
```
> Lưu ý: vì `AiEraCore`/`ParticleField`/`BusinessNode` có animation chạy liên tục qua `useFrame` (xoay đều), `frameloop="demand"` **không tự động render lại mỗi frame** — cần gọi `invalidate()` thủ công trong vòng lặp animation, hoặc (đơn giản hơn cho mobile) chấp nhận animation "giật nhẹ" ở framerate thấp hơn bằng cách kết hợp `frameloop="always"` nhưng **giới hạn FPS thủ công** (dùng thư viện `r3f-perf`/`useFrame` với so sánh delta-time để chỉ update khi đủ 1/30 giây trôi qua) — đơn giản và ổn định hơn `demand` cho trường hợp có animation nền liên tục.
- Thêm `antialias: false` cho mobile (đã đổi ở snippet trên) — antialiasing tốn thêm 1 lần render đa mẫu, trên màn hình mobile DPI cao thường không cần vì pixel đã rất nhỏ.
- Đổi `powerPreference` sang `'low-power'` cho tier mobile (ngược với khuyến nghị `'default'` ở mục A.6 dành cho mọi thiết bị nói chung) — trên mobile, `'low-power'` giúp trình duyệt ưu tiên hiệu năng/nhiệt ổn định, tránh throttle giữa chừng gây giật khi máy nóng lên.

### F.7. Tạm dừng hoàn toàn render loop khi tab ẩn hoặc scene cuộn ra khỏi màn hình
```tsx
// Trong World component (AiEraScene.tsx)
const isVisibleRef = useRef(true);
useEffect(() => {
  const handleVisibility = () => { isVisibleRef.current = document.visibilityState === 'visible'; };
  document.addEventListener('visibilitychange', handleVisibility);
  return () => document.removeEventListener('visibilitychange', handleVisibility);
}, []);

useFrame(() => {
  if (!isVisibleRef.current) return; // không tính toán gì khi tab ẩn/app xuống nền
  // ... phần code hiện tại
});
```
Kết hợp thêm `IntersectionObserver` trên container Canvas: khi Hero (chứa scene 3D) đã cuộn khỏi viewport (người dùng đang đọc phần Services/Ecosystem phía dưới), tạm dừng animation tương tự — 3D scene trên trang chủ thường chỉ hiển thị ở phần Hero, không cần chạy nền khi không ai nhìn thấy.

### F.8. Kết hợp cả 2 hướng: Progressive Enhancement theo GPU tier thực tế
Cách tiếp cận toàn diện nhất — dùng kết quả `detect-gpu` (F.1) để **chọn 1 trong 3 mức trải nghiệm**, thay vì nhị phân "có/không có 3D" như A.1:

| GPU Tier (detect-gpu) | Trải nghiệm hiển thị |
|---|---|
| Tier 0 (không hỗ trợ WebGL/rất yếu) | Ảnh tĩnh/gradient (giống A.1) |
| Tier 1–2 (mobile tầm thấp–trung) | 3D scene với preset `mobile-medium` (F.2–F.7: particle ít, không bloom, LOD thấp, frameSkip, low-power) |
| Tier 3 (mobile cao cấp/tablet/desktop) | 3D scene preset `medium`/`high` như hiện tại |

Cách này đảm bảo **không thiết bị nào bị chặn hoàn toàn trải nghiệm thương hiệu**, đồng thời máy yếu không bị ép tải nội dung vượt quá khả năng xử lý.

### F.9. Kiểm thử trên thiết bị thật, không chỉ tin lab data
- PageSpeed Insights (lab data) không phản ánh chính xác 100% trải nghiệm thật trên từng dòng máy. Sau khi áp dụng Checklist F, **bắt buộc** kiểm thử trực tiếp trên tối thiểu: 1 điện thoại Android tầm trung (Snapdragon 6xx/Helio G-series, phổ biến tại VN), 1 iPhone đời cũ (iPhone 11/12), qua Chrome DevTools Remote Debugging hoặc BrowserStack.
- Theo dõi thêm **nhiệt độ máy & thời lượng pin** khi scroll qua Hero trong 1–2 phút — WebGL chạy liên tục là nguyên nhân phổ biến gây nóng máy, ảnh hưởng trải nghiệm dù số liệu Lighthouse có thể đã cải thiện.
- Sau khi lên production, theo dõi **Core Web Vitals field data thật** (Search Console) theo nhóm thiết bị, không chỉ dựa vào 1 lần đo lab.

### F.10. Triển khai cụ thể: tự động fallback ảnh tĩnh cho Tier 0 (không hỗ trợ WebGL / GPU quá yếu)

Đây là phần code hoàn chỉnh, ghép nối tất cả các bước F.1–F.8 thành 1 component wrapper duy nhất, tự quyết định hiển thị gì dựa trên khả năng thiết bị thực tế — **không dựa vào đoán mobile/desktop**, mà dựa vào khả năng WebGL thật.

**Bước 1 — Hàm kiểm tra WebGL có khả dụng không (chạy trước cả `detect-gpu`)**
```ts
// src/lib/three/webgl-support.ts
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl && gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext;
  } catch (e) {
    return false; // trình duyệt chặn WebGL (chính sách công ty, chế độ tiết kiệm pin cực hạn...) hoặc lỗi driver
  }
}
```
> Một số thiết bị/trình duyệt **hoàn toàn không có WebGL context** (trình duyệt cũ, chế độ tiết kiệm pin cực hạn của một số Android, WebView hạn chế trong app...). Với các máy này, `detect-gpu` cũng không chạy được — nên **phải kiểm tra WebGL trước tiên**, độc lập với `detect-gpu`.

**Bước 2 — Hook tổng hợp quyết định "cấp độ hiển thị" (device capability level)**
```ts
// src/lib/three/use-scene-capability.ts
'use client';
import { useEffect, useState } from 'react';
import { getGPUTier } from 'detect-gpu';
import { isWebGLAvailable } from './webgl-support';

export type SceneCapability = 'checking' | 'static' | 'mobile-lite' | 'full';

export function useSceneCapability(): SceneCapability {
  const [capability, setCapability] = useState<SceneCapability>('checking');

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      // 1) Ưu tiên tôn trọng lựa chọn của người dùng / mạng yếu → luôn fallback tĩnh
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = (navigator as any).connection?.saveData;
      if (reduceMotion || saveData) {
        if (!cancelled) setCapability('static');
        return;
      }

      // 2) Không có WebGL → Tier 0 chắc chắn, fallback tĩnh ngay, KHÔNG gọi detect-gpu
      if (!isWebGLAvailable()) {
        if (!cancelled) setCapability('static');
        return;
      }

      // 3) Có WebGL → đo GPU tier thực tế
      try {
        const gpuTier = await getGPUTier({ mobileBenchmarkPercentages: [0, 50, 30, 20] });
        if (cancelled) return;

        if (gpuTier.tier === 0 || gpuTier.isMobile === undefined) {
          // detect-gpu tự xếp tier 0 cho GPU quá yếu/không nhận diện được, dù context WebGL tồn tại
          setCapability('static');
        } else if (gpuTier.tier === 1 || (gpuTier.isMobile && gpuTier.tier === 2)) {
          setCapability('mobile-lite'); // preset 'mobile-medium' ở F.2
        } else {
          setCapability('full'); // preset 'medium'/'high' hiện tại
        }
      } catch {
        // detect-gpu lỗi (hiếm) → an toàn là fallback tĩnh thay vì có thể crash Canvas
        if (!cancelled) setCapability('static');
      }
    }

    detect();
    return () => { cancelled = true; };
  }, []);

  return capability;
}
```

**Bước 3 — Component wrapper dùng trong `page.tsx` (thay thế toàn bộ logic cũ)**
```tsx
// src/components/three/HeroSceneSwitcher.tsx
'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSceneCapability } from '@/lib/three/use-scene-capability';

const AiEraScene = dynamic(() => import('./AiEraScene'), { ssr: false });

export default function HeroSceneSwitcher() {
  const capability = useSceneCapability();

  // Trong lúc đang detect (vài chục–vài trăm ms đầu) luôn hiển thị placeholder nhẹ nhất,
  // tránh "giật" giao diện nếu sau đó phải fallback về static.
  if (capability === 'checking' || capability === 'static') {
    return (
      <div className="fixed inset-0 z-0 bg-background" aria-hidden>
        <Image
          src="/hero-poster.webp"     // ảnh tĩnh chụp lại cảnh 3D, chuẩn bị sẵn trong public/
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      </div>
    );
  }

  // 'mobile-lite' hoặc 'full' → mount Canvas thật, truyền tier tương ứng vào bên trong
  return <AiEraScene forcedTier={capability === 'mobile-lite' ? 'mobile-medium' : undefined} />;
}
```
```tsx
// src/app/[locale]/page.tsx
import HeroSceneSwitcher from '@/components/three/HeroSceneSwitcher';
// ...
export default function HomePage() {
  return (
    <>
      <HeroSceneSwitcher />
      {/* phần Hero text, Services, v.v. giữ nguyên */}
    </>
  );
}
```

**Bước 4 — Chuẩn bị ảnh `hero-poster.webp`**
- Chụp screenshot thật của cảnh 3D ở trạng thái đẹp nhất (góc camera mặc định), export **WebP, độ phân giải 1920×1080, dưới 150KB**.
- Đặt tại `public/hero-poster.webp`, dùng `next/image` với `priority` (vì đây là phần LCP của trang) để được ưu tiên tải sớm nhất — quan trọng vì Tier 0 thường đi kèm mạng yếu, ảnh này cần tải nhanh.

### F.11. Bảng tổng hợp hành vi theo từng nhóm thiết bị (để QA kiểm thử)

| Điều kiện phát hiện | `capability` | Hiển thị | Preset 3D áp dụng |
|---|---|---|---|
| `prefers-reduced-motion` hoặc Data Saver bật | `static` | Ảnh tĩnh `hero-poster.webp` | Không có |
| Không có WebGL context (trình duyệt/thiết bị chặn) | `static` | Ảnh tĩnh | Không có |
| Có WebGL nhưng `detect-gpu` trả về `tier: 0` | `static` | Ảnh tĩnh | Không có |
| `detect-gpu` lỗi khi chạy (hiếm) | `static` | Ảnh tĩnh (an toàn, tránh crash) | Không có |
| `tier: 1`, hoặc mobile với `tier: 2` | `mobile-lite` | Canvas 3D nhẹ | `mobile-medium` (F.2: 120 particle, không Bloom, LOD thấp) |
| `tier: 3`, hoặc desktop với `tier: 2+` | `full` | Canvas 3D đầy đủ | `medium`/`high` (như hiện tại) |

> **QA cần test đủ 3 hàng đầu tiên** để xác nhận cơ chế fallback hoạt động đúng — cách dễ nhất để giả lập "Tier 0" khi test: dùng Chrome DevTools → **Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`**, hoặc tắt hardware acceleration trong Chrome (`chrome://settings` → System) để giả lập máy không có GPU tăng tốc.

## CHECKLIST G — Xử lý riêng cho Desktop (tier `'ultra'`)

> Áp dụng thêm sau khi đã làm Checklist A/F cho mobile. Nếu đã triển khai `useSceneCapability()` (F.10) thì tier `'ultra'` chỉ nên đạt được khi **`detect-gpu` xác nhận `tier: 3`**, không chỉ dựa vào số nhân CPU như hiện tại.

### G.1. Ngừng dùng `hardwareConcurrency` để quyết định tier `'ultra'`
Máy tính văn phòng/laptop phổ thông hiện nay hầu hết đều có **≥ 8 luồng CPU** (kể cả máy dùng card đồ hoạ;ạ tích hợp yếu, hoặc chạy trong máy ảo/Chromebook) — dùng điều kiện `cores >= 8 ? 'ultra'` là **không đáng tin cậy**, y hệt lỗi đã nêu ở A.3 cho mobile. Sửa:
```ts
// src/lib/three/quality-tiers.ts — dùng chung logic với F.1, chỉ khác nhánh desktop
export async function detectQualityTierAsync(): Promise<QualityTier> {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return 'low';

  const gpuTier = await getGPUTier();
  if (gpuTier.tier === 0) return 'low';
  if (gpuTier.tier === 1) return 'medium';
  if (gpuTier.tier === 2) return 'high';
  return 'ultra'; // chỉ khi detect-gpu xác nhận tier 3 thật sự (dGPU rời, đủ mạnh)
}
```

### G.2. Giảm bớt độ nặng của chính preset `'ultra'` (kể cả khi máy đủ mạnh)
Dù máy có GPU rời mạnh, **12,4 giây TBT vẫn là bất thường** — điều này cho thấy vấn đề không chỉ nằm ở "chọn sai tier" mà bản thân code animation (đặc biệt `AiEraCore.tsx`, `BusinessNode.tsx`) tính toán JS nặng bất kể tier (nhiều phép `Math.sin`, forEach qua nhiều ref mỗi frame — xem lại phần "Nguyên nhân gốc rễ" Mục 1). Áp dụng luôn **F.5 (frameSkip)** và **F.4 (giảm LOD)** cho preset `'ultra'` chứ không chỉ cho mobile — ví dụ `frameSkip: 0` vẫn ổn (60fps) nhưng **giảm số phép tính trong mỗi lần `useFrame`** bằng cách gộp bớt vòng lặp `torusRefs.forEach`/`sparkRefs.forEach` hoặc cache kết quả `Math.sin` dùng chung cho nhiều phần tử thay vì tính riêng lẻ.

### G.3. Kiểm tra lại toàn bộ nhóm chẩn đoán trùng lặp với Mobile
Các chẩn đoán sau xuất hiện **giống hệt** ở cả Mobile và Desktop → xác nhận đây là vấn đề ở **code chung**, không phải vấn đề riêng thiết bị, ưu tiên sửa 1 lần áp dụng cho mọi tier:
- "Rút gọn JavaScript — 189 KiB" → xử lý theo **A.5** (tree-shake `@react-three/drei`).
- "Giảm JavaScript không dùng — ~221–222 KiB" → xử lý theo **A.7** (Bundle Analyzer, code-split đúng chunk).
- "Tránh dùng các ảnh động không được ghép — 4 phần tử" → xử lý theo **Checklist E** (`force3D: true` cho GSAP).

### G.4. CLS 0,241 trên Desktop — kiểm tra riêng nguyên nhân khác Mobile
CLS Desktop (0,241) thấp hơn Mobile (0,374) nhưng vẫn ở mức "Trung bình" (chưa đạt Tốt). Vì màn hình Desktop rộng hơn, các phần tử gây shift trên Mobile (ảnh/canvas full-width) có thể ảnh hưởng ít hơn tỷ lệ % viewport — cần dùng Chrome DevTools → **Performance panel → Experience** để xem chính xác phần tử nào dịch chuyển trên Desktop (có thể khác phần tử gây CLS trên Mobile, ví dụ do Header sticky hoặc `Ecosystem`/`Services` section co giãn khi ảnh load).

### G.5. Đo lại sau khi sửa — mục tiêu Desktop
| Chỉ số | Trước | Mục tiêu sau khi sửa |
|---|---|---|
| Điểm hiệu suất tổng | 47/100 | ≥ 90/100 |
| TBT | 12.400ms | < 200ms |
| Speed Index | 7,0s | < 3,4s |
| CLS | 0,241 | < 0,1 |
| FCP/LCP | 0,8s (giữ nguyên, đã tốt) | Giữ nguyên |

---

## 2. QUY TRÌNH TRIỂN KHAI (thứ tự thực hiện đề xuất)

- [ ] **Bước 1:** Đo baseline hiện tại — lưu lại report PageSpeed gốc để so sánh trước/sau (đã có ảnh chụp trong yêu cầu này).
- [ ] **Bước 2 (chọn 1 trong 2 hướng, quyết định cùng team/PM trước khi code):**
  - **Hướng nhanh (khuyến nghị nếu cần fix gấp):** Triển khai A.1 — tắt 3D scene trên mobile, thay bằng gradient/ảnh tĩnh.
  - **Hướng giữ trải nghiệm 3D (nếu 3D là điểm nhấn thương hiệu bắt buộc):** Triển khai Checklist F (F.1–F.8) — giữ 3D nhưng tối ưu nặng cho mobile theo GPU tier thực tế.
- [ ] **Bước 3:** Triển khai A.3 (hoặc F.1 nếu chọn hướng giữ 3D) — sửa thuật toán detect tier, không dựa vào `hardwareConcurrency` một mình.
- [ ] **Bước 4:** Triển khai A.6/F.6 — sửa cấu hình `gl={{...}}` của Canvas (tắt antialias mobile, `powerPreference` phù hợp).
- [ ] **Bước 5:** Build + `ANALYZE=true npm run build` (A.7) — xác nhận bundle 3D tách chunk riêng, không tải trên mobile khi dùng A.1.
- [ ] **Bước 6:** Deploy lên staging → chạy lại PageSpeed Insights (mobile) → kiểm tra TBT đã giảm mạnh (mục tiêu < 1000ms ở bước này, dù chưa tối ưu hết).
- [ ] **Bước 7:** Sửa CLS — Checklist B (fadeIn keyframe, container Canvas, next/font fallback, next/image).
- [ ] **Bước 8:** Sửa non-composited animation — Checklist E (`force3D: true` cho GSAP, rà `box-shadow` animation).
- [ ] **Bước 9:** Cấu hình Cache-Control cho static assets — Checklist D.
- [ ] **Bước 10:** Kiểm tra render-blocking CSS/script bên thứ 3 — Checklist C.
- [ ] **Bước 11:** Triển khai **Checklist G** (G.1–G.4) — sửa logic tier `'ultra'` cho Desktop, giảm tải tính toán trong `useFrame` bất kể tier.
- [ ] **Bước 12:** Deploy production → chạy lại PageSpeed Insights (cả mobile & desktop) → so sánh với bảng số liệu ở Mục 0.1/0.2, xác nhận đạt ngưỡng "Tốt" (màu xanh) cho cả 5 chỉ số Core Web Vitals trên **cả 2 form factor**.
- [ ] **Bước 13:** Thiết lập giám sát định kỳ — bật **Chrome UX Report (CrUX)**/Search Console → **Core Web Vitals report** để theo dõi dữ liệu người dùng thật (field data), không chỉ dựa vào lab data của PageSpeed.

---

## 3. MỤC TIÊU SAU TỐI ƯU (kỳ vọng thực tế)

### Mobile
| Chỉ số | Trước | Mục tiêu sau Checklist A/F–E |
|---|---|---|
| TBT | 15.850ms | < 200ms |
| LCP | 4,7s | < 2,5s |
| FCP | 3,8s | < 1,8s |
| CLS | 0,374 | < 0,1 |
| Speed Index | 10,6s | < 3,4s |

### Desktop
| Chỉ số | Trước | Mục tiêu sau Checklist G |
|---|---|---|
| Điểm hiệu suất | 47/100 | ≥ 90/100 |
| TBT | 12.400ms | < 200ms |
| LCP | 0,8s | Giữ nguyên (đã tốt) |
| FCP | 0,8s | Giữ nguyên (đã tốt) |
| CLS | 0,241 | < 0,1 |
| Speed Index | 7,0s | < 3,4s |

> Riêng nhóm **Checklist A/F** (mobile) và **Checklist G** (desktop) — đều xoay quanh cùng 1 gốc rễ: JavaScript của cảnh 3D chiếm dụng main thread — dự kiến đóng góp **phần lớn** mức cải thiện cho cả 2 form factor. Nên làm và đo lại **ngay sau khi sửa xong phần 3D**, trước khi đầu tư thời gian vào các checklist chi tiết còn lại (B/C/D/E), để xác nhận đúng hướng trước khi tối ưu sâu hơn.
