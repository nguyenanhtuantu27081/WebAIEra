# 📚 Bài học Tối ưu PageSpeed Insights — Toàn diện

> **Nguồn thực chiến:** Rút ra từ quá trình tối ưu website [aiera.vn](https://aiera.vn) (ai-era-site)
> **Công cụ đo:** [PageSpeed Insights](https://pagespeed.web.dev/) / Google Lighthouse
> **Mục tiêu:** Đạt điểm xanh (90–100) trên cả **Mobile** và **Desktop** ở tất cả 4 hạng mục.

---

## Mục lục

1. [Tổng quan PageSpeed Insights](#1-tổng-quan-pagespeed-insights)
2. [PERFORMANCE — Hiệu suất](#2-performance--hiệu-suất)
3. [ACCESSIBILITY — Khả năng truy cập](#3-accessibility--khả-năng-truy-cập)
4. [BEST PRACTICES — Thực hành tốt nhất](#4-best-practices--thực-hành-tốt-nhất)
5. [SEO — Tối ưu công cụ tìm kiếm](#5-seo--tối-ưu-công-cụ-tìm-kiếm)
6. [Checklist triển khai nhanh](#6-checklist-triển-khai-nhanh)

---

## 1. Tổng quan PageSpeed Insights

PageSpeed Insights (PSI) sử dụng Lighthouse để đánh giá trang web qua **4 hạng mục chính**, mỗi hạng mục chấm điểm từ 0–100:

| Hạng mục | Ý nghĩa | Trọng số chính |
| :--- | :--- | :--- |
| **Performance** | Tốc độ tải, phản hồi, ổn định giao diện | FCP, LCP, TBT, CLS, SI |
| **Accessibility** | Khả năng sử dụng cho mọi người (bao gồm người khuyết tật) | ARIA, contrast, alt text, semantic HTML |
| **Best Practices** | Bảo mật, API hiện đại, không lỗi console | HTTPS, no deprecated APIs, no console errors |
| **SEO** | Khả năng lập chỉ mục, cấu trúc nội dung | meta tags, robots.txt, structured data |

### Điểm khác biệt giữa Mobile và Desktop

- **Mobile:** Lighthouse giả lập CPU chậm **4x** và mạng **Slow 4G** (~1.6 Mbps, RTT 150ms). Đây là lý do điểm Mobile luôn thấp hơn Desktop.
- **Desktop:** Không bóp CPU, mạng nhanh hơn. Tuy nhiên vẫn bị phạt nếu có render-blocking resources hoặc Long Tasks.

---

## 2. PERFORMANCE — Hiệu suất

Đây là hạng mục **khó đạt điểm cao nhất**, đặc biệt trên Mobile. Lighthouse tính điểm Performance dựa trên 5 chỉ số chính (Core Web Vitals + bổ sung):

### 2.1 Các chỉ số cốt lõi (Core Web Vitals)

#### FCP — First Contentful Paint (Trọng số: 10%)
> Thời điểm trình duyệt vẽ được nội dung đầu tiên (text, ảnh, SVG, canvas) lên màn hình.

**Mục tiêu:** < 1.8s (Mobile) / < 0.9s (Desktop)

**Nguyên nhân FCP chậm:**
- CSS render-blocking: Trình duyệt phải tải xong toàn bộ CSS trước khi vẽ.
- Font chữ chặn render (FOIT — Flash of Invisible Text).
- Script đồng bộ (synchronous) trong `<head>` tranh chấp băng thông.
- Server response chậm (TTFB cao).

**Giải pháp đã áp dụng:**
```html
<!-- ❌ SAI: 8 file CSS riêng lẻ chặn render -->
<link rel="stylesheet" href="./css/variables.css">
<link rel="stylesheet" href="./css/base.css">
<link rel="stylesheet" href="./css/typography.css">
<link rel="stylesheet" href="./css/layout.css">
<link rel="stylesheet" href="./css/components.css">
<link rel="stylesheet" href="./css/theme.css">
<link rel="stylesheet" href="./css/animations.css">
<link rel="stylesheet" href="./css/responsive.css">

<!-- ✅ ĐÚNG: Gộp thành 1 file bundle duy nhất -->
<link rel="stylesheet" href="./css/bundle.min.css">
```

```html
<!-- ❌ SAI: Google Fonts chặn render -->
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">

<!-- ✅ ĐÚNG: Tải font bất đồng bộ -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=...&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap"
      media="print" onload="this.media='all'">
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">
</noscript>
```

---

#### LCP — Largest Contentful Paint (Trọng số: 25%)
> Thời điểm phần tử nội dung lớn nhất (ảnh hero, heading lớn, video poster, canvas) hiển thị xong trên viewport.

**Mục tiêu:** < 2.5s (Mobile) / < 1.2s (Desktop)

**Nguyên nhân LCP chậm:**
- Render-blocking CSS/JS trì hoãn toàn bộ quá trình render.
- Ảnh hero/banner lớn chưa tối ưu (không lazy load, thiếu `width`/`height`).
- Font chữ chưa sẵn sàng khi vẽ heading lớn.
- Server response (TTFB) quá lâu.

**Giải pháp:**
- Gộp CSS thành 1 bundle (giảm request).
- Preload font chữ và ảnh hero nếu có: `<link rel="preload" as="image" href="hero.webp">`.
- Sử dụng format ảnh tối ưu: **WebP** hoặc **AVIF** thay vì PNG/JPG.
- Đặt `width` và `height` cố định cho ảnh LCP để tránh layout shift.
- **Preconnect** tới CDN bên ngoài để giảm DNS lookup + TLS handshake:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://www.googletagmanager.com">
```

---

#### TBT — Total Blocking Time (Trọng số: 30%)
> Tổng thời gian Main Thread bị block bởi các Long Tasks (> 50ms) trong khoảng từ FCP đến khi trang tương tác được (TTI).

**Mục tiêu:** < 200ms (Mobile) / < 150ms (Desktop)

**Đây là chỉ số có trọng số CAO NHẤT (30%)** — ảnh hưởng lớn nhất đến điểm Performance.

**Nguyên nhân TBT cao:**
- JavaScript nặng chạy ngay khi tải trang (VD: khởi tạo Three.js, tính toán hình học 3D, particles).
- Third-party scripts (GTM, analytics, chat widgets) tranh chấp CPU.
- Post-processing effects (Bloom, FXAA) gây Long Tasks trên GPU → callback chậm lại.

**Giải pháp đã áp dụng:**

```js
// ❌ SAI: Khởi chạy animation loop ngay lập tức → block Main Thread
renderer.setAnimationLoop(animate);

// ✅ ĐÚNG: Trì hoãn khởi tạo 3D sau khi trình duyệt rảnh
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    renderer.setAnimationLoop(animate);
  }, { timeout: 800 });
} else {
  requestAnimationFrame(() => {
    renderer.setAnimationLoop(animate);
  });
}
```

```js
// ❌ SAI: Google Tag Manager tải đồng bộ chặn render
<script async src="https://www.googletagmanager.com/gtag/js?id=G-LS0X2ERLBL"></script>

// ✅ ĐÚNG: Trì hoãn GTM đến khi trình duyệt rảnh hoặc user tương tác
function loadGTM() {
  if (window.gtmLoaded) return;
  window.gtmLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-LS0X2ERLBL';
  document.head.appendChild(s);
  gtag('js', new Date());
  gtag('config', 'G-LS0X2ERLBL');
}
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadGTM, { timeout: 2500 });
} else {
  setTimeout(loadGTM, 1500);
}
// Kích hoạt khi user tương tác lần đầu
['scroll', 'keydown', 'touchstart', 'click'].forEach(e => {
  window.addEventListener(e, loadGTM, { once: true, passive: true });
});
```

**Giảm tải 3D cho thiết bị yếu (quality-tier):**
```js
// Điều chỉnh cấu hình theo khả năng thiết bị
export const TIER_CONFIG = {
  LOW:    { particles: 120,  dpr: 1,    bloom: 0,    lights: 1 },  // Mobile nhỏ
  MEDIUM: { particles: 400,  dpr: 1.25, bloom: 0.35, lights: 2 },  // Tablet
  HIGH:   { particles: 900,  dpr: 1.5,  bloom: 0.7,  lights: 2 },  // Desktop HD
  ULTRA:  { particles: 1600, dpr: 1.75, bloom: 0.9,  lights: 3 }   // Desktop 2K+
};
```

---

#### CLS — Cumulative Layout Shift (Trọng số: 25%)
> Đo lường mức độ các phần tử trên trang bị dịch chuyển bất ngờ trong quá trình tải.

**Mục tiêu:** < 0.1

**Nguyên nhân CLS cao:**
- Ảnh/video thiếu `width` và `height` → trình duyệt không biết kích thước trước khi tải xong.
- Font chữ thay đổi kích thước khi swap từ fallback sang custom font.
- Quảng cáo/banner inject động.
- Thanh thông báo (cookie consent, notification bar) đẩy nội dung xuống.

**Giải pháp:**
```html
<!-- Luôn đặt width/height cho ảnh -->
<img src="hero.webp" width="800" height="450" alt="..." loading="lazy">

<!-- Sử dụng CSS aspect-ratio cho container -->
<style>
  .hero-img { aspect-ratio: 16/9; width: 100%; }
</style>

<!-- Font display swap (tránh FOIT nhưng chấp nhận FOUT nhẹ) -->
<!-- Đã bao gồm &display=swap trong URL Google Fonts -->
```

---

#### SI — Speed Index (Trọng số: 10%)
> Đo tốc độ nội dung hiển thị trực quan trên viewport. Tính bằng cách phân tích video quay quá trình tải trang.

**Mục tiêu:** < 3.4s (Mobile) / < 1.3s (Desktop)

**Giải pháp:** Tất cả các tối ưu cho FCP và LCP đều cải thiện Speed Index. Đặc biệt:
- Inline Critical CSS (CSS thiết yếu cho màn hình đầu tiên) vào `<head>` nếu cần.
- Lazy load mọi tài nguyên không hiển thị trên viewport ban đầu.

---

### 2.2 Tối ưu hóa Nginx Web Server

```nginx
# ❌ SAI: Ngưỡng nén quá cao, bỏ sót file nhỏ
gzip_min_length 10240;

# ✅ ĐÚNG: Nén mọi file từ 256 bytes trở lên
gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_proxied any;
gzip_comp_level 6;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/x-javascript
    application/xml
    application/json
    image/svg+xml
    font/woff2;
```

**Cache-Control cho tài nguyên tĩnh:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|css|js|woff|woff2|ttf|eot)$ {
    root /usr/share/nginx/html;
    expires 365d;                                    # Cache lâu dài
    add_header Cache-Control "public, immutable";    # Immutable = không cần revalidate
    access_log off;
}
```

---

### 2.3 Bảng tổng hợp kỹ thuật giảm từng chỉ số

| Chỉ số | Kỹ thuật tối ưu chính |
| :--- | :--- |
| **FCP** | Gộp CSS, async font, preconnect, giảm TTFB |
| **LCP** | Preload ảnh hero, WebP/AVIF, preconnect CDN, inline critical CSS |
| **TBT** | Defer JS nặng (Three.js), requestIdleCallback, defer GTM, giảm particles/bloom |
| **CLS** | width/height cho ảnh, aspect-ratio, font display swap |
| **SI** | Tất cả các kỹ thuật trên cộng hưởng |

---

## 3. ACCESSIBILITY — Khả năng truy cập

### 3.1 Các quy tắc cốt lõi

#### Thuộc tính `alt` cho ảnh
```html
<!-- ❌ SAI -->
<img src="logo.webp">

<!-- ✅ ĐÚNG -->
<img src="logo.webp" alt="Logo AI Era - Hệ sinh thái trí tuệ nhân tạo">

<!-- Ảnh trang trí thuần túy: dùng alt rỗng -->
<img src="decorative-line.svg" alt="">
```

#### Thuộc tính `aria-label` cho nút tương tác
```html
<!-- ❌ SAI: Nút chỉ có icon, không có label -->
<button>✕</button>

<!-- ✅ ĐÚNG -->
<button aria-label="Đóng hộp thoại">✕</button>

<!-- Đã áp dụng cho lang switch: -->
<button data-lang="vi" class="lang-btn active" aria-label="Tiếng Việt">VI</button>
<button data-lang="en" class="lang-btn" aria-label="English">EN</button>
```

#### Cấu trúc heading đúng thứ bậc
```html
<!-- ❌ SAI: Nhảy từ h1 sang h3, bỏ qua h2 -->
<h1>Tiêu đề chính</h1>
<h3>Tiêu đề phụ</h3>

<!-- ✅ ĐÚNG: Thứ bậc liên tục -->
<h1>Tiêu đề chính</h1>
<h2>Tiêu đề phụ</h2>
<h3>Tiêu đề con</h3>
```

#### Contrast ratio (Tỷ lệ tương phản)
- **Chữ nhỏ (< 18px bold / < 14px):** Tỷ lệ tương phản tối thiểu **4.5:1**
- **Chữ lớn (≥ 18px bold / ≥ 14px):** Tỷ lệ tương phản tối thiểu **3:1**
- Kiểm tra bằng: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

```css
/* ❌ SAI: Chữ xám quá nhạt trên nền tối */
color: #555;  /* trên background #030305 → contrast ~2.5:1 */

/* ✅ ĐÚNG: Đủ tương phản */
color: #8a8a93;  /* trên background #030305 → contrast ~4.7:1 */
```

### 3.2 Semantic HTML
```html
<!-- Sử dụng thẻ semantic thay vì div chung chung -->
<nav>...</nav>           <!-- Thanh điều hướng -->
<main>...</main>         <!-- Nội dung chính -->
<section>...</section>   <!-- Phần nội dung có chủ đề -->
<article>...</article>   <!-- Bài viết độc lập -->
<aside>...</aside>       <!-- Nội dung bên lề (HUD panel) -->
<footer>...</footer>     <!-- Chân trang -->
```

### 3.3 Thuộc tính `lang` trên thẻ `<html>`
```html
<!-- Bắt buộc khai báo ngôn ngữ -->
<html lang="vi">  <!-- Tiếng Việt -->
<html lang="en">  <!-- Tiếng Anh -->
```

---

## 4. BEST PRACTICES — Thực hành tốt nhất

### 4.1 HTTPS
- Mọi tài nguyên (ảnh, CSS, JS, font) đều phải được tải qua **HTTPS**.
- Không được có mixed content (HTTP lẫn trong trang HTTPS).

### 4.2 Không dùng API đã lỗi thời (Deprecated APIs)
```js
// ❌ SAI: document.write chặn parser
document.write('<script src="..."></script>');

// ✅ ĐÚNG: Tạo element động
const s = document.createElement('script');
s.src = '...';
document.head.appendChild(s);
```

### 4.3 Không có lỗi trong Browser Console
- Kiểm tra không có lỗi JavaScript nào trong DevTools Console.
- Kiểm tra không có lỗi 404 (tài nguyên thiếu).
- Tránh `console.log` trong production code.

### 4.4 Thuộc tính bảo mật cho link ngoài
```html
<!-- ❌ SAI: Link mở tab mới không an toàn -->
<a href="https://external.com" target="_blank">Link</a>

<!-- ✅ ĐÚNG: Thêm rel="noopener" (ngăn tab mới truy cập window.opener) -->
<a href="https://external.com" target="_blank" rel="noopener">Link</a>
```

### 4.5 Ảnh có đúng tỷ lệ (Aspect Ratio)
- Ảnh hiển thị phải có kích thước gốc ≥ kích thước hiển thị (tránh ảnh mờ do scale up).
- Sử dụng `srcset` cho responsive images:
```html
<img src="photo-800.webp"
     srcset="photo-400.webp 400w, photo-800.webp 800w, photo-1200.webp 1200w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="Mô tả ảnh">
```

### 4.6 Passive Event Listeners
```js
// ❌ SAI: scroll/touch listener chặn scrolling
addEventListener('scroll', handler);
addEventListener('touchstart', handler);

// ✅ ĐÚNG: Đánh dấu passive để trình duyệt scroll mượt mà
addEventListener('scroll', handler, { passive: true });
addEventListener('touchstart', handler, { passive: true });
addEventListener('resize', handler, { passive: true });
```

---

## 5. SEO — Tối ưu công cụ tìm kiếm

### 5.1 Meta tags bắt buộc
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Title: 50-60 ký tự, chứa từ khóa chính -->
  <title>AI Automation & AI Agent — AI Era</title>

  <!-- Description: 120-160 ký tự, hấp dẫn và chứa từ khóa -->
  <meta name="description" content="AI Era — AI Automation & AI Agent: tự động hoá quy trình nghiệp vụ, triển khai AI Agent xử lý khách hàng.">

  <!-- Theme color cho mobile browser -->
  <meta name="theme-color" content="#030305">
</head>
```

### 5.2 Cấu trúc Heading
```html
<!-- Mỗi trang chỉ có DUY NHẤT 1 thẻ h1 -->
<h1>Tiêu đề chính của trang (chứa từ khóa)</h1>
<h2>Phân đoạn lớn</h2>
<h3>Chi tiết</h3>
```

### 5.3 robots.txt
```txt
User-agent: *
Allow: /

Sitemap: https://aiera.vn/sitemap.xml
```

### 5.4 sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aiera.vn/</loc>
    <lastmod>2026-08-25</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aiera.vn/ai-automation-ai-agent</loc>
    <lastmod>2026-08-25</lastmod>
    <priority>0.8</priority>
  </url>
  <!-- ... các trang khác -->
</urlset>
```

### 5.5 Canonical URL (Tránh duplicate content)
```html
<link rel="canonical" href="https://aiera.vn/ai-automation-ai-agent">
```

### 5.6 Structured Data (Schema.org)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Era",
  "url": "https://aiera.vn",
  "description": "Hệ sinh thái trí tuệ nhân tạo đa chiều",
  "sameAs": []
}
</script>
```

### 5.7 Link Crawlable
```html
<!-- ❌ SAI: Link bằng JS, bot không crawl được -->
<a onclick="navigate('/page')">Link</a>
<a href="javascript:void(0)">Link</a>

<!-- ✅ ĐÚNG: Link HTML chuẩn -->
<a href="/ai-automation-ai-agent">AI Automation</a>
```

### 5.8 Thuộc tính `hreflang` (Đa ngôn ngữ)
```html
<!-- Nếu có phiên bản đa ngôn ngữ -->
<link rel="alternate" hreflang="vi" href="https://aiera.vn/">
<link rel="alternate" hreflang="en" href="https://aiera.vn/en/">
<link rel="alternate" hreflang="x-default" href="https://aiera.vn/">
```

---

## 6. Checklist triển khai nhanh

### ✅ Performance
- [ ] Gộp tất cả CSS thành 1 file bundle duy nhất
- [ ] Tải Google Fonts bất đồng bộ (`preload` + `media="print" onload`)
- [ ] Preconnect tới mọi CDN bên ngoài
- [ ] Trì hoãn GTM/GA4 (requestIdleCallback hoặc sau tương tác)
- [ ] Defer/lazy init mọi JS nặng (Three.js, animation libraries)
- [ ] Giảm particles/effects trên Mobile (quality-tier system)
- [ ] Ảnh dùng format WebP/AVIF + lazy loading
- [ ] Ảnh có width/height cố định (tránh CLS)
- [ ] Nginx: gzip_min_length 256, comp_level 6
- [ ] Nginx: Cache-Control 365d + immutable cho static assets
- [ ] Passive event listeners cho scroll/touch/resize

### ✅ Accessibility
- [ ] Mọi ảnh có thuộc tính `alt` (hoặc `alt=""` nếu trang trí)
- [ ] Mọi nút bấm/link tương tác có `aria-label` nếu không có text
- [ ] Thẻ `<html lang="vi">` đúng ngôn ngữ
- [ ] Heading theo thứ bậc (h1 → h2 → h3, không nhảy cóc)
- [ ] Contrast ratio đạt chuẩn WCAG 2.1 AA (≥ 4.5:1)
- [ ] Sử dụng semantic HTML (nav, main, section, aside, footer)

### ✅ Best Practices
- [ ] Toàn bộ tài nguyên qua HTTPS (không mixed content)
- [ ] Không dùng API deprecated (document.write, etc.)
- [ ] Không có lỗi trong browser console
- [ ] Link target="_blank" có rel="noopener"
- [ ] Không console.log trong production

### ✅ SEO
- [ ] Mỗi trang có `<title>` riêng biệt, chứa từ khóa (50-60 ký tự)
- [ ] Mỗi trang có `<meta name="description">` (120-160 ký tự)
- [ ] Mỗi trang chỉ có 1 thẻ `<h1>`
- [ ] Có robots.txt với Sitemap
- [ ] Có sitemap.xml liệt kê tất cả URL
- [ ] Link crawlable (href thật, không dùng JS navigation)
- [ ] Canonical URL cho mỗi trang
- [ ] Structured Data (JSON-LD) nếu phù hợp

---

## 💡 Nguyên tắc vàng

1. **Gộp & Nén:** Càng ít request HTTP càng tốt. Gộp CSS, gộp JS, nén gzip/brotli.
2. **Trì hoãn thông minh:** Chỉ tải ngay những gì cần cho FCP/LCP. Mọi thứ khác defer/lazy.
3. **Tối ưu theo thiết bị:** Mobile khác Desktop. Dùng quality-tier system để giảm tải cho thiết bị yếu.
4. **Đo lường liên tục:** Chạy PageSpeed Insights sau mỗi lần deploy để theo dõi điểm số.
5. **Third-party = Kẻ thù của Performance:** GTM, analytics, chat widgets, social embeds — tất cả đều phải defer hoặc lazy load.
