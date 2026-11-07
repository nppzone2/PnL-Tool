// Mã hoá giá mẫu T9 (giá NPP nhập tháng 9) bằng khoá công khai, giống inbox.sealed. Chạy: node scripts/seal-tpl.mjs <file.json>
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
const src = process.argv[2];
if (!src) { console.error("Thiếu file JSON giá mẫu"); process.exit(1); }
const b64 = (u) => Buffer.from(u).toString("base64");
const pub = await crypto.subtle.importKey("jwk", { ...JSON.parse(await readFile("scripts/inbox-public.json", "utf8")), ext: true },
  { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
const ak = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, ak, new TextEncoder().encode(await readFile(src, "utf8"))));
const wk = new Uint8Array(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pub, await crypto.subtle.exportKey("raw", ak)));
await writeFile("src/t9.sealed", JSON.stringify({ v: 1, at: new Date().toISOString(), wk: b64(wk), iv: b64(iv), ct: b64(ct) }));
console.log("Đã mã hoá src/t9.sealed");
