# Hướng dẫn triển khai Grid-Beam Background theo UX-226

**Đối tượng:** Junior Developer  
**Phạm vi:** Tất cả file `.html` trong `ai-era-site/`, **ngoại trừ `index.html`**.  
**Nguồn thiết kế bắt buộc tham khảo:** `ux-226-grid-beam-hero-en.html` — Lucian UX/UI Prompt #226.

> **Mục tiêu của bản hướng dẫn này:** Không thay UX-226 bằng một lưới nền mờ đơn giản. Bản triển khai dùng chung phải giữ lại những đặc trưng nhận diện của mẫu gốc: grid 34px, grid glow sáng theo vị trí con trỏ trong bán kính 90px, vùng glow tím ở trung tâm, beam chạy ngang/dọc trên canvas với ba nhóm màu, đầu beam phát sáng, tối đa 9 beam, khởi tạo 4 beam, beam có chiều dài/tốc độ ngẫu nhiên, canvas hỗ trợ DPR, dừng animation khi trang không hiển thị và tôn trọng `prefers-reduced-motion`. **Theo yêu cầu cập nhật, vùng hiển thị rõ của grid cơ sở được giới hạn quanh trung tâm và chiếm xấp xỉ 30% diện tích viewport; vùng rìa fade mềm về trong suốt.**

## 1. Quyết định triển khai

Không copy nguyên toàn bộ HTML demo UX-226 vào từng trang. Mẫu gốc là một component demo 340 × 340 px có nội dung minh họa riêng; dự án cần **chuyển các lớp hiệu ứng của component thành một background dùng chung toàn viewport**. Vì vậy:

- Giữ nguyên đặc tính thị giác và hành vi của UX-226, nhưng mở rộng kích thước từ 340 × 340 px thành viewport.
- Tạo đúng **một CSS dùng chung** và **một JavaScript dùng chung** để tránh lệch hiệu ứng giữa các trang.
- Không thay đổi layout, nội dung, SEO, menu, footer, i18n hoặc script nghiệp vụ hiện có.
- `landing-page-hosting.html` có hero grid riêng; giữ nguyên hero này. Background dùng chung chạy phía sau nội dung toàn trang, vì vậy cần kiểm tra để tránh hiệu ứng quá dày ở vùng hero.
- `index.html` tuyệt đối không thêm stylesheet, markup hoặc script grid.

## 2. Danh sách file cần áp dụng

| File | Áp dụng? | Ghi chú |
|---|---|---|
| `index.html` | **Không** | Giữ nguyên 100%, không thêm link/CSS/JS/markup grid. |
| `ai-automation-ai-agent.html` | Có | Trang dịch vụ |
| `digital-marketing-ai-content.html` | Có | Trang dịch vụ |
| `fintech-ai-quant-finance.html` | Có | Trang dịch vụ |
| `landing-page-hosting.html` | Có | Giữ hero UX-226 đang có; thêm background dùng chung phía sau |
| `phan-mem-quan-ly-doanh-nghiep.html` | Có | Trang dịch vụ |
| `privacy.html` | Có | Giữ đường đọc nội dung chính sách rõ ràng; không loại bỏ grid/beam, chỉ giảm nhẹ opacity nếu cần sau QA |
| `thiet-ke-website-chuan-seo.html` | Có | Trang dịch vụ |

Trước khi sửa, chạy `git status` và tạo branch riêng, ví dụ `feature/ux226-shared-grid`. Commit hoặc sao lưu trạng thái hiện tại.

---

## 3. Thuộc tính UX-226 phải được giữ lại

| Thuộc tính trong file mẫu | Giá trị/logic cần giữ |
|---|---|
| Grid cơ sở `.u226-gd` | Hai linear-gradient, line 1px, trắng alpha `.07`, grid spacing `34px`, position `-1px -1px` |
| Fade của grid cơ sở | `radial-gradient(31% 31% at 50% 45%, #000 0%, transparent 100%)`; vùng ellipse trung tâm xấp xỉ 30% diện tích viewport, rìa fade mềm |
| Grid glow `.u226-gl` | Màu `rgba(129,140,248,.55)`, mask radial theo con trỏ `90px 90px`, transition `opacity .4s` |
| Glow trung tâm `.u226-glow` | 260 × 180 px, top 44%, tím `rgba(99,102,241,.35)`, blur 10px |
| Beam canvas `.u226-cv` | Canvas phủ nền, `pointer-events:none`, DPR tối đa 2 |
| Màu beam | `129,140,248` (indigo), `45,212,191` (teal), `244,114,182` (pink) |
| Beam spawn | Khoảng mỗi `0.42s`, tối đa 9 beam; ban đầu 4 beam |
| Beam chuyển động | Hướng ngang/dọc ngẫu nhiên; tốc độ `110–200 px/s`; chiều dài `50–90 px` |
| Đầu beam | Chấm sáng bán kính `1.8`, shadow blur `8`, đường beam rộng `1.6px` |
| Motion safety | Tôn trọng `prefers-reduced-motion: reduce`; không chạy animation khi người dùng yêu cầu giảm chuyển động |
| Hiệu năng | Dùng `requestAnimationFrame`; dừng khi tab không visible; canvas resize theo viewport và DPR |

Không đưa các token giao diện demo như nút “Switch theme”, card 340 × 340 px hoặc tiêu đề “Ship in a tenth…” vào các trang thật. Chỉ dùng các lớp background và logic beam.

## 4. Bước 1 — Tạo CSS dùng chung

**Tạo file:** `ai-era-site/css/grid-beam-background.css`

Dán toàn bộ đoạn code sau:

```css
/*
 * AI Era — UX-226 Grid-Beam Background
 * Adapted from Lucian UX/UI Prompt #226.
 * Decorative layer only; must never block page interaction.
 */
.grid-beam-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  isolation: isolate;
  color: #f2f4ff;
  --ux226-mx: -200px;
  --ux226-my: -200px;
}

/* Base grid: preserve UX-226's 34px spacing and .07 white line alpha. */
.grid-beam-background__grid,
.grid-beam-background__grid-glow {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, .07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .07) 1px, transparent 1px);
  background-size: 34px 34px;
  background-position: -1px -1px;
}

/* UX-226 base grid radial fade.
   Requested scope: visible grid footprint is about 30% of the viewport area.
   31% x 31% elliptical radii yield approximately pi * .31 * .31 = 30% area.
   The grid fades softly toward the edge instead of ending with a hard boundary. */
.grid-beam-background__grid {
  -webkit-mask-image: radial-gradient(31% 31% at 50% 45%, #000 0%, transparent 100%);
  mask-image: radial-gradient(31% 31% at 50% 45%, #000 0%, transparent 100%);
}

/* Brighter 90px cursor hotspot, matching .u226-gl. */
.grid-beam-background__grid-glow {
  background-image:
    linear-gradient(rgba(129, 140, 248, .55) 1px, transparent 1px),
    linear-gradient(90deg, rgba(129, 140, 248, .55) 1px, transparent 1px);
  -webkit-mask-image: radial-gradient(90px 90px at var(--ux226-mx) var(--ux226-my), #000, transparent);
  mask-image: radial-gradient(90px 90px at var(--ux226-mx) var(--ux226-my), #000, transparent);
  transition: opacity .4s;
}

/* Central violet glow from the source demo. */
.grid-beam-background__ambient-glow {
  position: absolute;
  left: 50%;
  top: 44%;
  width: 260px;
  height: 180px;
  margin: -90px 0 0 -130px;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(99, 102, 241, .35), transparent);
  filter: blur(10px);
}

/* Canvas draws moving horizontal/vertical beams. */
.grid-beam-background__canvas {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Content should paint above the background; keep fixed nav/menu/footer interactive. */
body.has-ux226-grid > .site-nav,
body.has-ux226-grid > .site-menu-panel,
body.has-ux226-grid > .page,
body.has-ux226-grid > .contact-footer {
  position: relative;
  z-index: 1;
}

/* Keep text contrast on legal/policy pages without deleting the effect. */
body.has-ux226-grid[data-page-type="legal"] .grid-beam-background__grid {
  opacity: .78;
}
body.has-ux226-grid[data-page-type="legal"] .grid-beam-background__ambient-glow {
  opacity: .65;
}

/* Responsive: preserve grid character but prevent a dense appearance on narrow screens. */
@media (max-width: 640px) {
  .grid-beam-background__grid,
  .grid-beam-background__grid-glow {
    background-size: 34px 34px;
  }
  .grid-beam-background__ambient-glow {
    width: 220px;
    height: 150px;
    margin: -75px 0 0 -110px;
  }
}

/* Source demo disables motion for users who request reduced motion. */
@media (prefers-reduced-motion: reduce) {
  .grid-beam-background__grid-glow {
    transition: none;
  }
}
```

### Kích thước vùng grid rõ nét (~30% diện tích viewport)

Grid cơ sở dùng `radial-gradient(31% 31% at 50% 45%, #000 0%, transparent 100%)`. Với ellipse có bán kính tương đương khoảng 31% chiều rộng và 31% chiều cao, diện tích hình học xấp xỉ `π × 0.31 × 0.31 ≈ 30%` diện tích viewport. Vì gradient chuyển dần từ đen sang trong suốt, đây là **tỷ lệ ước tính của footprint fade**, không phải ranh giới cứng pixel-perfect. Giữ nguyên grid spacing `34px`, alpha đường `.07`, con trỏ glow `90px`, glow tím trung tâm và beam canvas; chỉ thay kích thước mask của grid cơ sở. Nếu cần hiệu chỉnh trong QA, chỉ điều chỉnh hai giá trị `31%` cùng nhau để vùng vẫn cân đối.

### Vì sao không đặt opacity thấp toàn lớp?

Không đặt `opacity: .1` hoặc `.2` trên `.grid-beam-background`, vì nó làm nhạt đồng thời cả grid, glow và beam — đây là nguyên nhân khiến hiệu ứng mất các đặc trưng của UX-226. Cường độ mặc định ở trên giữ alpha của mẫu gốc; chỉ tinh chỉnh riêng theo QA khi thật sự ảnh hưởng khả năng đọc.

---

## 5. Bước 2 — Tạo JavaScript dùng chung cho beam

**Tạo file:** `ai-era-site/js/grid-beam-background.js`

Đoạn code dưới đây chuyển logic canvas của `.u226-cv` từ demo sang viewport toàn trang. Nó giữ ba màu beam, tốc độ/chiều dài ngẫu nhiên, đầu beam phát sáng, tối đa 9 beam, 4 beam khởi tạo và spawn mỗi khoảng 0.42 giây.

```js
/* AI Era — UX-226 shared grid-beam animation. */
(() => {
  const root = document.querySelector('.grid-beam-background');
  if (!root) return;

  const canvas = root.querySelector('.grid-beam-background__canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const COLORS = ['129,140,248', '45,212,191', '244,114,182'];
  const GRID = 34;
  const MAX_BEAMS = 9;
  const DPR_MAX = 2;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let beams = [];
  let spawnAccumulator = 0;
  let rafId = 0;
  let lastFrame = 0;
  let pageVisible = !document.hidden;
  let pointerX = -200;
  let pointerY = -200;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(DPR_MAX, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function spawnBeam(initial = false, index = 0) {
    const vertical = Math.random() < 0.5;
    const extent = vertical ? height : width;
    const crossExtent = vertical ? width : height;
    const lineCount = Math.max(1, Math.floor(crossExtent / GRID) - 1);
    const line = (1 + Math.floor(Math.random() * lineCount)) * GRID - 1;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const start = direction > 0 ? -60 : extent + 60;
    const position = initial ? extent * (0.2 + index * 0.18) : start;

    beams.push({
      vertical,
      line,
      position,
      direction,
      speed: 110 + Math.random() * 90,
      length: 50 + Math.random() * 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const beam of beams) {
      const x0 = beam.vertical ? beam.line : beam.position - beam.direction * beam.length;
      const y0 = beam.vertical ? beam.position - beam.direction * beam.length : beam.line;
      const x1 = beam.vertical ? beam.line : beam.position;
      const y1 = beam.vertical ? beam.position : beam.line;
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(${beam.color},0)`);
      gradient.addColorStop(1, `rgba(${beam.color},.95)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x0 + 0.5, y0 + 0.5);
      ctx.lineTo(x1 + 0.5, y1 + 0.5);
      ctx.stroke();

      /* Glowing beam head from UX-226. */
      ctx.fillStyle = `rgba(${beam.color},1)`;
      ctx.shadowColor = `rgba(${beam.color},1)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x1 + 0.5, y1 + 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function tick(now) {
    rafId = 0;
    if (!pageVisible || document.hidden || reduceMotion.matches) return;

    const dt = Math.min(0.05, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    spawnAccumulator += dt;

    if (spawnAccumulator > 0.42 && beams.length < MAX_BEAMS) {
      spawnAccumulator = 0;
      spawnBeam();
    }

    for (const beam of beams) beam.position += beam.direction * beam.speed * dt;
    beams = beams.filter((beam) => {
      const limit = (beam.vertical ? height : width) + 70;
      return beam.direction > 0 ? beam.position < limit : beam.position > -70;
    });

    draw();
    rafId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (rafId || !pageVisible || document.hidden || reduceMotion.matches) return;
    lastFrame = performance.now();
    rafId = window.requestAnimationFrame(tick);
  }

  function stop() {
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function onPointerMove(event) {
    if (coarsePointer) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    root.style.setProperty('--ux226-mx', `${pointerX}px`);
    root.style.setProperty('--ux226-my', `${pointerY}px`);
  }

  function onPointerLeave() {
    pointerX = -200;
    pointerY = -200;
    root.style.setProperty('--ux226-mx', '-200px');
    root.style.setProperty('--ux226-my', '-200px');
  }

  function onVisibilityChange() {
    pageVisible = !document.hidden;
    if (pageVisible) start();
    else stop();
  }

  function onMotionPreferenceChange() {
    if (reduceMotion.matches) {
      stop();
      beams = [];
      draw();
    } else {
      /* Start with four beams again when motion is allowed. */
      for (let i = 0; i < 4; i++) spawnBeam(true, i);
      draw();
      start();
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibilityChange);
  reduceMotion.addEventListener?.('change', onMotionPreferenceChange);

  resizeCanvas();
  if (!reduceMotion.matches) {
    for (let i = 0; i < 4; i++) spawnBeam(true, i);
    draw();
    start();
  }
})();
```

**Lưu ý:** Với `prefers-reduced-motion`, grid và glow vẫn hiển thị tĩnh, chỉ dừng beam động. Nếu cần hỗ trợ trình duyệt rất cũ không có `MediaQueryList.addEventListener`, có thể bổ sung fallback `addListener` trong cùng file.

---

## 6. Bước 3 — Thêm stylesheet vào 7 trang con

Trong `<head>` mỗi trang mục tiêu, tìm stylesheet bundle hiện có, ví dụ:

```html
<link rel="stylesheet" href="./css/bundle.min.css?v=20260914.1">
```

Thêm ngay sau đó:

```html
<link rel="stylesheet" href="./css/grid-beam-background.css?v=1.0.0">
```

Không đổi query version của `bundle.min.css`. **Không thêm dòng stylesheet này vào `index.html`.**

## 7. Bước 4 — Thêm markup background vào `<body>`

Trong mỗi trang mục tiêu, tìm thẻ `<body id="top">`. Chèn ngay sau thẻ body mở và trước navigation:

```html
<!-- UX-226 decorative background; kept separate from page content. -->
<div class="grid-beam-background" aria-hidden="true">
  <div class="grid-beam-background__grid"></div>
  <div class="grid-beam-background__grid-glow"></div>
  <div class="grid-beam-background__ambient-glow"></div>
  <canvas class="grid-beam-background__canvas"></canvas>
</div>
```

Thêm class vào body để CSS xếp lớp nội dung lên trên background:

```html
<body id="top" class="has-ux226-grid">
```

Với `privacy.html`, dùng:

```html
<body id="top" class="has-ux226-grid" data-page-type="legal">
```

Nếu thẻ body đã có `class` hoặc `data-*` khác, **ghép thêm thuộc tính vào thuộc tính hiện có**, không xóa giá trị cũ. Markup phải chỉ xuất hiện một lần trong mỗi trang.

## 8. Bước 5 — Nạp JavaScript dùng chung

Trước `</body>` của mỗi trang mục tiêu, thêm:

```html
<script src="./js/grid-beam-background.js?v=1.0.0" defer></script>
```

Nếu dự án đã có convention tập trung script trong `<head>` với `defer`, có thể đặt cùng khu vực đó. Không xóa hoặc thay thứ tự các script hiện hữu như `detail-i18n.js`, `contact-footer.js`, `menu-init.js` hay script của menu/theme. **Không thêm script vào `index.html`.**

## 9. Bước 6 — Xử lý riêng `landing-page-hosting.html`

Trang này đã có hero grid riêng trong nội dung. Để không phá hiệu ứng hiện tại:

1. Giữ nguyên markup/CSS/JS hero grid đã được thêm trước đó.
2. Thêm background toàn trang dùng chung như các bước trên.
3. Không đổi class `hosting-grid-hero` thành class dùng chung và không thay thế hero bằng markup background.
4. Kiểm tra ở đầu trang: nếu hai hiệu ứng làm vùng hero quá dày, chỉ giảm cường độ **lớp background toàn trang** trên trang này, không xóa các lớp `.hosting-grid-hero` hoặc sửa các giá trị gốc của hero. Có thể thêm class `has-ux226-grid has-hosting-grid-hero` vào body rồi dùng CSS scoped, ví dụ:

```css
body.has-hosting-grid-hero .grid-beam-background__grid { opacity: .55; }
body.has-hosting-grid-hero .grid-beam-background__ambient-glow { opacity: .45; }
```

Chỉ thêm override trên nếu visual QA xác nhận cần thiết. Không áp dụng opacity thấp cho toàn bộ site.

## 10. Bước 7 — Kiểm tra code trước khi chạy

Chạy các kiểm tra từ root project:

```bash
# Đếm markup ở 7 trang mục tiêu; mỗi file phải có đúng 1 background
rg -l 'class="grid-beam-background"' ai-era-site/*.html

# Đảm bảo trang chủ không bị thay đổi
rg -n 'grid-beam-background|has-ux226-grid|grid-beam-background.js' ai-era-site/index.html

# Xác nhận các giá trị quan trọng của UX-226 còn trong code dùng chung
rg -n '34px|90px 90px|129, 140, 248|45, 212, 191|244, 114, 182|MAX_BEAMS|0\.42|110 \+|50 \+' \
  ai-era-site/css/grid-beam-background.css ai-era-site/js/grid-beam-background.js
```

Lệnh tìm trong `index.html` phải không trả kết quả. `rg -l` phải liệt kê 7 trang con. Kiểm tra thêm `git diff -- ai-era-site/index.html` phải trống.

## 11. Bước 8 — Chạy demo local

Tại thư mục root dự án hoặc thư mục `ai-era-site`, chạy máy chủ tĩnh. Ví dụ từ root:

```bash
cd ai-era-site
python -m http.server 8000
```

Mở các URL sau để kiểm tra từng trang:

- `http://localhost:8000/ai-automation-ai-agent.html`
- `http://localhost:8000/digital-marketing-ai-content.html`
- `http://localhost:8000/fintech-ai-quant-finance.html`
- `http://localhost:8000/landing-page-hosting.html`
- `http://localhost:8000/phan-mem-quan-ly-doanh-nghiep.html`
- `http://localhost:8000/privacy.html`
- `http://localhost:8000/thiet-ke-website-chuan-seo.html`
- `http://localhost:8000/index.html` (chỉ xác nhận trang chủ không đổi)

## 12. Checklist nghiệm thu

### Bảo toàn mẫu UX-226
- [ ] Grid 34 × 34 px, đường lưới nhìn thấy rõ, không bị làm mờ toàn lớp.
- [ ] Grid cơ sở tập trung ở vùng trung tâm, footprint khoảng 30% diện tích viewport với radial fade mềm; không phủ đều cứng toàn màn hình.
- [ ] Khi rê chuột trên desktop, vùng grid glow sáng hơn theo con trỏ với mask khoảng 90 × 90 px.
- [ ] Có ambient violet glow ở vùng trung tâm trên, gần vị trí 44% chiều cao.
- [ ] Beam chạy cả ngang lẫn dọc; đầu beam phát sáng và phần đuôi có gradient.
- [ ] Ba tông màu indigo, teal và pink đều có thể xuất hiện.
- [ ] Có nhiều beam đồng thời; ban đầu có 4 beam, giới hạn không quá 9.
- [ ] Beam có tốc độ và chiều dài biến đổi, không phải một đường CSS mờ chạy lặp đơn giản.

### Tích hợp với website
- [ ] Background nằm phía sau nội dung, không che click, chọn chữ, menu hoặc footer.
- [ ] Navigation/menu vẫn hoạt động; footer contact và anchor vẫn dùng được.
- [ ] Nội dung, metadata, canonical, JSON-LD, i18n và script cũ không bị xóa hoặc thay đổi ngoài ý muốn.
- [ ] `landing-page-hosting.html` giữ nguyên hero grid hiện tại và không bị hiệu ứng chồng quá dày.
- [ ] `privacy.html` vẫn dễ đọc; không loại bỏ hoàn toàn grid hoặc beam chỉ vì đây là trang legal.
- [ ] `index.html` không có diff và không tải file CSS/JS mới.

### Responsive, motion, performance
- [ ] Kiểm tra desktop rộng (≥ 1280 px), tablet (~768 px) và mobile (~375 px).
- [ ] Canvas được resize đúng khi thay đổi kích thước cửa sổ; không bị méo hoặc để lại vệt.
- [ ] DPR được giới hạn tối đa 2.
- [ ] Tab nền được ẩn thì animation dừng; quay lại tab thì tiếp tục.
- [ ] Bật hệ điều hành “Reduce motion”: grid/glow tĩnh còn hiển thị nhưng beam dừng.
- [ ] Trình duyệt console không có lỗi JS/CSS hoặc lỗi 404 tài nguyên.
- [ ] Đo nhanh trên thiết bị yếu; nếu có giật, không được âm thầm bỏ canvas để thay bằng grid mờ. Hãy profile trước, sau đó điều chỉnh có chủ đích và ghi lại trade-off.

### Pull Request
- [ ] Chỉ 7 HTML mục tiêu được cập nhật; `index.html` không thay đổi.
- [ ] Có 2 file dùng chung: `css/grid-beam-background.css`, `js/grid-beam-background.js`.
- [ ] Không có bản sao CSS/JS lớn dán lặp vào từng HTML.
- [ ] PR mô tả các trang đã kiểm tra và ghi nhận ngoại lệ (nếu có).
- [ ] Có screenshot trước/sau cho desktop và mobile, đặc biệt là `landing-page-hosting.html` và `privacy.html`.

## 13. Xử lý lỗi thường gặp

**Không thấy beam nhưng thấy grid:** kiểm tra file JS đã tải thành công, class canvas có đúng tên, console không báo lỗi và `prefers-reduced-motion` không bật.

**Grid quá mờ:** kiểm tra không có `opacity` thấp trên `.grid-beam-background` hoặc overlay toàn trang; kiểm tra thứ tự stylesheet và các rule `background-image` có bị CSS khác ghi đè không.

**Beam nằm sau nền đặc của page:** xem background của `body`, `.page` và các section. Background dùng chung phải nằm trong lớp stacking thấp hơn; không đặt z-index âm tùy tiện vì có thể bị vẽ phía sau body.

**Menu hoặc footer không click được:** xác nhận background có `pointer-events: none`; xác nhận các lớp `.site-nav`, `.site-menu-panel`, `.page`, `.contact-footer` nằm trên background.

**Hero `landing-page-hosting.html` quá sáng:** chỉ scoped giảm lớp background dùng chung ở trang đó; không xóa grid glow, beam canvas hoặc ambient glow trong hero hiện hữu.

**Animation vẫn chạy khi tab ẩn:** xác nhận listener `visibilitychange` được đăng ký và `stop()` hủy `requestAnimationFrame`.

---

## Definition of Done

Công việc chỉ hoàn tất khi cả 7 trang con có cùng hiệu ứng grid-beam theo UX-226, con trỏ tạo hotspot sáng trên desktop, beam canvas đa màu chạy ngang/dọc, reduced motion được tôn trọng, nội dung vẫn dễ đọc và `index.html` không bị sửa đổi.
