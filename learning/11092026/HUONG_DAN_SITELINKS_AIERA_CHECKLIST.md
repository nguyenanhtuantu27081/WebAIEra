# Hướng dẫn Sitelinks & Structured Data cho aiera.vn — Checklist cho Junior Dev

**Mục tiêu:** Giúp Google hiểu rõ cấu trúc site → hiển thị **Sitelinks** (các link phụ dưới kết quả tìm kiếm chính) cho `aiera.vn`.
**Phạm vi review:** site tĩnh thực tế đang chạy tại `ai-era-site/` (KHÔNG phải bản Next.js trong `source/`, bản đó đang là bản rebuild WIP, chưa deploy).

Sitelinks **không cấu hình trực tiếp được** — Google tự sinh ra khi thuật toán tin rằng site có cấu trúc rõ ràng, điều hướng nhất quán và có đủ tín hiệu uy tín (traffic, brand search). Việc của dev là dọn 4 nhóm tín hiệu dưới đây cho sạch để xác suất được hiển thị Sitelinks tăng lên.

---

## 🔴 BƯỚC 0 — Fix lỗi mất dấu tiếng Việt (làm trước tiên, chặn mọi việc khác)

Kiểm tra thực tế bằng Python (không phải lỗi hiển thị terminal) trong `fintech-ai-quant-finance.html`:

```
Hiện tại (sai): "Công ngh tài chính & Đnh lượng AI"
Đúng phải là : "Công nghệ tài chính & Định lượng AI"
```

Một số ký tự có dấu (ví dụ `ệ`, `ị`) đang bị **rớt mất hoàn toàn** trong `<title>`, `<meta description>`, `og:title`, `og:description`, JSON-LD `Service.name/description`, và `<h1>` của trang này. Đây là lỗi nội dung nghiêm trọng vì:
- Google hiển thị **nguyên văn** `<title>`/`<meta description>` bị lỗi này trên trang kết quả tìm kiếm.
- JSON-LD chứa chuỗi lỗi vẫn có thể là JSON hợp lệ về mặt cú pháp nhưng **sai về nội dung** → Google đọc sai tên dịch vụ.

**Việc cần làm:**
1. Rà **toàn bộ 7 file HTML** trong `ai-era-site/` (không chỉ file trên) bằng cách mở từng file và tìm các từ có dấu `ệ`, `ị`, `ẫ`, `ẽ`... trong `<title>`, `<meta>`, JSON-LD, `<h1>`–`<h3>`.
2. Sau khi sửa tay, validate lại từng khối JSON-LD:
   ```bash
   python3 -c "import json,glob;
   for f in glob.glob('ai-era-site/*.html'):
       import re
       html = open(f, encoding='utf-8').read()
       for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.S):
           json.loads(m)  # raise nếu JSON hỏng
   print('OK toàn bộ JSON-LD hợp lệ')"
   ```
3. Tìm nguyên nhân gốc: rà lại mọi script/tool (bash, Python, Node) từng ghi đè các file `.html` này — đảm bảo luôn đọc/ghi với `encoding='utf-8'` tường minh, không dựa vào encoding mặc định của OS/terminal. Đây là lỗi đã từng xảy ra và được "fix" trước đó (xem `learning/HUONG_DAN_SITELINKS_CAU_TRUC_HIEN_TAI_AIERA.md`) nhưng đã **tái phát** ở file được sửa gần nhất (`fintech-ai-quant-finance.html`, lastmod 2026-09-10) → cần thêm bước kiểm tra encoding vào quy trình publish trước khi coi là xong.

---

## 1. Structured Data / Schema Markup

### ✅ Đã làm đúng — giữ nguyên
- `Organization` + `WebSite` (`@graph`) đặt trong `index.html`, có `sameAs` (Facebook, Zalo) và đủ `alternateName` cho biến thể thương hiệu.
- `WebSite.potentialAction` (SearchAction) → đủ điều kiện kỹ thuật cho **Sitelinks Search Box**.
- `ItemList` liệt kê 6 trang dịch vụ ngay trên trang chủ → tín hiệu hierarchy tốt cho Google.
- Mỗi trang dịch vụ con có `BreadcrumbList` + `Service` schema riêng, đúng theo cấu trúc site.

### ❌ Cần sửa

**1.1. Đồng bộ kênh liên hệ vào `sameAs`**
`Organization.sameAs` hiện chỉ có Facebook + Zalo, nhưng footer đã có LinkedIn (`linkedin.com/company/ai-era-vn`). Bổ sung:
```json
"sameAs": [
  "https://www.facebook.com/aiera.vn",
  "https://zalo.me/84977511663",
  "https://www.linkedin.com/company/ai-era-vn/"
]
```
Sửa tại khối `@graph` → `Organization` trong `index.html` (dòng ~40-68).

**1.2. Thêm `BreadcrumbList` hiển thị (visible), không chỉ có trong JSON-LD**
Hiện breadcrumb chỉ tồn tại "vô hình" trong `<script type="application/ld+json">`, còn trên UI mỗi trang dịch vụ chỉ có nút `back-link` ("Quay lại AI Era Ecosystem") — không có breadcrumb trail thật (`Trang chủ > Dịch vụ > Tên dịch vụ`). Google khuyến nghị breadcrumb schema nên **khớp với breadcrumb hiển thị trên trang** để tăng độ tin cậy. Cần thêm 1 dòng breadcrumb HTML thật ngay trên `<h1>` của mỗi trang dịch vụ:
```html
<nav class="breadcrumb" aria-label="Breadcrumb">
  <a href="./index.html">Trang chủ</a> ›
  <span aria-current="page">Công nghệ tài chính & Định lượng AI</span>
</nav>
```

**1.3. Thêm schema cấp "danh mục dịch vụ"**
Site hiện không có trang danh mục `/dich-vu` — 6 trang dịch vụ nằm phẳng ở root. Nếu chưa muốn đổi URL (xem mục 2), ít nhất nên thêm `hasOfferCatalog` vào `Organization` để nhóm 6 service lại có ngữ nghĩa rõ ràng hơn cho Google, hỗ trợ tốt hơn cho việc gợi ý Sitelinks theo nhóm.

---

## 2. Clear Site Hierarchy (Cấu trúc website rõ ràng)

### Hiện trạng
Site hiện là **cấu trúc phẳng 1 tầng**: `aiera.vn/index.html` + 6 file `.html` nằm thẳng ở root (`fintech-ai-quant-finance.html`, `ai-automation-ai-agent.html`...). Không có trang danh mục trung gian kiểu `/dich-vu/`.

### Vấn đề
- Google cần thấy 1 "trục" rõ ràng: Trang chủ → Danh mục → Trang con để tự tin gom nhóm Sitelinks.
- URL phẳng khiến Google khó phân biệt "trang dịch vụ" với "trang khác" nếu site phát triển thêm blog/case study sau này.

### Khuyến nghị (ưu tiên theo mức độ rủi ro)
- **Không đổi URL hiện tại** (6 file `.html` đã được Google index, đổi URL sẽ mất traffic/authority đã tích lũy — rủi ro cao, lợi ích thấp so với site quy mô nhỏ này).
- **Thay vào đó**, củng cố hierarchy bằng tín hiệu mềm:
  1. Breadcrumb hiển thị (mục 1.2) — cho Google thấy quan hệ cha-con.
  2. `ItemList` schema (đã có) — giữ nguyên, đây chính là "trang danh mục ảo".
  3. Nav chính (`<nav class="footer-links">`) đã liệt kê đủ 6 trang + trang chủ → **giữ nguyên, đừng xoá** (đây là tín hiệu hierarchy quan trọng nhất hiện có).
  4. Nếu tương lai có > 10-12 trang, lúc đó mới cân nhắc tạo `/dich-vu/index.html` thật và làm redirect 301 có kế hoạch — không làm vội ở quy mô hiện tại.

---

## 3. Internal Linking (Liên kết nội bộ)

### ✅ Đã có
- `nav.footer-links` ở `index.html` trỏ tới đủ 6 trang dịch vụ + trang chủ, dùng thẻ `<a href>` thật (không phải JS-only navigation) → crawlable tốt.
- Mỗi trang dịch vụ có `back-link` trỏ về `index.html`.

### ❌ Thiếu — cần bổ sung
**3.1. Không có liên kết chéo giữa các trang dịch vụ (related content)**
Từ `fintech-ai-quant-finance.html`, không có link nào dẫn sang `ai-automation-ai-agent.html` hay các dịch vụ khác trong nội dung — chỉ có ở footer chung. Cần thêm khối "Dịch vụ liên quan" cuối mỗi trang, trước phần contact:
```html
<section class="related-services">
  <h2 data-i18n="related-title">Dịch vụ liên quan</h2>
  <ul>
    <li><a href="./ai-automation-ai-agent.html">AI Automation & AI Agent</a></li>
    <li><a href="./thiet-ke-website-chuan-seo.html">Thiết kế website chuẩn SEO</a></li>
  </ul>
</section>
```
Việc này vừa tăng internal link contextual (tốt cho SEO on-page), vừa giảm bounce rate.

**3.2. Anchor text cần mô tả, tránh lặp**
Kiểm tra `footer-links`: text hiện tại ("Fintech & Định lượng AI", "AI Automation & AI Agent"...) đã đủ mô tả — **giữ nguyên, không đổi thành "Xem thêm"/"Click here"**.

---

## 4. Sitemap XML

File hiện tại: `ai-era-site/sitemap.xml` — 7 URL (`index.html` + 6 trang dịch vụ). `robots.txt` đã trỏ đúng `Sitemap:`.

### ❌ Cần sửa
**4.1. `lastmod` không nhất quán / không tự động**
Sitemap đang set tay từng ngày (`2026-08-23`, riêng 1 trang là `2026-09-10`). Rủi ro: quên cập nhật khi sửa nội dung → Google đánh giá sai tần suất update. Khuyến nghị: viết 1 script nhỏ generate `sitemap.xml` tự động lấy `lastmod` từ ngày sửa file thật (`git log -1 --format=%cI -- <file>` hoặc `fs.statSync(file).mtime`), chạy trước mỗi lần deploy.

**4.2. Thiếu `privacy.html` trong sitemap**
File tồn tại trên site (`privacy.html`) nhưng không có trong `sitemap.xml`. Việc này **đúng** nếu trang có `<meta name="robots" content="noindex">` (kiểm tra lại đúng là có) — giữ nguyên, không thêm vào sitemap vì đây là hành vi chuẩn cho trang noindex.

**4.3. Không có bản đa ngôn ngữ (`hreflang`)**
Site chuyển ngôn ngữ VI/EN bằng JS (`data-i18n`, đổi text runtime), **không có URL riêng cho từng ngôn ngữ** (không có `/en/...`). Vì vậy:
- Không thể (và không nên) thêm `hreflang` vào sitemap — vì không có URL EN thật để trỏ tới, thêm `hreflang` trỏ về cùng 1 URL sẽ không có tác dụng.
- Ghi chú cho team: nếu muốn Google index được nội dung tiếng Anh riêng (phục vụ SEO quốc tế), cần bản rebuild có URL thật theo locale (giống cấu trúc `source/` Next.js với `[locale]` đang làm dở) — đây là quyết định kiến trúc, không phải fix nhỏ.

---

## ✅ CHECKLIST TỔNG HỢP (theo thứ tự thực hiện)

- [ ] **0.** Rà & fix mất dấu tiếng Việt toàn bộ 7 file HTML, validate lại JSON-LD từng file.
- [ ] **1.1** Thêm LinkedIn vào `Organization.sameAs`.
- [ ] **1.2** Thêm breadcrumb HTML hiển thị trên cả 6 trang dịch vụ, khớp với `BreadcrumbList` JSON-LD.
- [ ] **1.3** (tuỳ chọn, không gấp) Thêm `hasOfferCatalog` vào `Organization` schema.
- [ ] **2.** Không đổi URL — giữ nav footer hiện có làm trục hierarchy chính.
- [ ] **3.1** Thêm block "Dịch vụ liên quan" (2-3 link contextual) vào cuối mỗi trang dịch vụ.
- [ ] **3.2** Kiểm tra lại không có anchor text kiểu "xem thêm"/"click here" ở đâu khác trong site.
- [ ] **4.1** Viết script tự sinh `lastmod` trong `sitemap.xml` từ ngày sửa file thật.
- [ ] **4.2** Xác nhận `privacy.html` có `noindex` → không thêm vào sitemap (đã đúng).
- [ ] **4.3** Ghi chú kiến trúc: không thêm `hreflang` khi chưa có URL theo locale thật.
- [ ] **Nội dung intro trang chủ** — đã gộp 2 đoạn trùng lặp (`intro-p` + `intro-about-p`) thành 1 đoạn duy nhất, xem mục dưới.

---

## 5. Nội dung intro trang chủ — đã sửa trùng lặp

**Vấn đề gốc:** `index.html` có 2 đoạn `<p>` liền nhau nói cùng 1 nội dung (AIERA là hệ sinh thái AI, gồm tự động hóa/AI Agent/phân tích định lượng/AI SEO) — trùng lặp ngữ nghĩa, loãng thông điệp, và đoạn thứ 2 (`intro-about-p`) **không có key tương ứng trong `js/i18n.js`** nên khi chuyển sang tiếng Anh, đoạn này vẫn hiển thị tiếng Việt (lỗi i18n).

**Đã sửa trong `index.html` và `js/i18n.js`:** gộp thành 1 đoạn duy nhất, đủ 2 ngôn ngữ:

- **VI:** "AIERA Solutions (AI Era) là công ty công nghệ Việt Nam xây dựng hệ sinh thái giải pháp trí tuệ nhân tạo cho doanh nghiệp — tự động hóa, AI Agent, phân tích định lượng tài chính, AI SEO và phần mềm quản lý, cùng xoay quanh một lõi trí tuệ chung."
- **EN:** "AIERA Solutions (AI Era) is a Vietnamese technology company building an AI ecosystem for businesses — automation, AI agents, quantitative finance analysis, AI SEO and management software, all powered by one shared intelligence core."

File đính kèm `index.html` và `js/i18n.js` trong bản này đã áp dụng thay đổi — chỉ cần merge vào repo.
