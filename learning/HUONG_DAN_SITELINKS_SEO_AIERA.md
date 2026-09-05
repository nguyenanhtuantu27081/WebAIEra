# Hướng dẫn Technical SEO cho aiera.vn — Đạt Sitelinks & Brand Search

**Đối tượng:** Junior Dev
**Mục tiêu:** Website https://aiera.vn/ hiển thị **Sitelinks** trên Google, và các truy vấn thương hiệu (`aiera`, `ai era`, `ai era solution`, `ai era fintech`, `fintech`) trả về đúng https://aiera.vn/
**Nguồn:** Review code thực tế trong `source/` (Next.js 14 App Router + next-intl)

---

## 0. TÓM TẮT — LỖI NGHIÊM TRỌNG NHẤT (phải sửa trước tiên)

Trước khi làm bất kỳ checklist nào bên dưới, đây là các lỗi **chặn hoàn toàn** khả năng lên Sitelinks. Nếu không sửa mục này, mọi việc tối ưu khác đều vô nghĩa.

### 🔴 Lỗi #1 — Sai tên miền trên TOÀN BỘ code (Critical)
Toàn bộ codebase hard-code domain **`https://ai-era.vn`** (có dấu gạch ngang), trong khi domain thật đang chạy là **`https://aiera.vn`** (không có gạch ngang):

- `src/app/robots.ts` → `Sitemap: https://ai-era.vn/sitemap.xml`
- `src/app/sitemap.ts` → `const baseUrl = 'https://ai-era.vn'`
- `src/lib/seo/metadata.ts` → `siteConfig.url = 'https://ai-era.vn'`
- `src/lib/seo/schema.ts` → toàn bộ `url`, `logo` dùng `ai-era.vn`
- `src/app/[locale]/page.tsx` → JSON-LD Organization/WebSite dùng `ai-era.vn`, email `contact@ai-era.vn`

**Hậu quả:** canonical tag, sitemap, schema Organization/WebSite đều trỏ về domain khác với domain thật → Google index nhầm domain, hoặc coi 2 domain là 2 entity khác nhau → **không thể gộp tín hiệu thương hiệu để hiển thị Sitelinks**, và tìm "ai era" có thể không ra `aiera.vn`.
→ Xử lý ở **Checklist A**.

### 🔴 Lỗi #2 — Trang chủ là Client Component (`'use client'`)
`src/app/[locale]/page.tsx` khai báo `'use client'`. Điều này gây 2 vấn đề:
1. Không thể `export function generateMetadata()` cho trang chủ (Next.js chỉ cho phép ở Server Component) → **trang chủ đang không có `<title>`/`description`/canonical/hreflang riêng**, chỉ dùng metadata mặc định (nếu có) từ layout.
2. JSON-LD `<script>` bị render phía client → Googlebot vẫn đọc được (Google render JS) nhưng chậm hơn, rủi ro hơn so với server-render, và không nhất quán với các trang service (vốn là Server Component).

→ Xử lý ở **Checklist A**.

### 🔴 Lỗi #3 — Menu điều hướng trỏ tới trang không tồn tại (404)
`Header.tsx` có link `/services` và `/contact`; `Footer.tsx` có thêm `/about`, `/privacy`. Nhưng trong `src/app/[locale]/` **không hề có** `services/page.tsx`, `contact/page.tsx`, `about/page.tsx`, `privacy/page.tsx`. Toàn bộ 4 link này sẽ ra **404**.

**Hậu quả:** Google Search Console sẽ báo lỗi "Not Found (404)" cho các internal link quan trọng nhất trên site (nằm trong Header — xuất hiện ở mọi trang). Đây là tín hiệu **cấu trúc site kém** khiến Google khó xác định site hierarchy → giảm mạnh cơ hội có Sitelinks.
→ Xử lý ở **Checklist B & C**.

### 🔴 Lỗi #4 — Thiếu ảnh/asset được khai báo trong schema & metadata
`schema.ts`/`metadata.ts`/`page.tsx` tham chiếu `logo.png` và `og-image.jpg`, nhưng thư mục `public/` chỉ có `manifest.json`. Google Merchant/Logo guideline yêu cầu `logo` trong schema Organization phải resolve được (200 OK).
→ Xử lý ở **Checklist A.6**.

### 🟠 Lỗi #5 — `sameAs` rỗng, thiếu `SearchAction`
`sameAs: []` trong Organization schema (trang chủ) — không có bất kỳ social profile nào để Google đối chiếu xác thực entity "AI Era". `WebSite` schema cũng thiếu `potentialAction` (SearchAction) — đây là schema bắt buộc nếu muốn có **Sitelinks Search Box**.
→ Xử lý ở **Checklist A.3, A.4**.

---

## 1. Bối cảnh kỹ thuật quan trọng cần biết trước khi sửa

- Stack: **Next.js 14 (App Router)** + `next-intl` (locale prefix `/vi`, `/en`, mặc định `vi`).
- Route thật: `src/app/[locale]/...` — **không có route "/" trần**, mọi trang đều có tiền tố locale. `middleware.ts` tự redirect `/` → `/vi`.
- Sitemap & robots đang được viết dưới dạng **Route Handler thủ công** (`src/app/robots.ts`, `src/app/sitemap.ts` dùng `export async function GET()`), **không dùng** API chuẩn `MetadataRoute.Sitemap`/`MetadataRoute.Robots` mà Next.js 14 hỗ trợ sẵn. Điều này không sai, nhưng dễ gây lỗi thủ công (chính là lỗi domain ở trên) và khó bảo trì.
- Hiện có 6 trang dịch vụ (service) dưới `/services/<slug>`, không có trang index `/services`, không có blog/kiến thức, không có trang `/about`, `/contact`.

**Lưu ý cho Sitelinks:** Google **tự động** chọn Sitelinks dựa trên cấu trúc site + hành vi người dùng + độ phổ biến của trang con — **không có cách nào ép Google hiển thị Sitelinks trực tiếp**. Việc của chúng ta là tối ưu 4 kỹ thuật nền tảng (Structured Data, Site Hierarchy, Internal Linking, Sitemap) và loại bỏ mọi rào cản kỹ thuật (404, domain sai, thiếu metadata) để **tăng xác suất tối đa**.

---

## CHECKLIST A — Structured Data (Schema Markup)

### A.1. Sửa toàn bộ domain sai trong code
Tạo 1 biến môi trường duy nhất, dùng lại ở mọi nơi thay vì hard-code chuỗi.

**File `.env` / biến môi trường:**
```
NEXT_PUBLIC_SITE_URL=https://aiera.vn
```

**`src/lib/seo/metadata.ts`** — sửa:
```ts
export const siteConfig = {
  name: 'AI Era',
  description: 'AI Era cung cấp các giải pháp AI và digital marketing toàn diện cho doanh nghiệp Việt Nam.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn',
  ogImage: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn'}/og-image.jpg`,
  creator: 'AI Era',
};
```
Đồng thời bổ sung `metadataBase: new URL(siteConfig.url)` vào object trả về của `generateMetadata()` — Next.js dùng field này để tự resolve các URL tương đối trong OG image, tránh warning và tránh sai domain khi build.

**`src/lib/seo/schema.ts`** — thay toàn bộ `https://ai-era.vn` → `https://aiera.vn` (hoặc import từ `siteConfig.url`).

**`src/app/robots.ts`** — sửa dòng cuối:
```
Sitemap: https://aiera.vn/sitemap.xml
```

**`src/app/sitemap.ts`** — sửa:
```ts
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn';
```

**`src/app/[locale]/page.tsx`** — sửa toàn bộ `ai-era.vn` → `aiera.vn`, `contact@ai-era.vn` → email đúng theo domain thật.

> ✅ **Checklist xác minh:** search toàn repo bằng `grep -rn "ai-era.vn" src/` phải trả về **0 kết quả** sau khi sửa xong.

### A.2. Chuyển trang chủ về Server Component
- Đổi `src/app/[locale]/page.tsx`: xóa `'use client'` ở đầu file.
- Phần cần tương tác phía client (nếu Hero/Ecosystem/Three.js scene cần `useState`, animation...) thì **giữ nguyên `'use client'` bên trong từng component con** (`Hero.tsx`, `AiEraScene.tsx`...) — chỉ cần page.tsx (route file) là Server Component.
- Sau khi chuyển, thêm `generateMetadata()` cho trang chủ giống cấu trúc các trang service:
```ts
import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  return buildMetadata({
    title: locale === 'vi'
      ? 'AI Era — Giải pháp AI & Fintech cho doanh nghiệp Việt Nam'
      : 'AI Era — AI & Fintech Solutions for Vietnamese Businesses',
    description: 'AI Era (AI Era Solution) cung cấp giải pháp AI Automation, AI Agent, Fintech, phân tích định lượng chứng khoán và Digital Marketing.',
    path: '',
    locale,
  });
}
```
> Lưu ý: chèn cụm từ khóa thương hiệu **"AI Era", "AI Era Solution", "Fintech"** tự nhiên trong title/description trang chủ — đây là tín hiệu quan trọng để Google gắn các truy vấn brand (`ai era solution`, `ai era fintech`, `fintech`) với domain `aiera.vn`.

### A.3. Bổ sung `sameAs` (xác thực thực thể thương hiệu)
Trong Organization schema (cả `schema.ts` và JSON-LD ở `page.tsx`), thêm toàn bộ social/profile chính thức của công ty:
```ts
sameAs: [
  'https://www.facebook.com/<fanpage-that>',
  'https://www.linkedin.com/company/<company-that>',
  'https://www.youtube.com/@<channel-that>',
  // thêm Zalo OA, Crunchbase, G2... nếu có
],
```
> Nếu chưa có các trang này, phối hợp với marketing để tạo/xác nhận link chính thức trước khi điền — **không điền link không thuộc sở hữu công ty**.

### A.4. Thêm `SearchAction` vào WebSite schema (bắt buộc cho Sitelinks Search Box)
```ts
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Era',
  url: siteConfig.url,
  description: '...',
  inLanguage: ['vi', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/vi/tim-kiem?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
```
> Cần có chức năng tìm kiếm thật trên site tại URL này (mục **Checklist B.5**) — Google sẽ kiểm tra thử, nếu không hoạt động sẽ không hiển thị search box.

### A.5. Thêm `WebPage` schema cho từng trang service + gắn Organization schema global
- Tạo 1 component dùng chung `<JsonLd data={...} />` để tránh lặp code `<script dangerouslySetInnerHTML>` ở 6 file service page.
- Đặt **Organization schema + WebSite schema** ở `layout.tsx` cấp `[locale]` (dùng chung cho mọi trang, chỉ render 1 lần), thay vì chỉ đặt ở `page.tsx` (trang chủ) như hiện tại. Việc này giúp Google thấy Organization schema nhất quán ở mọi trang, tăng độ tin cậy của entity.
- Từng trang service **giữ nguyên** `serviceSchema` + `breadcrumbSchema` riêng (đã làm đúng), chỉ cần sửa domain (mục A.1).

### A.6. Chuẩn bị đúng asset được khai báo trong schema
- Thêm file `public/logo.png` (khuyến nghị ≥ 112×112px, nền trong suốt hoặc trắng, đúng logo thương hiệu — theo [Google Logo guidelines](https://developers.google.com/search/docs/appearance/structured-data/logo)).
- Thêm file `public/og-image.jpg` (1200×630px) dùng cho Open Graph/Twitter Card.
- Kiểm tra `favicon` + `manifest.json` hiển thị đúng tên "AI Era" (ảnh hưởng tới Site Name hiển thị trên SERP, một phần liên quan tới Sitelinks/brand result).

### A.7. Kiểm thử Structured Data (bắt buộc trước khi coi là "Done")
Sau khi deploy staging/production:
1. Chạy [Google Rich Results Test](https://search.google.com/test/rich-results) cho: trang chủ, 1 trang service, kiểm tra **0 lỗi (Errors)**.
2. Chạy [Schema Markup Validator](https://validator.schema.org/) — kiểm tra Organization, WebSite, Service, BreadcrumbList đều pass.
3. Trong Google Search Console → **Enhancements** → theo dõi mục Breadcrumbs không có lỗi.

---

## CHECKLIST B — Clear Site Hierarchy (Cấu trúc website rõ ràng)

Google chọn Sitelinks dựa nhiều vào cấu trúc phân cấp rõ ràng (site có "trục" chính + các nhánh con hợp lý). Hiện site đang **phẳng** (flat: 6 trang service ngang hàng, không có landing "hub").

### B.1. Tạo trang index `/services` (hub page) — đang bị thiếu, gây 404
```
src/app/[locale]/services/page.tsx
```
- Nội dung: giới thiệu ngắn + card link tới cả 6 service, mỗi card có anchor text mô tả (không dùng "xem thêm").
- Thêm `generateMetadata()` + `breadcrumbSchema([{name:'Trang chủ', url:'/'}, {name:'Dịch vụ', url:'/services'}])`.
- Đây chính là ứng viên tốt nhất để trở thành 1 trong các **Sitelinks** (trang hub luôn được Google ưu tiên).

### B.2. Tạo các trang còn thiếu đang bị 404
Tạo tối thiểu các trang sau (đang được Header/Footer trỏ tới nhưng chưa tồn tại):
- `src/app/[locale]/about/page.tsx` — Giới thiệu công ty (About) — trang này **rất quan trọng** cho E-E-A-T và cho Google hiểu entity "AI Era".
- `src/app/[locale]/contact/page.tsx` — Liên hệ, kèm `LocalBusiness`/`ContactPage` schema nếu có địa chỉ văn phòng.
- `src/app/[locale]/privacy/page.tsx` — Chính sách bảo mật.

> ✅ Sau khi tạo xong, test lại toàn bộ link ở Header/Footer bằng tay hoặc bằng crawler (Screaming Frog) → phải **0 link 404**.

### B.3. Chuẩn hoá phân cấp URL (URL hierarchy)
- URL hiện tại đã khá tốt (`/services/<slug>` phẳng 1 cấp). Gợi ý nâng cấp để rõ ràng hơn về mặt "silo" nội dung — không bắt buộc nhưng nên cân nhắc nếu sắp có blog:
  - `/services` (hub)
  - `/services/ai-automation-ai-agent`
  - `/blog` (hub) + `/blog/<slug>` — nếu công ty có kế hoạch content marketing (khuyến nghị mạnh vì hiện site chưa có content pillar nào để build topical authority cho từ khóa "fintech").

### B.4. Breadcrumb hiển thị (visual), không chỉ schema
Hiện tại chỉ có breadcrumb **schema** (invisible), không có breadcrumb **UI** hiển thị cho người dùng trên các trang service. Cần:
- Tạo component `<Breadcrumb items={[...]} />` hiển thị dạng `Trang chủ / Dịch vụ / AI Automation & AI Agent` ở đầu mỗi trang service.
- Dùng chung data cho cả UI và `breadcrumbSchema()` (tránh lệch dữ liệu giữa 2 nơi).
- Lý do bắt buộc: Google Search Central khuyến nghị breadcrumb schema phải **khớp với breadcrumb hiển thị thật trên trang** để được tin tưởng và lấy hiển thị trên SERP.

### B.5. Bổ sung chức năng tìm kiếm nội bộ (Internal Search)
Cần để phục vụ `SearchAction` (mục A.4):
- Tạo trang `/[locale]/tim-kiem?q=` với search cơ bản (kể cả chỉ search trong 6 service + about/contact bằng client-side filter cũng đủ điều kiện ban đầu).

### B.6. XML structure / heading hierarchy trong từng trang
Kiểm tra mỗi trang chỉ có **đúng 1 thẻ `<h1>`**, các heading con dùng `<h2>`/`<h3>` đúng thứ tự lồng nhau (đã đúng ở các trang service hiện tại theo review — giữ nguyên pattern này khi tạo trang mới).

---

## CHECKLIST C — Internal Linking (Liên kết nội bộ)

### C.1. Sửa toàn bộ link "cụt" trong Header/Footer
- `Header.tsx`: `/services` → trỏ đúng sau khi có trang hub (B.1); `/contact` → trỏ đúng sau khi có trang (B.2).
- `Footer.tsx`: bổ sung 2 service đang bị thiếu (`digital-marketing-ai-content`, `landing-page-hosting`) — hiện Footer chỉ liệt kê 4/6 dịch vụ, khiến 2 trang này **ít được liên kết nội bộ nhất site** (yếu tín hiệu quan trọng nhất theo PageRank nội bộ).

### C.2. Internal link giữa các trang service với nhau (related services)
Hiện các trang service **không link chéo nhau**. Thêm block "Dịch vụ liên quan" (Related Services) ở cuối mỗi trang service, link tới 2–3 service khác kèm anchor text mô tả rõ ràng (không dùng "tại đây"/"xem thêm"), ví dụ:
```
Xem thêm: AI Automation & AI Agent | Phần mềm quản lý doanh nghiệp
```

### C.3. Internal link từ trang chủ xuống từng service bằng anchor text chuẩn
- Kiểm tra component `Services.tsx` (được render ở `page.tsx`) đang link tới 6 service — đảm bảo anchor text trùng với H1 của trang đích (tăng relevance tín hiệu nội bộ).

### C.4. Breadcrumb (mục B.4) cũng là 1 dạng internal link quan trọng
Mỗi breadcrumb là 1 internal link về trang cha → tự động củng cố cấu trúc phân cấp.

### C.5. Kiểm tra không có "orphan page" (trang mồ côi)
- Sau khi hoàn thành A + B, chạy crawl toàn site (Screaming Frog / Ahrefs Site Audit) → đảm bảo **mọi trang trong sitemap.xml đều được ít nhất 1 internal link trỏ tới**, và **mọi internal link đều trả về 200** (không 404, không redirect chain).

---

## CHECKLIST D — Sitemap XML

### D.1. Sửa domain sai (đã nêu ở A.1) — bắt buộc trước tiên

### D.2. Bổ sung URL còn thiếu vào `sitemap.ts`
Sau khi tạo các trang mới (B.1, B.2), cập nhật mảng `pages` trong `src/app/sitemap.ts`:
```ts
const pages = [
  { url: '/', priority: 1.0, changefreq: 'daily' },
  { url: '/services', priority: 0.9, changefreq: 'weekly' },
  { url: '/about', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.6, changefreq: 'monthly' },
  { url: '/services/phan-tich-dinh-luong-chung-khoan', priority: 0.8, changefreq: 'weekly' },
  { url: '/services/ai-automation-ai-agent', priority: 0.8, changefreq: 'weekly' },
  { url: '/services/thiet-ke-website-chuan-seo', priority: 0.8, changefreq: 'weekly' },
  { url: '/services/landing-page-hosting', priority: 0.8, changefreq: 'weekly' },
  { url: '/services/digital-marketing-ai-content', priority: 0.8, changefreq: 'weekly' },
  { url: '/services/phan-mem-quan-ly-doanh-nghiep', priority: 0.8, changefreq: 'weekly' },
  // KHÔNG thêm /privacy vào sitemap — trang chính sách thường noindex, không cần Google ưu tiên crawl
];
```

### D.3. Cân nhắc dùng API chuẩn của Next.js thay vì Route Handler thủ công
Khuyến nghị đổi `src/app/sitemap.ts` sang dùng `MetadataRoute.Sitemap` chuẩn của Next 14 (tự động format XML đúng chuẩn, tránh lỗi thủ công như domain sai):
```ts
import { MetadataRoute } from 'next';
import { routing } from '@/lib/i18n/routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aiera.vn';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [ /* danh sách như D.2 */ ];
  return pages.flatMap((page) =>
    routing.locales.map((locale) => ({
      url: `${baseUrl}/${locale}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changefreq as any,
      priority: page.priority,
      alternates: {
        languages: { en: `${baseUrl}/en${page.url}`, vi: `${baseUrl}/vi${page.url}` },
      },
    }))
  );
}
```
Tương tự đổi `robots.ts` sang `MetadataRoute.Robots`. (Không bắt buộc nếu thiếu thời gian — nhưng **domain phải đúng** dù dùng cách nào.)

### D.4. `lastModified` phải phản ánh đúng ngày sửa nội dung thật
Hiện tại `lastModified: new Date().toISOString()` luôn trả về **thời điểm request**, khiến mọi URL luôn hiển thị "vừa cập nhật" — sai lệch, làm giảm độ tin cậy tín hiệu freshness với Googlebot. Sửa thành ngày cập nhật nội dung thật (hard-code theo ngày publish/update từng trang, hoặc lấy từ CMS/git commit date nếu có).

### D.5. Submit & theo dõi sitemap trong Google Search Console
1. Vào GSC → **Sitemaps** → submit `https://aiera.vn/sitemap.xml`.
2. Nếu domain cũ `ai-era.vn` từng được submit/index trước đó → xử lý ở **Checklist E** (rất quan trọng, liên quan trực tiếp brand search).

---

## CHECKLIST E — Tối ưu Brand Search (`aiera`, `ai era`, `ai era solution`, `ai era fintech`, `fintech`, `thiết kế website`, `thiết kế landing page`)

Đây là phần trả lời trực tiếp yêu cầu "tìm bằng từ khóa aiera/ai era.../fintech/thiết kế website/thiết kế landing page đều ra aiera.vn".

### E.1. Kiểm tra & xử lý domain `ai-era.vn` (nếu tồn tại/đã từng chạy)
1. Dùng `whois`/trình duyệt kiểm tra xem `ai-era.vn` có đang trỏ về đâu không.
2. Nếu `ai-era.vn` **thuộc sở hữu công ty** và từng có nội dung/backlink → set up **301 redirect toàn bộ** từ `ai-era.vn` → `aiera.vn` (giữ nguyên path), sau đó submit "Change of Address" trong Google Search Console (property `ai-era.vn` → `aiera.vn`) để gộp tín hiệu.
3. Nếu `ai-era.vn` **không thuộc sở hữu công ty** → càng phải sửa domain trong code (Checklist A.1) gấp, vì hiện tại code đang tự "hiến" tín hiệu SEO cho 1 domain không phải của mình.

### E.2. Đăng ký & xác thực Google Business Profile (GBP)
- Tạo/claim **Google Business Profile** với tên chính xác "AI Era" hoặc "AI Era Solution", website = `https://aiera.vn`, category liên quan Fintech/Software/Marketing Agency.
- GBP là 1 trong những tín hiệu mạnh nhất giúp Google map brand keyword → đúng entity/domain, đặc biệt cho truy vấn có tên thương hiệu.

### E.3. Nhất quán "NAP + Brand Name" (Organization schema, footer, GBP, social) 
Đảm bảo tên thương hiệu, mô tả xuất hiện **nhất quán** ở mọi nơi để Google gộp thành 1 entity:
- Title trang chủ nên chứa cả biến thể: "AI Era" và có thể nhắc "AI Era Solution" trong description/about page (vì đây là từ khóa brand người dùng tìm).
- Thêm 1 đoạn text ngắn ở trang **About** xác nhận rõ: "AI Era (tên đầy đủ: AI Era Solution) là công ty cung cấp giải pháp AI và Fintech..." — giúp Google/AI Overview hiểu các biến thể tên là cùng 1 thực thể.
- Đảm bảo từ "Fintech" xuất hiện tự nhiên (không nhồi nhét) ở: title/description trang chủ, About page, và ít nhất 1 service liên quan (`phan-tich-dinh-luong-chung-khoan`) — vì user muốn từ khóa đơn "fintech" (khá chung chung/cạnh tranh) cũng trỏ về site, nên cần content pillar mạnh về chủ đề Fintech (xem E.5).

### E.4. Google Search Console — Brand query monitoring
- Sau khi index lại, theo dõi **Performance report** filter theo query chứa "aiera", "ai era" → kiểm tra site có đang xếp hạng #1 cho các query brand hay không (thường brand query luôn nên #1 nếu kỹ thuật đúng).
- Nếu vẫn không lên top cho "ai era" sau 2–4 tuần kể từ khi sửa domain: kiểm tra xem có website/directory bên thứ 3 nào khác đang dùng "AI Era" trùng tên gây nhiễu tín hiệu không (search thủ công trên Google).

### E.5. Riêng từ khóa "fintech" (từ khóa chung, cạnh tranh cao)
Một từ khóa đơn "fintech" **rất khó** chỉ nhờ kỹ thuật (schema/sitemap/internal link) mà lên top — cần thêm content pillar:
- Khuyến nghị: xây dựng chuyên mục `/blog` hoặc `/kien-thuc` với nội dung chuyên sâu về Fintech (liên kết nội bộ dày đặc với trang `phan-tich-dinh-luong-chung-khoan`), để xây dựng **topical authority**.
- Đây là hạng mục content/off-page, ngoài phạm vi code, nhưng dev cần **chuẩn bị sẵn route + template** (`/blog/[slug]`) với đầy đủ `Article` schema, breadcrumb, internal link tới service liên quan để team content triển khai ngay khi có bài viết.

### E.6. Từ khóa "thiết kế website" / "thiết kế landing page" (dịch vụ, cạnh tranh trung bình–cao)
Hai từ khóa này đã có sẵn trang đích rõ ràng (`/services/thiet-ke-website-chuan-seo`, `/services/landing-page-hosting`), nhưng cần củng cố thêm để cạnh tranh với các agency khác cũng target đúng cụm từ này:
- **Title/H1 đã chứa từ khóa đúng** ("Thiết kế website chuẩn SEO & AI SEO", "Thiết kế Landing Page & Miễn phí Hosting") — giữ nguyên, không đổi.
- **Bổ sung "Dự án tiêu biểu" (Case Study/Portfolio)** vào 2 trang này — đã triển khai (xem mục E.7 bên dưới), giúp: (1) tăng độ tin cậy/E-E-A-T cho từ khóa dịch vụ, (2) người dùng tìm "thiết kế website"/"thiết kế landing page" thấy bằng chứng sản phẩm thật, tăng CTR & thời gian ở lại trang → tín hiệu tích cực cho Google.
- Thêm `CreativeWork`/`Product` schema mô tả dự án nếu muốn nâng cao hơn (không bắt buộc ở giai đoạn này).
- Đảm bảo 2 trang này **luôn nằm trong Footer + trang `/services` (hub)** — hiện Footer đang thiếu 2 link này (xem lại **C.1**), cần sửa gấp vì đây chính là 2 trang target từ khóa dịch vụ quan trọng.

### E.7. Case Study / Backlink dự án — ARA Beauty Center (đã triển khai trong code)
Đã thêm section **"Dự án tiêu biểu"** vào 2 trang sau, dẫn tới website khách hàng thực tế `https://arabeautycenter.com/` (dự án do AI Era thiết kế):
- `src/app/[locale]/services/thiet-ke-website-chuan-seo/page.tsx`
- `src/app/[locale]/services/landing-page-hosting/page.tsx`

Chi tiết kỹ thuật đã áp dụng:
```tsx
<a
  href="https://arabeautycenter.com/"
  target="_blank"
  rel="noopener"
  className="text-indigo hover:text-indigo-2 transition-colors"
>
  ARA Beauty Center
</a>
```
**Lưu ý về `rel` attribute (quan trọng, dev cần hiểu rõ trước khi copy-paste):**
- Dùng `rel="noopener"` (không thêm `nofollow`) vì đây là **case study/portfolio thật** do AI Era thực hiện — không phải link trả phí/quảng cáo, nên để **dofollow** là hợp lý và đúng chuẩn Google (link "tự nhiên" tới sản phẩm thật của chính mình).
- Nếu sau này link dạng "đối tác trả phí" / "affiliate" / "được tài trợ" → **bắt buộc** đổi thành `rel="sponsored noopener"` theo đúng [Google Search Central guideline về qualifying outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links).
- Không lạm dụng: chỉ thêm case study khi đó **thực sự là dự án AI Era đã làm** — không thêm link tới site không liên quan chỉ để "trao đổi backlink", vì đây là hành vi link scheme, có thể bị Google phạt cả 2 site.

> ✅ Việc còn lại cho dev: xác nhận với team account/PM rằng `arabeautycenter.com` đúng là dự án đã bàn giao, và (khuyến khích) liên hệ để phía ARA Beauty Center gắn ngược **1 backlink từ arabeautycenter.com trỏ về aiera.vn** (dạng "Thiết kế bởi AI Era" ở footer) — đây là backlink 2 chiều tự nhiên, tốt cho cả 2 bên và tốt hơn 1 chiều.

---

## 2. QUY TRÌNH TRIỂN KHAI (thứ tự thực hiện đề xuất cho Junior Dev)

- [x] **Bước 1:** Sửa domain sai toàn bộ code (A.1) — commit riêng, dễ review/rollback.
- [x] **Bước 2:** Chuyển `page.tsx` (trang chủ) thành Server Component + thêm `generateMetadata` (A.2).
- [x] **Bước 3:** Tạo các trang thiếu: `/services` (hub), `/about`, `/contact`, `/privacy` (B.1, B.2).
- [x] **Bước 4:** Sửa link 404 trong `Header.tsx`, `Footer.tsx` + bổ sung 2 service còn thiếu ở Footer (C.1).
- [x] **Bước 5:** Thêm component `Breadcrumb` UI dùng chung data với `breadcrumbSchema` (B.4).
- [x] **Bước 6:** Bổ sung `sameAs`, `SearchAction`, di chuyển Organization/WebSite schema lên `layout.tsx` (A.3, A.4, A.5).
- [x] **Bước 7:** Thêm asset `logo.png`, `og-image.jpg` vào `public/` (A.6).
- [x] **Bước 8:** Cập nhật `sitemap.ts` với URL mới + sửa `lastModified` (D.2, D.4).
- [x] **Bước 9:** Thêm internal link chéo giữa các trang service (C.2, C.3).
- [ ] **Bước 10:** Deploy staging → chạy Rich Results Test + Schema Validator (A.7).
- [ ] **Bước 11:** Crawl toàn site bằng Screaming Frog → xác nhận 0 lỗi 404/redirect chain (C.5).
- [ ] **Bước 12:** Deploy production → submit sitemap trong GSC, xử lý domain `ai-era.vn` nếu có (D.5, E.1).
- [ ] **Bước 13:** Tạo/claim Google Business Profile (E.2).
- [ ] **Bước 14:** Xác nhận case study `arabeautycenter.com` đúng dự án thật, đề nghị backlink ngược về `aiera.vn` (E.7).
- [ ] **Bước 15:** Theo dõi Performance report cho brand + service query ("aiera", "ai era", "thiết kế website", "thiết kế landing page") trong 2–4 tuần (E.4, E.6).

## 3. LƯU Ý CUỐI

- **Sitelinks không thể "bật" thủ công** — Google tự quyết định dựa trên chất lượng site + hành vi tìm kiếm theo thời gian (thường mất vài tuần đến vài tháng sau khi sửa kỹ thuật). Checklist này tối ưu **điều kiện cần**, không đảm bảo **thời điểm** xuất hiện.
- Việc site hiện tại đang chạy trên domain khác với domain khai báo trong code (`ai-era.vn` vs `aiera.vn`) là rủi ro SEO nghiêm trọng nhất — cần xác nhận với team/khách hàng domain chính thức là gì **trước khi** bắt đầu sửa code, để tránh sửa nhầm chiều.
