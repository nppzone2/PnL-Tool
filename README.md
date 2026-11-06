# Distributor P&L Simulator · HCM Zone 2 & 3

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
   - `INBOX_KEY`: khoá bí mật mở gói dữ liệu EDE Input + SaleOut by Segment (`src/inbox.sealed`), được cung cấp riêng
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

### Cập nhật EDE Input PnL + SaleOut by Segment (không cần chạy lệnh)

1. Đăng nhập Admin → tab **Dữ liệu nguồn** → nạp file **PnL Detail** (cả năm), **EDE Input PnL** (export cả năm) và **SaleOut by Segment** (nhiều tháng). PnL Detail trong gói sẽ ghi đè số trong `data.enc`, nên cập nhật hằng tháng không cần DATA_KEY.
2. Bấm **Đóng gói & tải inbox.sealed**. File đã được mã hoá bằng khoá công khai `scripts/inbox-public.json`.
3. Trên GitHub: thư mục `src` → **Add file → Upload files** → chọn `inbox.sealed` (ghi đè file cũ) → **Commit**.
4. GitHub Actions dùng secret `INBOX_KEY` giải mã và nhúng vào trang đã mã hoá, nên NPP cũng thấy số EDE.

Thẻ P&L tháng đã chốt có EDE tính như sau: sản lượng tổng theo PnL Detail; SDIS × giá Val01; On-Off = phần còn lại; giá On-Off từng SKU theo cấu trúc OFF/ON NPP nhập trên web tháng gần nhất (T9), cộng/trừ đều cho mọi SKU để khớp doanh thu PnL Detail, bình quân theo SL OFF/ON của tháng, làm tròn 1.000 đ; phần lệch dồn vào SKU tỷ trọng cao nhất (làm tròn 500 đ). Chi phí = VND (Val02) × % share (Val03), riêng thuê kho = m² × đơn giá × % share. Market investment, Capital cost = Val01 × Val02%. Current account, Credit for Outlets = Val01. Remaining value hiển thị Val01, tính P&L = Val01 × (% share khấu hao xe tải + xe nâng + thiết bị VP) ÷ 3. CD, DIP, Other income, Inventory, CD hold, Cash deposit lấy PnL Detail.

### Cập nhật sổ TSCĐ (tab Khấu hao)

```bash
DATA_KEY=<khoá> node scripts/seal-fa.mjs path/to/fa.csv   # ghi lại src/fa.enc
git add src/fa.enc && git commit -m "Update fixed assets" && git push
```

File CSV có header `DisID,Tên TSCĐ,Loại TSCĐ,Nguyên giá,Ngày bắt đầu` (cột thứ 6 `Số tháng KH` không bắt buộc, mặc định 60) (ngày dd/mm/yyyy, tên không chứa dấu phẩy). CSV chỉ dùng để mã hoá, không commit.

## Build thử trên máy

```bash
DATA_KEY=... ADMIN_PASSWORD=... NPP_PASSWORD=... node scripts/build.mjs
npx serve dist
```

Admin cũng có thể thêm, xoá tài sản ngay trong tab Khấu hao rồi bấm **Lưu sổ TSCĐ**; cần cập nhật Apps Script theo `server/README.md`.
