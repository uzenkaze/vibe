export async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw", enc.encode(password), "PBKDF2", false, ["deriveBits", "deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: salt, iterations: 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
    );
}

export async function encryptData(dataObj, password) {
    const text = JSON.stringify(dataObj);
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const encoded = new TextEncoder().encode(text);
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, encoded);

    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    // 호출 스택 크기 초과(Maximum call stack size exceeded) 방지를 위한 안전한 루프 방식의 base64 인코딩
    let binary = '';
    const len = combined.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(combined[i]);
    }

    return {
        _isEncrypted: true,
        payload: btoa(binary)
    };
}

export async function decryptData(encryptedObj, password) {
    if (!encryptedObj || !encryptedObj._isEncrypted) return encryptedObj;
    try {
        const combined = new Uint8Array(atob(encryptedObj.payload).split("").map(c => c.charCodeAt(0)));
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const ciphertext = combined.slice(28);
        const key = await deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, ciphertext);
        return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
        console.error("Decryption failed:", e);
        return null; // Signals wrong password or corrupted data
    }
}
