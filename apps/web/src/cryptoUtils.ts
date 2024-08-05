import { InvalidPasswordException } from "./exceptions/InvalidPasswordException.ts";

export async function encryptMnemonic(
  mnemonic: string,
  password: string,
): Promise<string> {
  if (mnemonic.length === 0 || password.length === 0) {
    throw new Error("Mnemonic and password must not be empty");
  }

  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(mnemonic),
  );
  const encryptedArray = new Uint8Array(encryptedContent);
  const encrypted = new Uint8Array(
    salt.byteLength + iv.byteLength + encryptedArray.byteLength,
  );
  encrypted.set(salt);
  encrypted.set(iv, salt.byteLength);
  encrypted.set(encryptedArray, salt.byteLength + iv.byteLength);

  return btoa(String.fromCharCode(...encrypted));
}

export async function decryptMnemonic(
  encryptedMnemonic: string,
  password: string,
): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedBytes = Uint8Array.from(atob(encryptedMnemonic), (c) =>
    c.charCodeAt(0),
  );
  const salt = encryptedBytes.slice(0, 16);
  const iv = encryptedBytes.slice(16, 28);
  const data = encryptedBytes.slice(28);

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );

  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data,
    );
    return decoder.decode(decryptedContent);
  } catch (e) {
    if (e instanceof DOMException && e.name === "OperationError") {
      throw new InvalidPasswordException();
    } else {
      throw e;
    }
  }
}
