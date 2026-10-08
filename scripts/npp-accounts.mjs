// In danh sách tài khoản NPP (DisID + mật khẩu) để Admin gửi cho từng NPP.
// Dùng: DATA_KEY=... NPP_MASTER_KEY=... node scripts/npp-accounts.mjs
// KHÔNG lưu kết quả vào repo.
import { loadNpps, nppPassword } from "./lib.mjs";

const { DATA_KEY, NPP_MASTER_KEY } = process.env;
if (!DATA_KEY || !NPP_MASTER_KEY) { console.error("Cần DATA_KEY và NPP_MASTER_KEY."); process.exit(1); }
const npps = await loadNpps(DATA_KEY);
console.log("Mã NPP\tTên đăng nhập (DisID)\tMật khẩu");
for (const n of npps) console.log(`${n.code}\t${n.id}\t${nppPassword(NPP_MASTER_KEY, n.id)}`);
