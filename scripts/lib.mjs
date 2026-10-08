// Tiện ích dùng chung cho build và tạo tài khoản NPP.
import { createHmac, createHash, webcrypto as crypto } from "node:crypto";
import { readFile } from "node:fs/promises";

// 32 ký tự, bỏ I và O để dễ đọc
export const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Mật khẩu NPP = 12 ký tự lấy từ HMAC-SHA256(NPP_MASTER_KEY, "npp|<DisID>")
// Phải giống hệt hàm nppPw_ trong server/Code.gs.
export function nppPassword(master, id) {
  const h = createHmac("sha256", master).update("npp|" + id).digest();
  let s = "";
  for (let i = 0; i < 12; i++) s += ALPHA[h[i] % 32];
  return s;
}

export const sha256Hex = (s) => createHash("sha256").update(s).digest("hex");

// Đọc danh sách NPP (code, DisID) từ src/data.enc
export async function loadNpps(dataKeyB64) {
  const sealed = JSON.parse(await readFile("src/data.enc", "utf8"));
  const k = await crypto.subtle.importKey("raw", Buffer.from(dataKeyB64, "base64"), "AES-GCM", false, ["decrypt"]);
  const data = new TextDecoder().decode(await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(sealed.iv, "base64") }, k, Buffer.from(sealed.ct, "base64")));
  return [...data.matchAll(/\{"code":"([^"]+)","id":"(\d+)"/g)].map((m) => ({ code: m[1], id: m[2] }));
}
