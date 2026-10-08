// Mã hoá file dữ liệu thô (JS consts) thành src/data.enc trước khi commit.
// Dùng:  DATA_KEY=<base64> node scripts/seal-data.mjs path/to/data.plain.js
// Nếu chưa có DATA_KEY, script sẽ sinh khoá mới và in ra để lưu vào GitHub secret.
// KHÔNG commit file dữ liệu thô (repo đang public).
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";

const src = process.argv[2];
if (!src) { console.error("Cần đường dẫn file dữ liệu thô."); process.exit(1); }
let key = process.env.DATA_KEY;
if (!key) {
  key = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
  console.log("DATA_KEY mới (lưu vào GitHub secret DATA_KEY):\n" + key);
}
const k = await crypto.subtle.importKey("raw", Buffer.from(key, "base64"), "AES-GCM", false, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(await readFile(src, "utf8")));
await writeFile("src/data.enc", JSON.stringify({
  iv: Buffer.from(iv).toString("base64"), ct: Buffer.from(new Uint8Array(ct)).toString("base64"),
}));
console.log("Đã ghi src/data.enc");
