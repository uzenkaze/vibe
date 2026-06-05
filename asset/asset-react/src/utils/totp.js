// 기존 asset.html에 포함되어 있던 TOTP(Google Authenticator) 로직 복원

export function generateTOTPSecret() {
  const array = new Uint8Array(10);
  crypto.getRandomValues(array);
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < array.length; i++) {
    secret += base32chars[array[i] % 32];
  }
  return secret;
}

export function base32ToHex(base32) {
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let hex = "";
  for (let i = 0; i < base32.length; i++) {
    const val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    const chunk = bits.substr(i, 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

export async function getTOTPCode(secret) {
  const keyHex = base32ToHex(secret);
  if (keyHex.length % 2 !== 0) return null;
  const keyBytes = new Uint8Array(keyHex.length / 2);
  for (let i = 0; i < keyHex.length; i += 2) {
    keyBytes[i / 2] = parseInt(keyHex.substr(i, 2), 16);
  }
  const epoch = Math.round(new Date().getTime() / 1000.0);
  const time = Math.floor(epoch / 30);
  let timeHex = time.toString(16).padStart(16, '0');
  const timeBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    timeBytes[i] = parseInt(timeHex.substr(i * 2, 2), 16);
  }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, timeBytes);
  const hmac = new Uint8Array(signature);
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}
