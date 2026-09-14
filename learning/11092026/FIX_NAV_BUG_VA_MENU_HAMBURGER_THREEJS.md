# Fix triệt để bug `footer-links` nhảy lên đầu + Menu hamburger 3D mới

## 1. Vì sao fix trước (touch-action) không đủ — nguyên nhân THẬT SỰ

Lần trước bug được chẩn đoán là do thiếu `touch-action` trên canvas WebGL —
đúng cho một tình huống, nhưng **không phải nguyên nhân chính**, vì vậy bug
vẫn còn trên cả desktop (nơi không hề có "touch").

**Nguyên nhân thật, xác nhận bằng cách đọc thẳng CSS:**

```css
/* css/layout.css, trước khi sửa */
nav{
  position:fixed;left:0;right:0;top:0;z-index:30;
  ...
}
```

Đây là **type selector** (`nav`, không có dấu `.` hay `#`) — nó áp dụng cho
**MỌI thẻ `<nav>`** trong toàn bộ trang, không phân biệt class. Trong khi đó:

```css
.footer-links{
  display:flex; flex-wrap:wrap; gap:10px;
  max-width:760px; margin:56px auto 0; padding:18px 20px;
  border-top:1px solid var(--border);
  /* KHÔNG có khai báo "position" ở đây */
}
```

`.footer-links` không tự set `position`, nên nó **thừa kế
`position:fixed;top:0;left:0;right:0;z-index:30`** từ rule `nav{}` phía trên
— vì `<nav class="footer-links">` vẫn là một thẻ `<nav>`. Kết quả: dải pill
điều hướng bị dính cứng ở đỉnh màn hình (chỉ lệch xuống ~56px nhờ
`margin-top`), xảy ra trên **mọi kích thước màn hình, mọi trang có thẻ
`<nav>` thứ hai** — kể cả `<nav class="breadcrumb">` trên 6 trang dịch vụ
cũng dính lỗi tương tự (dù ít lộ hơn vì breadcrumb ngắn).

## 2. Cách đã sửa

Đổi selector từ type selector `nav{}` sang class riêng `.site-nav{}`, và
chỉ gắn class này cho header thật:

```css
/* css/layout.css và css/bundle.min.css — đã sửa */
.site-nav{
  position:fixed;left:0;right:0;top:0;z-index:30;
  ...
}
```

```html
<!-- trước -->
<nav> ... </nav>

<!-- sau -->
<nav class="site-nav"> ... </nav>
```

**Quy tắc phòng tái phát cho cả team:** không bao giờ style layout
(`position`, `display`, kích thước...) bằng type selector thuần
(`nav{}`, `header{}`, `section{}`...) khi trang có nhiều hơn 1 thẻ cùng
loại — luôn dùng class. Type selector chỉ an toàn cho các thuộc tính
reset chung (font, margin:0...).

## 3. Đồng bộ header trên TẤT CẢ các trang (yêu cầu thứ 2)

Trước đây: `index.html` có header đầy đủ (logo + AI ERA.VN + VI/EN), còn 6
trang dịch vụ + `privacy.html` chỉ có `back-link` ("Quay lại AI Era
Ecosystem") + nút đổi ngôn ngữ — không có logo, không nhất quán.

**Đã đồng bộ:** mọi trang giờ dùng chung 1 khối `.site-nav` (logo + AI
ERA.VN + VI/EN + nút menu hamburger), style và hành vi giống hệt
`index.html`. `back-link` cũ được thay bằng breadcrumb (đã có sẵn từ lần
trước) + logo (bấm logo là về trang chủ) — không mất chức năng, chỉ gọn
và nhất quán hơn.

> **Ghi chú kỹ thuật:** site hiện là HTML tĩnh, không có template engine
> nên phải copy header vào từng file `.html`. Việc này được thực hiện bằng
> **1 script Python duy nhất** (đính kèm logic trong phần 5) để đảm bảo cả
> 8 trang giống hệt nhau tuyệt đối — không sửa tay từng file để tránh lệch
> nội dung. Lần sau cần đổi header, sửa script rồi chạy lại, đừng sửa tay
> từng trang.

## 4. Menu hamburger 3 gạch với hiệu ứng three.js (yêu cầu thứ 3)

Đã bỏ hoàn toàn cách hiển thị "dải pill" cũ (Constellation Bar). Thay bằng:

- **Icon menu**: không dùng SVG/CSS thường mà render bằng **three.js** thật
  sự (`js/three/hamburger-menu.js`) — 3 đường thẳng (`THREE.Line`) trong 1
  `OrthographicCamera` scene nhỏ 26×26px, đồng bộ ngôn ngữ hình ảnh (glow
  tím-indigo, dùng `WebGLRenderer` chung phong cách với scene 3D chính của
  trang).
- **Hiệu ứng**: khi bấm, 2 đường trên/dưới xoay 45° và trượt vào giữa để
  tạo hình dấu X (morph animation bằng easing, không dùng CSS transform vì
  đây là mesh 3D thật), đường giữa fade dần. Khi đóng lại, hiệu ứng
  "breathing glow" nhẹ (opacity dao động theo sin) giữ icon sống động dù
  không tương tác.
- **Menu mở ra**: dropdown panel `.site-menu-panel` (không phải dải pill
  cố định choán chỗ nữa) chứa đúng 7 link cũ (Trang chủ + 6 dịch vụ), style
  dạng kính mờ tối, khớp theme site. Đóng khi: bấm ra ngoài, nhấn `Esc`,
  hoặc bấm vào 1 link.
- **SEO**: các link trong panel vẫn là thẻ `<a href>` thật, nằm sẵn trong
  HTML (không lazy-render bằng JS), nên Google vẫn crawl và tính là internal
  link bình thường dù bị ẩn bằng CSS lúc đầu (`hidden` + `.open` toggle) —
  đây là kỹ thuật ẩn/hiện hợp lệ (giống mọi mobile menu chuẩn), không phải
  cloaking.

### File liên quan
- `js/three/hamburger-menu.js` — component three.js, export
  `initHamburgerMenu(canvas, panel, button)`.
- `js/menu-init.js` — bootstrap nhỏ, import và khởi tạo component trên,
  được nhúng vào **cả 8 trang**.
- `css/components.css` + `css/bundle.min.css` — thêm rule
  `.menu-toggle`, `.menu-canvas-wrap`, `.site-menu-panel` (đã style sẵn
  responsive cho mobile).

## 5. Danh sách file đã sửa — merge theo đúng đường dẫn này

```
css/layout.css                    → đổi nav{} thành .site-nav{}
css/components.css                → thêm CSS menu hamburger + dropdown
css/bundle.min.css                → merge cả 2 thay đổi trên (bundle production)
js/three/hamburger-menu.js         → MỚI — component three.js
js/menu-init.js                    → MỚI — bootstrap khởi tạo menu
index.html                         → header dùng .site-nav, thêm menu panel + script
ai-automation-ai-agent.html        → đồng bộ header + menu panel
digital-marketing-ai-content.html  → đồng bộ header + menu panel
fintech-ai-quant-finance.html      → đồng bộ header + menu panel
landing-page-hosting.html          → đồng bộ header + menu panel
phan-mem-quan-ly-doanh-nghiep.html → đồng bộ header + menu panel
thiet-ke-website-chuan-seo.html    → đồng bộ header + menu panel
privacy.html                       → đồng bộ header + menu panel (trước đây
                                      trang này còn KHÔNG có logo header,
                                      giờ đã có)
```

⚠️ **Lưu ý khi merge:** `css/bundle.min.css` là file **production thật sự**
được mọi trang `<link>` tới (`href="./css/bundle.min.css?v=dark"`) —
`css/components.css` / `css/layout.css` chỉ là file nguồn chưa gộp. Nếu
team có quy trình build lại bundle từ nguồn, chạy lại quy trình đó; nếu
không có build step tự động (hiện tại có vẻ đang merge tay), phải đảm bảo
`bundle.min.css` được cập nhật — bản đính kèm đã cập nhật sẵn cả 3 file này,
chỉ cần thay thế nguyên file.

## 6. Checklist test lại trước khi deploy

- [ ] Mở `index.html` — header hiển thị đúng vị trí, không có pill nào lộ
      ra ở đỉnh trang khi vừa load.
- [ ] Bấm icon 3 gạch → 3 đường morph thành X mượt, panel dropdown hiện ra
      dưới header, đúng 7 link, không đè lên nội dung khác.
- [ ] Bấm ra ngoài panel / nhấn `Esc` / bấm 1 link → panel đóng lại đúng,
      icon trở về hình 3 gạch.
- [ ] Mở lần lượt cả 6 trang dịch vụ + `privacy.html` — xác nhận **header
      giống hệt index.html** (logo, VI/EN, icon menu), breadcrumb vẫn nằm
      đúng vị trí (không còn bị dính lên đỉnh).
- [ ] Test trên mobile thật (không chỉ DevTools emulator), kể cả trong
      webview Zalo/Messenger — vì đây là nơi lỗi cũ bị người dùng phản ánh.
- [ ] Kiểm tra Console không có lỗi JS (đặc biệt liên quan `three.js` load
      từ CDN qua importmap — nếu CDN chặn, icon vẫn nên có fallback không
      vỡ layout; xem mục 7 nếu cần fallback).
- [ ] Kiểm tra lại `robots.txt`/`sitemap.xml` không cần đổi gì (URL các
      trang không đổi, chỉ đổi phần header/nav bên trong).

## 7. Rủi ro cần biết (không chặn deploy, nhưng nên theo dõi)

- Icon menu phụ thuộc `three.js` load qua CDN (`jsdelivr`, khai báo trong
  `<script type="importmap">`). Nếu CDN chậm/lỗi, canvas sẽ trống (không có
  icon) nhưng **nút bấm vẫn hoạt động** vì `menu-toggle` là `<button>` HTML
  thật, không phụ thuộc three.js để toggle — chỉ mất hiệu ứng hình ảnh, không
  mất chức năng. Có thể cân nhắc thêm 1 fallback CSS 3-gạch ẩn phía sau
  canvas, hiện ra nếu JS lỗi — nếu team thấy cần, báo lại để bổ sung.
