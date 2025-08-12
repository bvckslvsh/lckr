import { bufferToBase64, base64ToBuffer } from "./bufferUtils";

interface LockerMetadata {
  version: number;
  salt: string;
  iterations: number;
  hash: string;
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
}

async function generateSalt(): Promise<Uint8Array> {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function deriveKey(
  password: string,
  salt: Uint8Array
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
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function saveLockerMetadata(
  directoryHandle: FileSystemDirectoryHandle,
  salt: Uint8Array,
  iterations = 100000,
  hash = "SHA-256",
  encryption = { algorithm: "AES-GCM", keyLength: 256, ivLength: 12 }
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
    hash,
    encryption,
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
  outputFileName: string
): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const fileData = await file.arrayBuffer();
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileData
  );
  const encryptedFileHandle = await directoryHandle.getFileHandle(
    outputFileName,
    { create: true }
  );
  const writable = await encryptedFileHandle.createWritable();
  const encryptedBlob = new Blob([iv, new Uint8Array(encryptedData)]);
  await writable.write(encryptedBlob);
  await writable.close();
}

async function decryptFile(
  encryptedFileHandle: FileSystemFileHandle,
  key: CryptoKey
): Promise<Blob> {
  const file = await encryptedFileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  const iv = new Uint8Array(arrayBuffer.slice(0, 12));
  const encryptedData = arrayBuffer.slice(12);
  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedData
  );
  return new Blob([decryptedData]);
}

async function encryptAllFiles(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey
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
      await encryptFile(file, key, directoryHandle, `${file.name}.enc`);
      await directoryHandle.removeEntry(file.name);
    }
  }
}

async function createTestFile(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey
) {
  await encryptFile(
    new File(["LocalLockerTest"], "test.txt"),
    key,
    directoryHandle,
    "test.encrypted"
  );
}

async function verifyKey(
  directoryHandle: FileSystemDirectoryHandle,
  key: CryptoKey
): Promise<boolean> {
  try {
    const fileHandle = await directoryHandle.getFileHandle("test.encrypted");
    const decryptedBlob = await decryptFile(fileHandle, key);
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
