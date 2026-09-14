# Hướng dẫn Fix Lỗi Production – aiera.vn

Tài liệu này dành cho junior dev, thực hiện tuần tự từng bước. Mỗi phần đều có: **Vấn đề → Nguyên nhân → Cách fix → Cách kiểm tra lại (verify)**.

---

## Mục lục

1. [Cache-busting cho CSS/JS (nguyên nhân chính khiến production "không cập nhật")](#1-cache-busting-cho-cssjs)
2. [Nginx: tách chiến lược cache cho HTML và asset](#2-nginx-tách-chiến-lược-cache)
3. [Quy trình deploy Docker: đảm bảo server luôn chạy image mới nhất](#3-quy-trình-deploy-docker)
4. [CSS phòng vệ cho `.site-menu-panel`](#4-css-phòng-vệ-cho-site-menu-panel)
5. [Fix WebGL warning `drawArraysInstanced`](#5-fix-webgl-warning-drawarraysinstanced)
6. [Ghi chú về cảnh báo cookie `_ga_*`](#6-ghi-chú-về-cảnh-báo-cookie-ga)
7. [Checklist trước khi deploy lần sau](#7-checklist-trước-khi-deploy-lần-sau)

---

## 1. Cache-busting cho CSS/JS

### Vấn đề
Sửa/xóa code trong `components.css`, build lại `bundle.min.css`, deploy lên server — nhưng trình duyệt người dùng vẫn hiển thị giao diện cũ trong nhiều ngày.

### Nguyên nhân
File HTML đang gọi CSS bằng một query string **cố định**, không đổi qua các lần deploy:

```html
<link rel="stylesheet" href="./css/bundle.min.css?v=dark">
```

Vì URL không đổi, trình duyệt (và mọi proxy/CDN ở giữa) sẽ tiếp tục dùng file đã cache trước đó thay vì tải file mới — kể cả khi nội dung file trên server đã thay đổi.

### Cách fix

**Bước 1** — Mở tất cả các file HTML trong `ai-era-site/` (`index.html`, `phan-mem-quan-ly-doanh-nghiep.html`, `fintech-ai-quant-finance.html`, `landing-page-hosting.html`, `digital-marketing-ai-content.html`, `ai-automation-ai-agent.html`, `thiet-ke-website-chuan-seo.html`, `privacy.html`).

**Bước 2** — Tìm dòng:
```html
<link rel="stylesheet" href="./css/bundle.min.css?v=dark">
```
và các thẻ `<script src="./js/....js">` liên quan.

**Bước 3** — Thay `?v=dark` bằng một giá trị **thay đổi mỗi lần deploy**. Có 2 lựa chọn:

- **Cách đơn giản (làm ngay, không cần build tool):** dùng timestamp lúc build, ví dụ:
  ```html
  <link rel="stylesheet" href="./css/bundle.min.css?v=20260911.1">
  <script type="module" src="./js/contact-footer.js?v=20260911.1"></script>
  <script type="module" src="./js/menu-init.js?v=20260911.1"></script>
  ```
  Quy ước: mỗi lần build/deploy, đổi số `20260911.1` này (ngày + số thứ tự) ở **tất cả** các file HTML và **tất cả** thẻ `<link>/<script>` trỏ tới asset đã đổi.

- **Cách chuẩn hơn (khuyến nghị về lâu dài):** viết 1 script nhỏ (Node/Python) chạy trước khi deploy, tự động:
  1. Tính hash nội dung file (ví dụ MD5 8 ký tự đầu) của `bundle.min.css`, `contact-footer.js`, `menu-init.js`...
  2. Đổi tên file thành `bundle.min.<hash>.css`.
  3. Tìm–thay tất cả các chỗ HTML tham chiếu tới file đó bằng tên mới.

  Ví dụ script Python đơn giản (đặt tên `build_hash_assets.py`, chạy trong thư mục `ai-era-site/`):

  ```python
  import hashlib, re, pathlib

  ASSETS = ["css/bundle.min.css", "js/contact-footer.js", "js/menu-init.js"]
  root = pathlib.Path(__file__).parent

  mapping = {}
  for rel in ASSETS:
      path = root / rel
      content = path.read_bytes()
      h = hashlib.md5(content).hexdigest()[:8]
      new_name = re.sub(r"(\.[a-z]+)$", rf".{h}\1", rel)
      (root / new_name).write_bytes(content)
      mapping[rel] = new_name

  for html_file in root.glob("*.html"):
      text = html_file.read_text(encoding="utf-8")
      for old, new in mapping.items():
          text = text.replace(f'"./{old}?v=dark"', f'"./{new}"')
          text = text.replace(f'"./{old}"', f'"./{new}"')
      html_file.write_text(text, encoding="utf-8")

  print("Đã cập nhật:", mapping)
  ```

  Chạy script này **mỗi lần trước khi build Docker image**.

### Cách kiểm tra lại
1. Deploy xong, mở DevTools → tab Network.
2. Reload trang (không cần hard refresh), kiểm tra request `bundle.min.css` có URL/tên file đúng phiên bản mới không.
3. Chạy: `curl -I https://aiera.vn/css/bundle.min.css?v=<phiên-bản-mới>` → phải trả về `200`, không phải cache 304 từ lần cũ.

---

## 2. Nginx: tách chiến lược cache

### Vấn đề
`nginx.conf` hiện tại cache **mọi** file CSS/JS/ảnh 30 ngày, trong khi HTML không có cấu hình cache rõ ràng — ngược với best practice.

### Nguyên tắc chuẩn
- **File có tên chứa hash/version** (đã cache-busting ở bước 1) → cache **dài hạn**, an toàn vì tên file đổi khi nội dung đổi.
- **File HTML** (và bất kỳ asset nào KHÔNG có hash trong tên) → luôn bắt trình duyệt hỏi lại server (`no-cache`), để user luôn thấy nội dung mới nhất.

### Cách fix

Mở `nginx.conf`, sửa block cache asset hiện tại:

```nginx
# Cache static assets đã có version/hash trong tên — an toàn để cache dài hạn
location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|css|js|woff|woff2|ttf|eot)$ {
    root /usr/share/nginx/html;
    try_files $uri =404;
    expires 30d;
    add_header Cache-Control "public, max-age=2592000, immutable";
    access_log off;
    log_not_found on;
}
```

Và thêm block riêng cho HTML **ngay trước** block `location /` hiện có:

```nginx
# HTML luôn phải revalidate — không được cache cứng
location ~* \.html$ {
    root /usr/share/nginx/html;
    try_files $uri =404;
    add_header Cache-Control "no-cache, must-revalidate";
}
```

> Lưu ý: `no-cache` không có nghĩa là "không cache" — nó có nghĩa là trình duyệt **luôn hỏi lại server** (If-Modified-Since/ETag) trước khi dùng bản cache, nên vẫn nhanh nhưng luôn đúng nội dung mới nhất.

### Cách kiểm tra lại
```bash
curl -I https://aiera.vn/phan-mem-quan-ly-doanh-nghiep.html
```
→ Header `Cache-Control` phải là `no-cache, must-revalidate`.

```bash
curl -I https://aiera.vn/css/bundle.min.css
```
→ Header `Cache-Control` phải chứa `immutable, max-age=2592000`.

---

## 3. Quy trình deploy Docker

### Vấn đề
Push image mới lên GHCR nhưng server vẫn chạy bản cũ.

### Nguyên nhân
`docker-compose.yml` dùng tag `:latest` với `restart: always`. **Docker Compose không tự pull image mới** khi bạn chỉ push lên registry — nó chỉ dùng lại image đã có sẵn trên máy chủ.

### Cách fix

**Bước 1** — Trên server, mỗi lần deploy, luôn chạy đúng thứ tự sau (không được bỏ bước `pull`):

```bash
cd /path/to/webaiera
docker compose pull
docker compose up -d --force-recreate
docker image prune -f   # dọn image cũ, tránh đầy ổ đĩa
```

**Bước 2** — Nếu deploy qua CI/CD (GitHub Actions), thêm bước SSH vào server chạy đúng 2 lệnh trên sau khi build & push image thành công. Ví dụ step trong workflow:

```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SERVER_SSH_KEY }}
    script: |
      cd /path/to/webaiera
      docker compose pull
      docker compose up -d --force-recreate
      docker image prune -f
```

**Bước 3 (khuyến nghị)** — Thay vì chỉ tin vào tag `:latest`, cân nhắc dùng tag theo commit SHA (ví dụ `ghcr.io/.../webaiera:abc1234`) để biết chắc server đang chạy đúng bản nào, dễ rollback.

### Cách kiểm tra lại
```bash
docker image inspect ghcr.io/nguyenanhtuantu27081/webaiera:latest --format '{{.Id}}'
docker inspect webaiera --format '{{.Image}}'
```
→ Hai giá trị ID này phải **giống nhau** sau khi deploy. Nếu khác, nghĩa là container đang chạy chưa dùng image mới nhất.

---

## 4. CSS phòng vệ cho `.site-menu-panel`

### Vấn đề
Nếu vì lý do gì đó CSS load chậm/lỗi/thiếu, menu ẩn (`hidden`) có thể bị "lộ" ra giữa trang thay vì ẩn hẳn.

### Nguyên nhân
`.site-menu-panel` hiện chỉ ẩn bằng `opacity:0; visibility:hidden; pointer-events:none` — không có `display:none`, nên nếu CSS này không kịp áp dụng, phần tử vẫn chiếm chỗ và hiển thị trong luồng trang bình thường.

### Cách fix
Mở `css/components.css`, thêm rule sau **ngay dưới** rule `.site-menu-panel{...}` (dòng ~804):

```css
.site-menu-panel[hidden]{
  display:none !important;
}
```

Sau đó build lại `bundle.min.css` (nối/minify lại như quy trình hiện tại của dự án).

### Cách kiểm tra lại
1. Mở DevTools → Elements, tìm `#siteMenuPanel`.
2. Xóa tạm thuộc tính CSS chính (`opacity`, `visibility`) qua devtools để giả lập lỗi load CSS.
3. Xác nhận panel vẫn không hiển thị nhờ rule `[hidden]{display:none}`.

---

## 5. Fix WebGL warning `drawArraysInstanced`

### Vấn đề
Console báo: `WebGL warning: drawArraysInstanced: Drawing to a destination rect smaller than the viewport rect.`

### Nguyên nhân
File `js/three/scene-setup.js`, hàm `onResize()` đang gọi `composer.setSize()` **trước khi** cập nhật `renderer.setPixelRatio()`. Khi devicePixelRatio thay đổi lúc resize (đổi màn hình, zoom, xoay điện thoại), render target của `composer` (dùng cho Bloom pass) bị tạo với tỉ lệ pixel cũ, nhỏ hơn buffer thật của renderer → lệch kích thước.

### Cách fix

**Bước 1** — Mở file `js/three/scene-setup.js`.

**Bước 2** — Tìm đoạn code hiện tại (khoảng dòng 77–83):

```js
export function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, cfg.dpr));
}
```

**Bước 3** — Sửa lại theo đúng thứ tự: cập nhật `pixelRatio` **trước**, rồi mới `setSize`:

```js
export function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, cfg.dpr));
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
}
```

**Bước 4** — Kiểm tra các file three.js khác có resize handler tương tự (`contact-btn-3d.js`, `hamburger-menu.js`) — nếu có pattern gọi `setSize` trước `setPixelRatio` trong một hàm resize, sửa theo cùng nguyên tắc. (Tại thời điểm review, 2 file này chỉ set 1 lần lúc khởi tạo, không có resize handler nên không cần sửa.)

### Cách kiểm tra lại
1. Mở trang trên Firefox/Chrome, mở DevTools Console.
2. Resize cửa sổ trình duyệt nhiều lần, hoặc kéo cửa sổ qua lại giữa 2 màn hình có DPI khác nhau (nếu có).
3. Xác nhận không còn warning `drawArraysInstanced` xuất hiện.

---

## 6. Ghi chú về cảnh báo cookie `_ga_*`

Cảnh báo: *"Giá trị của thuộc tính 'expires' cho cookie '_ga_LS0X2ERLBL' đã bị ghi đè."*

- Đã kiểm tra: đoạn script `gtag` trên các trang chỉ load **đúng 1 lần**, có guard `window.gtmLoaded` chuẩn, không bị gọi trùng.
- Cảnh báo này phát sinh từ **bên trong script `gtag.js` của Google** (tự set cookie `_ga_<ID>` 2 lần: khởi tạo rồi cập nhật session) — không phải lỗi từ code của dự án.
- **Không cần sửa gì** ở phần này. Đây là warning phổ biến trên hầu hết website dùng GA4, chủ yếu xuất hiện trên Firefox.

---

## 7. Checklist trước khi deploy lần sau

- [ ] Đã đổi version/hash cho tất cả file CSS/JS thay đổi trong lần deploy này (Mục 1)
- [ ] Đã cập nhật đúng chỗ tham chiếu trong **tất cả** các file `.html` (không chỉ 1 trang)
- [ ] `nginx.conf` đã tách rule cache cho `.html` (no-cache) và asset có hash (immutable) (Mục 2)
- [ ] Deploy trên server chạy đủ `docker compose pull` → `up -d --force-recreate` (Mục 3)
- [ ] Đã verify `docker inspect` container đang chạy đúng image mới (Mục 3)
- [ ] Test bằng hard refresh (Ctrl+Shift+R) **và** ẩn danh (Incognito) trên trình duyệt để loại trừ cache cũ trước khi kết luận đã fix xong
- [ ] Console DevTools không còn warning `drawArraysInstanced` sau khi resize
