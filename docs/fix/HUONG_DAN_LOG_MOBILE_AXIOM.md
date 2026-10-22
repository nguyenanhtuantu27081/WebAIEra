# Hướng dẫn thêm log trong code để điều tra lỗi crash mobile ở `index.html`

**Phạm vi:** chỉ sửa code của dự án `ai-era-site/` để phát sinh log chẩn đoán. Axiom, Docker Compose, VPS, token, dataset và pipeline ingest đã được cấu hình sẵn; tài liệu này không hướng dẫn cài đặt hay cấu hình lại các phần đó.

## 1. Mục tiêu

Khi trang chủ bị nhấp nháy, treo hoặc trình duyệt báo “đã có sự cố xảy ra liên tục”, cần biết:
- Giai đoạn nào của trang chủ đang chạy trước khi lỗi xuất hiện.
- Có JavaScript exception hoặc promise rejection không.
- Renderer nào bị mất WebGL context.
- DPR, viewport, tier chất lượng và trạng thái hiển thị tại thời điểm lỗi.
- Animation loop có bị khởi động nhiều lần hay tiếp tục chạy khi tab ẩn không.
- Các log nào được ghi ngay trước khi trang ngừng hoạt động.

**Giả định cần xác nhận trong code:** dự án đã có sẵn cách gửi log từ frontend lên hệ thống log/Axiom. Trước khi thêm logger mới, hãy tìm trong repository các từ khóa như `axiom`, `otel`, `opentelemetry`, `logger`, `fetch`, `ingest`, `console`, `Sentry` và xem cách dự án hiện tại gửi log. Dùng lại cơ chế sẵn có; không tạo endpoint, token hoặc config Axiom mới trong hướng dẫn này.

> Nếu hiện tại chỉ có Axiom chạy trên VPS nhưng frontend chưa có đường gửi log đến đó, `console.error()` trong browser sẽ **không tự động xuất hiện** trong Axiom. Khi đó cần tích hợp vào collector/client logging hiện có của dự án; không nhúng token Axiom vào JavaScript client.

---

## 2. Trước khi sửa

1. Tạo nhánh Git riêng hoặc backup source.
2. Mở `ai-era-site/index.html` và xác nhận entry module đang được nạp.
3. Mở `ai-era-site/js/main.js`, `ai-era-site/js/three/scene-setup.js`, `ai-era-site/js/quality-tier.js`, `ai-era-site/js/three/nodes.js`.
4. Tìm cơ chế logging hiện có và xác định cách gọi logger gửi sự kiện lên Axiom.
5. Thử tái hiện lỗi trên thiết bị thật và lưu log ban đầu.
6. Không log mỗi frame; chỉ log sự kiện, trạng thái thay đổi hoặc số liệu tổng hợp mỗi 5–10 giây.

Trong các đoạn code dưới đây, `logger.info(...)`, `logger.warn(...)`, `logger.error(...)` là **tên minh họa**. Thay chúng bằng API logger thực tế đang có trong repository. Nếu chưa có logger dùng được từ browser, có thể dùng `console.*` để kiểm tra qua remote debugging, nhưng đó không đồng nghĩa với đồng bộ Axiom.

---

## 3. Log lỗi JavaScript toàn cục

### File: `ai-era-site/js/diagnostics.js` (tạo mới nếu chưa có)

Tạo module nhỏ để bắt lỗi chưa được xử lý. Trước khi dùng, thay phần `emitLog()` để gọi logger có sẵn của dự án.

```js
// js/diagnostics.js
function emitLog(level, event, details = {}) {
  const record = {
    event,
    level,
    time: new Date().toISOString(),
    page: window.location.pathname, // không gửi query string
    visibility: document.visibilityState,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    },
    details,
  };

  // THAY bằng logger hiện có đang gửi log lên Axiom.
  // Ví dụ: appLogger[level](record);
  const fn = console[level] || console.log;
  fn.call(console, '[diagnostics]', record);
}

export const logDiagInfo = (event, details) =>
  emitLog('info', event, details);

export const logDiagWarn = (event, details) =>
  emitLog('warn', event, details);

export const logDiagError = (event, details) =>
  emitLog('error', event, details);

export function initDiagnostics() {
  window.addEventListener('error', (event) => {
    const target = event.target;

    // Lỗi tải resource (script, CSS, ảnh, font) thường không có event.error.
    if (target && target !== window) {
      logDiagError('resource_load_error', {
        tagName: target.tagName || 'unknown',
        resource: String(target.src || target.href || '').slice(0, 300),
      });
      return;
    }

    logDiagError('window_error', {
      message: String(event.message || '').slice(0, 1000),
      filename: String(event.filename || '').slice(0, 300),
      line: event.lineno || null,
      column: event.colno || null,
      name: String(event.error?.name || ''),
      stack: String(event.error?.stack || '').slice(0, 2000),
    });
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    logDiagError('unhandled_rejection', {
      message: String(reason?.message || reason || '').slice(0, 1000),
      stack: String(reason?.stack || '').slice(0, 2000),
    });
  });

  document.addEventListener('visibilitychange', () => {
    logDiagInfo('visibility_change', {
      state: document.visibilityState,
    });
  });

  window.addEventListener('pagehide', () => {
    logDiagInfo('pagehide', {});
  });

  window.addEventListener('pageshow', (event) => {
    logDiagInfo('pageshow', {
      persistedFromBFCache: event.persisted,
    });
  });

  window.addEventListener('orientationchange', () => {
    logDiagInfo('orientation_change', {
      width: window.innerWidth,
      height: window.innerHeight,
      orientation: screen.orientation?.type || 'unknown',
    });
  });
}
```

### Lưu ý

- Đây là lớp bắt lỗi toàn cục. Nó không tự bắt được mọi lỗi GPU/process crash.
- Không ghi cookie, localStorage, form input, token, query string hoặc dữ liệu cá nhân.
- `pagehide` chỉ báo được nếu browser còn đủ thời gian chạy handler.

---

## 4. Khởi tạo diagnostics sớm trong trang chủ

### File: `ai-era-site/js/main.js`

Thêm import ở đầu file:

```js
import {
  initDiagnostics,
  logDiagInfo,
  logDiagWarn,
  logDiagError,
} from './diagnostics.js';
```

Gọi trước khi khởi tạo cảnh Three.js:

```js
initDiagnostics();
logDiagInfo('home_module_start', {
  userAgent: navigator.userAgent,
  online: navigator.onLine,
  hardwareConcurrency: navigator.hardwareConcurrency ?? null,
  deviceMemoryGB: navigator.deviceMemory ?? null,
  saveData: navigator.connection?.saveData ?? null,
});
```

Đặt log theo từng giai đoạn init quan trọng. Ví dụ, giữ nguyên các lệnh init thực tế và thêm event ngay trước/sau:

```js
logDiagInfo('home_init_stage', { stage: 'before-scene-init' });
// Lệnh khởi tạo scene đang có của dự án
logDiagInfo('home_init_stage', { stage: 'after-scene-init' });

logDiagInfo('home_init_stage', { stage: 'before-nodes-init' });
// Lệnh khởi tạo nodes đang có của dự án
logDiagInfo('home_init_stage', { stage: 'after-nodes-init' });
```

Không copy các hàm init minh họa nếu tên hàm đó không tồn tại trong dự án. Chỉ chèn log trước/sau các lời gọi thực tế, chẳng hạn controls, node, HUD, effects và renderer phụ.

Nếu trang dừng sau `before-...` nhưng không có event `after-...`, đó là manh mối để khoanh vùng giai đoạn bị lỗi; không phải bằng chứng tuyệt đối nếu browser bị kill.

---

## 5. Theo dõi WebGL context

### File: `ai-era-site/js/three/scene-setup.js`

Sau khi renderer chính được tạo, gắn listener lên `renderer.domElement`. Import logger:

```js
import {
  logDiagInfo,
  logDiagWarn,
  logDiagError,
} from '../diagnostics.js';
```

Ngay sau lệnh khởi tạo renderer hiện tại:

```js
const canvas = renderer.domElement;

canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();

  logDiagError('webgl_context_lost', {
    renderer: 'main',
    statusMessage: event.statusMessage || 'unknown',
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    dpr: window.devicePixelRatio || 1,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
});

canvas.addEventListener('webglcontextrestored', () => {
  logDiagWarn('webgl_context_restored', {
    renderer: 'main',
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });
});

logDiagInfo('webgl_renderer_created', {
  renderer: 'main',
  tier,
  configuredDpr: cfg.dpr,
  antialias: cfg.antialias,
  powerPreference: cfg.powerPreference,
  canvasWidth: canvas.width,
  canvasHeight: canvas.height,
});
```

**Chú ý:** đoạn trên giả định biến `renderer`, `tier`, `cfg` có sẵn tại vị trí chèn. Nếu file khởi tạo renderer theo cách khác, đặt listener ngay sau khi lấy được renderer và dùng các biến thực tế. Không khai báo `const renderer` lần thứ hai.

### Renderer phụ

Tìm tất cả nơi tạo `new THREE.WebGLRenderer(...)`, đặc biệt:
- `ai-era-site/js/contact-footer.js`
- `ai-era-site/js/three/contact-btn-3d.js`
- `ai-era-site/js/three/hamburger-menu.js`

Gắn cùng loại listener cho từng `renderer.domElement`, nhưng đặt tên rõ ràng (`footer`, `contact-button`, `hamburger-menu`). Gắn listener một lần khi tạo renderer, không gắn lại mỗi lần mở menu.

---

## 6. Ghi cấu hình quality tier và resize

### File: `ai-era-site/js/quality-tier.js`

Không cần sửa logic chất lượng chỉ để bật logging. Thay vào đó, log kết quả tier ở nơi gọi `getQualityTier()` hoặc ngay sau khi chọn cấu hình:

```js
logDiagInfo('render_quality_selected', {
  tier,
  viewportWidth: window.innerWidth,
  viewportHeight: window.innerHeight,
  devicePixelRatio: window.devicePixelRatio || 1,
  pointerCoarse: window.matchMedia?.('(pointer: coarse)')?.matches ?? null,
  reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? null,
  saveData: navigator.connection?.saveData ?? null,
});
```

Nếu `quality-tier.js` không import logger để tránh phụ thuộc vòng, hãy log tại `scene-setup.js` sau khi gọi `getQualityTier()`.

### File: `ai-era-site/js/three/scene-setup.js`

Trong hàm resize hiện có, ghi log có throttle/debounce, không ghi mọi resize event:

```js
let lastResizeLogAt = 0;

function logResizeIfNeeded() {
  const now = Date.now();
  if (now - lastResizeLogAt < 2000) return;
  lastResizeLogAt = now;

  logDiagInfo('webgl_resize', {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    canvasWidth: renderer.domElement.width,
    canvasHeight: renderer.domElement.height,
  });
}
```

Gọi `logResizeIfNeeded()` từ hàm resize hiện có. Nếu dùng `renderer` ở module scope, đảm bảo hàm chỉ được gọi sau khi renderer đã được tạo.

---

## 7. Theo dõi animation loop trong `main.js`

Mục tiêu là biết loop được bật/tắt khi nào và ước lượng tần suất callback mà không tạo log mỗi frame.

### 7.1. Ghi trạng thái animation

Ở module scope:

```js
let lastLoggedAnimationState = null;

function logAnimationState(state, details = {}) {
  if (state === lastLoggedAnimationState) return;
  lastLoggedAnimationState = state;

  logDiagInfo('main_animation_state', {
    state,
    visibility: document.visibilityState,
    ...details,
  });
}
```

Gọi `logAnimationState('running')` khi loop thực sự bắt đầu; gọi `logAnimationState('paused')` khi code thực sự dừng loop. Không gọi `paused` chỉ vì một frame bỏ qua render nếu loop vẫn chạy.

### 7.2. Đo số callback mỗi 5 giây

Tích hợp vào hàm `animate()` hiện có, không tạo loop thứ hai chỉ để đo:

```js
let sampleStart = performance.now();
let sampleFrames = 0;
let lastSampleLog = sampleStart;

function recordMainFrameSample() {
  sampleFrames++;
  const now = performance.now();

  if (now - lastSampleLog < 5000) return;

  const elapsed = now - sampleStart;
  const approximateFps = elapsed > 0
    ? Math.round(sampleFrames * 1000 / elapsed)
    : null;

  logDiagInfo('main_animation_sample', {
    approximateFps,
    sampleWindowMs: Math.round(elapsed),
  });

  sampleStart = now;
  sampleFrames = 0;
  lastSampleLog = now;
}
```

Trong `animate()` hiện có, gọi `recordMainFrameSample()` một lần mỗi callback. Đây là tốc độ callback của animation loop, không nhất thiết bằng FPS thực tế của màn hình/GPU. Không gọi `console.log` mỗi frame.

---

## 8. Theo dõi nodes và pulse line

### File: `ai-era-site/js/three/nodes.js`

Chỉ ghi log ở điểm thay đổi trạng thái hoặc khi phát hiện bất thường. Không log mọi node mỗi frame.

Ví dụ khi chọn node hoặc thay đổi selection, ghi event tại nơi handler thực sự thay đổi selection:

```js
logDiagInfo('node_selection_changed', {
  selectedNode: selected,
});
```

Nếu `selected` có thể là object, chỉ gửi ID/index ổn định thay vì serialize toàn bộ object Three.js.

Nếu cần xác minh `computeLineDistances()` gây tải, không log mỗi lần gọi. Thực hiện một thử nghiệm có kiểm soát:
1. Ghi log `diagnostic_variant: "pulse-distance-on"` khi dùng code hiện tại.
2. Tạo một nhánh thử nghiệm tắt phần cập nhật này trên mobile, ghi `diagnostic_variant: "pulse-distance-off"`.
3. So sánh context loss, crash và frame sample trên cùng thiết bị.
4. Xóa log variant sau khi kết thúc điều tra.

Không khẳng định `computeLineDistances()` là nguyên nhân crash chỉ vì nó chạy mỗi frame; cần so sánh thực nghiệm.

---

## 9. Log lỗi khi khởi tạo renderer

Ở mỗi nơi tạo renderer, dùng `try/catch` cục bộ để ghi lỗi rồi ném lại lỗi, tránh che giấu failure:

```js
let renderer;

try {
  renderer = new THREE.WebGLRenderer({
    antialias: cfg.antialias,
    alpha: true,
    powerPreference: cfg.powerPreference,
  });
} catch (error) {
  logDiagError('webgl_renderer_create_failed', {
    name: String(error?.name || 'Error'),
    message: String(error?.message || error).slice(0, 1000),
    tier,
    dpr: window.devicePixelRatio || 1,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });
  throw error;
}
```

Đây là mẫu; hãy chỉnh để khớp cách khai báo renderer hiện có, không khai báo biến `renderer` trùng tên. Không bắt lỗi rồi tiếp tục chạy các module phụ thuộc vào renderer chưa tạo được.

---

## 10. Kiểm tra log đã đến Axiom

Axiom/Docker Compose đã được cấu hình sẵn theo thông tin người dùng cung cấp. Vì vậy không thay đổi config ở đó. Chỉ xác minh đường log hiện có đã nhận event mới:

1. Mở trang staging với cơ chế logging đang có.
2. Tải lại `index.html`.
3. Tìm event `home_module_start`.
4. Tìm `render_quality_selected` và `webgl_renderer_created`.
5. Tạo một lỗi thử an toàn trên staging (không gây crash GPU) và xác nhận `window_error` xuất hiện.
6. Trên thiết bị bị lỗi, tìm theo thời gian và nhóm event quanh thời điểm nhấp nháy.
7. Nếu log có ở Console nhưng không xuất hiện trong Axiom, kiểm tra logger/collector hiện có; không nhúng token vào browser để khắc phục.
8. Nếu không có log cuối cùng trước crash, ghi nhận rằng browser có thể bị kill trước khi flush.

Các tên event nên dùng thống nhất:

| Event | Ý nghĩa |
|---|---|
| `home_module_start` | Module trang chủ bắt đầu |
| `home_init_stage` | Mốc trước/sau từng giai đoạn khởi tạo |
| `window_error` | Lỗi JavaScript toàn cục |
| `unhandled_rejection` | Promise rejection chưa được xử lý |
| `resource_load_error` | Lỗi tải script/CSS/ảnh/font |
| `webgl_renderer_created` | Renderer được tạo |
| `webgl_renderer_create_failed` | Không tạo được renderer |
| `webgl_context_lost` | WebGL context bị mất |
| `webgl_context_restored` | Context được browser khôi phục |
| `render_quality_selected` | Tier cấu hình render |
| `webgl_resize` | Kích thước canvas/viewport thay đổi |
| `main_animation_state` | Loop bắt đầu/dừng |
| `main_animation_sample` | Số callback ước lượng theo cửa sổ thời gian |
| `visibility_change` | Tab visible/hidden |
| `pagehide` / `pageshow` | Vòng đời trang |

---

## 11. Checklist cho dev

### Trước khi sửa
- [ ] Xác nhận cách logging hiện có của dự án và API logger dùng để gửi Axiom.
- [ ] Xác nhận `index.html` nạp đúng `js/main.js`.
- [ ] Tạo nhánh/backup và lưu log gốc.
- [ ] Ghi thiết bị, OS, browser version và thao tác tái hiện.

### Sau khi thêm log
- [x] Lỗi JS tạo event `window_error` (`js/diagnostics.js`).
- [x] Promise rejection tạo event `unhandled_rejection` (`js/diagnostics.js`).
- [x] Renderer chính ghi `webgl_renderer_created` (`js/three/scene-setup.js`).
- [x] Có listener `webgl_context_lost` và `webgl_context_restored` (tất cả 4 renderer).
- [x] Renderer phụ có tên phân biệt (`main`, `contact-button`, `hamburger-menu`, `footer`) và listener không bị gắn lặp.
- [x] Tier/DPR/viewport được ghi tại thời điểm init và resize có throttle 2000ms.
- [x] Animation sample không ghi từng frame (cửa sổ đo 5000ms trong `js/main.js`).
- [x] Không có dữ liệu nhạy cảm hoặc query string trong log.
- [x] Logger có tiền tố dự án `ai-era-site:` và session ID riêng biệt cho hệ thống Axiom dùng chung nhiều dự án.
- [x] Đã kiểm tra không gây exception khi môi trường không có collector/beacon.

### Khi phân tích sự cố
- [ ] Lọc event theo thời gian, page và session nếu logger có session ID.
- [ ] Tìm `webgl_context_lost` trước tiên.
- [ ] Kiểm tra `webgl_renderer_create_failed`, `window_error`, `unhandled_rejection`.
- [ ] So sánh `render_quality_selected`, DPR và kích thước canvas.
- [ ] Tìm nhiều `webgl_renderer_created` trong cùng một lần truy cập.
- [ ] Đối chiếu log với remote debugging.
- [ ] Không kết luận nguyên nhân chỉ dựa vào một event đơn lẻ.

---

## 12. Giới hạn của log browser

- Trình duyệt bị kill do OOM/GPU process crash có thể không dispatch event và không gửi log cuối cùng.
- `webglcontextlost` chỉ hữu ích khi browser phát event và JavaScript còn hoạt động.
- `pagehide` không bảo đảm batch log đã tới server.
- `console.error()` chỉ xuất hiện trong Axiom nếu dự án có collector/forwarder thu thập console từ browser; Axiom trên VPS không tự động đọc console của khách truy cập.
- Để kết luận nguyên nhân, cần phối hợp log với remote debugging trên Android/iOS và thử nghiệm bật/tắt từng hiệu ứng.

## 13. Definition of Done

- [ ] Logger hiện có được tái sử dụng; không thêm token hoặc cấu hình Axiom mới vào frontend.
- [ ] Có event khởi tạo trang chủ, lỗi JS và WebGL context.
- [ ] Có log tier/DPR/viewport và trạng thái animation.
- [ ] Log kiểm thử đã xuất hiện trong Axiom qua pipeline sẵn có.
- [ ] Log không tăng tải đáng kể và không ghi mỗi frame.
- [ ] Đã thử trên thiết bị gặp lỗi.
- [ ] Ticket có session/time range, event cuối cùng và kết luận hoặc giới hạn điều tra.
