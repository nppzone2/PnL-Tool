# API nhận bài nộp NPP (Google Apps Script + Google Sheet)

Khi NPP bấm **Hoàn tất & gửi về hệ thống**, Giá bán + Chi phí vận hành + tóm tắt P&L được ghi vào Google Sheet. Admin xem ở tab **Bài nộp NPP**.

## Cài đặt (khoảng 5 phút)

1. Tạo Google Sheet mới, đặt tên ví dụ `NPP P&L – Bài nộp`.
2. **Extensions → Apps Script**, xoá code mẫu, dán toàn bộ nội dung `server/Code.gs`, bấm **Save**.
3. **Project Settings (biểu tượng bánh răng) → Script Properties → Add**:
   - `ADMIN_PASSWORD` = đúng mật khẩu Admin trong GitHub secret
   - `NPP_PASSWORD` = đúng mật khẩu NPP trong GitHub secret
4. **Deploy → New deployment → Select type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Bấm **Deploy**, cấp quyền khi Google hỏi, copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).
5. GitHub repo → **Settings → Secrets and variables → Actions → New secret** `API_URL` = Web app URL vừa copy.
6. **Actions → Deploy P&L Tool → Run workflow**.

## Cấu trúc Sheet

- `Submissions`: mỗi NPP × tháng một dòng, bài nộp sau ghi đè bài trước, cột `Lần gửi` tăng dần.
- `Log`: lịch sử toàn bộ các lần gửi.

## Lưu ý

- Đổi mật khẩu Admin: cập nhật cả GitHub secret `ADMIN_PASSWORD` lẫn Script Property.
- Đổi `NPP_PASSWORD`: cập nhật cả GitHub secret lẫn Script Property.
- Sửa `Code.gs`: **Deploy → Manage deployments → Edit → Version: New version** để giữ nguyên URL.
