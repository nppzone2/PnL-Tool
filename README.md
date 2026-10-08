# NPP P&L Simulator · HCM Zone 2 & 3

Công cụ mô phỏng P&L nhà phân phối (tháng M-1, tham chiếu M-2), triển khai qua GitHub Pages với 2 cấp truy cập.

| Quyền | Tab hiển thị |
|---|---|
| **Admin** | P&L, Giá bán, Chi phí vận hành, Verify data, GIS Input, Channel, Dữ liệu nguồn |
| **NPP** | P&L, Giá bán, Chi phí vận hành |

## Cài đặt một lần

1. **Settings → Secrets and variables → Actions → Secrets**, tạo:
   - `ADMIN_PASSWORD`: mật khẩu Admin
   - `NPP_PASSWORD`: mật khẩu dùng chung cho tất cả NPP
   - `DATA_KEY`: khoá giải mã dữ liệu nguồn (được cung cấp riêng, không đưa lên repo)
   - `API_URL`: địa chỉ Web app Google Apps Script nhận bài nộp NPP (xem `server/README.md`)
2. **Settings → Secrets and variables → Actions → Variables** (tuỳ chọn): `ADMIN_USER` nếu muốn đổi tên Admin (mặc định `admin`).
3. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Vào tab **Actions → Deploy P&L Tool → Run workflow** (hoặc push lên `main`).

## Tài khoản NPP

- Tên đăng nhập = **DisID** trong PnL Detail (ví dụ `10260147`).
- Mật khẩu dùng chung cho tất cả NPP: lấy từ secret `NPP_PASSWORD`.
- Xem danh sách DisID để cấp tài khoản:

```bash
DATA_KEY=... NPP_PASSWORD=... node scripts/npp-accounts.mjs
```

## Bảo mật

- Repo public nhưng dữ liệu chỉ lưu dạng mã hoá (`src/data.enc`, AES-256-GCM).
- Trang deploy mã hoá toàn bộ code + dữ liệu; mật khẩu nào mở được sẽ quyết định quyền (PBKDF2 310k vòng).
- Mật khẩu NPP dùng chung nên không ngăn được một NPP đăng nhập vào DisID của NPP khác. Phân quyền NPP hiện chỉ là phân quyền giao diện: dữ liệu của tất cả NPP nằm trong trang đã mã hoá, nên người có kỹ thuật vẫn có thể xem được. Để cách ly thật sự, cần chuyển phần dữ liệu sang máy chủ.
- NPP bấm **Hoàn tất & gửi về hệ thống** ở tab Chi phí vận hành: Giá bán + Chi phí vận hành được ghi vào Google Sheet, Admin xem ở tab **Bài nộp NPP** (tự nạp bài mới vào tool).

## Cập nhật dữ liệu

```bash
DATA_KEY=<khoá> node scripts/seal-data.mjs path/to/data.plain.js   # ghi lại src/data.enc
git add src/data.enc && git commit -m "Update data" && git push
```

Không commit file dữ liệu thô.

## Build thử trên máy

```bash
DATA_KEY=... ADMIN_PASSWORD=... NPP_PASSWORD=... node scripts/build.mjs
npx serve dist
```
