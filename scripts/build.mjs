// Build dist/index.html: giải mã dữ liệu nguồn bằng DATA_KEY, ghép với app,
// rồi mã hoá lại toàn bộ code + dữ liệu bằng một khoá ngẫu nhiên (CK).
// CK được "bọc" riêng cho Admin (ADMIN_PASSWORD) và cho từng NPP (mật khẩu lấy từ NPP_MASTER_KEY + DisID).
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
import { nppPassword, sha256Hex } from "./lib.mjs";

const ITER = 310000;
const need = (k) => {
  const v = process.env[k];
  if (!v) { console.error(`Thiếu biến môi trường / GitHub secret: ${k}`); process.exit(1); }
  return v;
};
const DATA_KEY = need("DATA_KEY"), ADMIN = need("ADMIN_PASSWORD"), MASTER = need("NPP_MASTER_KEY");
// Tên đăng nhập: admin cho Admin; DisID cho từng NPP. Tên được mã hoá cùng khoá nên không thể bỏ qua.
const ADMIN_USER = (process.env.ADMIN_USER || "admin").trim().toLowerCase();
if (ADMIN === MASTER) { console.error("ADMIN_PASSWORD không được trùng NPP_MASTER_KEY."); process.exit(1); }

const b64 = (u) => Buffer.from(u).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));
const enc = new TextEncoder(), dec = new TextDecoder();

async function aesKey(raw, usage) { return crypto.subtle.importKey("raw", raw, "AES-GCM", false, usage); }

// 1. Giải mã dữ liệu nguồn
const sealedData = JSON.parse(await readFile("src/data.enc", "utf8"));
let data;
try {
  const k = await aesKey(unb64(DATA_KEY), ["decrypt"]);
  data = dec.decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(sealedData.iv) }, k, unb64(sealedData.ct)));
} catch { console.error("DATA_KEY không đúng: không giải mã được src/data.enc"); process.exit(1); }

const [style, body, app, shell] = await Promise.all(
  ["src/style.html", "src/body.html", "src/app.js", "src/shell.html"].map((f) => readFile(f, "utf8")));

// 2. Mã hoá payload (dữ liệu + app) bằng CK
const ck = crypto.getRandomValues(new Uint8Array(32));
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await aesKey(ck, ["encrypt"]), enc.encode(data + "\nconst API_URL=" + JSON.stringify(process.env.API_URL || "") + ";\n" + app)));

// 3. Bọc CK theo từng quyền
async function wrap(pw, role, user) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), wiv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveKey"]);
  const kek = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const w = await crypto.subtle.encrypt({ name: "AES-GCM", iv: wiv }, kek, enc.encode(JSON.stringify({ role, user, ck: b64(ck) })));
  return { h: sha256Hex(user), salt: b64(salt), iv: b64(wiv), ct: b64(new Uint8Array(w)) };
}
const npps = [...data.matchAll(/\{"code":"([^"]+)","id":"(\d+)"/g)].map((m) => ({ code: m[1], id: m[2] }));
if (!npps.length) { console.error("Không đọc được danh sách NPP từ dữ liệu."); process.exit(1); }
const keys = [await wrap(ADMIN, "admin", ADMIN_USER)];
for (const n of npps) keys.push(await wrap(nppPassword(MASTER, n.id), "npp", n.id));
console.log(`Đã tạo ${npps.length} tài khoản NPP (tên đăng nhập = DisID).`);
const sealed = JSON.stringify({ iter: ITER, iv: b64(iv), ct: b64(ct), keys });

const html = shell.replace("{{STYLE}}", () => style).replace("{{BODY}}", () => body).replace("{{SEALED}}", () => sealed);
await mkdir("dist", { recursive: true });
await writeFile("dist/index.html", html);
await writeFile("dist/.nojekyll", "");
console.log(`dist/index.html: ${(html.length / 1024).toFixed(0)} KB`);
