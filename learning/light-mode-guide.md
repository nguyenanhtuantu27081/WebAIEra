# Hướng dẫn implement Light Mode — AI Era

Tài liệu này hướng dẫn cách code theme Light Mode dựa trên bản demo đã duyệt (`aiera-light-mode.html`). Đọc kỹ trước khi code, không tự ý đổi màu/spacing ngoài những gì liệt kê ở đây.

---

## 1. Nguyên tắc chung (đọc trước khi code)

- Light mode **không phải** là dark mode đảo màu. Hiệu ứng "glow" (phát sáng) trên nền đen sẽ **không hoạt động** trên nền sáng — phải thay bằng shadow màu (colored shadow) và độ tương phản weight/màu chữ.
- Mọi hạt bụi (particles), đường quỹ đạo (orbit lines) đều phải có **opacity rất thấp** để không cạnh tranh với nội dung text/card.
- Không dùng đen thuần `#000000` cho chữ — luôn dùng navy đậm để tạo cảm giác sang trọng hơn (xem bảng token).
- Toàn bộ theme dùng chung 1 bộ token màu — không hardcode hex trực tiếp trong component, luôn dùng biến CSS.

---

## 2. Design tokens (copy nguyên vào file CSS gốc)

```css
:root[data-theme="light"] {
  /* Nền */
  --bg: #F6F7FB;
  --surface: #FFFFFF;
  --border: #E7E9F2;

  /* Chữ */
  --text: #161832;        /* navy đậm — dùng cho heading, không dùng đen thuần */
  --text-muted: #666B85;  /* xám ánh navy — dùng cho mô tả, label phụ */

  /* Accent */
  --accent: #3D4FE0;      /* xanh điện — chấm bullet, số liệu, icon nhấn */
  --accent2: #8B5CF6;     /* tím — node, orbit, gradient heading */

  /* Gradient dùng cho heading/logo chữ */
  --gradient-text: linear-gradient(150deg, #1B1D3D 0%, #2A2B57 45%, #4C3E8F 100%);

  /* Font */
  --font-sans: 'Manrope', 'Segoe UI', sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}
```

> Nếu project dùng SCSS/Tailwind, map các biến trên vào `theme.extend.colors` hoặc `$variables` tương ứng — không đổi tên biến để dễ đối chiếu với bản dark mode.

---

## 3. Cách xử lý từng thành phần

### 3.1. Heading / Logo (không dùng màu đen phẳng)

Heading chính và chữ "AI Era" trong quả cầu phải dùng **gradient text**, không dùng `color: var(--text)` đơn thuần:

```css
h1, .brand-heading {
  font-weight: 700;
  letter-spacing: -0.025em;
  background: var(--gradient-text);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

⚠️ Lưu ý: nếu browser/trình duyệt không hỗ trợ `background-clip: text` (rất hiếm), phải có fallback `color: var(--text)` phía trên rule gradient.

### 3.2. Logo nhỏ (header)

```css
.logo {
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #232645;
}
.logo .icon { color: var(--accent2); }
.logo .domain { color: #A6ABC4; font-weight: 500; } /* phần ".VN" */
```

### 3.3. Card / Node (nhãn nổi trên orbit)

Thay glow bằng shadow mềm màu trung tính, viền hairline mảnh:

```css
.node, .panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(20, 20, 50, 0.06);
}
.node::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
```

### 3.4. Quả cầu trung tâm (sphere/core)

```css
.sphere {
  background: radial-gradient(circle at 35% 30%, #ffffff, #EDEFFC 55%, #DCE0FA 100%);
  box-shadow:
    0 50px 90px -20px rgba(139, 92, 246, 0.35),
    0 0 0 1px rgba(139, 92, 246, 0.08),
    inset 0 0 60px rgba(61, 79, 224, 0.08);
}
```

### 3.5. Đường quỹ đạo (orbit rings)

Giảm mạnh opacity so với dark mode — chỉ để gợi ý, không nên rõ nét:

```css
.ring {
  border: 1px solid rgba(139, 92, 246, 0.18);
  border-radius: 50%;
}
```

---

## 4. Hạt bụi bay (Particles)

### Nguyên tắc màu
Trong dark mode particles màu trắng/cyan sáng để *phát sáng* trên nền đen. Trong light mode phải **đảo ngược logic**: particles phải **tối hơn nền, opacity rất thấp**, nếu không sẽ trông như bụi bẩn hoặc biến mất.

| Thuộc tính | Giá trị |
|---|---|
| Màu | `rgba(61,79,224, x)` hoặc `rgba(139,92,246, x)` (dùng chung 2 accent) |
| Opacity | random 0.06 – 0.24 |
| Kích thước | 1.5px – 5px |
| Blur | hạt >3.5px thì blur 1px, hạt nhỏ không blur |
| z-index | phải thấp hơn card/text (đặt ở layer nền cùng) |

### Code mẫu (vanilla JS, có thể chuyển sang React/Vue tuỳ stack)

```html
<div class="particles" id="particles"></div>
```

```css
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1; /* thấp hơn nội dung (z-index: 2 trở lên) */
}
.particle {
  position: absolute;
  border-radius: 50%;
  animation: drift linear infinite;
}
@keyframes drift {
  0%   { transform: translateY(0) translateX(0); }
  50%  { transform: translateY(-18px) translateX(10px); }
  100% { transform: translateY(0) translateX(0); }
}
@keyframes drift2 {
  0%   { transform: translateY(0) translateX(0); }
  50%  { transform: translateY(14px) translateX(-14px); }
  100% { transform: translateY(0) translateX(0); }
}
```

```js
const wrap = document.getElementById('particles');
const colors = ['61,79,224', '139,92,246']; // --accent, --accent2
const count = 55;

for (let i = 0; i < count; i++) {
  const el = document.createElement('div');
  el.className = 'particle';

  const size = Math.random() * 3.5 + 1.5;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const opacity = (Math.random() * 0.18 + 0.06).toFixed(2);
  const blur = size > 3.5 ? '1px' : '0px';

  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.left = `${Math.random() * 100}%`;
  el.style.top = `${Math.random() * 100}%`;
  el.style.background = `rgba(${color},${opacity})`;
  el.style.filter = `blur(${blur})`;
  el.style.animationName = i % 2 === 0 ? 'drift' : 'drift2';
  el.style.animationDuration = `${Math.random() * 6 + 5}s`;
  el.style.animationDelay = `${Math.random() * 4}s`;

  wrap.appendChild(el);
}
```

> Nếu site dùng canvas/WebGL cho orbit 3D thật (three.js...), áp dụng đúng bảng màu/opacity ở trên cho particle system thay vì dùng DOM element — logic màu và opacity giữ nguyên.

---

## 5. Checklist trước khi merge

- [ ] Không còn `color: #000` hoặc `color: black` ở bất kỳ đâu trong theme light
- [ ] Heading và logo dùng gradient text đúng token `--gradient-text`
- [ ] Tất cả card dùng shadow mềm `rgba(20,20,50,0.06)`, không dùng glow
- [ ] Orbit rings và particles có opacity thấp, không lấn át nội dung
- [ ] Test chuyển đổi dark ↔ light không bị giật/nháy layout
- [ ] Test contrast text đạt tối thiểu WCAG AA (dùng DevTools Lighthouse kiểm tra)
- [ ] Test trên mobile: particles không gây lag (giảm `count` xuống ~25-30 nếu cần trên thiết bị yếu)
- [ ] Respect `prefers-reduced-motion`: tắt animation particles/orbit nếu user bật cài đặt giảm chuyển động

```css
@media (prefers-reduced-motion: reduce) {
  .particle, .ring { animation: none; }
}
```

---

## 6. File tham khảo

Bản demo HTML hoàn chỉnh (đã duyệt design) đính kèm cùng thư mục: `aiera-light-mode.html` — có thể mở trực tiếp bằng trình duyệt để soi từng giá trị CSS/JS khi code.
