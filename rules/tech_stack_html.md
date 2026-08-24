# AI Era — Production HTML Website Tech Stack

## 1. Mục tiêu

AI Era sẽ được phát triển thành **website công ty thực tế** nhưng ưu tiên kiến trúc đơn giản, dễ triển khai và đầu ra trực tiếp là các file:

```txt
.html
.css
.js
.json
```

Website không bắt buộc phải dùng Next.js hoặc React.

Mục tiêu là giữ được trải nghiệm 3D cao cấp của Three.js nhưng vẫn:

- Dễ mở trực tiếp trên trình duyệt.
- Dễ upload lên hosting/CDN.
- Dễ chỉnh sửa từng file.
- Tối ưu SEO.
- Responsive trên desktop, laptop, tablet và mobile.
- Có Day Mode / Night Mode.
- Hỗ trợ đa ngôn ngữ.
- Có thể tích hợp backend/API sau này.
- Có thể nâng cấp dần mà không cần viết lại giao diện.

---

# 2. Kiến trúc tổng thể

Stack cốt lõi:

```txt
HTML5
CSS3
JavaScript ES Modules
Three.js
GSAP
JSON
WebGL
```

Kiến trúc:

```txt
Browser
│
├── HTML
│   ├── Semantic Content
│   ├── Navigation
│   ├── Service Sections
│   ├── SEO Content
│   ├── Modal / Panel
│   └── CTA
│
├── CSS
│   ├── Design System
│   ├── Day / Night Theme
│   ├── Responsive Layout
│   ├── Glass UI
│   └── Mobile UI
│
└── JavaScript
    │
    ├── Three.js
    │   ├── AI Era Core
    │   ├── Business Nodes
    │   ├── Camera
    │   ├── Particle System
    │   ├── Lighting
    │   └── Post Processing
    │
    ├── GSAP
    │   ├── Camera Flight
    │   ├── Page Animation
    │   └── Scroll Animation
    │
    ├── Theme Manager
    ├── Language Manager
    ├── Responsive Controller
    └── API Client
```

---

# 3. HTML5

HTML là nền tảng chính của website.

Trang chủ:

```txt
index.html
```

Các trang dịch vụ:

```txt
ai-automation.html
ai-agent.html
digital-marketing.html
quantitative-equity-analysis.html
ai-driven-seo-web-design.html
ispa.html
```

Các trang công ty:

```txt
about.html
contact.html
case-studies.html
insights.html
```

HTML phải dùng semantic markup:

```html
<header>
<nav>
<main>
<section>
<article>
<aside>
<footer>
```

Không để toàn bộ nội dung trong Three.js canvas.

Nguyên tắc:

```txt
Three.js = trải nghiệm hình ảnh
HTML = nội dung thật
```

Điều này giúp:

- Google index tốt.
- AI search đọc được nội dung.
- Accessibility tốt.
- Mobile fallback tốt.
- SEO không phụ thuộc JavaScript 3D.

---

# 4. Three.js — Engine 3D chính

Three.js là công nghệ cốt lõi để tạo visual identity của AI Era.

Sử dụng:

```txt
Three.js
WebGLRenderer
PerspectiveCamera
EffectComposer
UnrealBloomPass
GLTFLoader
Raycaster
```

Three.js chịu trách nhiệm:

- Hạt nhân AI Era.
- Không gian 3D.
- 6 node lĩnh vực.
- Energy rings.
- Neural particles.
- Connection lines.
- Camera flight.
- Zoom bằng mouse wheel.
- Drag xoay 360°.
- Node hover.
- Node click.
- Fog.
- Lighting.
- Bloom.
- Background spatial particles.

---

# 5. AI Era Core

Hạt nhân AI Era là visual trung tâm.

Cấu trúc đề xuất:

```txt
AI Era Core
│
├── Neural Core
├── Energy Sphere
├── Wireframe Shell
├── Particle Shell
├── Orbital Rings
├── Neural Connections
├── Glow Layer
└── AI ERA HTML Label
```

Không nên render chữ "AI Era" bằng texture 3D nếu không cần thiết.

Nên dùng HTML overlay:

```html
<div class="ai-era-core-label">
    <strong>AI Era</strong>
    <span>Core Intelligence</span>
</div>
```

Ưu điểm:

- Chữ sắc nét.
- Responsive tốt.
- SEO tốt.
- Dễ đổi font.
- Dễ đổi ngôn ngữ.

---

# 6. Các lĩnh vực trong AI Era Universe

Các node:

```txt
AI Automation

AI Agent

Digital Marketing

Quantitative Equity Analysis

AI-driven SEO Web Design

SaaS iSpa
```

Mỗi lĩnh vực có:

```txt
3D Node
HTML Label
Color Identity
Description
URL
Camera Position
Camera LookAt
```

Ví dụ dữ liệu:

```js
export const nodes = [
  {
    id: "ai-automation",
    title: "AI Automation",
    url: "ai-automation.html",
    position: [5, 2, -1],
    color: "#818cf8"
  }
];
```

---

# 7. Camera System

Camera là một trong những thành phần quan trọng nhất.

Cần hỗ trợ:

```txt
Mouse Parallax

Left Mouse Drag
360° Rotation

Mouse Wheel Zoom

Camera Flight

Node Focus

Return to Core

Mobile Touch Drag

Mobile Pinch Zoom
```

---

## Camera Flight

Khi click node:

```txt
User clicks AI Agent
        ↓
Disable free camera
        ↓
Calculate node world position
        ↓
Camera rotates toward target
        ↓
Camera flies toward node
        ↓
Node becomes active
        ↓
Information panel appears
```

Animation nên dùng:

```txt
GSAP
```

Ví dụ:

```js
gsap.to(camera.position, {
  x: target.x,
  y: target.y,
  z: target.z,
  duration: 1.5,
  ease: "power3.inOut"
});
```

---

# 8. GSAP

GSAP được sử dụng cho cinematic animation.

Stack:

```txt
GSAP
ScrollTrigger
```

Ứng dụng:

- Camera flight.
- Hero introduction.
- Text reveal.
- Navigation animation.
- Modal.
- Service transitions.
- Scroll storytelling.
- Section reveal.

Không nên dùng GSAP để render Three.js.

Three.js render scene.

GSAP chỉ animate property.

---

# 9. CSS Architecture

CSS nên chia thành nhiều file.

```txt
/css
│
├── reset.css
├── variables.css
├── typography.css
├── layout.css
├── components.css
├── theme.css
├── responsive.css
└── animations.css
```

---

# 10. Design System

Sử dụng CSS Variables.

Ví dụ:

```css
:root {
  --font-primary: "Plus Jakarta Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  --accent-indigo: #818cf8;
  --accent-cyan: #67e8f9;
  --accent-purple: #c084fc;

  --radius-sm: 10px;
  --radius-md: 18px;
  --radius-lg: 28px;
}
```

---

# 11. Typography

Font chính:

```txt
Plus Jakarta Sans
```

Font kỹ thuật:

```txt
JetBrains Mono
```

Sử dụng:

```txt
Plus Jakarta Sans
- Heading
- Body
- Navigation
- CTA
- Service Content

JetBrains Mono
- HUD
- Node Number
- Technical Labels
- Coordinates
- System Information
```

---

# 12. Night Mode

Night Mode là nhận diện mặc định của AI Era.

Ví dụ:

```css
[data-theme="dark"] {
  --background: #030305;
  --surface: rgba(255,255,255,.04);
  --border: rgba(255,255,255,.08);

  --text-primary: #ffffff;
  --text-secondary: #8a8a93;

  --accent: #818cf8;
}
```

Three.js Night Mode:

```txt
Dark Background
High Bloom
Indigo Light
Cyan Light
Purple Glow
Visible Stars
Dark Fog
```

---

# 13. Day Mode

Day Mode phải có thiết kế riêng.

Không chỉ đơn giản đảo màu.

Ví dụ:

```css
[data-theme="light"] {
  --background: #f5f7fb;
  --surface: rgba(255,255,255,.72);
  --border: rgba(15,23,42,.10);

  --text-primary: #11131a;
  --text-secondary: #626773;

  --accent: #6366f1;
}
```

Three.js Day Mode:

```txt
Bright Environment
Low Bloom
Soft Indigo
Pearl Materials
Light Fog
Lower Particle Contrast
Soft Shadows
```

---

# 14. Theme Manager

File:

```txt
/js/theme.js
```

Hỗ trợ:

```txt
System
Light
Dark
```

Ví dụ:

```js
const savedTheme = localStorage.getItem("theme");

const systemDark =
  window.matchMedia("(prefers-color-scheme: dark)").matches;
```

Lưu lựa chọn:

```js
localStorage.setItem("theme", theme);
```

HTML:

```html
<html data-theme="dark">
```

---

# 15. Three.js Theme Synchronization

Khi người dùng đổi theme:

```txt
CSS Theme
    +
Three.js Theme
```

Ví dụ:

```js
function updateThreeTheme(theme) {

  if (theme === "dark") {

    scene.background = new THREE.Color("#030305");

    bloomPass.strength = 1.2;

  } else {

    scene.background = new THREE.Color("#f5f7fb");

    bloomPass.strength = 0.45;
  }
}
```

---

# 16. Responsive Design

Website cần responsive từ đầu.

Breakpoints tham khảo:

```txt
Mobile
320px - 639px

Large Mobile
640px - 767px

Tablet
768px - 1023px

Laptop
1024px - 1439px

Desktop
1440px - 1919px

4K
1920px+
```

---

# 17. Desktop Experience

Desktop có trải nghiệm đầy đủ:

```txt
Full Three.js Scene
6 Spatial Nodes
Advanced Particles
Camera Flight
Mouse Hover
360° Drag
Wheel Zoom
HUD
Glass Panels
Bloom
```

---

# 18. Tablet Experience

Tablet:

```txt
Touch Drag
Pinch Zoom
Reduced HUD
Reduced Particle Count
Reduced Bloom
Simplified Node Labels
```

---

# 19. Mobile Experience

Mobile phải được thiết kế riêng.

Không scale desktop trực tiếp xuống.

Đề xuất:

```txt
AI Era Core
      ↓
Swipe
      ↓
Node Carousel
      ↓
Tap Node
      ↓
Camera Focus
      ↓
Service Panel
```

Three.js mobile:

```txt
Lower Geometry
Lower Particles
DPR <= 1.5
Reduced Bloom
Fewer Lights
No expensive DOF
```

---

# 20. Touch Interaction

Desktop:

```txt
Mouse Move
Mouse Drag
Mouse Wheel
Click
```

Mobile:

```txt
Touch Drag
Tap
Double Tap
Pinch Zoom
Swipe
```

File:

```txt
/js/input-controller.js
```

Có thể dùng Pointer Events API:

```js
pointerdown
pointermove
pointerup
pointercancel
```

Pointer Events giúp dùng chung logic cho:

```txt
Mouse
Touch
Pen
```

---

# 21. Adaptive Performance

Website tự giảm chất lượng theo thiết bị.

Quality profiles:

```txt
LOW
MEDIUM
HIGH
ULTRA
```

### LOW

```txt
Particles: 250
DPR: 1
Bloom: Off
Lights: 1
Simple Materials
```

### MEDIUM

```txt
Particles: 600
DPR: 1.25
Bloom: Low
Lights: 2
```

### HIGH

```txt
Particles: 1400
DPR: 1.75
Bloom: Medium
Lights: 3
```

### ULTRA

```txt
Particles: 2500+
DPR: 2
Bloom: High
Shader Effects
Advanced Materials
```

---

# 22. Multi-language

Website hỗ trợ đa ngôn ngữ mà không cần framework.

Giai đoạn đầu:

```txt
Vietnamese
English
```

Mở rộng:

```txt
Japanese
Korean
Chinese
French
German
```

---

# 23. i18n Architecture

Cấu trúc:

```txt
/locales
│
├── vi.json
├── en.json
├── ja.json
└── ko.json
```

Ví dụ:

```json
{
  "hero.title": "Intelligence in motion.",
  "hero.description": "Explore the AI Era ecosystem.",
  "nodes.aiAgent": "AI Agent"
}
```

---

# 24. Language Manager

File:

```txt
/js/i18n.js
```

HTML:

```html
<h1 data-i18n="hero.title"></h1>
```

JavaScript:

```js
async function loadLanguage(locale) {

  const response =
    await fetch(`./locales/${locale}.json`);

  const messages =
    await response.json();

  document
    .querySelectorAll("[data-i18n]")
    .forEach(el => {

      const key =
        el.dataset.i18n;

      el.textContent =
        messages[key] || key;
    });
}
```

---

# 25. Multi-language SEO

Nếu website cần SEO mạnh theo từng thị trường, nên tạo URL riêng.

Ví dụ:

```txt
/en/index.html
/vi/index.html
```

Hoặc:

```txt
/en/ai-agent.html
/vi/ai-agent.html
```

HTML head:

```html
<link
  rel="alternate"
  hreflang="en"
  href="https://ai-era.com/en/ai-agent.html">

<link
  rel="alternate"
  hreflang="vi"
  href="https://ai-era.com/vi/ai-agent.html">
```

Cách này tốt hơn chỉ đổi text bằng JavaScript nếu SEO đa ngôn ngữ là yêu cầu quan trọng.

---

# 26. SEO

Mỗi trang `.html` phải có:

```txt
<title>

meta description

canonical

Open Graph

Twitter Card

Structured Data

H1

Semantic Content
```

Ví dụ:

```html
<title>
AI Automation | AI Era
</title>

<meta
  name="description"
  content="AI Era builds intelligent automation systems...">
```

---

# 27. AI SEO

Website cần tối ưu để AI search hiểu rõ các entity và dịch vụ.

Nội dung nên có:

```txt
Clear definitions

Service descriptions

FAQ

Use cases

Case studies

Industry terminology

Comparison content

Structured headings

Structured data
```

Không đặt nội dung chính trong canvas.

---

# 28. Structured Data

Dùng JSON-LD:

```txt
Organization

WebSite

Service

SoftwareApplication

Article

FAQPage

BreadcrumbList
```

Ví dụ:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Era"
}
</script>
```

---

# 29. JavaScript Architecture

Không nên viết toàn bộ code trong `index.html`.

Cấu trúc:

```txt
/js
│
├── main.js
├── three-scene.js
├── ai-era-core.js
├── business-nodes.js
├── camera-controller.js
├── particle-system.js
├── effects.js
├── input-controller.js
├── theme.js
├── i18n.js
├── api.js
└── analytics.js
```

---

# 30. ES Modules

HTML:

```html
<script type="module" src="./js/main.js"></script>
```

JavaScript:

```js
import {
  initScene
} from "./three-scene.js";

import {
  initTheme
} from "./theme.js";

import {
  initLanguage
} from "./i18n.js";
```

Điều này giúp website HTML thuần vẫn có kiến trúc module rõ ràng.

---

# 31. Three.js Import

Có thể dùng CDN với Import Map:

```html
<script type="importmap">
{
  "imports": {
    "three":
      "https://cdn.jsdelivr.net/npm/three/build/three.module.js",

    "three/addons/":
      "https://cdn.jsdelivr.net/npm/three/examples/jsm/"
  }
}
</script>
```

Hoặc production nên dùng npm + Vite build.

---

# 32. Development Tooling

Dù đầu ra cuối cùng là `.html`, nên dùng Vite trong quá trình development.

Stack:

```txt
Vite
HTML
CSS
JavaScript
Three.js
GSAP
```

Vite hỗ trợ:

- Dev server.
- Hot reload.
- ES modules.
- Minification.
- Asset optimization.
- Production build.

Output:

```txt
/dist
│
├── index.html
├── assets/
├── css/
└── js/
```

Kết quả vẫn là website HTML tĩnh.

---

# 33. Cấu trúc dự án đề xuất

```txt
ai-era/
│
├── index.html
├── about.html
├── contact.html
│
├── ai-automation.html
├── ai-agent.html
├── digital-marketing.html
├── quantitative-equity-analysis.html
├── ai-driven-seo-web-design.html
├── ispa.html
│
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── theme.css
│   └── responsive.css
│
├── js/
│   ├── main.js
│   ├── three-scene.js
│   ├── ai-era-core.js
│   ├── business-nodes.js
│   ├── camera-controller.js
│   ├── particle-system.js
│   ├── effects.js
│   ├── input-controller.js
│   ├── theme.js
│   ├── i18n.js
│   ├── api.js
│   └── analytics.js
│
├── locales/
│   ├── vi.json
│   └── en.json
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── models/
│   └── textures/
│
├── robots.txt
├── sitemap.xml
└── manifest.webmanifest
```

---

# 34. API Integration

Website `.html` vẫn có thể kết nối backend qua:

```txt
REST API
GraphQL
WebSocket
Server-Sent Events
```

Ví dụ:

```js
const response =
  await fetch(
    "https://api.ai-era.com/contact",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify(data)
    }
  );
```

---

# 35. Contact Form

Không nên để email logic trực tiếp trong HTML.

Kiến trúc:

```txt
contact.html
     ↓
JavaScript
     ↓
API Endpoint
     ↓
Email / CRM
```

Có thể kết nối:

```txt
CRM

Email Service

Marketing Automation

AI Lead Qualification
```

---

# 36. CMS

Website HTML vẫn có thể sử dụng Headless CMS.

Ví dụ:

```txt
Sanity
Strapi
Payload
Contentful
```

Flow:

```txt
CMS
 ↓
Build Script
 ↓
HTML Pages
 ↓
CDN
```

Hoặc frontend fetch API runtime khi phù hợp.

---

# 37. AI Integration

Không gọi AI API trực tiếp từ browser bằng secret key.

Đúng:

```txt
HTML Website
    ↓
AI Era API
    ↓
AI Gateway
    ↓
AI Model
```

Sai:

```txt
HTML
 ↓
Secret AI API Key
```

Các tính năng có thể tích hợp:

```txt
AI Assistant

AI Chat

AI Search

AI Agent

AI Lead Qualification

AI Recommendation

AI Support
```

---

# 38. Quantitative Equity Analysis

Frontend:

```txt
HTML
CSS
JavaScript
Three.js
Chart Library
```

Backend nên dùng:

```txt
Python

FastAPI

Pandas

Polars

NumPy

PostgreSQL
```

Kiến trúc:

```txt
quantitative-equity-analysis.html
          ↓
       REST API
          ↓
       FastAPI
          ↓
 Quantitative Engine
```

---

# 39. SaaS iSpa

Trang marketing:

```txt
ispa.html
```

Ứng dụng SaaS về sau có thể tách:

```txt
app.ispa.ai-era.com
```

Không bắt buộc ứng dụng SaaS phải dùng cùng stack `.html` với website marketing.

Website công ty và app SaaS có thể dùng kiến trúc khác nhau.

---

# 40. Performance

Mục tiêu:

```txt
LCP < 2.5s

CLS < 0.1

INP < 200ms
```

Three.js phải load có chiến lược.

Ví dụ:

```txt
1. HTML render trước

2. CSS render

3. Main content hiển thị

4. Three.js load

5. 3D scene initialize

6. High-resolution assets load sau
```

---

# 41. Lazy Loading Three.js

Có thể load Three.js sau hero content:

```js
window.addEventListener(
  "load",
  async () => {

    const module =
      await import(
        "./three-scene.js"
      );

    module.initScene();
  }
);
```

---

# 42. Image Optimization

Sử dụng:

```txt
AVIF
WebP
SVG
```

Không tải ảnh quá lớn.

Responsive images:

```html
<picture>
  <source
    srcset="hero.avif"
    type="image/avif">

  <source
    srcset="hero.webp"
    type="image/webp">

  <img
    src="hero.jpg"
    alt="AI Era">
</picture>
```

---

# 43. 3D Asset Optimization

Model:

```txt
GLB
GLTF
```

Compression:

```txt
Draco
Meshopt
```

Textures:

```txt
KTX2
Basis
```

Không dùng model nặng nếu geometry procedural bằng Three.js đã đủ đẹp.

---

# 44. Accessibility

Hỗ trợ:

```txt
Keyboard navigation

ARIA

Semantic HTML

Contrast

Focus State

Reduced Motion
```

CSS:

```css
@media
(prefers-reduced-motion: reduce) {

  .animated {
    animation: none;
  }
}
```

JavaScript:

```js
const reduceMotion =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
```

Nếu true:

```txt
Disable Auto Rotation

Reduce Camera Flight

Reduce Particles

Disable Heavy Effects
```

---

# 45. Progressive Enhancement

Website phải hoạt động kể cả khi WebGL không khả dụng.

Kiến trúc:

```txt
HTML Content
     ↓
CSS UI
     ↓
JavaScript Enhancements
     ↓
Three.js 3D Experience
```

Nếu Three.js lỗi:

```txt
Website vẫn đọc được

Menu vẫn hoạt động

Services vẫn hiển thị

Contact vẫn hoạt động

SEO không bị ảnh hưởng
```

---

# 46. WebGL Detection

Ví dụ:

```js
function supportsWebGL() {

  try {

    const canvas =
      document.createElement("canvas");

    return !!(
      window.WebGLRenderingContext &&
      (
        canvas.getContext("webgl") ||
        canvas.getContext(
          "experimental-webgl"
        )
      )
    );

  } catch {

    return false;
  }
}
```

Nếu không hỗ trợ:

```txt
Disable Three.js

Show static visual
```

---

# 47. Analytics

Có thể tích hợp:

```txt
Google Analytics

Google Tag Manager

PostHog

Microsoft Clarity
```

Track:

```txt
Node Click

Camera Focus

Service Page

Language Change

Theme Change

CTA Click

Contact Form

Scroll Depth
```

---

# 48. Security

Website static vẫn cần:

```txt
HTTPS

Content Security Policy

Secure Headers

SRI khi cần

Input Validation

API Rate Limiting
```

Không đặt:

```txt
API Keys

Database Password

AI Secrets
```

trong `.html` hoặc `.js` public.

---

# 49. Hosting

Vì output là static HTML nên có rất nhiều lựa chọn.

Khuyến nghị:

```txt
Cloudflare Pages

Vercel

Netlify

GitHub Pages

AWS S3 + CloudFront
```

Website chỉ cần:

```txt
HTML
CSS
JS
Assets
```

nên CDN cache rất hiệu quả.

---

# 50. PWA

Có thể thêm:

```txt
manifest.webmanifest
service-worker.js
```

Cho:

- Install website.
- Faster revisit.
- Offline shell.
- Mobile app-like experience.

---

# 51. Build Strategy

Development:

```txt
Vite
 ↓
HTML / CSS / JS source
 ↓
npm run build
 ↓
dist/
```

Production output:

```txt
dist/
├── index.html
├── ai-agent.html
├── ai-automation.html
├── assets/
├── locales/
├── robots.txt
└── sitemap.xml
```

Upload nguyên thư mục `dist` lên hosting.

---

# 52. package.json đề xuất

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "latest",
    "gsap": "latest"
  },
  "devDependencies": {
    "vite": "latest"
  }
}
```

Nên pin version cụ thể khi production ổn định.

---

# 53. index.html — Skeleton

```html
<!DOCTYPE html>

<html
  lang="vi"
  data-theme="dark">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="
      width=device-width,
      initial-scale=1.0
    ">

  <title>
    AI Era
  </title>

  <link
    rel="stylesheet"
    href="./css/main.css">

</head>

<body>

  <header>
    <nav>
      AI Era
    </nav>
  </header>

  <main>

    <section
      id="hero">

      <div
        id="three-container">
      </div>

      <div
        class="ai-era-core-label">

        AI Era

      </div>

    </section>

    <section
      id="services">

      <!-- Semantic content -->

    </section>

  </main>

  <script
    type="module"
    src="./js/main.js">
  </script>

</body>
</html>
```

---

# 54. main.js — Skeleton

```js
import {
  initScene
} from "./three-scene.js";

import {
  initTheme
} from "./theme.js";

import {
  initLanguage
} from "./i18n.js";

import {
  initNavigation
} from "./navigation.js";


async function init() {

  initTheme();

  await initLanguage();

  initNavigation();

  initScene();
}


init();
```

---

# 55. three-scene.js — Skeleton

```js
import * as THREE
from "three";


export function initScene() {

  const scene =
    new THREE.Scene();

  const camera =
    new THREE
      .PerspectiveCamera(
        50,
        window.innerWidth /
        window.innerHeight,
        0.1,
        100
      );

  const renderer =
    new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  document
    .querySelector(
      "#three-container"
    )
    .appendChild(
      renderer.domElement
    );

}
```

---

# 56. Tech Stack cuối cùng

## Website

```txt
HTML5
CSS3
JavaScript ES Modules
```

## 3D

```txt
Three.js
WebGL
EffectComposer
UnrealBloomPass
GLTFLoader
Raycaster
```

## Animation

```txt
GSAP
ScrollTrigger
CSS Animation
```

## Development

```txt
Vite
npm
```

## Typography

```txt
Plus Jakarta Sans
JetBrains Mono
```

## Theme

```txt
CSS Variables
JavaScript Theme Manager
localStorage
prefers-color-scheme
```

## Responsive

```txt
CSS Media Queries
Pointer Events
Adaptive Three.js Quality
Touch Controls
```

## Multi-language

```txt
JSON locale files
JavaScript i18n manager
Localized HTML pages khi SEO cần
hreflang
```

## SEO

```txt
Semantic HTML
Meta Tags
Open Graph
JSON-LD
sitemap.xml
robots.txt
```

## Backend Integration

```txt
REST API
WebSocket
Fetch API
```

## Deployment

```txt
Static Hosting
CDN
Cloudflare / Vercel / Netlify
```

---

# 57. Kiến trúc production khuyến nghị cho AI Era

```txt
                    AI ERA

                       │
                       ▼

                  index.html

                       │

          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼

        HTML          CSS       JavaScript

          │            │            │
          │            │            ▼
          │            │         Three.js
          │            │            │
          │            │       WebGL / GPU
          │            │
          │            ├── Theme
          │            │
          │            └── Responsive
          │
          ├── SEO
          ├── Content
          ├── Services
          └── Accessibility

                       │
                       ▼

                    REST API

                       │

             ┌─────────┼──────────┐
             ▼         ▼          ▼

           AI API     CMS      SaaS iSpa

                       │

                       ▼

                    Database
```

---

# 58. Quyết định kiến trúc

Phiên bản AI Era này ưu tiên:

```txt
HTML-first
+
Three.js enhanced
```

thay vì:

```txt
Three.js-only website
```

và cũng không bắt buộc:

```txt
React
Next.js
```

Điều này giúp AI Era:

- Có thể tạo trực tiếp thành file `.html`.
- Dễ host.
- Dễ backup.
- Dễ deploy.
- Dễ chỉnh sửa.
- Không phụ thuộc framework lớn.
- Three.js vẫn tạo trải nghiệm 3D cao cấp.
- SEO tốt vì nội dung nằm trong HTML.
- Có thể hỗ trợ Day / Night.
- Có thể hỗ trợ đa ngôn ngữ.
- Responsive và mobile tốt.
- Có thể kết nối AI API/backend sau này.

---

# 59. Hướng phát triển tiếp theo

Sau khi thống nhất tech stack, nên xây dựng theo thứ tự:

```txt
1. index.html

2. Design System

3. Day / Night Mode

4. Responsive Layout

5. Three.js AI Era Universe

6. Camera Controller

7. Mobile Touch Controller

8. Multi-language

9. Service Pages

10. SEO / AI SEO

11. Contact API

12. Analytics

13. Performance Optimization

14. Production Deployment
```

Kết quả cuối cùng là một website AI Era có thể deploy như website công ty thật, trong khi vẫn giữ được trải nghiệm Three.js 3D mạnh và trực quan.
