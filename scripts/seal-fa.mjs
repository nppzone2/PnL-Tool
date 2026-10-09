// Mã hoá sổ tài sản cố định (TSCĐ) của từng NPP thành src/fa.enc để tính Khấu hao.
// Dùng:  DATA_KEY=<base64> node scripts/seal-fa.mjs path/to/fa.csv
// CSV có cột: DisID, Tên TSCĐ, Loại TSCĐ, Nguyên giá, Ngày bắt đầu (dd/mm/yyyy). Không dùng dấu phẩy trong tên.
// KHÔNG commit file CSV gốc (đuôi *.csv đã bị gitignore).
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";

const src = process.argv[2];
const key = process.env.DATA_KEY;
if (!src || !key) { console.error("Cần đường dẫn CSV và biến môi trường DATA_KEY."); process.exit(1); }

const lines = (await readFile(src, "utf8")).split(/\r?\n/).filter((l) => l.trim());
const [head, ...body] = lines;
if (!/^DisID,/i.test(head)) { console.error("Dòng đầu phải là tiêu đề: DisID,Tên TSCĐ,Loại TSCĐ,Nguyên giá,Ngày bắt đầu"); process.exit(1); }
const rows = body.map((l, i) => {
  const [d, n, c, v, s] = l.split(",").map((x) => x.trim());
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s || "");
  if (!d || !n || !c || !(+v > 0) || !m) throw new Error(`Dòng ${i + 2} không hợp lệ: ${l}`);
  return { d, n, c, v: +v, s: `${m[3]}-${m[2]}-${m[1]}` };
});
console.log(`Đọc ${rows.length} tài sản của ${new Set(rows.map((r) => r.d)).size} NPP.`);

const k = await crypto.subtle.importKey("raw", Buffer.from(key, "base64"), "AES-GCM", false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(JSON.stringify(rows)));
await writeFile("src/fa.enc", JSON.stringify({
  iv: Buffer.from(iv).toString("base64"), ct: Buffer.from(new Uint8Array(ct)).toString("base64"),
}));
console.log("Đã ghi src/fa.enc");
