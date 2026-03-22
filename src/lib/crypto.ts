// src/lib/crypto.ts
// Server-side only — AES decryption ported from the Kodi plugin

import crypto from "crypto";

interface KeyInfo {
  key: Buffer;
  iv: Buffer;
}

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

function parseKeyInfo(secret: string): KeyInfo {
  const [keyHex, ivHex] = secret.split(":");
  return { key: hexToBuffer(keyHex), iv: hexToBuffer(ivHex) };
}

function getKeys(): KeyInfo[] {
  const keys: KeyInfo[] = [];
  const s1 = process.env.SECRET1?.trim();
  const s2 = process.env.SECRET2?.trim();
  if (s1) keys.push(parseKeyInfo(s1));
  if (s2) keys.push(parseKeyInfo(s2));
  return keys;
}

function tryDecrypt(ciphertext: Buffer, keyInfo: KeyInfo): string | null {
  // Auto-detect AES-128 vs AES-256 based on key length
  const alg = keyInfo.key.length === 16 ? "aes-128-cbc" : "aes-256-cbc";
  try {
    const decipher = crypto.createDecipheriv(alg, keyInfo.key, keyInfo.iv);
    decipher.setAutoPadding(true);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const text = decrypted.toString("utf-8");
    if (text.startsWith("{") || text.startsWith("[") || text.toLowerCase().includes("http")) {
      return text;
    }
    return null;
  } catch {
    return null;
  }
}

export function decryptData(encryptedBase64: string): string | null {
  try {
    const clean = encryptedBase64.replace(/\s/g, "");
    const ciphertext = Buffer.from(clean, "base64");
    for (const keyInfo of getKeys()) {
      const result = tryDecrypt(ciphertext, keyInfo);
      if (result !== null) return result;
    }
    return null;
  } catch {
    return null;
  }
}

export function decryptContent(content: string): string {
  const trimmed = content.trim();

  // Already valid M3U
  if (
    trimmed.startsWith("#EXTM3U") ||
    trimmed.startsWith("#EXTINF") ||
    trimmed.startsWith("#KODIPROP")
  ) {
    return trimmed;
  }

  if (trimmed.length < 79) return trimmed;

  try {
    const part1 = trimmed.slice(0, 10);
    const part2 = trimmed.slice(34, trimmed.length - 54);
    const part3 = trimmed.slice(-10);
    const encryptedDataStr = part1 + part2 + part3;

    const ivBase64 = trimmed.slice(10, 34);
    const keyBase64 = trimmed.slice(-54, -10);

    const iv = Buffer.from(ivBase64, "base64");
    const key = Buffer.from(keyBase64, "base64");
    // Auto-detect algorithm based on key length
    const alg = key.length === 16 ? "aes-128-cbc" : "aes-256-cbc";
    const encryptedBytes = Buffer.from(encryptedDataStr, "base64");

    const decipher = crypto.createDecipheriv(alg, key, iv);
    decipher.setAutoPadding(true);
    const decrypted = Buffer.concat([decipher.update(encryptedBytes), decipher.final()]);
    return decrypted.toString("utf-8");
  } catch {
    return content;
  }
}
