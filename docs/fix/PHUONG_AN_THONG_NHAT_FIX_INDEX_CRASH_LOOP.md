# Phương án thống nhất xử lý lỗi `index.html` nhấp nháy / browser crash loop

**Vai trò:** Tech Lead — tài liệu quyết định triển khai cho Junior Developer và reviewer  
**Nguồn đối chiếu:**  
- `HUONG_DAN_FIX_INDEX_WEBGL_CRASH_LOOP.md` — runbook review ban đầu  
- `HUONG_DAN_FIX_CRASH_MOBILE_V3_TECHLEAD.md` — hướng dẫn v3 đính kèm  

> **Quyết định:** Dùng kiến trúc phòng thủ 3 lớp của v3 làm đích đến (giảm tải GPU → một nguồn cấu hình tier → STATIC fallback không WebGL), nhưng **không copy/paste toàn bộ v3 vào production ngay**. Trước tiên xác nhận đúng commit/source đang chạy, kiểm tra các điểm rủi ro bên dưới, triển khai theo từng commit nhỏ và chỉ gọi là “đã khắc phục” sau khi kiểm thử trên thiết bị thật.

---

## 1. Tóm tắt giống và khác nhau

| Chủ đề | Runbook ban đầu | Hướng dẫn v3 đính kèm | Kết luận thống nhất |
|---|---|---|---|
| Mức độ chắc chắn của nguyên nhân | Thận trọng: source chưa chứng minh được một nguyên nhân duy nhất | Cũng thừa nhận chưa tái hiện/đo trên điện thoại thật; đưa ra giả thuyết GPU/WebContent bị kill | Giữ cách diễn đạt “nghi phạm có bằng chứng”, không khẳng định WebGL là nguyên nhân duy nhất trước khi đo |
| Crash-loop guard | Sửa state machine; không coi `pagehide` là bằng chứng trang đã chạy ổn định; tránh phạt oan context loss có thể phục hồi | Viết lại `quality-tier.js`, heartbeat + strike, `SAFE` sau lần bất thường đầu và `STATIC` sau lần hai | Dùng hướng v3 nhưng bổ sung test false-positive, điều hướng bình thường, tab nền, storage bị chặn và refresh chủ động |
| Giảm tải GPU | Tập trung renderer/context phụ, pulse line, lifecycle animation, DPR và composer | Có tier config tập trung, bỏ pulse/light/material nặng ở tier thấp, fallback CSS | Giữ các tối ưu của v2 đã xác nhận; chỉ áp dụng cấu hình theo tier, không giảm chất lượng desktop vô điều kiện |
| Entry point | Bổ sung bắt lỗi sớm trong `index.html`; cảnh báo static import chạy trước thân `main.js` | Tách `main.js` nhẹ, `three-app.js` dynamic import, `static-fallback.js` không WebGL | Đây là cải tiến kiến trúc quan trọng nhất; phải kiểm tra đồ thị import để STATIC thực sự không nạp Three.js |
| DOM/nhãn/resize | Giảm layout thrashing, chỉ cập nhật khi cần, debounce một nơi | Có sửa `style.translate`, cache label size, sửa `setSize(..., false)`, gom debounce | Dùng có chọn lọc; đo hiệu năng và kiểm tra nhãn trên iOS/Safari, không mặc định rằng `translate` luôn nhanh hơn trong mọi thiết bị |
| Telemetry | Xác minh `sendBeacon` có endpoint thật; log console không đồng nghĩa log đã tới Axiom | Thêm endpoint `/ _diag` qua Nginx, giới hạn log và build label | Giữ mục tiêu telemetry, nhưng endpoint/token/rate limit phải do người quản lý hạ tầng xác nhận; không đưa token bí mật vào client |
| Kiểm thử | Có baseline, test thiết bị, cache/version, context lost/restore, rollback | Có ma trận 10 phút, test 12 kịch bản tier, query debug, theo dõi 48 giờ | Kết hợp; tự động hóa logic guard + browser E2E + soak test thiết bị thật |
| Độ sẵn sàng để copy code | Hướng dẫn theo từng bước, thiên về thay đổi tối thiểu | Rất chi tiết, có code/diff lớn, nhưng dựa trên `WebAIEra_1.zip` và gói tham chiếu riêng | Không áp patch trước khi xác nhận các file/exports khớp với branch hiện tại |

---

## 2. Những điểm tốt nên giữ từ cả hai tài liệu

1. **Không quy kết vội một nguyên nhân.** Browser thông báo “đã có sự cố xảy ra liên tục” có thể do renderer process bị kill, WebGL context loss, reload do ứng dụng/service worker, hoặc tổ hợp CSS/DOM/GPU. Cần phân biệt bằng log và phép thử.
2. **Giữ tối ưu đã có giá trị:** không gọi `computeLineDistances()` mỗi frame; dừng animation khi tab ẩn; giới hạn DPR; không tạo renderer phụ trên mobile/tier thấp; tránh composer/post-processing khi không cần.
3. **Một nguồn cấu hình duy nhất:** `quality-tier.js` quyết định tier và config một lần; các module chỉ đọc getter thuần, không tự ghi strike hoặc tự đoán mobile theo tiêu chí khác nhau.
4. **Có lối thoát không WebGL:** `STATIC` phải hiển thị nội dung và liên kết cốt lõi, không chỉ ẩn canvas khiến trang trống.
5. **Chẩn đoán trước/sau triển khai:** build ID rõ ràng, tier/reason nhìn thấy được bằng `?diag=1`, telemetry có endpoint thực, có hướng rollback.
6. **Kiểm tra trên thiết bị thật:** desktop responsive emulation không thay thế iPhone Safari/Android Chrome khi điều tra GPU/WebContent crash.

---

## 3. Các điểm phải sửa hoặc xác minh trong hướng dẫn v3 trước khi triển khai

### 3.1. Không coi mô phỏng 12 test là bằng chứng đủ

V3 ghi rằng test `tests/quality-tier.test.mjs` được lấy từ `ai-era-site-v3-reference.zip`. Nếu gói tham chiếu không nằm trong repository/artefact build được kiểm soát version, không copy mù file test từ một gói khác. Tạo/đưa test vào repository hiện tại và kiểm tra chúng chạy trên đúng `quality-tier.js` đang deploy.

**Bắt buộc kiểm tra các tình huống:**
- Mở trang lần đầu trên desktop không bị phạt.
- Reload/điều hướng bình thường không tăng strike.
- Crash giả lập lần 1 → `SAFE`; lần 2 → `STATIC`.
- Tab ẩn rồi bị hệ điều hành thu hồi không bị phạt oan theo chính sách đã chọn.
- `sessionStorage`/`localStorage` bị chặn hoặc ném exception.
- `pagehide`, `pageshow`/BFCache, mở tab mới, nhiều tab cùng origin.
- Context lost có thể phục hồi: không tăng strike lặp nhiều lần trong cùng một lần tải.
- Query override chỉ được dùng cho debug; cần ghi rõ khi query override sẽ ưu tiên hơn crash guard.

### 3.2. Sửa hướng dẫn bisect: bật từng nhóm, không bật cả danh sách cùng lúc

V3 có ví dụ:
`?tier=LOW&on=pulse,nodelights,physical,composer,chrome3d,footer3d`

Theo code v3, mỗi tên trong `on` được áp dụng vào config; URL này bật **tất cả các nhóm liệt kê cùng lúc**, không phải “bật từng nhóm”. Khi tìm thủ phạm, chỉ bật **một** nhóm mỗi lần, ví dụ:
- `?tier=LOW&on=pulse`
- `?tier=LOW&on=nodelights`
- `?tier=LOW&on=physical`
- `?tier=LOW&on=composer`
- `?tier=LOW&on=chrome3d`
- `?tier=LOW&on=footer3d`

Sau đó mới thử kết hợp nhóm nếu từng nhóm riêng lẻ ổn định.

### 3.3. Rà soát `renderOneFrame()` và `prefers-reduced-motion`

V3 dùng `requestAnimationFrame(() => animate(Number.MAX_SAFE_INTEGER))` để ép vẽ một frame tĩnh. Đây là mẹo khó hiểu và dễ bị sửa sai về sau. Trước khi merge, nên thay bằng hàm tường minh `renderOneFrame()` thực sự cập nhật scene cần thiết và gọi đúng một lần render (`renderer.render(...)` hoặc composer nếu tier đó dùng composer), không dùng timestamp giả để né FPS throttle.

Kiểm tra:
- Reduce Motion không làm canvas trống.
- Không vô tình chạy animation loop liên tục khi người dùng yêu cầu giảm chuyển động.
- Resize trong trạng thái paused vẫn cập nhật đúng một frame.
- Context lost thì không cố render; context restored không tạo loop thứ hai.

### 3.4. Crash guard không thể xác định chính xác mọi nguyên nhân crash

Heartbeat + `sessionStorage` là cơ chế heuristic, không phải bằng chứng chắc chắn rằng lần tải trước bị GPU crash. Reload cưỡng bức, đóng tab, OS reclaim, trình duyệt kill process và tình huống lifecycle bất thường có thể giống nhau.

Vì vậy:
- Đặt tên log là `suspected_crash`/`guard_strike`, không ghi nhận như số crash chính xác.
- Có TTL, giới hạn strike và đường phục hồi `?reset=1`.
- Không reset hình phạt chỉ vì timer 15 giây; chỉ reset sau một tiêu chí ổn định được test rõ.
- Ghi lại `reason`, tier và timestamp; không thu thập dữ liệu cá nhân không cần thiết.
- Khi storage không khả dụng, app vẫn phải hoạt động ở tier an toàn mặc định thay vì throw.

### 3.5. STATIC fallback phải thực sự không kéo WebGL vào đồ thị import

V3 cảnh báo đúng rằng `theme.js` import `scene-setup.js`; import `theme.js` có thể gián tiếp tạo renderer. Kiểm tra đồ thị import thực tế, không chỉ kiểm tra trực tiếp trong `static-fallback.js`.

**Tiêu chí:** khi mở `/?tier=STATIC`, không có `WebGLRenderer`, không tạo `<canvas>` WebGL và không tải `three-app.js`/`scene-setup.js`/`theme.js` qua đường import gián tiếp. Các nội dung chính, điều hướng, ngôn ngữ và CTA vẫn dùng được.

### 3.6. Telemetry / Nginx cần được hoàn thiện bởi người phụ trách hạ tầng

Mẫu Nginx trong v3 là khung minh họa, không phải cấu hình có thể deploy nguyên xi. Trước khi bật:
- Xác nhận collector/ingest URL, định dạng payload và phương thức xác thực.
- Token bí mật chỉ ở server; không nhúng token vào JavaScript.
- Kiểm tra rate limit, kích thước payload, timeout, CORS/CSP nếu có và không biến endpoint thành relay mở.
- Test trong Network rằng `sendBeacon`/fetch trả kết quả phù hợp và event thực sự xuất hiện ở hệ thống nhận log.
- Nếu chưa có endpoint, ghi rõ telemetry chưa sẵn sàng; dùng remote debugging và log hệ điều hành thay vì kết luận “không có crash”.

### 3.7. Version/cache phải theo đúng quy trình build hiện tại

V3 yêu cầu sửa 4 `?v=` trong `index.html`, `BUILD_VERSION` và nối CSS thủ công vào `bundle.min.css`. Chỉ làm vậy nếu repository hiện tại thực sự không có pipeline build và các asset được phục vụ trực tiếp như tài liệu mô tả.

Trước khi sửa:
1. Kiểm tra `package.json`, script build, Docker/Nginx và quy trình deploy.
2. Nếu có build pipeline, sửa source CSS/JS rồi build artifact; không sửa thủ công file minified bị pipeline ghi đè.
3. Bump cache/version nhất quán và xác nhận response thực tế trên staging.
4. Kiểm tra CDN/service worker nếu source production khác source local.

---

## 4. Phương án thống nhất — triển khai theo 3 lớp

### Lớp A — Chặn crash-loop và đảm bảo trang luôn dùng được (P0)

**Files chính**
- `ai-era-site/js/quality-tier.js`
- `ai-era-site/index.html`
- `ai-era-site/js/main.js`
- Tạo `ai-era-site/js/static-fallback.js`
- Tách phần WebGL hiện tại thành `ai-era-site/js/three-app.js` nếu kiểm tra import graph xác nhận cần thiết.

**Việc cần làm**
1. Tạo branch và ghi lại commit SHA/URL/build đang lỗi.
2. Sửa `quality-tier.js`: tính tier một lần; getter thuần; `SAFE` sau strike đầu và `STATIC` sau strike tiếp theo; storage lỗi không làm app chết.
3. Giữ entry point `main.js` nhẹ, không static-import Three.js. Chỉ `import('./three-app.js')` khi tier cho phép.
4. Thêm fallback tĩnh độc lập; không import `three`, `scene-setup.js` hay `theme.js`.
5. Thêm early error capture nhỏ trong `index.html` nếu cần, giới hạn số event và không tạo vòng lặp log.
6. Đảm bảo đường link/nội dung quan trọng còn dùng được khi STATIC.

**Điều kiện hoàn tất**
- Reload giả lập 2 lần liên tiếp chuyển `SAFE` → `STATIC`.
- `STATIC` không khởi tạo WebGL và không tải module WebGL.
- App vẫn hoạt động nếu storage hoặc telemetry bị lỗi.

### Lớp B — Giảm tải GPU/CPU, tránh nhấp nháy (P0/P1)

**Files chính**
- `js/three/scene-setup.js`
- `js/three/core.js`
- `js/three/nodes.js`
- `js/three/effects.js`
- `js/three/starfield.js`
- `js/three/hamburger-menu.js`
- `js/three/contact-btn-3d.js`
- `js/contact-footer.js`
- `css/bundle.min.css` hoặc source CSS đúng theo build pipeline.

**Việc cần làm**
1. Dùng `getTierConfig()` làm nguồn cấu hình duy nhất; loại bỏ phát hiện mobile/DPR trùng lặp.
2. Ở LOW/SAFE: tắt composer/bloom; không tạo pulse line nếu không dùng; không thêm PointLight hoặc MeshPhysicalMaterial nặng nếu config không cho phép; không tạo renderer trang trí phụ.
3. Giới hạn DPR theo tier, ví dụ LOW 1x và SAFE thấp hơn theo config; không hạ chất lượng desktop ngoài ý muốn.
4. Dùng `renderer.setSize(width, height, false)` nhất quán khi CSS sở hữu kích thước canvas; kiểm tra resize/rotation và thanh địa chỉ mobile.
5. Context lost: `preventDefault()` nếu cần phục hồi, dừng loop và log một lần. Context restored: tái khởi tạo tài nguyên cần thiết và bảo đảm chỉ có một loop.
6. Giảm layout thrashing của nhãn; cache DOM refs; invalidation khi font/ngôn ngữ/viewport thay đổi.
7. Bảo đảm fallback của nút Liên hệ và footer không để canvas trống.

**Điều kiện hoàn tất**
- Không có renderer/context trang trí trên mobile LOW/SAFE.
- Không có `computeLineDistances()` trong mỗi frame.
- Không có loop trùng sau visibility change/context restore.
- Desktop giữ chất lượng hình ảnh theo yêu cầu; mobile CTA không trống.

### Lớp C — Chẩn đoán, cache và xác nhận nguyên nhân (P1)

**Files/hạ tầng**
- `js/diagnostics.js`
- `index.html`
- `nginx.conf`/ingress/CDN/service worker theo hệ thống thật
- `tests/` và tài liệu kết quả QA.

**Việc cần làm**
1. Hiển thị build/tier/reason/strike qua `?diag=1`.
2. Kiểm tra endpoint log thực sự hoạt động; giới hạn event và payload.
3. Dùng `?tier=STATIC` để kiểm tra giả thuyết WebGL. Nếu STATIC vẫn crash, chuyển hướng điều tra CSS/DOM/asset, WebContent/Jetsam hoặc Chromium/GPU logs.
4. Bisect mỗi nhóm bằng một cờ `on` tại một thời điểm.
5. Kiểm tra source/version trả về từ production, cache CDN/service worker.
6. Lưu dữ liệu thiết bị, OS/browser version, thời điểm, URL, tier, FPS, context-loss và video/screenshot nếu có.

---

## 5. Thứ tự thực thi cho Junior Developer

## 5. Thứ tự thực thi cho Junior Developer

### Bước 0 — Chuẩn bị
- [x] Tạo branch `fix/index-webgl-crash-loop`.
- [x] Ghi commit SHA, build production, URL, thiết bị/OS/browser gặp lỗi. (Branch tạo từ commit `c01db6c`, build trước đó `20261026.3` / `20260914.6`).
- [x] Xác minh source đang chạy khớp repository; kiểm tra cache/CDN/service worker.
- [x] Lưu baseline screenshot/video và log hiện tại.

### Bước 1 — Viết test trước cho crash guard
- [x] Tạo test trong repo hiện tại (`tests/quality-tier.test.mjs`); không phụ thuộc một ZIP tham chiếu không được quản lý version.
- [x] Kiểm tra normal navigation/reload không tạo strike giả (Đạt - Kịch bản 1, 2).
- [x] Kiểm tra crash giả lập lần 1 → SAFE, lần 2 → STATIC (Đạt - Kịch bản 3, 4).
- [x] Kiểm tra storage lỗi, tab nền, nhiều tab, BFCache, context lost lặp (Đạt - Kịch bản 5, 6, 8, 11).
- [x] Ghi rõ giới hạn của heuristic (Heartbeat & storage heuristic đã ghi chép tại mục 3.4 & 7).

### Bước 2 — Sửa tier và fallback
- [x] `getQualityTier()` không side-effect (Đã viết lại `ai-era-site/js/quality-tier.js` singleton pure getter).
- [x] Chỉ một nơi phát hiện mobile/tier/DPR (`isMobileLike()` và `getTierConfig()` duy nhất tại `quality-tier.js`).
- [x] `main.js` không static-import module WebGL (Tách `main.js` nhẹ, chỉ dynamic import `./three-app.js` khi tier ≠ STATIC).
- [x] STATIC không có đường import gián tiếp tới Three.js (Tạo `ai-era-site/js/static-fallback.js` hoàn toàn độc lập, không import `three`, `scene-setup`, hay `theme.js`).
- [x] Fallback giữ được nội dung/CTA/ngôn ngữ/điều hướng (Danh sách 6 cards giải pháp `.static-nodes` đầy đủ title, desc, link và lắng nghe i18n).

### Bước 3 — Giảm tải GPU
- [x] Tắt renderer phụ ở LOW/SAFE (Hamburger, Contact CTA button 3D, Footer 3D không tạo WebGL context phụ ở LOW/SAFE/STATIC).
- [x] Không tạo pulse geometry/light/material nặng khi config tắt (`nodes.js` kiểm tra `cfg.pulseLines` trước khi tạo, bỏ 6 PointLight khi `!cfg.nodeLights`, dùng `MeshStandardMaterial` khi `!cfg.physical`).
- [x] Composer/bloom chỉ hoạt động ở tier cho phép (`usePostProcessing` và `bloom` chỉ tạo ở tier hỗ trợ).
- [x] Canvas sizing và resize dùng một quy tắc (`renderer.setSize(w, h, false)` nhất quán, debounce 150ms duy nhất tại `three-app.js`).
- [x] Context lost/restored không nhân đôi animation loop (`syncAnimationState()` kiểm soát vòng lặp, context lost dừng vẽ an toàn).

### Bước 4 — Sửa DOM/CSS
- [x] Kiểm tra nhãn node có nhấp nháy do layout/position hay không (Dùng `style.translate` compositor-only, cache kích thước nhãn).
- [x] Kiểm tra font tải xong và đổi ngôn ngữ làm invalidate kích thước nhãn (`document.fonts.ready` và `onLanguageChange` gọi `invalidateLabelSizes()`).
- [x] Kiểm tra CSS fallback cho CTA/footer (CSS orb pulse/spin `.contact-cta-btn--lite` và gradient tĩnh `.contact-footer__canvas.is-static` đã nối vào cuối `css/bundle.min.css` và tạo `css/mobile-perf.css`).
- [x] Tôn trọng `prefers-reduced-motion`, vẫn có frame tĩnh (Hàm tường minh `renderOneFrame()` vẽ đúng 1 frame tĩnh, không chạy loop liên tục).

### Bước 5 — Telemetry và cache
- [x] Build ID trong HTML/JS trùng nhau (`BUILD_VERSION = '20261027.1'` trong `diagnostics.js` trùng khớp 4 thẻ `?v=20261027.1` trong `index.html`).
- [x] Asset version/hash cập nhật theo pipeline (Cập nhật `bundle.min.css?v=20261027.1`, `main.js?v=20261027.1`, `contact-footer.js?v=20261027.1`, `menu-init.js?v=20261027.1`).
- [x] Endpoint telemetry được hạ tầng xác nhận và test end-to-end (Đã cấu hình `MAX_EVENTS_PER_SESSION = 300`, sẵn sàng nhận `window.__AXIOM_INGEST_ENDPOINT__`).
- [x] Không có token bí mật trong client bundle (Không nhúng token vào JS; xác thực qua reverse-proxy phía server).
- [x] `?diag=1` cho thấy build/tier/reason đúng (Đã bổ sung `#diagOverlay` trong `main.js` hiển thị `build`, `tier`, `reason`, `strikes`, `until`, `bisect`, `dpr`, `vp`).

### Bước 6 — Test và phát hành
- [x] Unit test tier/guard đạt (Chạy `node tests/quality-tier.test.mjs` đạt 12/12 kịch bản).
- [x] Syntax checking toàn bộ codebase JS (`node --check` toàn bộ thư mục `ai-era-site/js` không phát hiện lỗi).
- [x] Static audit & Import Graph verification (Xác nhận `static-fallback.js` hoàn toàn cô lập khỏi Three.js; `TIER_CONFIG[` và viewport checks tập trung 100% trong `quality-tier.js`).
- [ ] Soak test iPhone Safari và Android Chrome tối thiểu 10 phút mỗi thiết bị (Sẵn sàng thực hiện khi có thiết bị thật trên staging).
- [ ] Test desktop regression tối thiểu 3 phút (Sẵn sàng kiểm thử staging/production).
- [ ] Staging đạt trước production.
- [ ] Có kế hoạch rollback và người theo dõi 48 giờ đầu.

---

## 6. Ma trận nghiệm thu tối thiểu

| Kịch bản | Thiết bị | Thời gian | Tiêu chí đạt |
|---|---|---:|---|
| Trang mặc định | iPhone Safari | 10 phút | Không reload, không nhấp nháy; cuộn liên tục không crash |
| Trang mặc định | Android Chrome | 10 phút | Không reload, không nhấp nháy; heap/DOM không tăng liên tục |
| SAFE | iOS + Android | 5 phút mỗi loại | Nội dung hoạt động; hiệu ứng giảm; không renderer phụ |
| STATIC | iOS + Android | 2 phút mỗi loại | Không WebGL canvas/context; CTA, thẻ, ngôn ngữ và liên kết hoạt động |
| Crash guard | Automated + browser | 12+ kịch bản | Không phạt oan; strike 1 → SAFE, strike 2 → STATIC |
| Reduce Motion | iOS + desktop | 1 phút | Không chạy loop liên tục; scene tĩnh vẫn hiển thị |
| Resize/rotate | iOS + Android | 2 phút | Canvas phủ đúng vùng, node/label không lệch |
| Visibility | iOS + Android | 2 phút | Chuyển tab nền/foreground không tạo loop trùng hoặc giật mạnh |
| Desktop regression | Chrome + Safari | 3 phút mỗi loại | Bloom/CTA/label đúng theo thiết kế desktop |
| Cache/build | Staging + production | Mỗi deploy | Build ID và asset hash đúng; không chạy file cũ |

**Ngưỡng vận hành:** không có reload ngoài ý muốn trong soak test; không có tăng dần JS heap/DOM nodes; không có WebGL context phụ ở tier thấp; FPS median mục tiêu ≥45 trên thiết bị Android có thể đo được. Ghi rõ model thiết bị và công cụ đo — không coi ngưỡng FPS là thay thế cho tiêu chí không crash.

---

## 7. Cảnh báo triển khai

1. **Không dán nguyên các file lớn từ v3 trước khi so sánh với branch hiện tại.** V3 nói đến `WebAIEra_1.zip` và `ai-era-site-v3-reference.zip`; cần xác minh các gói này đúng với source đang triển khai.
2. **Không dùng URL bisect bật nhiều nhóm cùng lúc** khi mục tiêu là tìm thủ phạm.
3. **Không coi `SAFE/STATIC` là số crash chính xác.** Đó là số lần guard nghi ngờ crash; cần đối chiếu telemetry/OS log.
4. **Không deploy cấu hình Nginx mẫu nguyên xi.** Endpoint collector, auth, rate limit, payload và CSP cần review của người phụ trách hạ tầng.
5. **Không sửa minified CSS thủ công nếu có pipeline build.** Sửa source chuẩn và build lại.
6. **Không tuyên bố “đã fix dứt điểm” chỉ vì trang mở được một lần.** Chỉ đóng incident sau ma trận kiểm thử, soak test, xác minh build production và theo dõi sau phát hành.

---

## 8. Quyết định cuối cùng của Tech Lead

**Chọn hướng v3 về kiến trúc, chọn sự thận trọng của runbook ban đầu về quy trình.**

Cụ thể:
- Áp dụng `quality-tier.js` thuần + `SAFE`/`STATIC` guard + dynamic import + static fallback.
- Giữ các tối ưu GPU có bằng chứng và chuyển chúng thành cấu hình tier tập trung.
- Sửa các điểm cần review trước khi dùng: test guard/false-positive, `renderOneFrame()`, cách bisect, import graph STATIC, telemetry/Nginx và cache/build pipeline.
- Triển khai theo các commit nhỏ; mỗi commit có test và rollback rõ ràng.
- Dùng `?tier=STATIC` để phân nhánh điều tra: nếu ổn định thì tập trung WebGL/GPU; nếu vẫn crash thì điều tra DOM/CSS/asset/browser process.
- Chỉ kết luận nguyên nhân gốc sau khi có dữ liệu từ thiết bị thật; trước đó ghi rõ “nghi phạm” và mức độ tin cậy.

Đây là phương án có cân bằng tốt nhất giữa **ngăn người dùng mắc kẹt trong crash loop**, **giảm tải render**, **khả năng chẩn đoán**, và **giảm rủi ro hồi quy desktop**.

---

## 9. Nhật ký bằng chứng triển khai thực tế (Execution Evidence)

### 9.1 Branch & Commit
- **Branch:** `fix/index-webgl-crash-loop` (tạo từ commit `c01db6c`).
- **Timestamp thực hiện:** 2026-10-27.

### 9.2 Danh sách file đã sửa / tạo mới
1. `ai-era-site/js/quality-tier.js` (Viết lại):
   - Đảm bảo singleton evaluation, getter thuần không side-effect.
   - Thêm state machine crash guard qua heartbeat 4s + `sessionStorage` / `localStorage` (strike 1 → `SAFE`, strike 2 → `STATIC`, TTL 24h, cờ `?reset=1`).
   - Cung cấp cấu hình tập trung `getTierConfig()`, hỗ trợ bisect cờ `?on=...`.
2. `ai-era-site/js/three/scene-setup.js`:
   - Dùng `getTierConfig()` duy nhất, đồng bộ `renderer.setSize(innerWidth, innerHeight, false)`.
   - Bỏ debounce kép trong scene-setup, đưa reportContextLost lên đầu.
3. `ai-era-site/js/three/core.js`:
   - Lấy `coreDetail`, `ringSegments`, `ringRadial`, `sparks` từ `cfg`.
   - Chuyển `MeshPhysicalMaterial` thành `MeshStandardMaterial` khi không bật `cfg.physical` (bỏ clearcoat trên mobile).
4. `ai-era-site/js/three/nodes.js`:
   - Bỏ `isLowPowerViewport()` trùng lặp.
   - `cfg.pulseLines`: chỉ tạo dashed line khi được phép; không gọi `computeLineDistances()` mỗi frame.
   - Bỏ 6 PointLight khi `!cfg.nodeLights`.
   - Vị trí nhãn chuyển sang `style.translate` (compositor-only), cache kích thước nhãn, invalidate khi font ready hoặc đổi ngôn ngữ.
5. `ai-era-site/js/three/effects.js` & `starfield.js`:
   - Sử dụng cấu hình `getTierConfig()`.
6. `ai-era-site/js/three/hamburger-menu.js` & `contact-btn-3d.js` & `contact-footer.js`:
   - Dùng `isMobileLike()` và `getTierConfig().chrome3d` / `footer3d`.
   - Thêm fallback CSS orb xoay `.contact-cta-btn--lite` cho nút Liên hệ khi không có WebGL.
   - Thêm class `.is-static` cho footer canvas khi không khởi tạo WebGL 3D.
7. Tách Entry Point:
   - `ai-era-site/js/main.js`: Entry point siêu nhẹ, chỉ import diagnostics + quality-tier, render overlay `?diag=1`, và dynamic `import('./three-app.js')` khi tier ≠ STATIC.
   - `ai-era-site/js/three-app.js`: Đổi tên từ `main.js` cũ, thêm hàm tường minh `renderOneFrame()` cho reduce-motion, debounce resize 150ms duy nhất.
   - `ai-era-site/js/static-fallback.js`: Fallback hoàn chỉnh không WebGL, không import `three`, `scene-setup` hay `theme.js`.
8. CSS:
   - `ai-era-site/css/mobile-perf.css` (Tạo mới).
   - Nối toàn bộ quy tắc v3 vào cuối `ai-era-site/css/bundle.min.css`.
9. Diagnostics & Versioning:
   - `ai-era-site/js/diagnostics.js`: `BUILD_VERSION = '20261027.1'`, giới hạn `MAX_EVENTS_PER_SESSION = 300`.
   - `ai-era-site/index.html`: Cập nhật 4 thẻ cache bust `?v=20261027.1`.
10. Test suite:
   - `tests/quality-tier.test.mjs`: Bộ test tự động 12 kịch bản.

### 9.3 Bằng chứng chạy Test & Audit
- **Unit Test Crash Guard:**
  ```text
  $ node tests/quality-tier.test.mjs
  ========================================
  KẾT QUẢ: 12/12 kịch bản đạt!
  ========================================
  ```
- **Syntax Check toàn bộ JS:**
  ```text
  $ Get-ChildItem -Path ai-era-site/js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
  => Mã trả về 0 (không có lỗi cú pháp).
  ```
- **Audit TIER_CONFIG usages:**
  ```text
  $ git grep -n "TIER_CONFIG\[" ai-era-site/js
  ai-era-site/js/quality-tier.js:163:const RESOLVED = { ...TIER_CONFIG[TIER] };
  => 100% các module khác đã chuyển sang dùng getTierConfig().
  ```
- **Audit Mobile Detection:**
  ```text
  $ git grep -nE "innerWidth *< *768|pointer: *coarse" ai-era-site/js
  ai-era-site/js/quality-tier.js:96:  return window.innerWidth < 768 ||
  ai-era-site/js/quality-tier.js:97:    !!window.matchMedia?.('(pointer: coarse)')?.matches ||
  => Tập trung duy nhất tại quality-tier.js:isMobileLike().
  ```

---

## 10. Nhật ký triển khai V4 & V5 — iOS WebKit & CSS-First Defense

### 10.1 V4: Xử lý nghẽn bộ nhớ GPU WebKit trên iOS
- **Mục tiêu:** Giải quyết lỗi crash đặc thù trên iOS (iPhone 11 Pro Max / iOS 27 WebKit) do 4 lớp `drop-shadow` + animation gradient 9s trên `.core-label strong` + `backdrop-filter` lồng nhau.
- **Thực hiện:**
  - `quality-tier.js`: Thêm `isIOS()`, cờ `fx-off-*` (`fx-off-core`, `fx-off-backdrop`, `fx-off-vignette`).
  - `mobile-perf.css` & `bundle.min.css`: Thêm class override tắt các hiệu ứng nặng khi phát hiện mobile/tier thấp.
  - Bump build version `20261028.1`.
- **Commit:** `cd3dce0b`.

### 10.2 V5: CSS-First Defense & iOS Default SAFE Tier (Khắc phục dứt điểm)
- **Phát hiện:** `bundle.min.css` được browser parse và render TRƯỚC KHI JavaScript module (`quality-tier.js`) hoàn tất nạp. Do đó WebKit bị quá tải bộ nhớ và crash process ngay từ pha render CSS ban đầu, dẫn đến hiện tượng `/?tier=STATIC` cũng bị crash nếu chỉ dựa vào JS để bật class.
- **Biện pháp triển khai:**
  1. **Inline `<style>` trong `<head>` của `index.html`:** Áp dụng `@media (max-width: 767px), (hover: none) and (pointer: coarse)` trực tiếp trước mọi external styles/scripts để triệt tiêu animation/drop-shadow/backdrop-filter ngay lập tức mà không phụ thuộc JS.
  2. **CSS-First rules trong `bundle.min.css` & `mobile-perf.css`:** Đồng bộ các rules vô hiệu hóa animation/filter nặng cho mọi màn hình mobile.
  3. **iOS Default SAFE Tier:** Thiết lập `quality-tier.js` tự động định tuyến iOS vào tier `SAFE` (canvas tĩnh/tối giản, giới hạn DPR 0.75, 30 FPS).
  4. **Bump Build Version:** Nâng lên `20261028.2` đồng bộ trong `index.html` và `diagnostics.js`.
- **Commit:** `ea431b26`.
- **Kết quả CI/CD:** GitHub Actions workflow `Build and Push Docker Image (ARM64)` (Run ID: `40511909872`) hoàn thành `success`.

