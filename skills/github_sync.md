---
name: github_sync
description: "Tự động hóa đồng bộ mã nguồn lên GitHub. Script này đảm bảo quy trình Git chuẩn, tránh các lỗi trùng lặp hoặc xung đột lệnh."
risk: high
---

# Kỹ năng: GitHub Sync (Script-based)

## Ngữ cảnh
Sử dụng script Bash để quản lý phiên bản cho toàn bộ thư mục dự án `/ARA`. Script này tự động hóa việc lưu trữ lên GitHub.

## Hướng dẫn thực thi (Instructions)
BẠN BẮT BUỘC SỬ DỤNG SCRIPT BASH DƯỚI ĐÂY. AI chỉ được phép thay đổi tham số `$1` (Commit Message).

1. Truyền vào thông điệp commit (ví dụ: "Website ARA Beauty Center").
2. Thực thi khối lệnh Bash:

```bash
#!/bin/bash

# 1. Cấu hình
BASE_DIR="/config/Desktop/ARRA"
COMMIT_MSG="${1:-Auto-sync by Antigravity AI}"
BRANCH="main" # Đổi thành master nếu repo của bạn dùng master

cd "$BASE_DIR"

# 2. Kiểm tra thực thể Git
if [ ! -d ".git" ]; then
    echo "❌ [LỖI] Thư mục này chưa được khởi tạo Git. Vui lòng chạy 'git init' trước."
    exit 1
fi

# 3. Kiểm tra xem có thay đổi gì không
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️ [THÔNG BÁO] Không có thay đổi nào cần đồng bộ."
    exit 0
fi

echo "⏳ Đang chuẩn bị đẩy thay đổi lên GitHub..."

# 4. Thực thi quy trình Git
git add .

# Thực hiện commit
git commit -m "$COMMIT_MSG"

# 5. Push lên GitHub
# Sử dụng -u để thiết lập upstream nếu cần, hoặc push trực tiếp
if git push origin "$BRANCH"; then
    echo "✅ [THÀNH CÔNG] Đã đẩy code lên GitHub repository."
    echo "📝 Message: $COMMIT_MSG"
    exit 0
else
    echo "❌ [LỖI] Không thể đẩy code lên GitHub. Vui lòng kiểm tra:"
    echo "   - Kết nối mạng trên VPS."
    echo "   - Quyền truy cập (SSH Key hoặc Personal Access Token)."
    echo "   - Xung đột (Conflict) với code trên server GitHub."
    exit 1
fi# 3. Kiểm tra xem có thay đổi gì không
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️ [THÔNG BÁO] Không có thay đổi nào cần đồng bộ."
    exit 0
fi

echo "⏳ Đang chuẩn bị đẩy thay đổi lên GitHub..."

# 4. Thực thi quy trình Git
git add .

# Thực hiện commit
git commit -m "$COMMIT_MSG"

# 5. Push lên GitHub
# Sử dụng -u để thiết lập upstream nếu cần, hoặc push trực tiếp
if git push origin "$BRANCH"; then
    echo "✅ [THÀNH CÔNG] Đã đẩy code lên GitHub repository."
    echo "📝 Message: $COMMIT_MSG"
    exit 0
else
    echo "❌ [LỖI] Không thể đẩy code lên GitHub. Vui lòng kiểm tra:"
    echo "   - Kết nối mạng trên VPS."
    echo "   - Quyền truy cập (SSH Key hoặc Personal Access Token)."
    echo "   - Xung đột (Conflict) với code trên server GitHub."
    exit 1
fi
