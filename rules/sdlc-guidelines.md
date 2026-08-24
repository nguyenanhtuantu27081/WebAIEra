# Quy trình Phát triển Phần mềm (SDLC) - ARA Beauty Center

Tài liệu này quy định các bước bắt buộc trong quá trình phát triển website và ứng dụng cho ARA Beauty Center. Mục tiêu tối thượng là tạo ra một sản phẩm **Premium, Chuyên nghiệp và Chuẩn y khoa**.

---

## 1. Requirement Analysis (Phân tích Yêu cầu)
- **Nhiệm vụ:** Hiểu rõ đối tượng khách hàng của ARA (Nữ giới, quan tâm đến sắc đẹp, ưa chuộng phong cách Hàn Quốc).
- **Hành động:** 
    - Đọc kỹ báo cáo trong `learning/content-audit.md`.
    - Phân tích danh sách dịch vụ (Spa, Clinic, Phun xăm) để xây dựng cấu trúc thông tin.
    - Xác định các tính năng then chốt: Đặt lịch trực tuyến, tư vấn Zalo, bảng giá động.
- **Hành động:** Kích hoạt skill `brainstorming.md`. CHÚ Ý: Chỉ kết thúc brainstorming khi người dùng xác nhận để đảm bảo bạn hiểu toàn bộ requirements.
- **Điều kiện chuyển bước:** Chỉ khi nhận được xác nhận "Understanding Lock" từ người dùng.

## 2. Design & Aesthetics (Thiết kế & Thẩm mỹ)
> [!IMPORTANT]
> Đây là bước quan trọng nhất đối với ngành làm đẹp. Website phải mang lại cảm giác "Wow" ngay từ cái nhìn đầu tiên.

- **Nguyên tắc:**
    - **Visual Excellence:** Sử dụng gradient mịn, dark mode (nếu cần), hiệu ứng glassmorphism.
    - **Typography:** Ưu tiên các font hiện đại như `Inter`, `Outfit` hoặc `Montserrat`.
    - **Aesthetics:** Màu sắc phải hài hòa (Pastel, Gold, hoặc phối màu chuẩn Clinic). Tránh các màu thô (plain red/blue).
    - **Component-First:** Luôn phác thảo cấu trúc Component (Header, Hero, Service Cards, Testimonials) trước khi thực hiện code.

## 3. Implementation (Triển khai Code)
- **Công nghệ:** HTML5, Vanilla CSS (ưu tiên linh hoạt), Javascript hiện đại.
- **Quy tắc Code:**
    - **SEO Ready:** Mỗi trang phải có Title, Meta Description và thẻ H1 duy nhất. Sử dụng Semantic HTML (`<section>`, `<article>`, `<nav>`).  Phải đảm bảo Meta pixel code hoạt động để khách nhắn tin qua fanpage và hotline, khai báo thông tin với google. Trích xuất thông tin từ /config/Desktop/ARA/Old_website_ara/Website.txt để tham khảo. 
    - **Sitemap (BẮT BUỘC):** Bất cứ khi nào thêm nội dung mới (như bài viết blog), phải đảm bảo script (ví dụ: `create_blogs.py`) cập nhật lại file `sitemap.xml` để hệ thống SEO luôn đồng bộ trước khi Deploy.
    - **Responsive:** Ưu tiên Mobile-first. Giao diện phải hoàn hảo trên mọi kích thước màn hình.
    - **Performance & Asset Cleanup (QUAN TRỌNG):** Chỉ sử dụng hình ảnh định dạng `.webp`. Xóa bỏ hoàn tất toàn bộ ảnh gốc định dạng khác như `.png`, `.jpg` khỏi thư mục `images/`. Đồng thời, xóa bỏ thư mục sao lưu di sản cũ `Old_website_ara` sau khi hoàn tất di chuyển dữ liệu để giữ codebase sạch sẽ, gọn nhẹ.
    - **No Placeholders:** Không dùng ảnh mẫu "Lorem Ipsum". Sử dụng công cụ `generate_image` để tạo ảnh minh họa chất lượng cao cho dịch vụ spa/clinic.


## 4. Verification & Testing (Kiểm thử)
- **Hành động:**
    - Kiểm tra tính năng đặt lịch (Form Validation).
    - Kiểm thử trên trình duyệt bằng công cụ `browser_subagent`.
    - Kiểm tra tốc độ tải trang và các lỗi console.
    - Chụp ảnh màn hình các thay đổi UI quan trọng để báo cáo.

## 5: 🔍 Code Review Gate (BẮT BUỘC — SA/Tech Lead)
> **Vai trò:** AI đóng vai Senior Solution Architect / Tech Lead.
> **Vị trí SDLC:** Sau Implementation, trước Testing — đúng chuẩn SDLC.

1. **Hành động:** Gọi skill `code_review.md`.
2. **Phạm vi:** Đánh giá 6 chiều:
   - 🏗️ **Architecture** — Luồng dữ liệu, tách biệt trách nhiệm, dead path
   - 🔒 **Security** — Secret exposure, credential type, input validation
   - 🛡️ **Reliability** — Error handling, retry, timeout, fallback, null safety
   - ⚡ **Performance** — Số HTTP calls, payload size, N+1 pattern
   - 🔧 **Maintainability** — Naming, magic values, expression complexity
   - 📏 **Compliance** — Đối chiếu trực tiếp với `RULES.md`
3. **Output:** Xuất báo cáo review theo format chuẩn trong skill.
4. **Phán quyết:**
   - **REJECTED** (có Critical issues) → AI phải sửa và review lại. KHÔNG được nhảy sang bước tiếp.
   - **APPROVED WITH CONDITIONS** (có Major issues) → Được deploy, ghi backlog vào metadata.
   - **APPROVED** (chỉ Minor) → Chuyển sang Giai đoạn 6.

## Giai đoạn 6: 🛡️ Validation Gate (BẮT BUỘC — Automated Script)
1. **Hành động:** Gọi skill `validate_workflow.md`. Truyền file JSON vào script validation.
2. **Phán quyết:**
   - Nếu script trả **exit code 1** (có lỗi) → **DỪNG. KHÔNG deploy.** AI phải sửa lỗi theo hướng dẫn trong output.
   - Nếu script trả **exit code 0** (chỉ cảnh báo hoặc sạch) → Được phép chuyển sang Giai đoạn 7.
3. **Vòng lặp:** Sau khi sửa, chạy lại validation cho đến khi PASS.

## 7: Đồng bộ & Triển khai (Sync & Deploy State)
1. **Git Sync:** Gọi skill `github_sync.md` với message: "website ARA Beauty Center".  

## 8. Documentation (Tài liệu hóa)
- **Hành động:**
    - Cập nhật `task.md` liên tục để theo dõi tiến độ.
    - Sau mỗi task lớn, cập nhật `walkthrough.md` với hình ảnh/video minh họa.
    - Lưu lại các bài học kinh nghiệm vào `learning/learning.md`.

---

> [!CAUTION]
> Tuyệt đối không nhảy thẳng vào code khi chưa có bản phác thảo thiết kế và cấu trúc component.