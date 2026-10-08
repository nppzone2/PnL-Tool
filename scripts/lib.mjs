// Tiện ích dùng chung cho build và tạo tài khoản NPP.
import { createHash, webcrypto as crypto } from "node:crypto";
import { readFile } from "node:fs/promises";

export const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");

// Đọc danh sách NPP (code, DisID) từ src/data.enc
export async function loadNpps(dataKeyB64) {
  const sealed = JSON.parse(await readFile("src/data.enc", "utf8"));
  const k = await crypto.subtle.importKey("raw", Buffer.from(dataKeyB64, "base64"), "AES-GCM", false, ["decrypt"]);
  const data = new TextDecoder().decode(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(sealed.iv, "base64") }, k, Buffer.from(sealed.ct, "base64")));
  return [...data.matchAll(/\{"code":"([^"]+)","id":"(\d+)"/g)].map((m) => ({ code: m[1], id: m[2] }));
}
