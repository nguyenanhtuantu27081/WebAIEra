# Hướng dẫn Sitelinks cho cấu trúc trang hiện tại — aiera.vn

**Đối tượng:** Junior Dev
**Cấu trúc site hiện tại (sau rollback):** `index.html` + 6 trang service + `privacy.html` (`noindex`) = 8 file, sitemap 7 URL.
**⚠️ ĐỌC BƯỚC 0 TRƯỚC — lỗi encoding đã lan ra toàn bộ 8 file, phải sửa trước khi làm bất cứ việc gì khác.**

---

## BƯỚC 0 — SỬA LỖI ENCODING TOÀN SITE (chặn mọi việc khác, làm trước tiên)

Kiểm tra thực tế: **cả 8 file HTML, kể cả `index.html`**, đang bị double-encoding UTF-8 — lỗi trước đây chỉ ở 4 trang mới, nay đã lan ra toàn site (rất có thể do lần rollback vừa rồi dùng script/sed đọc-ghi lại toàn bộ file mà không khai báo đúng `encoding='utf-8'`). Bằng chứng — `<title>` trang chủ:
```
Hiện tại (lỗi):  AI ERA Solutions â€” Ná»n táº£ng Giáº£i phÃ¡p TrÃ­ tuá»‡ NhÃ¢n táº¡o | aiera.vn
Đúng ra phải là: AI ERA Solutions — Nền tảng Giải pháp Trí tuệ Nhân tạo | aiera.vn
```
Google hiển thị **chính xác nội dung `<title>` này làm tiêu đề kết quả tìm kiếm** — nếu không sửa, tiêu đề trang chủ trên Google sẽ hiển thị vỡ chữ trước mặt mọi người dùng, chưa kể ảnh hưởng tới mọi thẻ meta, schema, nội dung hiển thị khác.

**Cách sửa (áp dụng cho toàn bộ 8 file, không riêng 4 file trước):**
```python
import glob

for path in glob.glob("ai-era-site/*.html"):
    raw = open(path, encoding="utf-8-sig").read()
    fixed = raw.encode("latin1", errors="ignore").decode("utf-8", errors="ignore")
    open(path, "w", encoding="utf-8", newline="").write(fixed)
    print("Đã sửa:", path)
```
**Bắt buộc sau khi chạy:**
1. Mở lại **từng file bằng mắt**, kiểm tra kỹ các đoạn có dấu tiếng Việt — đặc biệt `<title>`, `<meta name="description">`, nội dung trong `<script type="application/ld+json">` (vì JSON-LD nếu vỡ ký tự có thể khiến cả khối JSON không parse được, làm mất luôn structured data).
2. Chạy `python3 -c "import json; json.load(open('...'))"` để xác nhận từng khối JSON-LD vẫn là JSON hợp lệ sau khi sửa encoding (thay đổi ký tự bằng tay/script luôn có rủi ro làm hỏng cú pháp).
3. **Không lặp lại nguyên nhân gốc:** rà lại toàn bộ script/tool nội bộ (bash, Python, Node) có thao tác đọc/ghi các file `.html` này — đảm bảo **mọi lệnh đọc và ghi đều khai báo tường minh `encoding='utf-8'`** (Python) hoặc tương đương ở Node.js (`fs.readFileSync(path, 'utf8')`), không dựa vào encoding mặc định của hệ điều hành/terminal.
4. Thêm bước kiểm tra encoding vào quy trình trước khi deploy (xem Checklist cuối file) để lỗi này không tái diễn lần thứ 3.

---

## 1. GHI NHẬN NHỮNG GÌ ĐÃ LÀM ĐÚNG (không cần sửa lại)

So với các lần review trước, các điểm sau đã được xử lý đúng — giữ nguyên:
- ✅ Domain nhất quán `https://aiera.vn` ở canonical, OG, schema.
- ✅ `Organization` schema đã có `sameAs` (Facebook, Zalo) và `alternateName` đầy đủ biến thể tên thương hiệu (`aiera`, `AI Era`, `AI Era Solutions`, `aiera.vn`...).
- ✅ `WebSite` schema có `potentialAction.SearchAction` (xem lỗi cần sửa ở Bước 2).
- ✅ Mỗi trang service có `Service` + `BreadcrumbList` schema riêng.
- ✅ Internal linking: khối `.footer-links` giờ đã **hiển thị thật** (không còn `display:none`), dạng chip bo tròn có chấm màu — đúng tinh thần "không giống menu truyền thống", và **xuất hiện tĩnh trên cả `index.html`** — nghĩa là link tới 6 trang service giờ **crawl được ngay từ HTML thô**, không còn phụ thuộc hoàn toàn vào JavaScript như trước.
- ✅ `sitemap.xml` chỉ chứa 7 URL hợp lệ, `privacy.html` đúng đắn không có trong sitemap (đã gắn `noindex, follow`).
- ✅ Không còn `nav-links`/menu ngang truyền thống — nav trang chủ chỉ còn logo + lang-switch, đúng triết lý thiết kế ban đầu.

---

## 2. SỬA `SearchAction` TRỎ TỚI TRANG KHÔNG TỒN TẠI

```json
"potentialAction": {
  "@type": "SearchAction",
  "target": { "@type": "EntryPoint", "urlTemplate": "https://aiera.vn/tim-kiem?q={search_term_string}" },
  "query-input": "required name=search_term_string"
}
```
`https://aiera.vn/tim-kiem` **chưa tồn tại** trong 8 file hiện có. Khi Google thử nghiệm Sitelinks Search Box, nó sẽ kiểm tra URL này thực sự trả về kết quả tìm kiếm — nếu 404, Google sẽ **không** kích hoạt Sitelinks Search Box (không ảnh hưởng tới Sitelinks thường, chỉ ảnh hưởng riêng tính năng ô tìm kiếm kèm theo).

**2 lựa chọn:**
- **Lựa chọn A (khuyến nghị nếu chưa có kế hoạch làm trang search):** Xoá hẳn khối `potentialAction` khỏi schema cho tới khi có trang tìm kiếm thật — khai báo 1 tính năng không hoạt động còn rủi ro hơn là không khai báo.
- **Lựa chọn B:** Xây 1 trang `tim-kiem.html` tối thiểu — dùng JS lọc client-side qua `js/data/nodes.js` đã có sẵn dữ liệu 6 service (không cần backend), hiển thị kết quả khớp tên/mô tả dịch vụ theo `?q=`.

---

## 3. BÙ ĐẮP TÍN HIỆU ĐÃ MẤT KHI GỠ `services.html`/`about.html`

Vì hub `/services` và trang `/about` đã bị gỡ theo quyết định trước, cần bù lại 2 loại tín hiệu quan trọng **ngay trên trang chủ** để không mất hoàn toàn giá trị SEO đã có:

### 3.1. Thêm `ItemList` liệt kê 6 Service ngay trong schema trang chủ
Hiện `index.html` chỉ có `Organization` + `WebSite` trong `@graph`. Thêm 1 object `ItemList` tham chiếu 6 `Service` (đã định nghĩa `@id` ở từng trang service) để Google vẫn có 1 điểm nhìn tổng hợp toàn bộ dịch vụ mà không cần trang hub riêng:
```json
{
  "@type": "ItemList",
  "name": "Dịch vụ AIERA Solutions",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "https://aiera.vn/fintech-ai-quant-finance.html" },
    { "@type": "ListItem", "position": 2, "url": "https://aiera.vn/ai-automation-ai-agent.html" },
    { "@type": "ListItem", "position": 3, "url": "https://aiera.vn/thiet-ke-website-chuan-seo.html" },
    { "@type": "ListItem", "position": 4, "url": "https://aiera.vn/landing-page-hosting.html" },
    { "@type": "ListItem", "position": 5, "url": "https://aiera.vn/digital-marketing-ai-content.html" },
    { "@type": "ListItem", "position": 6, "url": "https://aiera.vn/phan-mem-quan-ly-doanh-nghiep.html" }
  ]
}
```
Thêm object này vào `@graph` của `index.html`, ngang hàng với `Organization`/`WebSite`.

### 3.2. Thêm 1 đoạn text "Giới thiệu ngắn" thật trên trang chủ (không cần trang riêng)
Vì không còn `about.html`, entity "AI Era" hiện chỉ được mô tả qua `intro-p` (1 câu ngắn) và mô tả từng node. Nên bổ sung **1 đoạn văn bản thật** (2-3 câu, dùng `data-i18n`, không phải chỉ trong schema) mô tả công ty ngay trên trang chủ — ví dụ đặt cạnh hoặc bên dưới phần `.intro`:
```html
<p class="intro-about" data-i18n="intro-about-p">
  AIERA Solutions (AI Era) là công ty công nghệ Việt Nam xây dựng hệ sinh thái giải pháp trí tuệ nhân tạo cho doanh nghiệp — từ tự động hoá, AI Agent, phân tích định lượng tài chính, đến thiết kế website chuẩn SEO và AI SEO.
</p>
```
Đoạn text này giúp củng cố lại phần "giới thiệu thực thể" đã mất khi bỏ `about.html`, có lợi cho cả SEO truyền thống lẫn AI Overviews/AI Search (vốn cần đoạn văn tự nhiên mô tả rõ "X là gì" để trích dẫn).

---

## 4. CHECKLIST STRUCTURED DATA CHO 6 TRANG SERVICE (đã có, chỉ cần rà soát lại sau Bước 0)

Vì Bước 0 có thể vô tình làm hỏng cú pháp JSON khi sửa encoding, rà lại từng trang service theo checklist:
- [ ] `<script type="application/ld+json">` parse được, không lỗi cú pháp (test bằng [Rich Results Test](https://search.google.com/test/rich-results)).
- [ ] `BreadcrumbList` có đúng 2 cấp: `AIERA Solutions` (trang chủ) → tên trang service.
- [ ] `Service.provider` tham chiếu đúng `Organization` (nên dùng `"@id": "https://aiera.vn/#organization"` thay vì định nghĩa lại toàn bộ Organization mỗi trang — kiểm tra xem hiện đang làm theo cách nào, nếu định nghĩa lặp lại thì gộp về dùng `@id` để tránh dữ liệu trùng/lệch).
- [ ] `canonical` đúng domain, đúng URL chính nó (không trỏ nhầm sang trang khác).

---

## 5. NỘI DUNG & INTERNAL LINKING — CÒN GÌ CẦN LÀM CHO 6 TRANG SERVICE

- [ ] Xác nhận mỗi trang service có block **"Dịch vụ liên quan"** link chéo 2–3 trang service khác (đã hướng dẫn ở lần review trước) — kiểm tra còn tồn tại sau các lần chỉnh sửa gần đây hay bị mất khi rollback.
- [ ] Anchor text trong `.footer-links` hiện dùng đúng tên rút gọn dịch vụ — giữ nguyên, đã tốt.
- [ ] Xác nhận không còn key `svc-*`, `about-*`, `contact-*`, `nav-services/about/contact` thừa trong `js/detail-i18n.js` (phát hiện hiện vẫn còn ~82 key loại này chưa dọn theo hướng dẫn gỡ bỏ trước đó) — không gây lỗi hiển thị nhưng nên dọn để tránh nhầm lẫn khi bảo trì về sau.

---

## 6. GIỚI HẠN THỰC TẾ CẦN HIỂU RÕ VỚI CẤU TRÚC 8 TRANG HIỆN TẠI

Với quyết định giữ site tối giản (không hub `/services`, không `/about`, không `/contact` riêng), **ứng viên Sitelinks thực tế chỉ còn lại 6 trang service** — không có gì sai, nhưng cần hiểu đúng kỳ vọng:
- Google **thường ưu tiên chọn Sitelinks từ các trang có traffic/lượt truy cập cao và cấu trúc rõ ràng** — với 6 trang cùng cấp (không có phân cấp hub), Google có thể chọn bất kỳ tổ hợp nào trong 6 trang này, không đoán trước được chính xác trang nào sẽ được chọn.
- Vì không có `/about`, `/contact` — kịch bản Sitelinks "Company / Dashboards / Integrations / Demo" giống `aiera.com` **khó tái hiện y hệt**; kỳ vọng hợp lý hơn là dạng Sitelinks liệt kê thẳng tên 4-6 dịch vụ.
- Đây là đánh đổi hợp lệ (ưu tiên giao diện tối giản, đúng triết lý thiết kế) — không phải lỗi kỹ thuật, chỉ cần đội ngũ hiểu đúng để không kỳ vọng sai.

---

## 7. CHECKLIST TRIỂN KHAI (thứ tự thực hiện)

- [ ] **Bước 1:** Sửa lỗi double-encoding trên toàn bộ 8 file (Mục 0) — kiểm tra bằng mắt + validate JSON-LD sau khi sửa.
- [ ] **Bước 2:** Xử lý `SearchAction` — xoá tạm hoặc xây trang `/tim-kiem` thật (Mục 2).
- [ ] **Bước 3:** Thêm `ItemList` 6 service vào schema trang chủ (Mục 3.1).
- [ ] **Bước 4:** Thêm đoạn giới thiệu ngắn thật trên trang chủ (Mục 3.2).
- [ ] **Bước 5:** Rà soát JSON-LD 6 trang service theo checklist Mục 4.
- [ ] **Bước 6:** Rà soát internal linking + dọn key i18n thừa (Mục 5).
- [ ] **Bước 7:** Deploy → chạy [Rich Results Test](https://search.google.com/test/rich-results) cho toàn bộ 7 trang có index (trang chủ + 6 service) — xác nhận 0 lỗi.
- [ ] **Bước 8:** Google Search Console → **Sitemaps** → submit lại (không đổi nội dung nhưng nên re-submit sau đợt sửa lỗi lớn) → **URL Inspection** → `Request Indexing` cho trang chủ (vì title/description đã đổi ở Bước 1).
- [ ] **Bước 9:** Theo dõi Search Console 3–6 tuần: mục **Page indexing** (không còn lỗi), mục **Performance** (theo dõi brand query + xem Sitelinks có xuất hiện chưa — cần thời gian, không có mốc cố định).
- [ ] **Bước 10 (dài hạn, không bắt buộc ngay):** Nếu sau 6-8 tuần Sitelinks vẫn chưa hình thành dù mọi chỉ số kỹ thuật đã đạt, cân nhắc lại việc khôi phục `about.html` — theo dữ liệu đối chiếu `aiera.com`, đây thường là đòn bẩy hiệu quả nhất còn lại chưa dùng tới.
