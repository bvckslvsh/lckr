import { bufferToBase64, base64ToBuffer } from "./bufferUtils";

export type CryptoParams = {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  hash: string;
  blockSize: number;
};

export const DEFAULT_CRYPTO_PARAMS: CryptoParams = {
  algorithm: "AES-GCM",
  keyLength: 256,
  ivLength: 12,
  hash: "SHA-256",
  blockSize: 64 * 1024,
};

interface LockerMetadata {
  version: number;
  salt: string;
  iterations: number;
  hash: string;
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    blockSize?: number;
  };
}

export function metadataToCryptoParams(meta: LockerMetadata): CryptoParams {
  return {
    algorithm: meta.encryption.algorithm,
    keyLength: meta.encryption.keyLength,
    ivLength: meta.encryption.ivLength,
    hash: meta.hash,
    blockSize: meta.encryption.blockSize ?? DEFAULT_CRYPTO_PARAMS.blockSize,
  };
}

async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations = 600000,
  hash = "SHA-256",
  keyLength = 256
): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: new Uint8Array(salt), iterations, hash },
    keyMaterial,
    { name: "AES-GCM", length: keyLength },
    false,
    ["encrypt", "decrypt"]
  );
}

async function saveLockerMetadata(
  directoryHandle: FileSystemDirectoryHandle,
  salt: Uint8Array,
  iterations = DEFAULT_CRYPTO_PARAMS.blockSize,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS
) {
  const fileHandle = await directoryHandle.getFileHandle(
    "locker.metadata.json",
    { create: true }
  );
  const writable = await fileHandle.createWritable();

  const metadata: LockerMetadata = {
    version: 1,
    salt: bufferToBase64(salt),
    iterations,
    hash: params.hash,
    encryption: {
      algorithm: params.algorithm,
      keyLength: params.keyLength,
      ivLength: params.ivLength,
      blockSize: params.blockSize,
    },
  };

  await writable.write(JSON.stringify(metadata, null, 2));
  await writable.close();
}

async function loadLockerMetadata(
  directoryHandle: FileSystemDirectoryHandle
): Promise<LockerMetadata | null> {
  try {
    const fileHandle = await directoryHandle.getFileHandle(
      "locker.metadata.json"
    );
    const file = await fileHandle.getFile();
    const text = await file.text();
    return JSON.parse(text) as LockerMetadata;
  } catch (error) {
    console.error("Error loading metadata:", error);
    return null;
  }
}

async function encryptFile(
  file: File,
  key: CryptoKey,
  directoryHandle: FileSystemDirectoryHandle,
  outputFileName: string,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS,
  onProgress?: (percent: number) => void
) {
  const reader = file.stream().getReader();
  const encryptedFileHandle = await directoryHandle.getFileHandle(
    outputFileName,
    { create: true }
  );
  const writable = await encryptedFileHandle.createWritable();

  let processed = 0;
  const totalSize = file.size;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    for (let offset = 0; offset < value.length; offset += params.blockSize) {
      const chunk = value.subarray(offset, offset + params.blockSize);
      const iv = crypto.getRandomValues(new Uint8Array(params.ivLength));

      const encryptedChunk = new Uint8Array(
        await crypto.subtle.encrypt({ name: params.algorithm, iv }, key, chunk)
      );

      await writable.write(new Blob([iv.buffer, encryptedChunk]));

      processed += chunk.length;
      if (onProgress) onProgress(Math.round((processed / totalSize) * 100));
    }
  }

  await writable.close();
}

async function decryptFile(
  encryptedFileHandle: FileSystemFileHandle,
  key: CryptoKey,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS
): Promise<Blob> {
  const file = await encryptedFileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  const decryptedChunks: ArrayBuffer[] = [];
  // GCM appends a 16-byte auth tag to every encrypted chunk
  const GCM_TAG_SIZE = 16;

  let offset = 0;
  while (offset < arrayBuffer.byteLength) {
    const iv = new Uint8Array(arrayBuffer.slice(offset, offset + params.ivLength));
    offset += params.ivLength;

    const end = Math.min(
      offset + params.blockSize + GCM_TAG_SIZE,
      arrayBuffer.byteLength
    );
    const encryptedChunk = arrayBuffer.slice(offset, end);
    offset = end;

    const decrypted = await crypto.subtle.decrypt(
      { name: params.algorithm, iv },
      key,
      encryptedChunk
    );
    decryptedChunks.push(decrypted as ArrayBuffer);
  }

  return new Blob(decryptedChunks);
}

async function encryptAllFiles(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS
) {
  // @ts-expect-error values() exists in browsers but not in TS types
  for await (const entry of directoryHandle.values()) {
    if (
      entry.kind === "file" &&
      !entry.name.endsWith(".enc") &&
      entry.name !== "locker.metadata.json" &&
      entry.name !== "test.encrypted"
    ) {
      const file = await entry.getFile();
      await encryptFile(file, key, directoryHandle, `${file.name}.enc`, params);
      await directoryHandle.removeEntry(file.name);
    }
  }
}

async function createTestFile(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS
) {
  await encryptFile(
    new File(["LocalLockerTest"], "test.txt"),
    key,
    directoryHandle,
    "test.encrypted",
    params
  );
}

async function verifyKey(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey,
  params: CryptoParams = DEFAULT_CRYPTO_PARAMS
): Promise<boolean> {
  try {
    const fileHandle = await directoryHandle.getFileHandle("test.encrypted");
    const decryptedBlob = await decryptFile(fileHandle, key, params);
    const text = await decryptedBlob.text();
    return text === "LocalLockerTest";
  } catch {
    return false;
  }
}

export {
  generateSalt,
  deriveKey,
  saveLockerMetadata,
  loadLockerMetadata,
  encryptFile,
  decryptFile,
  encryptAllFiles,
  createTestFile,
  verifyKey,
  bufferToBase64,
  base64ToBuffer,
};
