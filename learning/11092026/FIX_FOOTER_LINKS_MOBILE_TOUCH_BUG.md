# Fix bug: `footer-links` nhảy lên đầu trang (đè lên header/hero) trên mobile

## Hiện tượng
Trên mobile, ngay khi load trang (hoặc sau khi vuốt nhẹ), dải pill điều hướng
`nav.footer-links` (vốn phải nằm cuối trang, ngay trên `contact-footer`) lại
hiển thị đè ngay dưới header, chồng lên phần tiêu đề hero.

## Đây KHÔNG phải lỗi CSS `position` của `.footer-links`
`.footer-links` không hề có `position:fixed/absolute` — nó nằm đúng vị trí
trong luồng document (`normal flow`), sau `<div class="spatial-hero">`
(khoảng đệm cao `100vh` dùng để tạo không gian cuộn cho hiệu ứng 3D "bay
xuyên không gian"). Việc set `height:100vh` cho `.spatial-hero` là **thiết kế
đúng chủ đích**, không cần sửa.

## Nguyên nhân thật sự: thiếu `touch-action` trên canvas 3D
Trong `js/three/camera-controller.js`, các listener điều khiển xoay camera
bằng tay (`pointerdown`, `pointermove`) không gọi `e.preventDefault()`, và
không nơi nào trong CSS khai báo `touch-action`. Hệ quả trên thiết bị cảm ứng:

1. Người dùng vuốt 1 ngón → JS bắt sự kiện để xoay camera 3D (đúng ý đồ).
2. Vì thiếu `touch-action`, trình duyệt **đồng thời** hiểu đó là thao tác
   cuộn trang thật → cuộn cả `document`.
3. `nav`, `.intro`, `#labels`, `.hud`, `.controls` đều `position:fixed` →
   đứng yên khi cuộn (đúng thiết kế, luôn "dính" theo viewport).
4. `.spatial-hero` + `.footer-links` + `.contact-footer` là phần tử flow
   bình thường → bị cuộn trượt lên theo tay, chui ra ngay dưới header trong
   khi các lớp fixed vẫn đứng yên đè lên trên → tạo ra hiện tượng trong ảnh
   chụp.

Đây là lỗi kinh điển khi tự dựng gesture control bằng Pointer/Touch Events
mà quên khai báo `touch-action` cho phần tử nhận sự kiện.

## Đã sửa (áp dụng trong bản đính kèm)

**1. `css/base.css` và `css/bundle.min.css`** (bundle là file production thật
sự được `index.html` load, nhớ sửa cả 2 nơi, không chỉ sửa `base.css`):
```css
#webgl canvas{display:block;width:100%;height:100%;touch-action:none}
```

**2. `js/three/camera-controller.js`** — phòng hờ trường hợp trình duyệt/
webview không tôn trọng `touch-action` (một số in-app browser Zalo/Messenger
xử lý không chuẩn), thêm chặn tường minh:
```js
renderer.domElement.addEventListener('touchmove', e => {
  if (e.cancelable) e.preventDefault();
  if (e.touches.length === 2) {
    // ... pinch-zoom logic giữ nguyên
  }
}, { passive: false }); // đổi từ passive:true — bắt buộc để preventDefault có tác dụng
```
> Lưu ý: `passive:true` khiến mọi lệnh `preventDefault()` bên trong bị trình
> duyệt âm thầm bỏ qua (chỉ log warning ra console). Đây là lý do nếu trước
> đây có ai từng thử thêm `preventDefault()` mà vẫn không hết bug — vì
> listener khai báo `passive:true` thì gọi `preventDefault()` là vô nghĩa.

## Checklist test lại sau khi merge
- [ ] Mở site trên Chrome DevTools → Device Toolbar (mobile emulation), thử
      vuốt 1 ngón trong vùng 3D — trang **không được cuộn dọc**, chỉ camera
      xoay.
- [ ] Test thật trên điện thoại (không chỉ emulator) — ưu tiên test qua
      webview Zalo/Messenger vì site có nhiều nút liên hệ dẫn vào từ các app
      này.
- [ ] Xác nhận vuốt 2 ngón (pinch) vẫn zoom camera bình thường (không bị
      chặn nhầm bởi `preventDefault` mới thêm).
- [ ] Cuộn hết xuống cuối bằng nút "TRỞ VỀ AI ERA core" / link `#top` —
      đảm bảo không có tương tác nào khác bị vỡ do đổi `passive:false`.
- [ ] Test trên cả light mode và dark mode (đề phòng vì `data-theme` có ảnh
      hưởng CSS khác, dù không liên quan trực tiếp tới bug này).
