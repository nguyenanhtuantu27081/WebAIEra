# Hướng dẫn thêm log frontend để điều tra crash mobile và node flicker
**Dự án:** `ai-era-site` — `index.html`  
**Đích log:** Axiom đã được cấu hình sẵn qua pipeline hiện tại. Tài liệu này chỉ hướng dẫn instrument trong code; không cấu hình lại Docker Compose/VPS/Axiom.

## 0. Kết quả review codebase mới — `WebAIEra(1).zip`

Đã đọc archive mới `WebAIEra(1).zip`, thư mục web `ai-era-site/`. Source **đã có logger `js/diagnostics.js` và nhiều log ở các renderer**; không áp dụng nguyên hướng dẫn cũ về tạo thêm `js/diagnostics/mobile-diagnostics.js`, vì sẽ tạo hai logger song song và dễ đăng ký listener trùng.

### 0.1 Những gì code hiện có

1. `js/diagnostics.js` định nghĩa `initDiagnostics()`, `logDiagInfo/Warn/Error()`. Schema hiện có `project`, `session`, `event`, `raw_event`, `level`, `time`, `page`, `visibility`, `viewport`, `details`. Có listener `error` (capture), `unhandledrejection`, `visibilitychange`, `pagehide`, `pageshow`, `orientationchange`.
2. `emitLog()` ghi `console`, dispatch `app:telemetry:log`, và chỉ gọi `navigator.sendBeacon()` khi `window.__AXIOM_INGEST_ENDPOINT__` có giá trị. Không thấy trong `index.html` hoặc source một chỗ gán biến endpoint hay consumer đăng ký `app:telemetry:log`. Vì vậy code hiện tại **chưa chứng minh được log browser đã đến Axiom**.
3. `js/main.js` gọi `initDiagnostics()` trong thân module. Static imports được đánh giá trước thân module; do đó lỗi khi evaluate `scene-setup.js` hoặc module dependency có thể xảy ra trước lúc global error handlers được đăng ký. Cần cân nhắc bootstrap inline sớm trong `index.html` hoặc module bootstrap nhỏ không phụ thuộc các module Three.js.
4. `js/three/scene-setup.js`, `js/three/hamburger-menu.js`, `js/three/contact-btn-3d.js`, `js/contact-footer.js` đã ghi `webgl_renderer_created`, `webgl_context_lost` và `webgl_context_restored` (các tên/chi tiết khác nhau đôi chút). **Bổ sung vào handler hiện hữu**, không thêm listener thứ hai.
5. `js/three/scene-setup.js` log `render_quality_selected`, `webgl_resize`; `js/main.js` log `home_module_start`, `home_init_stage`, `main_animation_state`, `main_animation_sample`. `js/three/nodes.js` hiện có lời gọi `computeLineDistances()` lúc tạo line và trong animation chỉ khi `!isLowPowerViewport()`.
6. `js/quality-tier.js` hiện chỉ có `LOW/MEDIUM/HIGH/ULTRA`; không có `SAFE`, crash-loop guard hoặc xử lý `?safe=1` / `?lite=1`. Trên Android mặc định thường là `LOW`, nên không được báo cáo rằng so sánh các URL đó đã được hỗ trợ.
7. Có nhiều WebGL renderer: scene chính, hamburger, contact button và footer (footer lazy-init khi vào viewport). Đảm bảo log phân biệt `renderer` role để đối chiếu số context.
8. `initDiagnostics()` không tự gửi dữ liệu chỉ bằng console hoặc custom DOM event. Không đưa secret token vào JS client. Phải xác minh endpoint/forwarder hiện hữu bằng Network và event thử nghiệm trong Axiom; nếu endpoint chưa được cung cấp, giữ remote debugging là nguồn log thay vì tự đoán URL/token.

### 0.2 Cổng bắt buộc trước khi sửa

Chạy trong repo đang checkout và lưu output cùng commit hash:
```bash
grep -RInE 'AXIOM_INGEST_ENDPOINT|app:telemetry:log|sendBeacon|initDiagnostics|webglcontextlost|webglcontextrestored|computeLineDistances|new THREE.WebGLRenderer|EffectComposer|setAnimationLoop|requestAnimationFrame' ai-era-site
```

- Dùng `js/diagnostics.js` làm logger chung hiện hữu; chỉ mở rộng schema/forwarding nếu cần.
- Trước khi thêm event, tìm event cùng nghĩa để tránh duplicate logs.
- `sendToExistingAxiomPipeline` trong ví dụ cũ chỉ là placeholder; không phải hàm có sẵn trong source này.
- Không gửi nguyên `location.href`/query string; chỉ gửi các flag đã whitelist và không chứa dữ liệu nhạy cảm.

---

### Event hiện có nên tận dụng

| Event / nơi phát | Hiện có | Ghi chú |
|---|---|---|
| `render_quality_selected` — `scene-setup.js` | Có | Có tier, DPR cấu hình, bloom, pointer/reduced-motion/saveData. |
| `webgl_renderer_created` — scene/hamburger/contact/footer | Có | Trường khác nhau theo component; giữ trường `renderer` làm role thống nhất. |
| `webgl_context_lost` / `webgl_context_restored` | Có ở các canvas Three.js chính/phụ | Gắn vào listener hiện hữu, không đăng ký trùng. |
| `webgl_resize` | Có ở `scene-setup.js` | Bị giới hạn log tối thiểu 2 giây giữa các event. |
| `home_module_start`, `home_init_stage` | Có ở `main.js` | `initDiagnostics()` hiện được gọi trong thân module, có thể muộn cho lỗi dependency boot. |
| `main_animation_state`, `main_animation_sample` | Có ở `main.js` | FPS sample 5 giây; không thêm log từng frame. |
| `window_error`, `unhandled_rejection`, lifecycle | Có trong `diagnostics.js` | Lifecycle hiện có gồm visibility/pagehide/pageshow/orientationchange. |

---

## 1. Mục tiêu và giới hạn

Cần xác định trước khi browser Android bị crash:
- JavaScript exception hoặc promise rejection có xảy ra không?
- WebGL context có bị mất không?
- Renderer/scene/animation loop có bị khởi tạo nhiều lần?
- Có bao nhiêu node, light, geometry, draw call (nếu đo được)?
- Resize có bắn dồn dập không?
- Crash chỉ xảy ra ở tier mặc định hay cả `?lite=1` / `?safe=1`?
- Log có được gửi tới Axiom trước khi tab bị kill không?

**Lưu ý:** `FIX_REPORT.md` nói nghi phạm chính là `pulseLine.computeLineDistances()` trong mỗi frame, và các context WebGL phụ/post-processing/CSS/resize là yếu tố cộng dồn; nhưng báo cáo chưa tái hiện lỗi trên thiết bị thật. Log phải kiểm chứng giả thuyết, không chỉ ghi lại kết luận có sẵn.

## 2. File cần thêm/sửa

**Không tạo logger thứ hai mặc định.** Dùng module hiện hữu `ai-era-site/js/diagnostics.js` và mở rộng có kiểm soát:
- `js/diagnostics.js`: schema, giới hạn event, endpoint/forwarder thật nếu đã có; giữ API `logDiagInfo`, `logDiagWarn`, `logDiagError` để các module hiện tại tiếp tục dùng.
- `js/main.js`: giữ `initDiagnostics()` hiện tại; bổ sung event build/version và bảo đảm bootstrap lỗi sớm nếu cần.
- `js/three/scene-setup.js`: bổ sung chi tiết vào log renderer/context/resize đã có.
- `js/three/nodes.js`: đo call count / summary geometry có điều kiện chẩn đoán; không log từng frame.
- `js/three/hamburger-menu.js`, `js/three/contact-btn-3d.js`, `js/contact-footer.js`: giữ log renderer role/context hiện hữu và đo vòng đời/khởi tạo trùng.
- `js/quality-tier.js`: log tier hiện có; chỉ log `SAFE`/`lite` sau khi tính năng đó thực sự được triển khai.
- `index.html`: nếu cần bắt lỗi trước khi module graph chạy, thêm bootstrap inline nhỏ trước `type="module"`; không import Three.js vào bootstrap.

Nếu kiến trúc bắt buộc tách module logger mới, hãy migrate toàn bộ consumer và xóa/đổi module cũ có kế hoạch; không để hai bộ global listeners cùng hoạt động.

---

## 3. Mở rộng `js/diagnostics.js` đúng cách

Không sao chép ví dụ logger hoàn chỉnh thành `js/diagnostics.js`. Các module hiện có đã import API `logDiagInfo`, `logDiagWarn`, `logDiagError`; hãy giữ API đó để không phải sửa hàng loạt import.

`emitLog()` trong `js/diagnostics.js` đang tạo record với `project`, `session`, `event`, `raw_event`, `level`, `time`, `page`, `visibility`, `viewport`, `details`. Nếu cần thêm `buildVersion`, `sequence` hoặc `elapsedMs`, hãy thêm trực tiếp vào object record hiện tại. Ví dụ:

```js
// Bên trong emitLog() hiện hữu, bổ sung các trường vào record:
const record = {
  // ...các trường hiện có, giữ nguyên...
  buildVersion: BUILD_VERSION, // hằng số build do dự án quản lý, không tự đoán
  elapsedMs: Math.round(performance.now() - diagnosticStartedAt),
  details,
};
```

Đây là **mẫu bổ sung**, không chép nguyên object thay cho record hiện tại. Nếu thêm `sequence`, khai báo counter module-scope và tăng một lần cho mỗi event. Đặt giới hạn log theo session hoặc chỉ log event/summary để tránh log tràn; không ghi từng frame.

### Các nguyên tắc bắt buộc
- Không thêm một bộ `window.error`, `unhandledrejection`, `pagehide`, `visibilitychange` mới nếu listener tương ứng đã tồn tại trong `initDiagnostics()`.
- Không dùng `sendToExistingAxiomPipeline`: đây không phải hàm có sẵn. Code hiện tại chỉ thử `sendBeacon` nếu `window.__AXIOM_INGEST_ENDPOINT__` đã được gán.
- Không đưa Axiom token bí mật vào bundle frontend. Không gửi cookie, form input, dữ liệu cá nhân hoặc toàn bộ query string.
- `CustomEvent('app:telemetry:log')` chỉ phát event trong trang; không tự chuyển event sang Axiom nếu không có consumer.
- Ghi một `buildVersion` xác định (commit SHA hoặc build ID thật), không để placeholder trong production.

---

## 4. Khởi tạo diagnostics sớm và tránh listener trùng

Trong source hiện tại, `main.js` đã gọi `initDiagnostics()` và `diagnostics.js` đã đăng ký global listeners. **Không thêm lại các listener đó trong `main.js`.** Vấn đề còn lại là static imports được evaluate trước thân module, nên lỗi lúc evaluate `scene-setup.js` hoặc dependency có thể xảy ra trước khi `initDiagnostics()` chạy.

Để bắt lỗi boot sớm hơn, có thể thêm một bootstrap inline tối giản trong `index.html`, trước các script module. Ví dụ chỉ ghi dấu lỗi ra console (vì module logger chưa được import):

```html
<script>
  window.__earlyBootErrors = [];
  window.addEventListener('error', function (event) {
    window.__earlyBootErrors.push({
      type: 'error',
      message: String(event.message || ''),
      filename: String(event.filename || ''),
      line: event.lineno || null,
      column: event.colno || null,
      time: Date.now()
    });
    console.error('[early-boot-error]', window.__earlyBootErrors.at(-1));
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var item = {
      type: 'unhandledrejection',
      message: String(reason && reason.message || reason || ''),
      time: Date.now()
    };
    window.__earlyBootErrors.push(item);
    console.error('[early-boot-rejection]', item);
  });
</script>
```

Khi `initDiagnostics()` chạy, nếu cần, đọc các mục đã lưu và chuyển thành `logDiagError()` rồi xóa buffer. Giới hạn buffer (ví dụ 10 mục) để tránh tăng bộ nhớ. Listener `error` không bắt được mọi lỗi parse/module load và không thay thế Network/remote debugging; bootstrap này chỉ giúp thu một phần lỗi xảy ra sớm hơn.

---

## 5. Log vòng đời WebGL — `three/scene-setup.js`

Ghi sự kiện ngay sau khi tạo renderer và sau khi chọn render path. Trong source hiện tại, `composer` luôn được tạo nên `Boolean(composer)` sẽ luôn là `true`; nếu cần phân biệt đường render, hãy log rõ `composerEnabled` sau khi refactor render path:
```js
logDiagInfo("renderer_created", {
  rendererRole: "main-scene",
  tier,
  pixelRatio: renderer.getPixelRatio?.(),
  outputColorSpace: renderer.outputColorSpace,
  toneMapping: renderer.toneMapping,
  postProcessing: Boolean(composer), // Trong archive hiện tại composer luôn được tạo, kể cả LOW
  canvasWidth: renderer.domElement.width,
  canvasHeight: renderer.domElement.height
});
```

> **Chọn đúng theo source đang checkout:** archive cũ `WebAIEra.zip` chưa có các handler; archive mới `WebAIEra(1).zip` đã có handler ở renderer chính và một số renderer phụ; trong nhánh/bản vá khác, hãy grep trước để tránh đăng ký trùng. Nếu đã có handler, thêm log vào handler đó. Các hàm `stopAnimationLoop()` / `rebuildResourcesIfNeeded()` / `startAnimationLoop()` trong snippet dưới đây chỉ là tên minh họa, không được chép nguyên xi nếu chúng không tồn tại. Three.js tự quản lý phần lớn tài nguyên GPU của renderer; chỉ dựng lại tài nguyên thủ công nếu ứng dụng có tài nguyên WebGL tự quản lý ngoài Three.js.

Gắn sự kiện vào canvas:
```js
const canvas = renderer.domElement;

canvas.addEventListener("webglcontextlost", (event) => {
  logDiagError("webgl_context_lost", {
    rendererRole: "main-scene",
    preventDefaultCalled: true,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    tier
  }, "error");

  // Chỉ gọi preventDefault nếu ứng dụng có xử lý phục hồi/fallback.
  event.preventDefault();
  // Đặt cờ contextLost để renderFrame() bỏ qua render; dừng loop chỉ khi
  // kiến trúc hiện tại hỗ trợ start lại mà không tạo loop trùng.
});

canvas.addEventListener("webglcontextrestored", () => {
  logDiagWarn("webgl_context_restored", {
    rendererRole: "main-scene",
    tier
  }, "warn");

  // Nếu cần, đánh dấu context đã phục hồi và tiếp tục theo lifecycle hiện có.
  // Không gọi start loop mới nếu loop cũ vẫn đang chạy.
});
```
Tên hàm là ví dụ; dùng hàm thật của dự án. Nếu việc restore chưa được hỗ trợ an toàn, log rồi chuyển sang fallback/SAFE tier thay vì giả vờ phục hồi thành công.

### Thêm log khi khởi tạo scene
```js
logDiagInfo("scene_init", {
  tier,
  nodeCount,
  pulseLineCount,
  pointLightCount,
  postProcessing: Boolean(composer)
});
```
Các biến phải lấy từ trạng thái thực tế. Không tạo số liệu giả hoặc hard-code số node nếu scene có thể thay đổi.

## 6. Log animation loop — `main.js` hoặc module điều khiển render

### Không log từng frame
Log một summary mỗi 10–15 giây, hoặc khi FPS/tier thay đổi:
```js
let frameCount = 0;
let lastSummaryAt = performance.now();
let lastFrameAt = performance.now();

function onFrame(now) {
  frameCount++;

  const elapsed = now - lastSummaryAt;
  if (elapsed >= 10000) {
    logDiagInfo("render_summary", {
      intervalMs: Math.round(elapsed),
      frameCount,
      fpsApprox: Math.round(frameCount * 1000 / elapsed),
      sinceLastFrameMs: Math.round(now - lastFrameAt),
      tier,
      nodeCount,
      rendererCount: activeRenderers.size
    });

    frameCount = 0;
    lastSummaryAt = now;
  }

  lastFrameAt = now;
  // Phần update/render hiện có tiếp tục ở đây.
}
```
Mẫu này cần được tích hợp vào loop thật, không tạo thêm loop `requestAnimationFrame` chỉ để log. `activeRenderers` không tồn tại; nếu cần đếm renderer, thêm registry nhỏ trong `js/diagnostics.js` (đếm theo role `main-scene`, `hamburger`, `contact-btn`, `footer`) và gọi ngay sau mỗi `new THREE.WebGLRenderer`. **Mục tiêu nếu triển khai fallback cho renderer trang trí:** mobile chỉ còn renderer scene chính; desktop chỉ tạo renderer trang trí khi thực sự cần. Đây chưa phải trạng thái hiện tại: archive mới vẫn có thể tạo renderer cho main scene, hamburger, contact button và footer (footer lazy-init). Không ghi “mobile = 1 renderer” là kết quả đã đạt cho đến khi đo trên thiết bị thật.

Có thể bổ sung vào `render_summary` các số rẻ và hữu ích: `renderer.info.render.calls`, `renderer.info.render.triangles`, `renderer.info.memory.geometries/textures`, `renderer.info.programs.length`, và (chỉ Chrome/Android) `performance.memory?.usedJSHeapSize`. Lưu ý `renderer.info.memory.geometries` đếm *geometry*, **không** đếm GL buffer bị rò do thay `BufferAttribute` — xem §7 để chứng minh rò rỉ.

Ghi thêm event thay đổi:
- `animation_loop_started`
- `animation_loop_stopped` (kèm `reason`: `hidden`, `context_lost`, `component_disposed`, ...)
- `render_path_selected` (direct/composer)
- `render_quality_selected` / `quality_tier_changed` (event thứ hai chỉ sau khi implement tier changes)

## 7. Log trong `three/nodes.js`

Ghi một lần khi scene/node khởi tạo:
```js
logDiagInfo("nodes_initialized", {
  nodeCount,
  pulseLineCount,
  pointLightCount
});
```

Nếu đang điều tra `computeLineDistances`, đếm số lần gọi trong build debug hoặc thêm một counter ngay tại call site; log counter mỗi 10 giây, không log mỗi lần:
```js
let computeLineDistancesCalls = 0;

// Ngay trước call site đang được điều tra:
computeLineDistancesCalls++;

// Trong summary 10–15 giây:
logDiagInfo("geometry_update_summary", {
  computeLineDistancesCalls,
  intervalMs
});
computeLineDistancesCalls = 0;
```
### Cách chứng minh giả thuyết rò GL buffer (tùy chọn, chỉ staging/debug)
`renderer.info` **không** thấy buffer mồ côi, nên đếm trực tiếp lời gọi tạo buffer ở tầng WebGL:
```js
// Chỉ chạy ở staging sau khi đã thêm cờ chẩn đoán tường minh (ví dụ `?diag=1`).
// Cờ `diag` CHƯA có sẵn trong archive mới; không giả định điều kiện này tự hoạt động.
const gl = renderer.getContext();
const originalCreateBuffer = gl.createBuffer.bind(gl);
let createdBuffers = 0;
try {
  gl.createBuffer = function () {
    createdBuffers++;
    return originalCreateBuffer();
  };
} catch (error) {
  logDiagWarn("gl_buffer_instrumentation_unavailable", {
    message: String(error?.message || error)
  });
}
// Trong summary 10s: logDiagInfo("gl_buffer_summary", { created: createdBuffers, intervalMs });
// Sau test, gỡ instrumentation bằng cách bỏ bản vá debug và deploy lại source sạch.
```
Kỳ vọng cần kiểm chứng: **bản cũ** có thể cho thấy số lần tạo buffer tăng theo FPS; **bản vá** cần được đo để xác nhận. Đây là chỉ báo hỗ trợ giả thuyết, không phải bằng chứng duy nhất vì instrumentation có thể ảnh hưởng hiệu năng và không phải mọi buffer allocation đều tương ứng một GL buffer. Chạy ở bản cũ trên staging rồi so với bản vá. Chỉ bật khi `?diag=1`, đừng để trong production.

Không giữ instrumentation này trong production. Nếu ghi nhận tạo buffer bằng cách bọc `gl.createBuffer`, xác nhận phép gán được hỗ trợ trên browser mục tiêu và rằng bản debug không gây thêm lỗi. Sau khi sửa, ưu tiên counter tại call site và xác minh số lần gọi không tăng theo FPS.

Nếu dùng cập nhật `lineDistance.array` trực tiếp như báo cáo, log:
- độ dài array/attribute;
- số lần cập nhật;
- liệu có tạo attribute/geometry mới hay không;
- tier đang chạy.
Không log toàn bộ buffer hoặc object Three.js vì dữ liệu quá lớn.

## 8. Log resize — `main.js` / `three/scene-setup.js`

Ghi khi resize thực sự được áp dụng, không phải mọi event đều gửi lên Axiom:
```js
let resizeEvents = 0;
let lastResizeLogAt = 0;

window.addEventListener("resize", () => {
  resizeEvents++;

  const now = performance.now();
  if (now - lastResizeLogAt > 3000) {
    logDiagInfo("resize_activity", {
      resizeEvents,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      dpr: window.devicePixelRatio || 1
    });
    resizeEvents = 0;
    lastResizeLogAt = now;
  }
}, { passive: true });
```
Trong source thật, `main.js` đã có `handleWindowResize` (debounce 150ms). Đếm **sự kiện thô** ở đầu hàm (trước debounce) và đếm **lần áp dụng thật** bên trong `setTimeout`; tỉ lệ thô/áp dụng cao chứng tỏ debounce đang có tác dụng. Không thêm listener `resize` thứ hai. Ghi thêm `renderer.setSize` count trong build debug nếu nghi ngờ setSize bị gọi liên tục.

## 9. Log quality tier / SAFE fallback — `quality-tier.js`

Trong source hiện tại, `getQualityTier()` chỉ trả về tier và chỉ có `LOW/MEDIUM/HIGH/ULTRA`; không có `safe`/`lite` query hoặc crash guard. Ghi tier đang thực sự được chọn bằng `logDiagInfo('render_quality_selected', ...)` (event này đã được phát trong `scene-setup.js`). Nếu muốn log lý do, refactor `quality-tier.js` để trả cả `tier` và `reason` từ cùng một hàm quyết định, tránh sao chép logic điều kiện ở hai nơi. Chỉ thêm `querySafe`/`queryLite` sau khi triển khai cờ tương ứng; không ghi nguyên URL/query.

## 10. Gửi log tới Axiom: xác minh pipeline hiện có

**Kết quả review:** `js/diagnostics.js` có một đường gửi tùy chọn qua `navigator.sendBeacon()` nhưng chỉ khi `window.__AXIOM_INGEST_ENDPOINT__` được thiết lập. Trong archive không thấy chỗ gán biến này hay consumer của `app:telemetry:log`; do đó chưa thể kết luận đường gửi browser đang hoạt động.

Trong phạm vi tài liệu này **không thay đổi Docker Compose, cấu hình Axiom hoặc Nginx**. Hãy xác minh trong code/runtime hiện tại biến endpoint được gán từ đâu và request thực tế có xuất hiện trong Network/Axiom không. Nếu pipeline hiện tại chỉ thu log container/Nginx, hỏi người phụ trách pipeline về cơ chế frontend đã được phê duyệt; không tự đoán endpoint/token và không đưa secret vào bundle. Trong lúc chưa xác minh được đường gửi, dùng remote debugging (`chrome://inspect`) để thu console và ghi rõ rằng log browser chưa được xác nhận tới Axiom.

Các bước kiểm tra cho developer:
1. Tìm `AXIOM_INGEST_ENDPOINT`, `app:telemetry:log`, `navigator.sendBeacon`, `fetch` và chỗ gán endpoint trong code; archive có `sendBeacon` tùy chọn nhưng không có chỗ gán endpoint rõ ràng.
2. Xác định log browser có đi tới endpoint hiện hữu không; đừng nhầm log Nginx/Docker với log JavaScript.
3. Gửi một event test `diagnostics_test` có `sessionId`, rồi xác nhận event xuất hiện trong dataset Axiom đúng.
4. Kiểm tra CORS, CSP, network request và response/status.
5. Nếu pipeline hiện tại chỉ thu log server/Nginx, log `console.error` của browser sẽ không tự xuất hiện ở đó. Cần tích hợp logger client vào endpoint/SDK được dự án cho phép; không đưa secret ingestion token vào bundle public.

### Trường hợp tab bị kill trước khi gửi
- Event cuối cùng có thể không được gửi nếu chỉ dùng request bất đồng bộ.
- Gom event thường thành batch (ví dụ mỗi 5–10s) nhưng gửi **ngay lập tức** các event `error`, `webgl_context_lost`, `page_boot` bằng `sendBeacon`; nếu chờ batch, event cuối trước khi tab bị kill sẽ mất.
- Ưu tiên gửi các event quan trọng ngay khi xảy ra và dùng endpoint hiện hữu.
- Nếu endpoint hỗ trợ, cân nhắc `navigator.sendBeacon` hoặc `fetch(..., { keepalive: true })`; xác minh CORS, payload size và endpoint trước khi áp dụng.
- Không giả định `pagehide`/`unload` sẽ luôn chạy khi Android kill tab.
- Ghi `client_send_attempt`, `client_send_success`/`client_send_failure` nếu cơ chế gửi cho phép; tránh log đệ quy lỗi của chính logger.

## 11. Truy vấn/đọc log cần tìm

Lọc theo `source = frontend`, `service = webaiera`, `sessionId` và thời gian tái hiện. Tên field cụ thể tùy schema dataset Axiom.

Tìm theo thứ tự:
1. `page_boot` — có đúng build/version không?
2. `render_quality_selected` — tier thực tế (SAFE chỉ sau khi được triển khai)
3. `renderer_created` — có nhiều renderer role trong một session không?
4. `scene_init` / `nodes_initialized` — số node/light/pulse line.
5. `render_path_selected` — direct render hay composer?
6. `resize_activity` — event/size có tăng dồn dập không?
7. `geometry_update_summary` — số lần `computeLineDistances` có tăng theo thời gian/frame không?
8. `webgl_context_lost` / `webgl_context_restored`.
9. `window_error` / `unhandled_rejection`.
10. `animation_loop_stopped`, `pagehide`, `visibility_change`.

### So sánh bản cũ và bản vá
Lọc theo `buildVersion`/`tier`. Với cùng thiết bị, so: tần suất `webgl_context_lost`, `fpsApprox`, `gl_buffer_summary.created`, số `renderer_created` mỗi session, và thời gian sống của session (`elapsedMs` của event cuối). Không có log bản cũ thì không thể kết luận bản vá có hiệu quả.

### Diễn giải thận trọng
- Có `webgl_context_lost`: chứng minh context bị mất; chưa chứng minh duy nhất nguyên nhân là VRAM.
- Nhiều `renderer_created` cùng role trong một session: có thể khởi tạo trùng; kiểm tra lifecycle.
- `computeLineDistancesCalls` tăng gần theo FPS: bằng chứng call site còn nằm trong loop.
- Không thấy event cuối: có thể crash/kill trước khi flush, mạng lỗi, hoặc logger chưa gửi; **không** kết luận là không có lỗi.
- Chỉ thấy Nginx `access forbidden by rule` tới `/.env`, `/.git`…: đó là log server về request bị chặn, không phải bằng chứng chẩn đoán lỗi WebGL phía client.
- Có `window_error`/`unhandled_rejection`: dùng stack/filename/line để tìm lỗi JavaScript; lỗi GPU có thể không tạo JS exception rõ ràng.

## 12. Checklist triển khai logging

### Logger
- [x] Logger được init đúng một lần (khởi tạo trong `main.js`, đệm sớm `__earlyBootErrors` trong `index.html`).
- [x] Schema hiện hữu (`event`, `raw_event`, `level`, `time`, `session`, `page`, `viewport`) được giữ tương thích; đã bổ sung `buildVersion: '20261026.3'`, `sequence`, `elapsedMs` nhất quán.
- [x] Không ghi secret, cookie, token, form input hoặc dữ liệu cá nhân.
- [x] Log theo event/summary; không log mỗi frame.
- [x] Lỗi khi gửi log không gây lỗi đệ quy hoặc crash trang.

### Coverage
- [x] Có `page_boot` / `home_module_start` / `early_boot_error`.
- [x] Có `window_error`, `unhandled_rejection`.
- [x] Có `renderer_created`, `scene_init`, `nodes_initialized` (và phân biệt role `main`, `hamburger-menu`, `contact-button`, `footer`).
- [x] Có `webgl_context_lost/restored` (kèm cờ `contextLost` và `reportContextLost()`).
- [x] Có `render_path_selected`, loop start/stop và tier changes (`SAFE`/`LOW`/`MEDIUM`/`HIGH`/`ULTRA`).
- [x] Có summary FPS/geometry/resize định kỳ (mẫu 5 giây trong `main.js`, debounce resize 150ms).

### Kiểm chứng
- [ ] `diagnostics_test` thực sự xuất hiện trong Axiom.
- [ ] Log từ đúng Android session được lọc bằng `sessionId`.
- [ ] Đã tái hiện với URL mặc định.
- [x] Đã hỗ trợ URL mặc định và các cờ `?safe=1` / `?lite=1` (đã được implement trong `quality-tier.js`).
- [ ] Đã xác nhận có endpoint nhận log browser (hoặc đã thống nhất với người phụ trách pipeline) — không dùng placeholder `sendToExistingAxiomPipeline`.
- [x] Logger không import `quality-tier.js`; không có handler trùng với `scene-setup.js` / `main.js`.
- [x] Payload không chứa `location.search`/`href` đầy đủ (chỉ gửi pathname).
- [ ] Đã lưu build version, browser/version, Android version, thời gian tái hiện.
- [ ] Đã xác minh logger frontend không bị nhầm với log Nginx/server.
- [x] Đã cập nhật cache version `v=20261026.3` trong `index.html`.

## 13. Gói thông tin gửi khi yêu cầu hỗ trợ tiếp
- `sessionId` của lần tái hiện.
- Build/commit đang deploy.
- Android model/version và browser/version.
- URL đã thử (đã loại bỏ query nhạy cảm).
- 30–60 giây log trước crash, bao gồm `info`/`warn` chứ không chỉ `error`.
- Kết quả URL mặc định; chỉ kèm `?lite=1` / `?safe=1` nếu đã xác nhận source hỗ trợ và log cho thấy tier thực sự thay đổi.
- Nếu không có frontend logs, cung cấp xác nhận pipeline đang thu loại log nào và network status của request gửi log.
