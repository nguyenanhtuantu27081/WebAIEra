# Hướng dẫn chỉnh vùng Grid UX-226 chiếm khoảng 30% diện tích hiển thị

**Đối tượng:** Junior Developer  
**Mục tiêu:** Mở rộng vùng grid nhìn rõ ở giữa trang để phần grid rõ nét chiếm xấp xỉ **30% diện tích vùng hiển thị**, sau đó fade mượt ra ngoài.  
**Phạm vi:** Các trang HTML trong `ai-era-site/`, ngoại trừ `index.html`.  
**Nguồn tham chiếu:** `docs/Grid/ux-226-grid-beam-hero-en.html` và stylesheet dùng chung được tạo theo `GRID-BACKGROUND-IMPLEMENTATION.md`.

> **Lưu ý quan trọng:** Hướng dẫn này chỉ điều chỉnh mask của **grid cơ sở**. Không thay đổi khoảng cách grid `34 × 34px`, alpha đường lưới trắng `.07`, cursor glow `90px`, ambient glow tím, beam canvas, tốc độ/chiều dài beam, hoặc logic animation. Không copy toàn bộ demo card 340 × 340 px vào trang thật.

## 1. Xác định đúng file cần sửa

Nếu đã làm theo hướng dẫn nền dùng chung, hãy mở:

```text
ai-era-site/css/grid-beam-background.css
```

Tìm selector `.grid-beam-background__grid`. Không sửa các selector `.grid-beam-background__grid-glow`, `.grid-beam-background__ambient-glow` hoặc `.grid-beam-background__canvas`.

Nếu CSS dùng chung của dự án có tên khác, hãy tìm selector tương ứng với **grid cơ sở** (hai `linear-gradient` màu trắng, `background-size: 34px 34px`). Chỉ sửa `mask-image` và `-webkit-mask-image` của lớp đó.

## 2. Hiểu yêu cầu “30% diện tích”

Với background `position: fixed`, cách đo nhất quán giữa các trang là dựa trên **viewport** — phần trang đang nhìn thấy trong cửa sổ trình duyệt. Chiều cao toàn bộ tài liệu thay đổi theo nội dung và độ dài trang; nếu đo theo toàn bộ document thì cùng một CSS sẽ tạo ra tỷ lệ khác nhau ở mỗi trang.

Mục tiêu của thay đổi này:

- Vùng grid rõ nét ở giữa chiếm khoảng 30% diện tích viewport.
- Bao quanh vùng rõ nét là dải chuyển sắc để grid fade mượt, không có ranh giới cứng.
- Phần ngoài cùng vẫn có thể còn beam và glow riêng; mask này chỉ áp dụng cho grid cơ sở.

## 3. Thay radial mask bằng cấu hình sau

Trong `.grid-beam-background__grid`, giữ nguyên các thuộc tính lưới và thay cả hai dòng mask thành:

```css
.grid-beam-background__grid {
  -webkit-mask-image: radial-gradient(
    ellipse 42% 42% at 50% 45%,
    #000 0%,
    #000 74%,
    transparent 100%
  );
  mask-image: radial-gradient(
    ellipse 42% 42% at 50% 45%,
    #000 0%,
    #000 74%,
    transparent 100%
  );
}
```

Selector này phải vẫn giữ nguyên hai lớp gradient, khoảng cách và vị trí grid. Ví dụ phần CSS hoàn chỉnh nên có dạng:

```css
.grid-beam-background__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, .07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .07) 1px, transparent 1px);
  background-size: 34px 34px;
  background-position: -1px -1px;

  -webkit-mask-image: radial-gradient(
    ellipse 42% 42% at 50% 45%,
    #000 0%,
    #000 74%,
    transparent 100%
  );
  mask-image: radial-gradient(
    ellipse 42% 42% at 50% 45%,
    #000 0%,
    #000 74%,
    transparent 100%
  );
}
```

### Vì sao dùng `42%` và `74%`?

- `42% 42%` đặt bán kính ngoài của ellipse fade bằng khoảng 42% chiều rộng và chiều cao viewport.
- Màu `#000` được giữ nguyên đến `74%` bán kính ngoài. Vì vậy bán kính của vùng grid rõ nét là `42% × 74% ≈ 31.1%` theo mỗi trục.
- Diện tích ellipse rõ nét ước tính là `π × 0.311 × 0.311 ≈ 30.4%` diện tích viewport.
- Từ `74%` đến `100%`, mask chuyển dần sang trong suốt để tránh mép cứng. Toàn bộ vùng chuyển sắc sẽ rộng hơn vùng rõ nét.

Đây là ước tính hình học cho ellipse, không phải pixel boundary tuyệt đối. Độ tương phản thực tế còn phụ thuộc vào màu nền, màn hình và cách trình duyệt render gradient.

## 4. Những thuộc tính không được thay đổi

Sau khi chỉnh mask, xác nhận grid vẫn giữ các giá trị sau:

```css
background-size: 34px 34px;
background-position: -1px -1px;
```

Hai đường lưới cơ sở phải tiếp tục dùng alpha `.07`:

```css
linear-gradient(rgba(255, 255, 255, .07) 1px, transparent 1px),
linear-gradient(90deg, rgba(255, 255, 255, .07) 1px, transparent 1px);
```

Không áp dụng mask 30% lên `.grid-beam-background__grid-glow`, vì lớp này cần tiếp tục làm sáng grid trong vùng bán kính khoảng `90px` quanh con trỏ. Không áp dụng mask này lên canvas beam hoặc glow tím trung tâm.

## 5. Áp dụng cho trang nào?

Nếu các trang đã dùng stylesheet dùng chung `grid-beam-background.css`, chỉ cần sửa CSS dùng chung một lần. Không thêm CSS inline riêng vào từng trang.

Các trang con trong dự án:

- [ ] `ai-automation-ai-agent.html`
- [ ] `digital-marketing-ai-content.html`
- [ ] `fintech-ai-quant-finance.html`
- [ ] `landing-page-hosting.html`
- [ ] `phan-mem-quan-ly-doanh-nghiep.html`
- [ ] `privacy.html`
- [ ] `thiet-ke-website-chuan-seo.html`

**Không chỉnh sửa `index.html`.** Kiểm tra `index.html` không có link stylesheet, markup background hoặc script mới liên quan đến UX-226 grid.

Nếu dự án chưa chuyển các trang sang CSS dùng chung, hãy hoàn tất bước tạo/tích hợp CSS dùng chung theo tài liệu triển khai chính trước. Không dán đoạn CSS vào nhiều file HTML, vì về sau các trang dễ bị lệch cấu hình.

## 6. Chạy và kiểm tra

1. Tạo branch hoặc commit trạng thái hiện tại trước khi sửa.
2. Sửa mask trong `css/grid-beam-background.css`.
3. Chạy site bằng máy chủ local từ thư mục `ai-era-site`:

   ```bash
   python -m http.server 8000
   ```

4. Mở từng trang trong danh sách ở trên, ví dụ `http://localhost:8000/landing-page-hosting.html`.
5. Hard refresh (`Ctrl + Shift + R`) để tránh xem CSS cache cũ.
6. Kiểm tra ít nhất viewport desktop `1440 × 900`, laptop `1366 × 768` và mobile `390 × 844`.
7. Quan sát vùng giữa: grid phải rõ hơn trước và chiếm khoảng 30% diện tích nhìn thấy; fade chuyển tiếp mềm ra xung quanh.
8. Rê chuột: cursor glow vẫn đi theo con trỏ, không bị giới hạn vào ellipse của grid cơ sở.
9. Kiểm tra beam ngang/dọc vẫn chạy, glow tím trung tâm vẫn hiển thị, các nút/link/menu vẫn bấm được.
10. Mở `index.html` và xác nhận giao diện không thay đổi.

## 7. Checklist nghiệm thu

- [ ] Chỉ sửa mask của grid cơ sở trong stylesheet dùng chung.
- [ ] Grid spacing vẫn là `34 × 34px`.
- [ ] Đường lưới trắng vẫn alpha `.07`.
- [ ] Vùng grid rõ nét ở trung tâm chiếm xấp xỉ 30% viewport.
- [ ] Vùng ngoài fade mượt, không tạo đường viền hình ellipse nhìn thấy rõ.
- [ ] Cursor glow `90px` không bị cắt theo mask của grid cơ sở.
- [ ] Glow tím trung tâm và beam canvas giữ nguyên.
- [ ] Không có CSS grid trùng lặp trong từng HTML.
- [ ] Cả 7 trang con được kiểm tra ở desktop và mobile.
- [ ] `index.html` không bị sửa.
- [ ] Nội dung, navigation, footer, i18n và các chức năng hiện có vẫn hoạt động.
- [ ] `prefers-reduced-motion` và xử lý hiệu năng của beam không bị thay đổi.

## 8. Nếu kết quả chưa đúng

- **Vùng rõ nét vẫn quá nhỏ:** kiểm tra có đang xem CSS cũ do cache hay không; xác nhận mask có `#000 0%` đến `#000 74%` và không còn một rule khác ghi đè.
- **Vùng rõ nét quá rộng:** giảm `74%` xuống một giá trị nhỏ hơn, ví dụ `68%`; diện tích lõi rõ nét giảm theo bình phương của tỷ lệ này.
- **Muốn mở rộng vùng rõ nét:** tăng `74%` lên, ví dụ `78%`; không thay `34px` hoặc alpha `.07` để làm rộng mask.
- **Fade quá gắt:** giữ lõi rõ nét ở `74%` nhưng tăng kích thước ellipse ngoài từ `42%` lên `46%`; điều này kéo dài dải fade mà không tăng đáng kể vùng lõi rõ nét.
- **Grid glow theo con trỏ bị mờ hoặc biến mất:** kiểm tra xem có lỡ áp dụng mask này cho `.grid-beam-background__grid-glow` hay không.

**Quy tắc an toàn:** Không đổi đồng thời grid spacing, alpha, cursor glow và beam settings trong cùng thay đổi này. Chỉ thay mask của grid cơ sở để có thể so sánh trước/sau rõ ràng trong review.
