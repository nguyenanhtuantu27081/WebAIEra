# Hướng dẫn gỡ bỏ `services.html`, `contact.html`, `about.html` và `nav-links` — aiera.vn

**Đối tượng:** Junior Dev
**Bối cảnh:** Đảo ngược lại 3 trang mới và khối `nav-links` đã thêm ở các bước trước — quay về đúng triết lý thiết kế gốc của site (không có nav ngang, điều hướng qua node 3D + `.back-link` đơn giản).

**⚠️ Vì các URL này (`services.html`, `about.html`, `contact.html`) đã từng lên production, đã có trong `sitemap.xml` và có thể đã được Google thu thập/index — không được xoá file rồi để 404 trần trụi.** Cần xử lý đúng thứ tự ở Mục 1–6 để tránh để lại "soft 404" hoặc mất tín hiệu SEO một cách lộn xộn.

---

## 0. TÓM TẮT PHẠM VI THAY ĐỔI

| Việc cần làm | Vì sao |
|---|---|
| Xoá 3 file `services.html`, `contact.html`, `about.html` | Theo quyết định mới của team |
| Xoá khối `.nav-links` khỏi `index.html` | Quay lại đúng thiết kế gốc — không có nav ngang |
| Cập nhật `.footer-links` ở **9 file còn lại** (6 service + `privacy.html` + `index.html` nếu có) | Bỏ 3 link trỏ tới trang không còn tồn tại |
| Cập nhật `sitemap.xml` | Bỏ 3 URL không còn tồn tại |
| Thêm rule redirect trong `nginx.conf` | Tránh 404 trần trụi cho URL đã từng được Google biết tới |
| Dọn `js/detail-i18n.js` | Xoá các key `svc-*`, `about-*`, `contact-*`, `nav-services/about/contact` không còn dùng |
| Xử lý trong Google Search Console | Thông báo cho Google các URL đã gỡ, tránh báo lỗi Coverage kéo dài |

---

## 1. XOÁ 3 FILE TRANG

```bash
cd ai-era-site
rm services.html contact.html about.html
```

---

## 2. XOÁ KHỐI `.nav-links` TRONG `index.html`

Tìm và xoá đúng khối sau trong `<nav>`:
```html
<!-- XOÁ TOÀN BỘ KHỐI NÀY -->
<div class="nav-links" style="display:flex;gap:16px;">
  <a href="./services.html" data-i18n="nav-services">Dịch vụ</a>
  <a href="./about.html" data-i18n="nav-about">Giới thiệu</a>
  <a href="./contact.html" data-i18n="nav-contact">Liên hệ</a>
</div>
```
Sau khi xoá, `<nav>` trở về đúng cấu trúc gốc: chỉ còn logo bên trái + `lang-switch` bên phải — không có nhóm link nào ở giữa. Đây chính là thiết kế ban đầu của site (điều hướng hoàn toàn qua 6 node 3D, không qua nav ngang).

**Dọn CSS liên quan (không bắt buộc nhưng nên làm để tránh code chết):** Trong `css/components.css`, class `.nav-links`/`.nav-link` (đã thêm ở bước trước) không còn được dùng ở đâu nữa — có thể xoá hẳn hoặc giữ lại phòng khi cần dùng về sau, không ảnh hưởng nếu giữ (dead code không gây lỗi hiển thị, chỉ hơi dư dung lượng CSS).

---

## 3. CẬP NHẬT `.footer-links` — BỎ 3 LINK KHÔNG CÒN TỒN TẠI

Khối `<nav class="footer-links">` hiện đang được nhúng trong **9 file**: `index.html` (nếu có), 6 trang service, và `privacy.html`. Ở mỗi file, xoá đúng 3 dòng sau khỏi khối `footer-links` (giữ nguyên các link còn lại):
```html
<!-- XOÁ 3 DÒNG NÀY khỏi mọi <nav class="footer-links"> -->
<a href="./services.html">Dịch vụ</a>
<a href="./about.html">Giới thiệu</a>
<a href="./contact.html">Liên hệ</a>
```
Sau khi xoá, `footer-links` chỉ còn 7 link: `Trang chủ` + 6 trang service. Vì đây là thao tác lặp lại giống hệt nhau trên nhiều file (thuần HTML, không có template/include), khuyến nghị dùng lệnh `sed`/script để tránh sai sót copy tay:
```bash
cd ai-era-site
for f in index.html privacy.html ai-automation-ai-agent.html digital-marketing-ai-content.html \
         fintech-ai-quant-finance.html landing-page-hosting.html \
         phan-mem-quan-ly-doanh-nghiep.html thiet-ke-website-chuan-seo.html; do
  # Xoá 3 dòng <a> trỏ tới services/about/contact bên trong footer-links
  sed -i '/href="\.\/services\.html">D.*ch v.*<\/a>/d' "$f"
  sed -i '/href="\.\/about\.html">Gi.*i thi.*u<\/a>/d' "$f"
  sed -i '/href="\.\/contact\.html">Li.*n h.*<\/a>/d' "$f"
done
```
> ⚠️ Lệnh `sed` trên dùng regex khớp gần đúng do có thể dính vấn đề encoding cũ — **bắt buộc kiểm tra lại bằng mắt sau khi chạy**, không tin tưởng tuyệt đối vào script tự động (đúng bài học từ lỗi double-encoding ở lần review trước). Cách an toàn hơn nếu không chắc regex: mở từng file, tìm `footer-links`, xoá thủ công 3 dòng.

---

## 4. CẬP NHẬT `sitemap.xml`

Xoá 3 khối `<url>` sau khỏi `sitemap.xml`:
```xml
<!-- XOÁ -->
<url>
  <loc>https://aiera.vn/services.html</loc>
  ...
</url>
<url>
  <loc>https://aiera.vn/about.html</loc>
  ...
</url>
<url>
  <loc>https://aiera.vn/contact.html</loc>
  ...
</url>
```
Sitemap trở về đúng 7 URL ban đầu (trang chủ + 6 service).

---

## 5. THÊM REDIRECT 301 CHO 3 URL ĐÃ GỠ (bắt buộc — tránh mất tín hiệu SEO lộn xộn)

Vì `services.html`, `about.html`, `contact.html` **đã từng có mặt trên production và trong sitemap đã submit lên Google Search Console**, việc xoá file và để URL trả về 404 trần trụi không sai về mặt kỹ thuật, nhưng **không phải cách sạch nhất** — Google sẽ mất một khoảng thời gian "dọn dẹp" các URL 404 này khỏi index, và trong lúc đó Search Console sẽ liên tục báo lỗi Coverage. Cách chuyên nghiệp hơn là **301 redirect về trang phù hợp nhất còn tồn tại**, giữ lại phần nào giá trị link equity đã tích luỹ.

Thêm vào `nginx.conf`, đặt **trước** block `location /` hiện có:
```nginx
# Redirect các trang đã gỡ bỏ về trang chủ (đã từng tồn tại, tránh 404 trần trụi)
location = /services.html {
    return 301 /;
}
location = /about.html {
    return 301 /;
}
location = /contact.html {
    return 301 /;
}
```
> Cả 3 đều redirect về trang chủ (`/`) vì đây là nơi duy nhất còn chứa đúng nội dung tương ứng (6 node dịch vụ, panel liên hệ `#contactFooter`). Không redirect về 1 trang service cụ thể (dễ gây hiểu nhầm nội dung không liên quan).

---

## 6. DỌN `js/detail-i18n.js`

Xoá toàn bộ 3 block key sau khỏi **cả 2 block VI và EN** trong `js/detail-i18n.js` (đã thêm ở bước tạo trang trước đó):
```js
// XOÁ — block "// 7. services"
'svc-meta-desc': ..., 'svc-meta-title': ..., 'svc-h1': ..., 'svc-p1': ...,
'svc-card-1-title': ..., 'svc-card-1-desc': ..., // ... đến svc-card-6

// XOÁ — block "// 8. about" (nếu có)
'about-meta-desc': ..., 'about-h1': ..., ...

// XOÁ — block "// contact"
'contact-meta-desc': ..., 'contact-h1': ..., 'contact-p1': ..., 'contact-p2': ...,

// XOÁ — nav links
'nav-services': ..., 'nav-about': ..., 'nav-contact': ...,
```
> Các key không dùng vẫn nằm đó cũng không gây lỗi hiển thị (chỉ là dữ liệu chết), nhưng nên dọn để tránh nhầm lẫn cho dev sau này khi đọc lại file, và giảm nhẹ dung lượng file.

---

## 7. XỬ LÝ TRONG GOOGLE SEARCH CONSOLE (sau khi deploy)

- [ ] **Sitemaps:** submit lại `sitemap.xml` đã cập nhật (7 URL) để Google biết danh sách URL hợp lệ mới nhất.
- [ ] **URL Inspection:** kiểm tra từng URL `aiera.vn/services.html`, `/about.html`, `/contact.html` — nếu Google đã index, dùng công cụ **Removals** (Sitemaps → Removals → New Request) để yêu cầu gỡ tạm thời khỏi kết quả tìm kiếm, đẩy nhanh quá trình thay vì chờ Google tự phát hiện redirect.
- [ ] Theo dõi mục **Page indexing** trong 2–4 tuần tiếp theo, xác nhận 3 URL này chuyển trạng thái từ "Indexed" → "Page with redirect" (không phải "Not found (404)" hay "Soft 404" kéo dài).

---

## 8. CHECKLIST TRIỂN KHAI (thứ tự thực hiện)

- [ ] **Bước 1:** Xoá 3 file `services.html`, `contact.html`, `about.html` (Mục 1).
- [ ] **Bước 2:** Xoá khối `.nav-links` trong `index.html` (Mục 2).
- [ ] **Bước 3:** Cập nhật `.footer-links` ở 8 file còn lại, bỏ 3 link không còn tồn tại (Mục 3).
- [ ] **Bước 4:** Cập nhật `sitemap.xml`, bỏ 3 URL (Mục 4).
- [ ] **Bước 5:** Thêm 3 rule `return 301 /;` vào `nginx.conf` (Mục 5).
- [ ] **Bước 6:** Dọn key không dùng trong `js/detail-i18n.js` (Mục 6).
- [ ] **Bước 7:** Test cục bộ/staging: mở lại `index.html`, xác nhận nav chỉ còn logo + lang-switch, không còn nav-links; mở từng trang service + `privacy.html`, xác nhận `footer-links` chỉ còn 7 mục, không có link chết.
- [ ] **Bước 8:** Deploy production (build lại Docker image từ `ai-era-site/`).
- [ ] **Bước 9:** Xác nhận `https://aiera.vn/services.html` (và 2 URL còn lại) redirect 301 về `/` thay vì trả 404.
- [ ] **Bước 10:** Thực hiện Mục 7 (Search Console) trong tuần đầu sau deploy.
