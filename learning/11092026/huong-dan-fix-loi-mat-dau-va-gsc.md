# Hướng dẫn Fix lỗi — Mất dấu + Google Search Console + Theo dõi Sitelinks

> Dành cho: Junior Dev
> Dự án: AI Era (`aiera.vn`) — Next.js App Router + next-intl
> Ưu tiên: làm đúng thứ tự 3 bước bên dưới, **không skip Bước 0**.



---

## Bước 0 — Cách kiểm tra lỗi mất dấu (bắt buộc chạy trước khi merge bất kỳ PR nào có nội dung tiếng Việt)

Lỗi "mất dấu" xảy ra khi nội dung tiếng Việt bị paste/encode sai (thường do copy từ nguồn không phải UTF-8, hoặc do tool merge tự động strip diacritics). Cách kiểm tra:

```bash
# 1. Liệt kê tất cả file .tsx/.ts/.json trong src/
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" \) | sort > /tmp/all.txt

# 2. Liệt kê file có chứa ký tự có dấu tiếng Việt (Unicode range À-ỹ)
grep -rlP '[À-ỹ]' --include="*.tsx" --include="*.ts" --include="*.json" src/ | sort > /tmp/withdia.txt

# 3. So sánh — file nào xuất hiện trong danh sách A nhưng KHÔNG có trong danh sách B
#    => nghi vấn cao (không có dấu tiếng Việt nào dù nội dung là tiếng Việt)
comm -23 /tmp/all.txt /tmp/withdia.txt
```

**Lưu ý quan trọng:** danh sách `comm -23` ở trên sẽ có false positive — nhiều file (component UI thuần, layout, robots.ts, sitemap.ts...) hợp lệ không có tiếng Việt vì nội dung lấy từ `next-intl` (`t('key')`) chứ không hardcode. Junior dev **phải mở từng file trong danh sách và xác nhận bằng mắt**:
- Nếu file hardcode text tiếng Việt trực tiếp trong JSX (không qua `t()`) → kiểm tra kỹ từng câu.
- Nếu file chỉ dùng `t()` để lấy text từ `messages/vi.json` → không phải nghi vấn, bỏ qua.

Vì trong lần merge trước, checklist Bước 0 này **đã không được áp dụng cho 5 file bị lỗi**, giờ phải chạy lại full scan.

---

## Bước 1 — Fix triệt để lỗi mất dấu ở 5 file còn lại

### 1.1. Chạy lại full scan theo Bước 0

```bash
cd source
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" \) | sort > /tmp/all.txt
grep -rlP '[À-ỹ]' --include="*.tsx" --include="*.ts" --include="*.json" src/ | sort > /tmp/withdia.txt
comm -23 /tmp/all.txt /tmp/withdia.txt
```

### 1.2. Đối chiếu với danh sách 5 file bị báo lỗi lần merge này

Vì file này không đính kèm log merge cụ thể, **junior dev cần lấy đúng 5 tên file từ PR/commit gây lỗi** (xem lại PR review comment hoặc CI log của lần merge vừa rồi) rồi đối chiếu với output ở bước 1.1. Với mỗi file trong 5 file đó:

1. Mở file, tìm các đoạn text tiếng Việt hardcode (không qua `t()`).
2. So sánh với bản gốc (trước merge) bằng:
   ```bash
   git log --oneline -- <đường-dẫn-file>
   git diff <commit-trước-merge> <commit-hiện-tại> -- <đường-dẫn-file>
   ```
3. Nếu thấy các từ kiểu `chinh sach`, `dich vu`, `lien he`, `khach hang`... (thiếu dấu so với `chính sách`, `dịch vụ`, `liên hệ`, `khách hàng`) → đây chính là lỗi mất dấu, gõ lại đúng chính tả có dấu.
4. Kiểm tra riêng encoding của file — mở bằng VS Code, xem góc dưới phải có ghi `UTF-8` không (không phải `UTF-8 with BOM` lẫn lộn, không phải `Windows-1258`). Nếu sai → "Save with Encoding" → chọn UTF-8, save lại.

### 1.3. Checklist trước khi commit fix

- [ ] Đã chạy lại Bước 0 scan, không còn file nghi vấn nào chứa tiếng Việt hardcode thiếu dấu.
- [ ] Đã diff từng file trong 5 file với bản gốc để xác nhận đúng nội dung, không sửa nhầm ý nghĩa.
- [ ] Đã kiểm tra encoding UTF-8 (không BOM lẫn lộn) cho cả 5 file.
- [ ] Đã build local (`npm run build`) để chắc chắn không phát sinh lỗi TypeScript do sửa string.
- [ ] Đã xem lại `src/messages/vi.json` — nếu 5 file có liên quan đến key trong file message này, kiểm tra luôn key đó có bị mất dấu không.

---

## Bước 2 — Xác nhận Google Search Console: verify domain + submit sitemap.xml

Repo hiện tại **không có bằng chứng nào trong code** rằng domain đã verify hoặc đã submit sitemap (không có file verification `google*.html`, không có meta tag verification trong `layout.tsx`, không thấy log/script liên quan). Vì đây là thao tác thực hiện trên Google Search Console UI (không phải code), junior dev cần làm thủ công và lưu bằng chứng lại:

### 2.1. Kiểm tra domain đã verify chưa
1. Vào https://search.google.com/search-console
2. Chọn property `aiera.vn` (hoặc thêm mới nếu chưa có, chọn loại **Domain property** — verify qua DNS TXT record, ưu tiên hơn URL-prefix vì cover cả `www` và non-`www`, cả `http`/`https`).
3. Nếu chưa verify: làm theo hướng dẫn thêm TXT record vào DNS provider (Cloudflare/Namecheap/...), đợi propagate (~vài phút đến vài giờ), bấm Verify.
4. Chụp screenshot màn hình xác nhận "Ownership verified" — lưu vào thư mục docs nội bộ của team làm bằng chứng.

### 2.2. Kiểm tra sitemap đã submit chưa
1. Trong Search Console, vào mục **Sitemaps** (menu bên trái).
2. Kiểm tra đã có entry `sitemap.xml` với status "Success" chưa. Lưu ý: route hiện tại là `src/app/sitemap.ts` (Next.js dynamic sitemap), khi build sẽ generate ra `https://aiera.vn/sitemap.xml` — xác nhận URL này accessible thật:
   ```bash
   curl -I https://aiera.vn/sitemap.xml
   ```
   Phải trả về `200 OK` và `Content-Type: application/xml`.
3. Nếu chưa submit: nhập `sitemap.xml` vào ô "Add a new sitemap" → Submit.
4. Đối chiếu số URL trong sitemap Search Console báo với số URL thực tế trong `sitemap.ts` (hiện có 10 page × 2 locale = 20 URL) — nếu lệch số lượng, có thể sitemap bị lỗi khi generate.

### 2.3. Checklist Bước 2

- [ ] Domain property `aiera.vn` hiển thị "Ownership verified" trong Search Console.
- [ ] `sitemap.xml` đã được submit và status = Success (không phải "Couldn't fetch" hay "Has errors").
- [ ] `curl -I https://aiera.vn/sitemap.xml` trả 200 OK.
- [ ] `robots.ts` có dòng `Sitemap: https://aiera.vn/sitemap.xml` đúng domain thật (không phải localhost) — đã có sẵn trong code, chỉ cần xác nhận `NEXT_PUBLIC_SITE_URL` set đúng trên môi trường production.

---

## Bước 3 — Deploy và theo dõi Search Console (kiên nhẫn, đây là tín hiệu thật chứ không phải checklist code)

Sau khi hoàn tất Bước 1 và Bước 2:

### 3.1. Deploy
1. Merge PR fix mất dấu vào nhánh chính sau khi đã pass checklist Bước 1.
2. Deploy lên production theo quy trình hiện có của team (CI/CD hoặc deploy thủ công).
3. Sau deploy, kiểm tra nhanh vài trang production bằng mắt để chắc chắn không còn text mất dấu (đặc biệt 5 trang tương ứng 5 file vừa sửa).

### 3.2. Theo dõi Search Console trong vài tuần

Đây là phần **không thể rush** — Sitelinks (các link phụ hiện dưới kết quả tìm kiếm chính khi search tên thương hiệu) do Google **tự động quyết định**, không có nút "bật Sitelinks". Việc cần làm là theo dõi các tín hiệu sau, đều đặn mỗi tuần:

| Tín hiệu cần theo dõi | Ở đâu trong Search Console | Ý nghĩa |
|---|---|---|
| **Index Coverage** | Menu "Pages" (trước là "Coverage") | Xem bao nhiêu trang đã được Google index thành công, bao nhiêu bị lỗi ("Excluded", "Crawled - not indexed"...). Cần tất cả các trang chính (`/`, `/services`, `/about`, `/contact`, 6 trang service con) đều ở trạng thái "Indexed". |
| **Brand search impressions** | Menu "Performance" → filter Query chứa "AI Era" / "aiera" | Theo dõi số impression/click khi người dùng search tên thương hiệu. Sitelinks có xu hướng xuất hiện khi brand search volume + CTR ổn định tăng theo thời gian, kèm cấu trúc site rõ ràng (breadcrumb, internal linking — đã có sẵn trong code). |
| **Core Web Vitals** | Menu "Page experience" | Google ưu tiên site tốc độ tốt khi cân nhắc hiển thị rich results/sitelinks. |

**Lưu ý cho junior dev:** không có mốc thời gian cố định để Sitelinks xuất hiện (có thể 2 tuần, có thể vài tháng). Việc của team lúc này là:
- Đảm bảo index coverage sạch (không lỗi 404/redirect loop trong 10 page đã khai báo sitemap).
- Không tiếp tục thay đổi cấu trúc URL/site liên tục (Google cần thời gian ổn định để tin tưởng cấu trúc site).
- Report số liệu impression/coverage hàng tuần cho team, không kỳ vọng hành động code nào khác sẽ "ép" Sitelinks xuất hiện nhanh hơn.

### 3.3. Checklist Bước 3

- [ ] Đã deploy bản fix lên production.
- [ ] Đã kiểm tra bằng mắt 5 trang liên quan không còn lỗi mất dấu trên production (không chỉ local).
- [ ] Đã lên lịch check Search Console định kỳ hàng tuần (ghi vào calendar/task tracker của team).
- [ ] Đã báo với team rằng Sitelinks là kết quả tự nhiên từ tín hiệu SEO tích lũy, không phải thứ có thể "bật" bằng code — tránh kỳ vọng sai.

---

## Tóm tắt thứ tự thực hiện

1. 🔒 Revoke GitHub token bị lộ trong `.env` (làm ngay, không đợi).
2. 🔤 Chạy lại Bước 0 scan → đối chiếu 5 file lỗi từ merge trước → fix triệt để → build + diff review.
3. 🔍 Verify domain trên Search Console (Domain property qua DNS TXT) + submit `sitemap.xml` + confirm status Success.
4. 🚀 Deploy.
5. 📊 Theo dõi Index Coverage + Brand Search Impressions hàng tuần — đây là tín hiệu thật cho Sitelinks, kiên nhẫn, không rush.
