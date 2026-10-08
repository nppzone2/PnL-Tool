// In danh sách tài khoản NPP (tên đăng nhập = DisID, mật khẩu chung) để Admin gửi cho NPP.
// Dùng: DATA_KEY=... NPP_PASSWORD=... node scripts/npp-accounts.mjs
// KHÔNG lưu kết quả vào repo.
import { loadNpps } from "./lib.mjs";

const { DATA_KEY, NPP_PASSWORD } = process.env;
if (!DATA_KEY || !NPP_PASSWORD) { console.error("Cần DATA_KEY và NPP_PASSWORD."); process.exit(1); }
const npps = await loadNpps(DATA_KEY);
console.log("Mã NPP\tTên đăng nhập (DisID)\tMật khẩu");
for (const n of npps) console.log(`${n.code}\t${n.id}\t${NPP_PASSWORD}`);
