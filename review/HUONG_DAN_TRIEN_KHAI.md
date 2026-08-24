# AI ERA — Hướng dẫn Triển khai Website (Senior Review → Junior Dev Checklist)

**Người review:** Senior Tech Lead / Solution Architect (25 năm kinh nghiệm)
**Phạm vi review:** `/source` (Next.js scaffold + 2 file HTML tham chiếu motion), `/content` (6 trang nội dung), `/rules/tech_stack.md`, `/rules/sdlc-guidelines.md`, `/skills`
**Mục tiêu tài liệu:** Hướng dẫn **từng bước, từng file** để junior dev sửa code, nối nội dung `/content` vào scaffold Next.js đã có sẵn, và mang đúng "cảm giác chuyển động" (motion/hiệu ứng/font) của file tham chiếu `source/ai_era_antigravity.html` vào sản phẩm thật, tuân thủ 100% `rules/tech_stack.md`.

> ⚠️ Đọc phần **0. KẾT LUẬN REVIEW** trước — có **3 bug nghiêm trọng (Critical)** đang khiến site build sai / không chạy được. Phải sửa các bug này **trước tiên**, trước khi làm bất kỳ việc gì khác.

---

## 0. KẾT LUẬN REVIEW (Executive Summary)

### 0.1 Điểm tốt (giữ nguyên, không sửa)
- Kiến trúc thư mục `src/` đã đúng chuẩn `tech_stack.md` mục 13 (app/components/lib/messages/styles).
- Đã có Three.js + React Three Fiber (`AiEraScene`, `AiEraCore`, `BusinessNode`, `ParticleField`, `CameraController`, `Effects`) — đúng mục 3.
- Đã có Day/Night mode qua CSS variables + `next-themes` (`globals.css`, `ThemeToggle.tsx`) — đúng mục 5.
- `next-intl` đã cấu hình `routing.ts` + `request.ts`, message keys `en.json`/`vi.json` đã đồng bộ 100% (đã kiểm tra bằng script diff key).
- `sitemap.ts`, `robots.ts` đã khai báo AI crawler (GPTBot, PerplexityBot, ClaudeBot…) đúng mục 10.
- Nội dung `/content/*.md` đã được đưa vào 6 service page tương ứng (Vietnamese content khớp).

### 0.2 Bug NGHIÊM TRỌNG (Critical — phải sửa trước, site sẽ lỗi/không chạy nếu bỏ qua)

| # | File | Vấn đề | Hậu quả |
|---|------|--------|---------|
| C1 | `src/app/[locale]/services/*/page.tsx` (cả 6 file) | Hàm `export async function generateMetadata()` **trùng tên** với hàm import `generateMetadata` từ `@/lib/seo/metadata`. Bên trong thân hàm lại gọi `generateMetadata({...})` → JS sẽ hiểu đây là **gọi lại chính nó** (đệ quy vô hạn), không phải gọi hàm đã import. | Next.js build sẽ bị stack overflow / lỗi runtime khi Next gọi `generateMetadata` cho từng trang service. Đây là lỗi **chặn deploy**. |
| C2 | Thiếu file `src/middleware.ts` | `next-intl` với `localePrefix: 'always'` **bắt buộc** phải có middleware để redirect `/` → `/vi` hoặc `/en` và match locale trên mọi route. Hiện tại không có middleware nào trong repo. | Toàn bộ routing đa ngôn ngữ (`/vi`, `/en`) sẽ không hoạt động — truy cập `/` sẽ 404 hoặc không xác định được locale. |
| C3 | `next.config.js` chưa bọc bằng `createNextIntlPlugin` | File hiện tại chỉ có config `images`, không có plugin next-intl để nạp `src/lib/i18n/request.ts`. | next-intl server components sẽ không lấy được message config đúng cách trong một số version → lỗi build ngẫu nhiên khó debug. |

### 0.3 Vấn đề Major (nên sửa để đúng `tech_stack.md`)

| # | Vấn đề | Vi phạm mục nào trong `tech_stack.md` |
|---|--------|----------------------------------------|
| M1 | Font `Plus Jakarta Sans` / `JetBrains Mono` chỉ được khai báo tên trong CSS variable (`--font-plus-jakarta`) nhưng **chưa từng được load thật** (không có `next/font`, không có thẻ `<link>` Google Fonts). Trình duyệt sẽ fallback sang `system-ui`. | Mục 11 (Typography) — brand font không hiển thị đúng. |
| M2 | Chưa có GSAP / Motion nào được wire vào UI thật (`package.json` đã cài `gsap` và `motion` nhưng **không có file nào import chúng**). Toàn bộ hiệu ứng "cinematic" trong `source/ai_era_antigravity.html` (magnetic button, card tilt, cursor, scroll reveal) **chưa được port sang React**. | Mục 4 (Motion & Animation) — đây là yêu cầu cốt lõi để web có "chất" AI Era giống file tham chiếu. |
| M3 | `Effects.tsx` chỉ có `Bloom` cố định, không có adaptive theo device (LOW/MEDIUM/HIGH/ULTRA). `ParticleField`/`AiEraScene` cần kiểm tra lại DPR mobile. | Mục 7 (Adaptive Performance) và mục 6 (Mobile không dùng DoF nếu GPU yếu). |
| M4 | `defaultLocale: 'en'` trong `routing.ts` trong khi toàn bộ nội dung gốc và thị trường mục tiêu là tiếng Việt (`/content/*.md` chỉ có tiếng Việt). | Không sai kỹ thuật, nhưng nên đổi default → `vi` cho đúng ưu tiên thị trường (mục 9). |
| M5 | `rules/sdlc-guidelines.md` được viết cho dự án **"ARA Beauty Center"** (spa/clinic), không phải AI Era — copy nhầm tài liệu từ dự án khác (nhắc tới `Old_website_ara`, `create_blogs.py`, tông giọng "nữ giới, phong cách Hàn Quốc"...). | Cần báo lại PM/Lead để thay bằng SDLC đúng cho AI Era; junior dev **không áp dụng** quy tắc "chỉ dùng ảnh .webp, xoá Old_website_ara" từ file này vì không liên quan dự án hiện tại. |

### 0.4 Vấn đề Minor
- `next.config.js` có `remotePatterns` trỏ `cdn.example.com` — placeholder cần thay bằng domain CDN thật khi có.
- Service page hard-code lại nội dung tiếng Việt trong JSX thay vì đọc từ `messages/*.json` hoặc `/content/*.md` trực tiếp → khi content đổi phải sửa 2 nơi (`content/*.md` và `page.tsx`). Chấp nhận được ở giai đoạn này nhưng cần checklist đồng bộ (xem mục 6 bên dưới).

---

## 1. Chuẩn bị môi trường

```bash
cd source
npm install
npm install --save-dev @next/font   # nếu Next 14 chưa kèm sẵn next/font (thường đã có sẵn trong next 13+)
```

Checklist:
- [ ] `node -v` ≥ 18.18 (yêu cầu Next.js 14 App Router).
- [ ] Chạy `npm run typecheck` — nếu đang có bug C1, TypeScript **không** báo lỗi (vì tên trùng hợp lệ về mặt cú pháp) → đây là lý do cần sửa thủ công theo hướng dẫn dưới, không thể ỷ lại compiler.

---

## 2. SỬA BUG CRITICAL (bắt buộc làm trước tiên)

### Bước 2.1 — Sửa bug đệ quy `generateMetadata` (C1)

File cần sửa (cả 6 file, ví dụ dưới đây dùng `ai-automation-ai-agent/page.tsx`):

```
src/app/[locale]/services/ai-automation-ai-agent/page.tsx
src/app/[locale]/services/digital-marketing-ai-content/page.tsx
src/app/[locale]/services/landing-page-hosting/page.tsx
src/app/[locale]/services/phan-mem-quan-ly-doanh-nghiep/page.tsx
src/app/[locale]/services/phan-tich-dinh-luong-chung-khoan/page.tsx
src/app/[locale]/services/thiet-ke-website-chuan-seo/page.tsx
```

**Cách sửa:** đổi tên hàm import thành alias khác (`buildMetadata`) để không đè tên với export `generateMetadata` của Next.js.

```ts
// TRƯỚC (SAI — gây đệ quy vô hạn)
import { generateMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return generateMetadata({   // ❌ gọi lại chính nó, KHÔNG gọi hàm đã import
    title: '...',
    ...
  });
}
```

```ts
// SAU (ĐÚNG)
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({      // ✅ gọi đúng hàm helper đã import
    title: 'AI Automation & AI Agent — AI Era',
    description: 'Giải pháp AI Automation và triển khai AI Agent theo yêu cầu...',
    path: '/services/ai-automation-ai-agent',
    locale,
  });
}
```

Checklist:
- [ ] Sửa cả 6 file service page theo mẫu trên.
- [ ] Grep lại toàn repo để chắc chắn không còn chỗ nào đặt tên export trùng với import: `grep -rn "generateMetadata as generateMetadata\|import { generateMetadata }" src/app`.
- [ ] Chạy `npm run build` — build phải qua, không stack overflow.

### Bước 2.2 — Thêm `middleware.ts` cho next-intl (C2)

Tạo file mới **`source/middleware.ts`** (đặt ở root `source/`, ngang hàng với `next.config.js`, KHÔNG đặt trong `src/`):

```ts
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match tất cả path trừ: file tĩnh, _next, api, favicon, ảnh...
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

Checklist:
- [ ] File nằm đúng vị trí `source/middleware.ts` (Next.js chỉ nhận middleware ở root, không nhận trong `src/app`).
- [ ] Truy cập `http://localhost:3000/` → phải tự redirect sang `/vi` (sau khi làm bước 2.4 đổi default locale) hoặc `/en`.
- [ ] Truy cập `http://localhost:3000/vi/services/ai-automation-ai-agent` → load đúng trang, không 404.

### Bước 2.3 — Bọc `next.config.js` bằng plugin next-intl (C3)

```js
// source/next.config.js
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.ai-era.vn', // TODO: thay bằng domain CDN thật khi có, hiện là placeholder
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
```

Checklist:
- [ ] `npm run build` chạy sạch sau khi thêm plugin.
- [ ] Không còn warning "Couldn't find next-intl config" trong console dev.

### Bước 2.4 — (Khuyến nghị Major M4) Đổi default locale sang `vi`

File `src/lib/i18n/routing.ts`:

```ts
export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',   // đổi từ 'en' → 'vi' vì nội dung gốc và thị trường chính là Việt Nam
  localePrefix: 'always',
});
```

- [ ] Cập nhật lại `src/app/robots.ts` và `src/app/sitemap.ts` nếu có logic phụ thuộc default locale (hiện tại 2 file này liệt kê tường minh cả `en`/`vi` nên không cần sửa gì thêm).

---

## 3. Load đúng Font thương hiệu (Bug M1)

Font hiện KHÔNG được load thật. Sửa bằng `next/font/google` — cách chuẩn của Next.js 14, tốt cho performance (tự động self-host, không cần gọi Google Fonts runtime như file HTML tham chiếu).

### Bước 3.1 — Tạo file layout gốc load font

Không có root `src/app/layout.tsx` (chỉ có `src/app/[locale]/layout.tsx`). Việc load font phải đặt ở `src/app/[locale]/layout.tsx` vì đây là layout ngoài cùng thực tế đang được dùng.

Sửa file **`src/app/[locale]/layout.tsx`**:

```tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { ThemeProvider } from 'next-themes';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <div className="relative min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

> Ghi chú quan trọng: `next/font` tự inject biến CSS (`--font-plus-jakarta`, `--font-jetbrains`) vào class gắn trên `<html>`. `globals.css` và `tailwind.config.ts` **đã** tham chiếu đúng các biến này (`var(--font-plus-jakarta)`), nên **không cần sửa gì thêm** ở 2 file đó — chỉ cần layout gán class là đủ.

Checklist:
- [ ] Xoá mọi `<link href="https://fonts.googleapis.com/...">` nếu có (không dùng CDN font runtime nữa — dùng self-host qua `next/font` để tối ưu Core Web Vitals theo mục 22 `tech_stack.md`).
- [ ] Kiểm tra DevTools → tab Network → font `.woff2` được load từ domain chính (self-hosted), không gọi ra `fonts.gstatic.com`.
- [ ] Kiểm tra bằng mắt: heading dùng `Plus Jakarta Sans` (không phải Arial/system-ui mặc định), HUD/mono text dùng `JetBrains Mono`.

---

## 4. Port Motion & Hiệu ứng từ `ai_era_antigravity.html` sang React (Bug M2)

Đây là phần **quan trọng nhất** để website có đúng "chất" AI Era như file tham chiếu. Theo `tech_stack.md` mục 4, quy ước bắt buộc:

```
Three.js / R3F -> hiệu ứng 3D (ĐÃ CÓ trong AiEraScene)
GSAP           -> cinematic animation (camera flight, scroll story, section transition)
Motion         -> UI animation đơn giản (card, menu, dropdown, language switcher)
CSS            -> micro interaction (hover màu, border...)
```
**Không dùng nhiều engine cho cùng 1 hiệu ứng.** Dưới đây là bảng mapping hiệu ứng trong file HTML tham chiếu sang đúng công cụ theo quy ước:

| Hiệu ứng trong `ai_era_antigravity.html` | Dòng gốc | Công cụ áp dụng trong React | File cần tạo/sửa |
|---|---|---|---|
| Magnetic button (`.magnetic-wrap` + `mousemove` GSAP) | dòng 514–531 | **GSAP** (cinematic, đã có precedent trong file gốc) | `src/components/ui/MagneticButton.tsx` (mới) |
| Card 3D tilt theo con trỏ (`.tilt-card`, `rotateX/rotateY`) | dòng 545–570 | **GSAP** | `src/components/ui/GlassCard.tsx` (sửa) |
| Radial gradient theo vị trí chuột trên card (`--mouse-x/--mouse-y`) | dòng 268–279 | **CSS** (micro-interaction thuần CSS var, không cần JS engine) | `src/styles/globals.css` (sửa `.glass`) |
| Custom cursor (dot + outline lerp) | dòng 493–513 | **GSAP** — nhưng **chỉ bật trên desktop** (`window.matchMedia('(pointer: fine)')`), tắt hẳn trên mobile/touch | `src/components/ui/CustomCursor.tsx` (mới) |
| Scroll reveal cho section (fade/slide khi cuộn tới) | không có trong HTML gốc nhưng bắt buộc theo `tech_stack.md` mục 4 "ScrollTrigger" | **GSAP ScrollTrigger** | `src/lib/motion/useScrollReveal.ts` (mới hook) |
| Hover UI nhỏ (nav link, theme toggle) | CSS transition sẵn có | **CSS** (giữ nguyên, đã đúng) | không cần sửa |
| Language switcher / dropdown mở-đóng | chưa có animation | **Motion** (theo đúng quy ước UI animation) | `src/components/ui/LanguageSwitcher.tsx` (sửa) |

### Bước 4.1 — Tạo `MagneticButton.tsx`

```tsx
// src/components/ui/MagneticButton.tsx
'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wrapRef.current || !btnRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btnRef.current, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power2.out' });
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
  };

  const Tag: any = href ? 'a' : 'button';

  return (
    <div
      ref={wrapRef}
      className="inline-block p-5 -m-5"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Tag ref={btnRef} href={href} onClick={onClick} className={className}>
        {children}
      </Tag>
    </div>
  );
}
```

Áp dụng vào `Hero.tsx`: thay 2 thẻ `<a>` CTA (`Explore Services`, `Contact Us`) bằng `<MagneticButton href="#services" className="...">`.

- [ ] Import `gsap` ở đầu file (không import `ScrollTrigger` ở đây, không cần cho magnetic button).
- [ ] Test trên mobile: magnetic effect nên tự vô hiệu vì không có `mousemove` trên touch — không cần code riêng nhưng phải test tay để chắc chắn không bug.

### Bước 4.2 — Card tilt cho `GlassCard.tsx`

Sửa `src/components/ui/GlassCard.tsx` để thêm 3D tilt + set biến CSS `--mouse-x/--mouse-y` (theo đúng mapping bảng trên: JS set biến, CSS vẽ gradient):

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export default function GlassCard({
  children,
  className = '',
  tilt = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  [key: string]: any;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);

    const dx = (x - rect.width / 2) / (rect.width / 2);
    const dy = (y - rect.height / 2) / (rect.height / 2);
    gsap.to(cardRef.current, {
      rotateX: -dy * 8,
      rotateY: dx * 8,
      duration: 0.3,
      ease: 'power2.out',
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!tilt || !cardRef.current) return;
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={cardRef}
      className={`glass glass-tilt rounded-2xl p-6 transition-all duration-300 hover:border-indigo/30 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
      {...props}
    >
      {children}
    </div>
  );
}
```

Thêm vào `src/styles/globals.css` trong `@layer components`, ngay dưới `.glass`:

```css
  .glass-tilt {
    position: relative;
    overflow: hidden;
  }

  .glass-tilt::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(129, 140, 248, 0.06), transparent 40%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .glass-tilt:hover::before {
    opacity: 1;
  }
```

- [ ] `Services.tsx`, `Ecosystem.tsx`, `Hero.tsx` (HUD card) tự động có tilt vì đều dùng chung `<GlassCard>`.
- [ ] Với card nằm trong link (`<Link><GlassCard>...`) — test kỹ để `preserve-3d` không làm vỡ layout click.
- [ ] Tôn trọng `prefers-reduced-motion`: thêm guard đầu file `GlassCard.tsx`:
  ```ts
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ```
  và bỏ qua `handleMouseMove`/`handleMouseLeave` nếu `prefersReducedMotion === true` (đúng mục 8 Accessibility).

### Bước 4.3 — Custom cursor (chỉ desktop)

Tạo `src/components/ui/CustomCursor.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reduceMotion) return; // tắt hẳn trên mobile/touch/reduced-motion

    const handleMove = (e: MouseEvent) => {
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.05 });
      gsap.to(outlineRef.current, { x: e.clientX, y: e.clientY, duration: 0.35, ease: 'power2.out' });
    };

    const interactiveEls = document.querySelectorAll('a, button, .glass-tilt');
    const onEnter = () =>
      gsap.to(outlineRef.current, { scale: 1.6, borderColor: 'rgba(129,140,248,0.6)', duration: 0.2 });
    const onLeave = () =>
      gsap.to(outlineRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.4)', duration: 0.2 });

    window.addEventListener('mousemove', handleMove);
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    document.body.classList.add('cursor-none');

    return () => {
      window.removeEventListener('mousemove', handleMove);
      interactiveEls.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      });
      document.body.classList.remove('cursor-none');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}
```

Thêm CSS vào `globals.css`:

```css
.cursor-none { cursor: none; }
.cursor-dot, .cursor-outline {
  position: fixed; top: 0; left: 0; border-radius: 50%;
  pointer-events: none; transform: translate(-50%, -50%); z-index: 10000;
}
.cursor-dot { width: 6px; height: 6px; background: var(--text); }
.cursor-outline {
  width: 36px; height: 36px; border: 1px solid var(--border);
  background: var(--surface); backdrop-filter: blur(1px);
}
@media (pointer: coarse) {
  .cursor-dot, .cursor-outline { display: none; }
}
```

Gắn `<CustomCursor />` vào `src/app/[locale]/layout.tsx`, bên trong `<body>`, trước `<Header />`.

- [ ] Kiểm tra thiết bị cảm ứng (Chrome DevTools → toggle device toolbar) → cursor không hiện, không cản trở tap.

### Bước 4.4 — GSAP ScrollTrigger cho scroll reveal section

Tạo hook dùng chung `src/lib/motion/useScrollReveal.ts`:

```ts
'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

export function useScrollReveal(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!registered) {
      gsap.registerPlugin(ScrollTrigger);
      registered = true;
    }
    if (!ref.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return; // giữ nội dung hiện sẵn, không animate (đúng mục 8 Accessibility)

    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, [ref]);
}
```

Áp dụng trong `Ecosystem.tsx`, `Services.tsx`, `CTA.tsx` — mỗi section:

```tsx
'use client';
import { useRef } from 'react';
import { useScrollReveal } from '@/lib/motion/useScrollReveal';

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef);

  return (
    <section ref={sectionRef} className="...">
      {/* nội dung giữ nguyên */}
    </section>
  );
}
```

- [ ] Không dùng ScrollTrigger cho Hero (Hero luôn hiện ngay khi load — không nên fade-in gây chậm cảm nhận).
- [ ] Test cuộn xuống/lên (`toggleActions: 'play none none reverse'`) để section ẩn lại khi cuộn ngược qua rồi hiện lại khi cuộn xuống lần nữa — không bug giật.

### Bước 4.5 — Motion cho `LanguageSwitcher.tsx`

Dùng `motion/react` (package `motion` đã có sẵn trong `package.json`) cho dropdown mở/đóng — theo đúng quy ước "Motion = UI animation đơn giản":

```tsx
'use client';
import { AnimatePresence, motion } from 'motion/react';
// ...
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="glass rounded-xl p-2 absolute top-full mt-2 right-0"
    >
      {/* danh sách ngôn ngữ */}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] Đọc trước `src/components/ui/LanguageSwitcher.tsx` hiện có, chỉ thêm animation, **không đổi logic chuyển route** (`useRouter`, `usePathname` từ `@/lib/i18n/routing`).

---

## 5. Adaptive Performance cho Three.js (Bug M3)

Theo `tech_stack.md` mục 7, cần 4 tier LOW/MEDIUM/HIGH/ULTRA. Tạo file cấu hình:

```ts
// src/lib/three/quality-tiers.ts
export type QualityTier = 'low' | 'medium' | 'high' | 'ultra';

export const QUALITY_PRESETS: Record<QualityTier, {
  particles: number; bloom: boolean; bloomIntensity: number; dpr: [number, number]; lights: number;
}> = {
  low:    { particles: 300,  bloom: false, bloomIntensity: 0,    dpr: [1, 1],   lights: 1 },
  medium: { particles: 700,  bloom: true,  bloomIntensity: 0.5,  dpr: [1, 1.5], lights: 2 },
  high:   { particles: 1500, bloom: true,  bloomIntensity: 0.8,  dpr: [1, 2],   lights: 3 },
  ultra:  { particles: 2500, bloom: true,  bloomIntensity: 0.95, dpr: [1, 2],   lights: 4 },
};

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';
  const isMobile = window.innerWidth < 768;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return 'low';
  const cores = navigator.hardwareConcurrency ?? 4;
  if (isMobile) return cores >= 6 ? 'medium' : 'low';
  return cores >= 8 ? 'ultra' : 'high';
}
```

Trong `AiEraScene.tsx`:
- [ ] Gọi `detectQualityTier()` trong `useEffect` (client-only), lưu vào state.
- [ ] Truyền `dpr={preset.dpr}` xuống `<Canvas>`.
- [ ] Truyền `particleCount={preset.particles}` xuống `<ParticleField>`.
- [ ] Nếu `preset.bloom === false` → không render `<Effects />` (bỏ hẳn EffectComposer, không chỉ set intensity=0, để tiết kiệm GPU thật sự).

Trong `Effects.tsx`, đổi `intensity` cố định `0.95` thành prop nhận từ preset:

```tsx
export default function Effects({ intensity = 0.95 }: { intensity?: number }) {
  return (
    <EffectComposer>
      <Bloom intensity={intensity} luminanceThreshold={0.08} luminanceSmoothing={0.8} radius={0.8} />
    </EffectComposer>
  );
}
```

- [ ] Test bằng Chrome DevTools throttle CPU 4x/6x để chắc particle count thực sự giảm trên tier thấp (log ra console tạm thời để kiểm tra, rồi xoá log trước khi commit).

---

## 6. Checklist Đồng bộ Nội dung `/content` ↔ Code

Vì mỗi service page hiện **hard-code lại** nội dung tiếng Việt trong JSX (không tự động đọc `.md`), phải tuân thủ quy trình sau mỗi khi content thay đổi:

| File nguồn (`/content`) | File code phải cập nhật theo | Trường cần đối chiếu |
|---|---|---|
| `trang-chu.md` | `src/messages/vi.json` (`home.*`), `src/components/sections/Hero.tsx`, `Services.tsx` | H1, danh sách 6 dịch vụ, mô tả ngắn |
| `ai-automation-ai-agent.md` | `src/app/[locale]/services/ai-automation-ai-agent/page.tsx` | H1, H2, từng H3 + đoạn mô tả |
| `digital-marketing-ai-content.md` | `.../services/digital-marketing-ai-content/page.tsx` | nt |
| `landing-page-hosting.md` | `.../services/landing-page-hosting/page.tsx` | nt |
| `phan-mem-quan-ly-doanh-nghiep.md` | `.../services/phan-mem-quan-ly-doanh-nghiep/page.tsx` | nt |
| `phan-tich-dinh-luong-chung-khoan.md` | `.../services/phan-tich-dinh-luong-chung-khoan/page.tsx` | nt |
| `thiet-ke-website-chuan-seo.md` | `.../services/thiet-ke-website-chuan-seo/page.tsx` | nt |

Quy tắc bắt buộc khi sửa mỗi service page:
- [ ] H1 trong `.md` (`## H1: ...`) = `<h1>` trong page (duy nhất 1 thẻ h1/trang, đúng `sdlc-guidelines.md` nguyên tắc SEO — phần này áp dụng được dù file đó sai bối cảnh dự án).
- [ ] Mỗi `### H2` trong `.md` = 1 block `<h2>` + nhóm `<GlassCard>` chứa các `#### H3` con.
- [ ] Không bỏ sót đoạn "Lợi ích/Đối tượng sử dụng/Lý do chọn AI Era" cuối mỗi file `.md` — hiện tại các page đang **cắt bớt phần cuối** (ví dụ trang `ai-automation-ai-agent` thiếu hẳn phần "Lợi ích khi triển khai..." — cần bổ sung).
- [ ] Cập nhật `serviceSchema()` JSON-LD (`name`, `description`) khớp với `<h1>`/meta description.
- [ ] Sau khi sửa nội dung, chạy lại `npm run build` để Next tạo lại static params.

> Khuyến nghị dài hạn (không bắt buộc ngay): viết script `scripts/sync-content.ts` đọc `/content/*.md`, parse heading (`##`, `###`, `####`) bằng thư viện `remark`, tự sinh object props cho page — tránh lệch dữ liệu về sau. Ghi vào backlog, không làm trong scope hiện tại.

---

## 7. SEO / Structured Data Checklist

- [ ] Mọi service page phải có: `<title>` (qua `generateMetadata`/`buildMetadata`), `meta description`, đúng 1 `<h1>`, breadcrumb schema (`breadcrumbSchema`), service schema (`serviceSchema`) — đối chiếu `src/lib/seo/schema.ts`.
- [ ] Trang chủ (`src/app/[locale]/page.tsx`) hiện **chưa gọi `generateMetadata`/schema** — cần bổ sung `Organization` + `WebSite` JSON-LD theo `tech_stack.md` mục 10.
- [ ] `robots.ts`, `sitemap.ts` dùng domain `https://ai-era.vn` — xác nhận với PM đây có phải domain production chính thức không trước khi deploy thật (nếu domain khác, sửa cả 2 file + `siteConfig.url` trong `lib/seo/metadata.ts`).
- [ ] Không được nhét nội dung SEO (text quan trọng) vào bên trong `<canvas>` Three.js — toàn bộ nội dung text phải nằm trong HTML thường (đã đúng, chỉ cần giữ nguyên khi thêm hiệu ứng ở mục 4).

---

## 8. Testing & QA Checklist (trước khi deploy)

- [ ] `npm run typecheck` — pass.
- [ ] `npm run lint` — pass.
- [ ] `npm run build` — pass, không lỗi stack overflow (xác nhận bug C1 đã hết).
- [ ] Test thủ công routing: `/`, `/vi`, `/en`, `/vi/services/...` (6 trang), `/en/services/...` (6 trang) — không 404.
- [ ] Test Day/Night mode: bấm `ThemeToggle`, xác nhận Three.js scene đổi màu theo (`AiEraScene` phải nhận `theme` prop — kiểm tra lại `AiEraScene.tsx` có đang đọc `useTheme()` từ `next-themes` chưa; nếu chưa, bổ sung).
- [ ] Test responsive tại các breakpoint trong `tech_stack.md` mục 6: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop).
- [ ] Test `prefers-reduced-motion: reduce` (Chrome DevTools → Rendering → Emulate CSS media) — camera flight, particle, cursor, tilt, scroll reveal đều phải tắt/giảm.
- [ ] Lighthouse: LCP < 2.5s, CLS < 0.1, INP < 200ms (mục 22) — chạy trên cả `/` (có Three.js) và 1 service page (không có Three.js).
- [ ] Test cross-browser tối thiểu: Chrome, Safari, Firefox desktop + Safari iOS, Chrome Android (mục 28).
- [ ] Kiểm tra console không còn lỗi/warning liên quan GSAP `ScrollTrigger` bị register nhiều lần (do dùng biến `registered` guard ở mục 4.4).

---

## 9. Checklist tổng hợp theo thứ tự thực hiện (copy vào task tracker)

```
[ ] 2.1  Sửa bug đệ quy generateMetadata — 6 file service page
[ ] 2.2  Tạo middleware.ts cho next-intl
[ ] 2.3  Bọc next.config.js với createNextIntlPlugin
[ ] 2.4  Đổi defaultLocale 'en' → 'vi' trong routing.ts
[ ] 3.1  Load font qua next/font trong [locale]/layout.tsx, gỡ mọi <link> Google Fonts CDN
[ ] 4.1  Tạo MagneticButton.tsx, áp dụng vào Hero CTA
[ ] 4.2  Thêm tilt + --mouse-x/y vào GlassCard.tsx + globals.css
[ ] 4.3  Tạo CustomCursor.tsx (chỉ desktop, tôn trọng reduced-motion)
[ ] 4.4  Tạo useScrollReveal.ts, áp dụng Ecosystem/Services/CTA
[ ] 4.5  Thêm Motion animation cho LanguageSwitcher dropdown
[ ] 5    Tạo quality-tiers.ts, wire vào AiEraScene + Effects + ParticleField
[ ] 6    Đối chiếu lại 6 service page với /content/*.md, bổ sung phần bị thiếu
[ ] 7    Thêm Organization/WebSite schema cho trang chủ; xác nhận domain production
[ ] 8    Chạy toàn bộ Testing & QA Checklist ở mục 8
[ ] —    Báo PM: rules/sdlc-guidelines.md đang là tài liệu của dự án khác (ARA Beauty), cần thay thế
[ ] —    Sau khi hoàn tất mục 1-8, tiếp tục Mục 11 để port lớp DOM overlay: CoreLabel, NodeLabels, SceneOverlay (HUD/focus panel), CustomCursor nâng cấp dragging — xem checklist 11.5
```

---

## 11. Port lớp DOM Overlay từ `ai-era-spatial-threejs.html` (chữ "AI Era", node label, HUD, focus panel, cursor nâng cấp)

Bối cảnh: sau khi đối chiếu, lớp **WebGL 3D** (`AiEraCore.tsx`, `BusinessNode.tsx`, `ParticleField.tsx`, `CameraController.tsx`, `Effects.tsx`) đã được port đúng 1:1 từ `source/ai-era-spatial-threejs.html`. Phần **còn thiếu** là lớp **DOM overlay** nằm đè lên canvas: chữ "AI Era" ở giữa (gradient động), label tên từng lĩnh vực bay theo node, HUD telemetry, focus panel mô tả node, và custom cursor có state hover/dragging. Mục này hướng dẫn port chính xác phần còn thiếu đó.

**Nguyên tắc kỹ thuật quan trọng:** file gốc dùng vanilla JS để tự tính `project()` tọa độ 3D → 2D cho `.node-label`. Trong React Three Fiber, **không tự viết lại phép chiếu thủ công** — dùng sẵn `<Html>` của `@react-three/drei` (đã có trong `package.json`), nó tự động theo dõi world position của group cha và tự sync vị trí DOM, tương đương chức năng nhưng code ngắn hơn, ít bug hơn, đúng khuyến nghị `tech_stack.md` mục 3 (dùng Drei cho HTML labels).

### 11.1 — Chữ "AI Era" gradient động (`CoreLabel.tsx`)

Đây chính là đoạn `.core-label strong` + `@keyframes coreText` trong file gốc (dòng 121–137) — port nguyên bản, đặt tên `AiEraLogotype` cho rõ nghĩa. Component này là **DOM thuần, không nằm trong `<Canvas>`**, đặt cố định giữa màn hình đè lên canvas (giống file gốc: `.core-label{position:absolute;left:50%;top:50%}` không phụ thuộc phép chiếu 3D vì hạt nhân luôn ở tâm scene và tâm camera ban đầu).

Tạo file mới **`src/components/three/CoreLabel.tsx`**:

```tsx
'use client';

export default function CoreLabel({ visible = true }: { visible?: boolean }) {
  return (
    <div
      className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[15] text-center transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <strong className="ai-era-logotype block text-[clamp(2.25rem,4vw,4.6rem)] leading-[0.82] tracking-[-0.075em]">
        AI Era
      </strong>
      <span className="mt-3 block font-mono text-[0.58rem] tracking-[0.23em] uppercase text-[#b9b9c6]"
            style={{ textShadow: '0 0 14px rgba(129,140,248,.8)' }}>
        Core Intelligence
      </span>
    </div>
  );
}
```

Thêm CSS vào `src/styles/globals.css` (trong `@layer components`, cạnh `.text-gradient`):

```css
  .ai-era-logotype {
    font-weight: 800;
    background: linear-gradient(115deg, #fff 6%, #d8ddff 28%, #818cf8 55%, #67e8f9 76%, #fff 100%);
    background-size: 220% 220%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 7px rgba(255, 255, 255, .35)) drop-shadow(0 0 20px rgba(129, 140, 248, .9));
    animation: coreText 4.5s ease-in-out infinite;
  }

  @keyframes coreText {
    0%, 100% {
      background-position: 0 50%;
      filter: drop-shadow(0 0 7px rgba(255, 255, 255, .28)) drop-shadow(0 0 19px rgba(129, 140, 248, .72));
    }
    50% {
      background-position: 100% 50%;
      filter: drop-shadow(0 0 12px rgba(103, 232, 249, .62)) drop-shadow(0 0 31px rgba(129, 140, 248, 1));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-era-logotype { animation: none; background-position: 40% 50%; }
  }
```

Checklist:
- [ ] `visible={selected === null}` khi gắn vào scene — chữ "AI Era" chỉ hiện khi đang ở core, ẩn đi (fade) khi camera đã bay tới focus 1 node (đúng hành vi file gốc: `.core-label` vẫn tồn tại trong DOM nhưng về mặt UX chỉ có ý nghĩa khi đang ở core).
- [ ] Test dark/light mode: gradient dùng màu cố định (không theo `--text` variable) vì đây là **brand mark cố định**, không đổi theo theme — xác nhận với designer nếu Day Mode cần bản gradient khác (ví dụ tối hơn để tương phản trên nền sáng). Nếu cần, thêm biến `--logotype-gradient` vào `:root`/`.light` thay vì hard-code.

### 11.2 — Node label bay theo node 3D + click focus (`NodeLabels.tsx`)

Dùng `Html` của drei, gắn **bên trong** `BusinessNode.tsx` (không tạo file riêng theo dõi projection thủ công như file gốc).

Sửa file **`src/components/three/BusinessNode.tsx`** — thêm import và JSX:

```tsx
// Thêm vào đầu file, cạnh các import khác
import { Html } from '@react-three/drei';

// Sửa signature nhận thêm labelIndex (dạng "01", "02"...) và trạng thái active
export default function BusinessNode({
  data,
  index,
  onFocus,
  active = false,
}: {
  data: typeof fieldData[0];
  index: number;
  onFocus: (i: number) => void;
  active?: boolean;
}) {
  // ... giữ nguyên toàn bộ logic useRef/useFrame/useMemo hiện có ...

  return (
    <group ref={groupRef}>
      {/* ... giữ nguyên mesh/pointLight/sprite/ring/line hiện có ... */}

      {/* MỚI: label DOM bay theo group, tự động ẩn khi bị che bởi hình khối khác nhờ prop occlude */}
      <Html center distanceFactor={8} zIndexRange={[10, 0]} occlude={false}>
        <div
          className={`node-label ${active ? 'node-label--active' : ''}`}
          style={{ '--node-color': `#${data.color.toString(16).padStart(6, '0')}` } as React.CSSProperties}
          onClick={(e) => {
            e.stopPropagation();
            onFocus(index);
          }}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <span>{data.name}</span>
          <small>{String(index + 1).padStart(2, '0')}</small>
        </div>
      </Html>
    </group>
  );
}
```

Thêm CSS vào `globals.css` (port nguyên từ `.node-label` file gốc dòng 84–101, đổi màu sang dùng CSS variable của theme thay vì hard-code như file gốc để tương thích Day/Night mode):

```css
  .node-label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    border-radius: 11px;
    color: var(--text);
    font-size: 0.74rem;
    font-weight: 600;
    border: 1px solid var(--border);
    background: var(--surface-2);
    backdrop-filter: blur(14px);
    box-shadow: 0 12px 38px rgba(0, 0, 0, .22);
    white-space: nowrap;
    cursor: pointer;
    transition: border-color .25s, background .25s, transform .25s, color .25s;
  }

  .node-label::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--node-color, var(--indigo-2));
    box-shadow: 0 0 12px var(--node-color, var(--indigo-2));
  }

  .node-label small {
    color: var(--muted);
    font-family: var(--font-jetbrains);
    font-size: 0.58rem;
    letter-spacing: 0.06em;
  }

  .node-label:hover,
  .node-label--active {
    color: #fff;
    background: var(--surface-2);
    transform: scale(1.055);
  }
```

Cập nhật nơi gọi `<BusinessNode>` trong `AiEraScene.tsx` (component `World`) để truyền `active`:

```tsx
{fieldData.map((data, i) => (
  <BusinessNode
    key={i}
    data={data}
    index={i}
    active={selected === i}
    onFocus={(idx) => cameraControllerRef.current?.focusNode(idx)}
  />
))}
```

Checklist:
- [ ] `npm install @react-three/drei` — xác nhận đã có sẵn trong `package.json` (đã có, version `^9.88.0`), không cần cài thêm.
- [ ] Test click vào label → phải gọi đúng `focusNode(index)`, camera bay tới, không bị xuyên click xuống mesh phía sau (vì `<Html>` render ra ngoài DOM tree canvas, đảm bảo `pointer-events` hoạt động đúng — test kỹ trên Safari, có bug lịch sử với `Html` + Safari nếu `transform: translate3d` bị conflict).
- [ ] Trên mobile: `distanceFactor={8}` cần test lại — nếu label quá to/nhỏ khi camera zoom, điều chỉnh giá trị (tham khảo cách file gốc scale label theo `1/dist` — Drei tự lo phần này qua `distanceFactor`).

### 11.3 — HUD telemetry realtime + Focus Panel (`SceneOverlay.tsx`)

**Vấn đề hiện tại:** `Hero.tsx` có sẵn khối HUD nhưng dữ liệu **hard-code tĩnh** (`14.0`, `0.00`, `0.00`, `CORE`) — không đọc từ camera thật. Cần tách khối này ra khỏi `Hero.tsx`, biến thành overlay riêng nhận dữ liệu sống từ `CameraController`.

**Bước 11.3.1 — Cho `CameraController` bắn telemetry ra ngoài**

Sửa `src/components/three/CameraController.tsx`, thêm prop `onTelemetry` và gọi trong `useFrame` (throttle nhẹ để tránh re-render quá nhiều lần/giây):

```tsx
// Sửa signature forwardRef, thêm onTelemetry
const CameraController = forwardRef<
  CameraControllerHandle,
  {
    selected: number | null;
    setSelected: (i: number | null) => void;
    onTelemetry?: (t: { distance: number; rotX: number; rotY: number }) => void;
  }
>(function CameraController({ selected, setSelected, onTelemetry }, ref) {
  // ... giữ nguyên toàn bộ code hiện có ...

  const telemetryThrottleRef = useRef(0);

  useFrame(() => {
    // ... giữ nguyên toàn bộ logic camera hiện có ...

    // MỚI: thêm cuối useFrame, trước dấu đóng
    telemetryThrottleRef.current++;
    if (onTelemetry && telemetryThrottleRef.current % 6 === 0) { // ~10 lần/giây ở 60fps
      onTelemetry({
        distance: Number(cameraDistanceRef.current.toFixed(2)),
        rotX: Number(rotRef.current.x.toFixed(2)),
        rotY: Number(rotRef.current.y.toFixed(2)),
      });
    }
  });

  return null;
});
```

**Bước 11.3.2 — `AiEraScene.tsx` nhận và forward telemetry lên page**

```tsx
// Thêm state + prop mới trong AiEraScene
const AiEraScene = forwardRef<
  AiEraSceneHandle,
  {
    onNodeFocus?: (name: string, desc: string, index: number) => void;
    onTelemetry?: (t: { distance: number; rotX: number; rotY: number }) => void;
  }
>(function AiEraScene({ onNodeFocus, onTelemetry }, ref) {
  // ... giữ nguyên state selected/cameraControllerRef ...

  return (
    <Canvas /* ...giữ nguyên props hiện có... */>
      {/* ...giữ nguyên background/fog/lights... */}
      <World
        cameraControllerRef={cameraControllerRef}
        selected={selected}
        setSelected={setSelected}
        onTelemetry={onTelemetry}   {/* MỚI: truyền tiếp xuống World rồi xuống CameraController */}
      />
      <Effects />
    </Canvas>
  );
});
```

Trong function `World` (cùng file), thêm prop `onTelemetry` và forward vào `<CameraController onTelemetry={onTelemetry} ... />`.

**Bước 11.3.3 — Tạo `SceneOverlay.tsx`** (HUD + focus panel + control buttons, port từ `.hud`/`.focus-panel`/`.controls` file gốc dòng 141–169):

```tsx
// src/components/three/SceneOverlay.tsx
'use client';

import { useTranslations } from 'next-intl';

export interface FocusData {
  index: number;
  name: string;
  desc: string;
}

export default function SceneOverlay({
  telemetry,
  focus,
  onReset,
}: {
  telemetry: { distance: number; rotX: number; rotY: number };
  focus: FocusData | null;
  onReset: () => void;
}) {
  const t = useTranslations('home.hud');

  return (
    <>
      {/* HUD — ẩn trên mobile theo đúng breakpoint file gốc (@media max-width:900px) */}
      <aside className="hidden lg:block fixed right-7 top-[105px] z-[18] w-[248px] rounded-[18px] border border-border bg-surface-2 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
          <b className="text-[0.72rem] font-semibold">{t('title')}</b>
          <em className="not-italic font-mono text-[0.58rem] text-muted">{t('status')}</em>
        </div>
        <div className="px-4 py-4 font-mono text-[0.61rem] text-muted space-y-2.5">
          <div className="flex justify-between"><span>{t('distance')}</span><span className="text-indigo-2">{telemetry.distance.toFixed(1)}</span></div>
          <div className="flex justify-between"><span>{t('rotationX')}</span><span className="text-indigo-2">{telemetry.rotX.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{t('rotationY')}</span><span className="text-indigo-2">{telemetry.rotY.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>{t('focus')}</span><span className="text-indigo-2">{focus ? `NODE 0${focus.index + 1}` : 'CORE'}</span></div>
          <p className="pt-2.5 mt-2.5 border-t border-white/[.055] text-[0.72rem] leading-relaxed text-muted">
            Kéo để xoay. Cuộn để bay xuyên không gian. Click node để camera tự tiếp cận.
          </p>
        </div>
      </aside>

      {/* Controls — luôn hiện, thu gọn trên mobile */}
      <div className="fixed left-4 lg:left-[42px] bottom-4 lg:bottom-8 z-20 flex items-center gap-2">
        <span className="hidden sm:inline-flex rounded-lg border border-border bg-white/[.028] backdrop-blur-md px-2.5 py-2 font-mono text-[0.61rem] text-muted">
          {t('controls.drag')}
        </span>
        <span className="hidden sm:inline-flex rounded-lg border border-border bg-white/[.028] backdrop-blur-md px-2.5 py-2 font-mono text-[0.61rem] text-muted">
          {t('controls.wheel')}
        </span>
        <button
          onClick={onReset}
          className="rounded-lg border border-border bg-white/[.028] backdrop-blur-md px-2.5 py-2 font-mono text-[0.61rem] text-muted hover:text-white hover:border-indigo/40 hover:bg-indigo/10 transition-colors"
        >
          {t('controls.reset')}
        </button>
      </div>

      {/* Focus panel — hiện/ẩn animate theo cubic-bezier giống file gốc */}
      <div
        className="fixed right-4 lg:right-7 bottom-[70px] lg:bottom-7 z-[22] w-[min(370px,calc(100vw-32px))] rounded-[20px] border border-border bg-surface-2 backdrop-blur-xl p-5 transition-all duration-300"
        style={{
          transform: focus ? 'none' : 'translateY(22px)',
          opacity: focus ? 1 : 0,
          pointerEvents: focus ? 'auto' : 'none',
          transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)',
        }}
      >
        {focus && (
          <>
            <div className="font-mono text-[0.61rem] tracking-wide text-indigo-2">
              AI ERA / NODE {String(focus.index + 1).padStart(2, '0')}
            </div>
            <h2 className="mt-2 mb-2 text-[1.35rem] tracking-tight">{focus.name}</h2>
            <p className="text-[0.78rem] leading-relaxed text-muted">{focus.desc}</p>
            <button
              onClick={onReset}
              className="mt-3.5 rounded-full border border-border bg-white text-background font-bold text-[0.69rem] px-3.5 py-2"
            >
              Quay về lõi AI Era
            </button>
          </>
        )}
      </div>
    </>
  );
}
```

**Bước 11.3.4 — Gắn `SceneOverlay` vào trang, xoá khối HUD tĩnh cũ khỏi `Hero.tsx`**

Sửa `src/app/[locale]/page.tsx`:

```tsx
'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import Ecosystem from '@/components/sections/Ecosystem';
import Services from '@/components/sections/Services';
import CTA from '@/components/sections/CTA';
import CoreLabel from '@/components/three/CoreLabel';
import SceneOverlay, { FocusData } from '@/components/three/SceneOverlay';
import type { AiEraSceneHandle } from '@/components/three/AiEraScene';

const AiEraScene = dynamic(() => import('@/components/three/AiEraScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-background" />,
});

export default function HomePage() {
  const sceneRef = useRef<AiEraSceneHandle>(null);
  const [focus, setFocus] = useState<FocusData | null>(null);
  const [telemetry, setTelemetry] = useState({ distance: 14.5, rotX: 0, rotY: 0 });

  return (
    <>
      <AiEraScene
        ref={sceneRef}
        onNodeFocus={(name, desc, index) => setFocus({ name, desc, index })}
        onTelemetry={setTelemetry}
      />
      <CoreLabel visible={focus === null} />
      <SceneOverlay
        telemetry={telemetry}
        focus={focus}
        onReset={() => {
          sceneRef.current?.resetView();
          setFocus(null);
        }}
      />
      <Hero />
      <Ecosystem />
      <Services />
      <CTA />
    </>
  );
}
```

- [ ] Mở `src/components/sections/Hero.tsx`, **xoá hẳn** khối `<GlassCard>` HUD tĩnh (dòng chứa `t('hud.title')`, `KHOẢNG CÁCH CAMERA`...) vì đã thay bằng `SceneOverlay` thật — tránh trùng 2 HUD trên màn hình.
- [ ] Message keys `home.hud.*`, `home.focusPanel.*`, `home.cursor.*` trong `messages/vi.json`/`en.json` **đã có sẵn** (đã kiểm tra ở lần review trước) — chỉ cần dùng lại qua `useTranslations('home.hud')`, không cần thêm key mới.
- [ ] Test: kéo/xoay → số `ROTATION X/Y` trên HUD phải chạy theo thời gian thực; click node → `FOCUS` đổi thành `NODE 0x` và focus panel hiện đúng tên/mô tả; bấm "Quay về lõi AI Era" hoặc nút `RESET VIEW` → cả 2 đều gọi `resetView()`, HUD trở lại `CORE`.

### 11.4 — Nâng cấp `CustomCursor.tsx` thêm state hover/dragging

Bản trong mục 4.3 (đã hướng dẫn trước) mới có state hover. File gốc còn có state `dragging` (`body.dragging .cursor-outline{width:58px;...}` — vòng cursor phình to hơn khi đang kéo xoay scene). Bổ sung bằng cách phát custom event từ `CameraController`.

Sửa `src/components/three/CameraController.tsx`, trong `handlePointerDown`/`handlePointerUp` (phần xử lý drag hiện có):

```tsx
const handlePointerDown = (e: PointerEvent) => {
  if (e.button !== 0) return;
  draggingRef.current = true;
  lastXRef.current = e.clientX;
  lastYRef.current = e.clientY;
  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  window.dispatchEvent(new CustomEvent('aiera:dragstart'));   // MỚI
};
const handlePointerUp = () => {
  draggingRef.current = false;
  window.dispatchEvent(new CustomEvent('aiera:dragend'));     // MỚI
};
```

Sửa `src/components/ui/CustomCursor.tsx`, thêm listener 2 event này (thêm vào trong `useEffect` đã có ở mục 4.3, trước đoạn `return () => {...}`):

```tsx
const onDragStart = () => gsap.to(outlineRef.current, { scale: 1.9, borderColor: 'rgba(103,232,249,.65)', duration: 0.15 });
const onDragEnd = () => gsap.to(outlineRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.4)', duration: 0.2 });
window.addEventListener('aiera:dragstart', onDragStart);
window.addEventListener('aiera:dragend', onDragEnd);
// nhớ thêm 2 dòng removeEventListener tương ứng trong cleanup return
```

- [ ] Gắn `<CustomCursor />` một lần duy nhất ở `src/app/[locale]/layout.tsx` (đã hướng dẫn ở mục 4.3) — **không** gắn thêm lần nữa trong `page.tsx`, tránh nhân đôi cursor.
- [ ] Test: kéo chuột xoay scene → vòng tròn cursor phải phình to rõ rệt và đổi màu viền sang cyan, nhả chuột → trở lại kích thước outline mặc định.

### 11.5 — Checklist tổng hợp Mục 11 (thêm vào task tracker, nối tiếp mục 9)

```
[ ] 11.1  Tạo CoreLabel.tsx + CSS .ai-era-logotype/@keyframes coreText — gắn vào page.tsx, visible=(focus===null)
[ ] 11.2  Thêm <Html> label vào BusinessNode.tsx + CSS .node-label, truyền active={selected===i} từ AiEraScene
[ ] 11.3a Thêm prop onTelemetry vào CameraController.tsx, bắn dữ liệu mỗi ~10 lần/giây
[ ] 11.3b Forward onTelemetry qua World -> AiEraScene
[ ] 11.3c Tạo SceneOverlay.tsx (HUD + controls + focus panel), dùng message keys home.hud.*/focusPanel.*
[ ] 11.3d Gắn CoreLabel + SceneOverlay vào page.tsx, XOÁ khối HUD tĩnh cũ trong Hero.tsx
[ ] 11.4   Bắn CustomEvent aiera:dragstart/dragend từ CameraController, lắng nghe trong CustomCursor.tsx
[ ] —      Test end-to-end: xoay/zoom/click node/reset/HUD realtime/focus panel/cursor dragging — tất cả nối liền mạch, không còn dữ liệu hard-code
```

---

## 12. Ghi chú cho Tech Lead / PM

- File `rules/sdlc-guidelines.md` không thuộc về dự án AI Era (nội dung nói về spa/clinic "ARA Beauty Center", nhắc `Old_website_ara`, `create_blogs.py`). Đề xuất: giữ lại **quy trình 8 bước** (Requirement → Design → Implementation → Testing → Code Review Gate → Validation Gate → Sync & Deploy → Documentation) làm khung SDLC chung, nhưng viết lại toàn bộ nội dung chi tiết cho đúng ngữ cảnh AI Era (B2B, AI/SaaS, không phải spa/beauty).
- Thư mục `/skills` chứa rất nhiều skill SEO (seo-fundamentals, seo-schema, seo-content-writer, seo-aeo-*...) — khuyến nghị dùng các skill này ở giai đoạn viết/tối ưu nội dung blog/insights sau khi 6 trang dịch vụ core đã ổn định, tránh dùng đồng thời nhiều skill SEO trùng chức năng (ví dụ `seo-audit`, `seo-content-auditor`, `seo-forensic-incident-response` có phạm vi chồng lấn) — nên chọn 1 skill làm chuẩn cho mỗi loại tác vụ.

---

## 11. DOM Overlay Layer cho 3D Scene (port từ `ai-era-spatial-threejs.html`)

### 11.0 Bối cảnh — vì sao cần phần này

Review đối chiếu `source/ai-era-spatial-threejs.html` với `src/components/three/*` cho kết quả:

| Lớp | Trạng thái |
|---|---|
| Lớp WebGL (core, node, particle, camera flight, drag/wheel/parallax) | ✅ **Đã port đúng 1:1** trong `AiEraCore.tsx`, `BusinessNode.tsx`, `ParticleField.tsx`, `CameraController.tsx` — không cần sửa logic 3D. |
| Lớp DOM overlay (chữ "AI Era" gradient, node label bay theo world position, HUD telemetry realtime, focus panel, custom cursor có state hover/drag) | ❌ **Chưa được xây** — đây là nội dung của mục 11 này. |

Cũng phát hiện 1 bug nhỏ đang tồn tại: trong `AiEraScene.tsx`, hàm `handleFocus` (dòng 105–108) được định nghĩa để gọi `onNodeFocus?.(...)` nhưng **không hề được gắn vào đâu cả** — `BusinessNode` đang gọi thẳng `cameraControllerRef.current?.focusNode(idx)`, bỏ qua `handleFocus`. Vì vậy prop `onNodeFocus` hiện là dead code. Bước 11.5 dưới đây sẽ sửa luôn.

### 11.1 Thêm dữ liệu 6 lĩnh vực vào messages (đa ngôn ngữ) thay vì hard-code tiếng Anh

Hiện `fieldData` (tên + mô tả) đang bị hard-code tiếng Anh lặp lại ở **3 nơi**: `AiEraScene.tsx`, `BusinessNode.tsx`, `CameraController.tsx`. Cần đưa về 1 nguồn duy nhất trong `messages/*.json`, khớp nội dung với `/content/trang-chu.md`.

Sửa **`src/messages/vi.json`**, thay key `ecosystem` hiện tại bằng:

```json
"ecosystem": {
  "title": "Hệ sinh thái AI Era",
  "subtitle": "Sáu lĩnh vực cùng xoay quanh một hạt nhân trí tuệ nhân tạo",
  "nodes": [
    { "name": "AI Automation", "desc": "Tự động hóa quy trình nghiệp vụ, tích hợp hệ thống và tự động hóa có giám sát cho doanh nghiệp." },
    { "name": "AI Agent", "desc": "Agent hỗ trợ khách hàng, xử lý nghiệp vụ phức tạp và hoạt động đa kênh liền mạch." },
    { "name": "Digital Marketing & AI Content", "desc": "Quảng cáo đa nền tảng Meta, TikTok, Google kết hợp AI tạo và đăng nội dung tự động." },
    { "name": "Phân tích định lượng chứng khoán", "desc": "Tín hiệu định lượng, factor model và machine learning cho thị trường chứng khoán Việt Nam." },
    { "name": "Thiết kế Website chuẩn SEO & AI SEO", "desc": "Kiến trúc semantic-first, tối ưu Technical SEO và AI discovery cho doanh nghiệp." },
    { "name": "Phần mềm quản lý doanh nghiệp", "desc": "Hệ sinh thái SaaS chuyên ngành: iSpa, iNail, iBeauty và các giải pháp quản trị vận hành." }
  ]
}
```

Sửa **`src/messages/en.json`** tương ứng (bản dịch tiếng Anh, giữ đúng cấu trúc key/số lượng phần tử — 6 node):

```json
"ecosystem": {
  "title": "The AI Era Ecosystem",
  "subtitle": "Six domains orbiting one shared intelligence core",
  "nodes": [
    { "name": "AI Automation", "desc": "Workflow automation, system integration and human-in-the-loop automation for enterprises." },
    { "name": "AI Agent", "desc": "Customer-support agents, complex task agents and seamless omnichannel operation." },
    { "name": "Digital Marketing & AI Content", "desc": "Cross-platform ads on Meta, TikTok, Google combined with AI-generated and auto-published content." },
    { "name": "Quantitative Equity Analysis", "desc": "Quantitative signals, factor models and machine learning for the Vietnamese stock market." },
    { "name": "SEO & AI-driven Web Design", "desc": "Semantic-first architecture, technical SEO and AI discovery optimization for businesses." },
    { "name": "Business Management Software", "desc": "Vertical SaaS ecosystem: iSpa, iNail, iBeauty and other operations management solutions." }
  ]
}
```

Checklist:
- [ ] Chạy lại script diff key đã dùng ở review trước để xác nhận `en.json`/`vi.json` vẫn khớp 100% số lượng key sau khi sửa:
  ```bash
  python3 -c "
  import json
  def flat(d,p=''):
      out={}
      for k,v in d.items():
          key=f'{p}.{k}' if p else k
          if isinstance(v,dict): out.update(flat(v,key))
          elif isinstance(v,list):
              for i,item in enumerate(v):
                  out.update(flat(item, f'{key}[{i}]') if isinstance(item,dict) else {f'{key}[{i}]':item})
          else: out[key]=v
      return out
  en=flat(json.load(open('src/messages/en.json')))
  vi=flat(json.load(open('src/messages/vi.json')))
  print('missing in vi:', set(en)-set(vi))
  print('missing in en:', set(vi)-set(en))
  "
  ```
  → Output phải là 2 dòng rỗng (`set()`).

### 11.2 Tạo `src/lib/three/fieldData.ts` — nguồn dữ liệu 3D dùng chung

```ts
// src/lib/three/fieldData.ts
export const fieldColors = [0x818cf8, 0x67e8f9, 0xc084fc, 0x60a5fa, 0x5eead4, 0xf0abfc] as const;

export interface FieldNode {
  name: string;
  desc: string;
  color: number;
}

/** Ghép tên/mô tả đã dịch (từ messages) với màu cố định (không đổi theo ngôn ngữ). */
export function buildFieldData(nodes: { name: string; desc: string }[]): FieldNode[] {
  return nodes.map((n, i) => ({ ...n, color: fieldColors[i] }));
}
```

- [ ] Xoá mảng `fieldData` hard-code tiếng Anh khỏi `AiEraScene.tsx`, `BusinessNode.tsx`, `CameraController.tsx` — cả 3 file sẽ **nhận `fieldData` qua props** thay vì tự định nghĩa (xem bước 11.5).

### 11.3 Tạo `src/components/three/CoreLabel.tsx` — chữ "AI Era" gradient nổi bật

Đây chính là phần bạn yêu cầu: font-weight 800, gradient trắng→lavender→indigo→cyan, glow đa lớp, animate chậm — port nguyên spec từ `.core-label strong` + `@keyframes coreText` trong file gốc (dòng 121–137).

```tsx
// src/components/three/CoreLabel.tsx
'use client';

export default function CoreLabel({ subtitle = 'Core Intelligence' }: { subtitle?: string }) {
  return (
    <div className="ai-era-core-label" aria-hidden="true">
      <div>
        <strong>AI Era</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
```

> `aria-hidden="true"` vì đây là hiệu ứng thị giác trùng lặp với `<h1>` thật đã có trong `Hero.tsx` (nội dung SEO/accessibility phải nằm trong HTML ngữ nghĩa — đúng `tech_stack.md` mục 8, không được để text quan trọng chỉ tồn tại dưới dạng hiệu ứng trang trí).

Thêm CSS vào `src/styles/globals.css`, trong `@layer components`:

```css
  .ai-era-core-label {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 178px;
    height: 178px;
    display: grid;
    place-items: center;
    text-align: center;
    pointer-events: none;
    z-index: 5;
  }

  .ai-era-core-label strong {
    display: block;
    font-size: clamp(2.25rem, 4vw, 4.6rem);
    font-weight: 800;
    line-height: 0.82;
    letter-spacing: -0.075em;
    background: linear-gradient(115deg, #fff 6%, #d8ddff 28%, #818cf8 55%, #67e8f9 76%, #fff 100%);
    background-size: 220% 220%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.35)) drop-shadow(0 0 20px rgba(129, 140, 248, 0.9));
    animation: ai-era-core-text 4.5s ease-in-out infinite;
  }

  .ai-era-core-label span {
    display: block;
    margin-top: 12px;
    color: #b9b9c6;
    font: 500 0.58rem var(--font-jetbrains);
    letter-spacing: 0.23em;
    text-transform: uppercase;
    text-shadow: 0 0 14px rgba(129, 140, 248, 0.8);
  }

  @keyframes ai-era-core-text {
    0%, 100% {
      background-position: 0 50%;
      filter: drop-shadow(0 0 7px rgba(255, 255, 255, 0.28)) drop-shadow(0 0 19px rgba(129, 140, 248, 0.72));
    }
    50% {
      background-position: 100% 50%;
      filter: drop-shadow(0 0 12px rgba(103, 232, 249, 0.62)) drop-shadow(0 0 31px rgba(129, 140, 248, 1));
    }
  }
```

Trong `.light` (Day Mode), thêm override ngay dưới khối `.light` hiện có trong `globals.css` để glow không bị chói trên nền sáng:

```css
  .light .ai-era-core-label strong {
    background: linear-gradient(115deg, #1a1a2e 6%, #4338ca 28%, #4f46e5 55%, #0891b2 76%, #1a1a2e 100%);
    background-size: 220% 220%;
    filter: drop-shadow(0 0 4px rgba(79, 70, 229, 0.25));
  }
```

- [ ] Tôn trọng `prefers-reduced-motion`: animation `ai-era-core-text` đã tự động bị vô hiệu bởi rule chung `@media (prefers-reduced-motion: reduce)` đã có sẵn trong `globals.css` (ép `animation-duration: 0.01ms`) — không cần code thêm.

### 11.4 Thêm Node Label bay theo world position — dùng `<Html>` của Drei

Theo `tech_stack.md` mục 3, `@react-three/drei` là công cụ chỉ định cho "Text / HTML labels" — dùng `<Html>` thay vì tự viết code `project()`/raycaster thủ công như bản vanilla JS (đơn giản và đúng kiến trúc hơn).

Cài thêm nếu chưa có sẵn (thường đã có kèm `@react-three/drei`):
```bash
npm ls @react-three/drei
```

Sửa **`src/components/three/BusinessNode.tsx`** — thêm import và render `<Html>` bên trong `<group ref={groupRef}>`, ngay sau thẻ `<mesh ref={shellRef}>`:

```tsx
import { Html } from '@react-three/drei';
// ... giữ nguyên phần code cũ, chỉ thêm bên trong return:

<Html
  center
  distanceFactor={8}
  occlude={false}
  style={{ pointerEvents: 'auto' }}
>
  <div
    className="ai-era-node-label"
    style={{ '--node-color': `#${data.color.toString(16).padStart(6, '0')}` } as React.CSSProperties}
    onPointerOver={() => setHovered(true)}
    onPointerOut={() => setHovered(false)}
    onClick={() => onFocus(index)}
  >
    <span>{data.name}</span>
    <small>{String(index + 1).padStart(2, '0')}</small>
  </div>
</Html>
```

Thêm CSS tương ứng vào `globals.css`:

```css
  .ai-era-node-label {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 13px;
    border-radius: 11px;
    color: #dcdce2;
    font-size: 0.74rem;
    font-weight: 600;
    border: 1px solid var(--border);
    background: rgba(8, 8, 14, 0.64);
    backdrop-filter: blur(14px);
    box-shadow: 0 12px 38px rgba(0, 0, 0, 0.22);
    transition: border-color 0.25s, background 0.25s, transform 0.25s, color 0.25s;
    white-space: nowrap;
    cursor: pointer;
  }

  .ai-era-node-label::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--node-color, var(--indigo-2));
    box-shadow: 0 0 12px var(--node-color, var(--indigo-2));
  }

  .ai-era-node-label small {
    color: #555562;
    font: 400 0.58rem var(--font-jetbrains);
    letter-spacing: 0.06em;
  }

  .ai-era-node-label:hover,
  .ai-era-node-label.active {
    color: #fff;
    transform: scale(1.055);
  }

  @media (max-width: 900px) {
    .ai-era-node-label { font-size: 0.61rem; padding: 8px 9px; }
    .ai-era-node-label small { display: none; }
  }
```

- [ ] `distanceFactor={8}` điều chỉnh kích thước label theo khoảng cách camera (label nhỏ lại khi bay xa) — test bằng tay và chỉnh số cho hợp mắt, không có công thức cố định.
- [ ] `occlude={false}` vì label cần luôn hiện phía trên node dù bị mesh khác che (giữ đúng hành vi bản gốc — label không bao giờ bị ẩn).
- [ ] Test: node label phải **di chuyển đúng theo hiệu ứng bồng bềnh** (float animation) của node trong `useFrame`, vì `<Html>` của Drei tự đồng bộ theo world matrix của `<group>` cha mỗi frame.

### 11.5 Sửa `AiEraScene.tsx` — nhận `fieldData` từ props, xoá dead code `handleFocus`

```tsx
// src/components/three/AiEraScene.tsx
'use client';

import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AiEraCore from './AiEraCore';
import BusinessNode from './BusinessNode';
import ParticleField from './ParticleField';
import CameraController, { CameraControllerHandle } from './CameraController';
import Effects from './Effects';
import type { FieldNode } from '@/lib/three/fieldData';

export interface AiEraSceneHandle {
  resetView: () => void;
}

function World({
  fieldData,
  cameraControllerRef,
  selected,
  setSelected,
}: {
  fieldData: FieldNode[];
  cameraControllerRef: React.RefObject<CameraControllerHandle | null>;
  selected: number | null;
  setSelected: (i: number | null) => void;
}) {
  return (
    <group>
      <AiEraCore />
      {fieldData.map((data, i) => (
        <BusinessNode
          key={i}
          data={data}
          index={i}
          onFocus={(idx) => cameraControllerRef.current?.focusNode(idx)}
        />
      ))}
      <ParticleField />
      <CameraController
        ref={cameraControllerRef}
        fieldData={fieldData}
        selected={selected}
        setSelected={setSelected}
      />
    </group>
  );
}

const AiEraScene = forwardRef<
  AiEraSceneHandle,
  { fieldData: FieldNode[]; onNodeFocus?: (i: number | null) => void }
>(function AiEraScene({ fieldData, onNodeFocus }, ref) {
  const cameraControllerRef = useRef<CameraControllerHandle | null>(null);
  const [selected, setSelectedState] = useState<number | null>(null);

  const setSelected = (i: number | null) => {
    setSelectedState(i);
    onNodeFocus?.(i); // ✅ thay cho handleFocus dead-code cũ — báo lên component cha (page.tsx) để render focus panel
  };

  useImperativeHandle(ref, () => ({
    resetView: () => cameraControllerRef.current?.resetView(),
  }));

  return (
    <Canvas
      camera={{ position: [0, 0.2, 14.5], fov: 48, near: 0.1, far: 120 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#030305']} />
      <fog attach="fog" args={['#030305', 10, 50]} />
      <ambientLight intensity={0.36} color="#30304c" />
      <pointLight position={[4, 4, 6]} intensity={28} distance={36} decay={2} color="#8b8cff" />
      <pointLight position={[-4, -3, 3]} intensity={15} distance={30} decay={2} color="#67e8f9" />
      <World
        fieldData={fieldData}
        cameraControllerRef={cameraControllerRef}
        selected={selected}
        setSelected={setSelected}
      />
      <Effects />
    </Canvas>
  );
});

AiEraScene.displayName = 'AiEraScene';
export default AiEraScene;
```

> Ghi chú: đã xoá luôn `World` bản cũ tự quản lý `groupRef`/rotation riêng (dòng 25–94 bản gốc) vì đó là **logic trùng lặp** với rotation đã có sẵn trong `CameraController.tsx` (2 nơi cùng lắng nghe `pointermove`/`pointerdown` toàn `window` và cùng tính `targetRot` — dư thừa, có thể gây xung đột giá trị rotation). `CameraController` đã là nguồn duy nhất xử lý rotation — giữ đúng nguyên tắc "một trách nhiệm, một nơi xử lý" trong `rules/sdlc-guidelines.md` mục Code Review Gate (🏗️ Architecture).
> Đã bỏ `(window as any).__aiEraCamera = camera` — không cần nữa vì HUD sẽ lấy telemetry qua cơ chế ở bước 11.6 (ghi thẳng DOM bằng `id`, không cần biến `window` toàn cục kiểu không an toàn type).

- [ ] Kiểm tra kỹ: sau khi xoá `World` cũ, node/core không còn xoay 2 lần chồng lên nhau (bug thường gặp: tốc độ xoay nhanh gấp đôi bất thường) — nếu thấy hiện tượng này nghĩa là còn sót logic rotation trùng ở đâu đó.

### 11.6 Sửa `CameraController.tsx` — nhận `fieldData` qua props, ghi telemetry ra DOM

Đổi signature:

```tsx
const CameraController = forwardRef<
  CameraControllerHandle,
  { fieldData: FieldNode[]; selected: number | null; setSelected: (i: number | null) => void }
>(function CameraController({ fieldData, selected, setSelected }, ref) {
  // ... giữ nguyên toàn bộ logic cũ, chỉ đổi mọi chỗ dùng biến `fieldData` module-level
  // (hard-code sẵn ở đầu file cũ) thành `fieldData` nhận từ props.
  // Xoá hẳn mảng `const fieldData = [...]` hard-code ở đầu file (dòng 12–19 bản gốc).
```

Thêm cập nhật DOM telemetry vào cuối `useFrame` đã có sẵn (chèn ngay trước dòng `camera.lookAt(currentLookRef.current);`):

```tsx
    // Ghi telemetry ra DOM trực tiếp — KHÔNG dùng React state để tránh re-render 60 lần/giây,
    // giữ đúng tinh thần bản gốc dùng document.querySelector('#distVal').textContent = ...
    const distEl = document.getElementById('ai-era-dist');
    const rotXEl = document.getElementById('ai-era-rotx');
    const rotYEl = document.getElementById('ai-era-roty');
    if (distEl) distEl.textContent = cameraDistanceRef.current.toFixed(1);
    if (rotXEl) rotXEl.textContent = rotRef.current.x.toFixed(2);
    if (rotYEl) rotYEl.textContent = rotRef.current.y.toFixed(2);
```

Checklist:
- [ ] Toàn bộ 3 chỗ dùng `fieldData[i]`/`fieldData.length` trong `focusNode()` phải đổi sang đọc từ tham số props, không phải biến module-level cũ.
- [ ] `rotRef` hiện tại (`{x,y,z}`) được khai báo trong `CameraController` nhưng KHÔNG dùng để xoay world group nữa sau bước 11.5 (do đã xoá `World` cũ) — cần tự bổ sung: `World` giờ không tự xoay, nên phải chuyển việc set `groupRef.current.rotation` **vào trong `CameraController`**, bằng cách nhận thêm 1 `worldGroupRef` từ ngoài truyền vào, hoặc đơn giản hơn — đổi cách tiếp cận: xoay **camera quanh core** thay vì xoay cả `world` group (đây thực ra đúng với cách bản gốc vanilla JS làm — bản gốc **không** xoay `world`, nó chỉ dùng `rot`/`targetRot` để tính `camera.position` trong nhánh `else if(selected===null)`; hãy đọc lại đoạn `renderer.domElement.addEventListener('pointermove', ...)` bản gốc — nó chỉ cập nhật `targetRot` dùng cho parallax nhẹ, KHÔNG áp `rot` vào world.rotation ở đâu cả trong đoạn code đã xem). Do đó: **xác nhận lại join bằng cách xem hết phần render loop còn lại của file gốc** trước khi kết luận cần xoay world hay không — xem bước 11.6b ngay dưới.

### 11.6b — Xác minh: bản gốc có xoay `world.rotation` hay không?

> ⚠️ Đây là bước **bắt buộc phải làm trước khi xoá `World` cũ ở bước 11.5**, vì nếu bản gốc thực sự dùng `world.rotation.set(rot.x, rot.y, rot.z)` ở render loop (phần cuối file `ai-era-spatial-threejs.html` mà bản review này chưa trích hết), thì việc xoay phải **giữ lại** — chỉ chuyển từ `World` component sang xử lý trong `CameraController` (dùng `useThree()` lấy `scene`, tìm group qua `ref` dùng chung), KHÔNG được xoá bỏ hoàn toàn hiệu ứng "kéo chuột xoay 360° cả hệ sinh thái" mà bạn yêu cầu.

Việc cần làm:
```bash
grep -n "world.rotation\|group.rotation" source/ai-era-spatial-threejs.html
```
- Nếu lệnh trên **có kết quả** → world thực sự bị xoay theo `rot.x/y/z` mỗi frame. Khi đó, sửa `CameraController.tsx`: nhận thêm prop `worldRef: React.RefObject<THREE.Group>` từ `AiEraScene.tsx`, và trong `useFrame` thêm:
  ```tsx
  if (worldRef.current) {
    worldRef.current.rotation.set(rotRef.current.x, rotRef.current.y, rotRef.current.z);
  }
  ```
  đồng thời `AiEraScene.tsx` bọc `<World>` trong 1 `<group ref={worldRef}>` (khôi phục lại phần group bọc ngoài, nhưng **không khôi phục lại toàn bộ đoạn pointermove/pointerdown/pointerup trùng lặp** — chỉ khôi phục cái group + ref rỗng, để `CameraController` là nơi DUY NHẤT ghi vào `rotation`).
- Nếu lệnh trên **không có kết quả** → giữ nguyên bước 11.5 như đã viết (không cần world rotation riêng, chỉ camera parallax là đủ).

Junior dev **phải tự chạy lệnh `grep` trên và báo cáo kết quả trong PR description** trước khi merge bước 11.5/11.6, vì đây là quyết định ảnh hưởng trực tiếp tới cảm giác "kéo chuột xoay cả hệ sinh thái 360°" mà yêu cầu đề bài nhấn mạnh.

### 11.7 Tạo `src/components/three/SceneHUD.tsx` — HUD + Focus Panel + nút Reset

Component này nằm **ngoài `<Canvas>`**, là lớp DOM phủ lên trên (giống `#labels`, `.hud`, `.focus-panel` trong bản gốc).

```tsx
// src/components/three/SceneHUD.tsx
'use client';

import type { FieldNode } from '@/lib/three/fieldData';

export default function SceneHUD({
  fieldData,
  selected,
  onReset,
  hudCopy = 'Kéo để xoay. Lăn chuột để bay xuyên không gian. Click node để tập trung.',
  labels,
}: {
  fieldData: FieldNode[];
  selected: number | null;
  onReset: () => void;
  hudCopy?: string;
  labels: {
    telemetryTitle: string;
    dist: string; rotX: string; rotY: string; focus: string;
    drag: string; wheel: string; reset: string;
    nodeKicker: string; back: string;
  };
}) {
  const node = selected !== null ? fieldData[selected] : null;

  return (
    <>
      {/* HUD telemetry — ẩn trên mobile theo tech_stack.md mục 6 (HUD rút gọn trên tablet/mobile) */}
      <aside className="ai-era-hud hidden lg:block">
        <div className="ai-era-hud-head">
          <b>{labels.telemetryTitle}</b>
          <em>LIVE</em>
        </div>
        <div className="ai-era-hud-body">
          <div className="ai-era-hud-row"><span>{labels.dist}</span><span id="ai-era-dist">14.5</span></div>
          <div className="ai-era-hud-row"><span>{labels.rotX}</span><span id="ai-era-rotx">0.00</span></div>
          <div className="ai-era-hud-row"><span>{labels.rotY}</span><span id="ai-era-roty">0.00</span></div>
          <div className="ai-era-hud-row">
            <span>{labels.focus}</span>
            <span>{node ? node.name.toUpperCase() : 'CORE'}</span>
          </div>
          <p className="ai-era-hud-copy">{hudCopy}</p>
        </div>
      </aside>

      {/* Controls */}
      <div className="ai-era-controls">
        <span className="ai-era-control">{labels.drag}</span>
        <span className="ai-era-control hidden sm:inline-flex">{labels.wheel}</span>
        <button className="ai-era-control" onClick={onReset}>{labels.reset}</button>
      </div>

      {/* Focus panel */}
      <div className={`ai-era-focus-panel ${node ? 'show' : ''}`}>
        {node && (
          <>
            <div className="ai-era-focus-kicker">
              {labels.nodeKicker} <span>{String(selected! + 1).padStart(2, '0')}</span>
            </div>
            <h2>{node.name}</h2>
            <p>{node.desc}</p>
            <button onClick={onReset}>{labels.back}</button>
          </>
        )}
      </div>
    </>
  );
}
```

CSS bổ sung vào `globals.css`:

```css
  .ai-era-hud {
    position: fixed; right: 28px; top: 105px; z-index: 18; width: 248px;
    border: 1px solid var(--border); border-radius: 18px; background: var(--surface-2);
    backdrop-filter: blur(18px); overflow: hidden; box-shadow: 0 24px 70px rgba(0,0,0,.28);
  }
  .ai-era-hud-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
  .ai-era-hud-head b { font-size: .72rem; font-weight: 600; }
  .ai-era-hud-head em { font-style: normal; color: var(--muted); font: 400 .58rem var(--font-jetbrains); }
  .ai-era-hud-body { padding: 15px 16px; }
  .ai-era-hud-row { display: flex; justify-content: space-between; margin-bottom: 10px; font: 400 .61rem var(--font-jetbrains); color: var(--muted); }
  .ai-era-hud-row span:last-child { color: var(--indigo-2); }
  .ai-era-hud-copy { padding-top: 10px; border-top: 1px solid var(--border); font-size: .72rem; color: var(--muted); line-height: 1.6; }

  .ai-era-controls { position: fixed; left: 42px; bottom: 32px; z-index: 20; display: flex; align-items: center; gap: 9px; }
  .ai-era-control {
    border: 1px solid var(--border); background: var(--surface); color: var(--muted);
    font: 500 .61rem var(--font-jetbrains); padding: 8px 10px; border-radius: 9px;
    backdrop-filter: blur(12px); cursor: pointer; transition: .25s;
  }
  .ai-era-control:hover { color: var(--text); border-color: rgba(129,140,248,.38); background: rgba(129,140,248,.08); }

  .ai-era-focus-panel {
    position: fixed; right: 28px; bottom: 28px; z-index: 22; width: min(370px, calc(100vw - 56px));
    border: 1px solid var(--border); background: var(--surface-2); backdrop-filter: blur(20px);
    border-radius: 20px; padding: 20px; transform: translateY(22px); opacity: 0; pointer-events: none;
    transition: .35s cubic-bezier(.2,.8,.2,1);
  }
  .ai-era-focus-panel.show { transform: none; opacity: 1; pointer-events: auto; }
  .ai-era-focus-kicker { color: var(--indigo-2); font: 500 .61rem var(--font-jetbrains); letter-spacing: .08em; }
  .ai-era-focus-panel h2 { font-size: 1.35rem; letter-spacing: -.04em; margin: 9px 0 8px; }
  .ai-era-focus-panel p { font-size: .78rem; line-height: 1.65; color: var(--muted); }
  .ai-era-focus-panel button {
    margin-top: 14px; border: 1px solid var(--border); border-radius: 999px; padding: 8px 13px;
    background: #fff; color: #030305; font-weight: 700; font-size: .69rem; cursor: pointer;
  }

  @media (max-width: 900px) {
    .ai-era-controls { left: 18px; bottom: 18px; }
    .ai-era-focus-panel { right: 14px; bottom: 62px; width: calc(100vw - 28px); }
  }
```

Bổ sung message keys `home.hud`/`home.focusPanel`/`home.cursor` **đã có sẵn** trong `vi.json`/`en.json` (đã kiểm tra ở review trước) — chỉ cần map đúng field khi gọi component, không cần thêm key mới ngoài phần `ecosystem.nodes` ở bước 11.1.

### 11.8 Ráp toàn bộ vào `src/app/[locale]/page.tsx`

```tsx
'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations, useMessages } from 'next-intl';
import Hero from '@/components/sections/Hero';
import Ecosystem from '@/components/sections/Ecosystem';
import Services from '@/components/sections/Services';
import CTA from '@/components/sections/CTA';
import CoreLabel from '@/components/three/CoreLabel';
import { buildFieldData } from '@/lib/three/fieldData';
import type { AiEraSceneHandle } from '@/components/three/AiEraScene';

const AiEraScene = dynamic(() => import('@/components/three/AiEraScene'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-0 bg-background" />,
});
const SceneHUD = dynamic(() => import('@/components/three/SceneHUD'), { ssr: false });

export default function HomePage() {
  const t = useTranslations('home');
  const messages = useMessages() as any;
  const sceneRef = useRef<AiEraSceneHandle | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const fieldData = buildFieldData(messages.ecosystem.nodes);

  return (
    <>
      <AiEraScene ref={sceneRef} fieldData={fieldData} onNodeFocus={setSelected} />
      <CoreLabel subtitle={t('coreSubtitle', { default: 'Core Intelligence' } as any)} />
      <SceneHUD
        fieldData={fieldData}
        selected={selected}
        onReset={() => sceneRef.current?.resetView()}
        hudCopy={t('hud.copy', { default: 'Kéo để xoay. Lăn chuột để bay xuyên không gian. Click node để tập trung.' } as any)}
        labels={{
          telemetryTitle: t('hud.title'),
          dist: t('hud.distance'),
          rotX: t('hud.rotationX'),
          rotY: t('hud.rotationY'),
          focus: t('hud.focus'),
          drag: t('hud.controls.drag'),
          wheel: t('hud.controls.wheel'),
          reset: t('hud.controls.reset'),
          nodeKicker: t('focusPanel.kicker'),
          back: t('focusPanel.back'),
        }}
      />
      <Hero />
      <Ecosystem />
      <Services />
      <CTA />
    </>
  );
}
```

> Ghi chú: `t('hud.copy', {default: ...})` — nếu `next-intl` version đang dùng không hỗ trợ tham số `default` trực tiếp trong `t()`, thêm hẳn key `home.hud.copy` vào `messages/*.json` thay vì dùng fallback runtime (cách này an toàn hơn, tránh lỗi build ở strict mode).

Checklist bước 11.8:
- [ ] Thêm key `home.hud.copy` và `home.coreSubtitle` vào cả `vi.json`/`en.json` nếu chọn hướng an toàn nói trên.
- [ ] `SceneHUD` phải `dynamic(..., { ssr: false })` giống `AiEraScene` vì nó đọc `document.getElementById` gián tiếp qua `CameraController` — không được render ở server.
- [ ] Test: click từng node trong cả 3 nơi (label 3D nổi trên node, thẻ trong `Services.tsx` phía dưới trang — **không** trùng hành vi, `Services.tsx` là link điều hướng trang, còn label 3D là focus camera tại chỗ) — xác nhận không nhầm lẫn 2 luồng tương tác này khi demo cho khách hàng.

### 11.9 Nâng cấp `CustomCursor.tsx` — thêm state `dragging` (đúng bản gốc)

Bản gốc có 2 class trạng thái: `.hovering` (hover phần tử tương tác) và `.dragging` (đang giữ chuột trái kéo xoay scene) — bản nháp ở lần trả lời trước của tôi (mục 4.3 cũ) **mới chỉ có `.hovering`**, thiếu `.dragging`. Bổ sung:

```tsx
// src/components/ui/CustomCursor.tsx — thêm vào useEffect hiện có
const handlePointerDown = (e: PointerEvent) => {
  if (e.button === 0) document.body.classList.add('cursor-dragging');
};
const handlePointerUp = () => {
  document.body.classList.remove('cursor-dragging');
};

window.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('pointerup', handlePointerUp);

// nhớ thêm vào cleanup return:
window.removeEventListener('pointerdown', handlePointerDown);
window.removeEventListener('pointerup', handlePointerUp);
```

CSS bổ sung:

```css
body.cursor-dragging .cursor-outline {
  width: 58px; height: 58px; border-color: rgba(103, 232, 249, 0.65);
}
```

- [ ] Test: giữ chuột trái kéo trên scene 3D → outline cursor phồng to hơn cả trạng thái hover thường, đổi màu viền sang cyan — đúng cảm giác "đang thao tác không gian" như bản gốc.

### 11.10 Checklist tổng hợp Mục 11 (thêm vào task tracker, nối tiếp mục 9 đã có)

```
[ ] 11.1  Thêm ecosystem.nodes vào vi.json/en.json, chạy script diff key xác nhận khớp
[ ] 11.2  Tạo src/lib/three/fieldData.ts
[ ] 11.3  Tạo CoreLabel.tsx + CSS gradient/glow/animation trong globals.css (kèm override .light)
[ ] 11.4  Thêm <Html> node label vào BusinessNode.tsx + CSS .ai-era-node-label
[ ] 11.5  Sửa AiEraScene.tsx: nhận fieldData qua props, xoá dead code handleFocus, xoá World cũ trùng lặp
[ ] 11.6  Sửa CameraController.tsx: nhận fieldData qua props, ghi telemetry ra DOM bằng id
[ ] 11.6b Chạy grep xác minh world.rotation trong file gốc TRƯỚC khi hoàn tất 11.5/11.6, báo cáo trong PR
[ ] 11.7  Tạo SceneHUD.tsx + toàn bộ CSS .ai-era-hud/.ai-era-controls/.ai-era-focus-panel
[ ] 11.8  Ráp AiEraScene + CoreLabel + SceneHUD vào page.tsx, thêm home.hud.copy/home.coreSubtitle nếu cần
[ ] 11.9  Nâng cấp CustomCursor.tsx thêm state dragging
[ ] —     Test end-to-end: xoay 360°, lăn chuột bay, click node → camera bay cong tới node → panel hiện đúng mô tả tiếng Việt/Anh theo locale → bấm Reset/Return to core → camera bay ngược lại đúng vị trí ban đầu
[ ] —     Test responsive: HUD ẩn trên mobile, node label rút gọn (ẩn số thứ tự) dưới 900px, focus panel full-width trên mobile
[ ] —     Test Day/Night mode: chữ "AI Era" đổi gradient đúng theo `.light` override, không bị chói mắt ở Day Mode
```

