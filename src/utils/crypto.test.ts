import { describe, it, expect } from "vitest";
import {
  generateSalt,
  deriveKey,
  encryptFile,
  decryptFile,
  createTestFile,
  verifyKey,
} from "./crypto";

// ── In-memory FileSystem mock ────────────────────────────────────────────────

function createMockDir(initialFiles: Record<string, Uint8Array> = {}) {
  const store = new Map<string, Uint8Array>(Object.entries(initialFiles));

  const makeFileHandle = (name: string) => ({
    getFile: async () => {
      if (!store.has(name)) throw new DOMException("Not found", "NotFoundError");
      return new File([store.get(name)!], name);
    },
    createWritable: async () => {
      const chunks: Uint8Array[] = [];
      return {
        write: async (data: BlobPart) => {
          const buf = await new Blob([data]).arrayBuffer();
          chunks.push(new Uint8Array(buf));
        },
        close: async () => {
          const total = chunks.reduce((acc, c) => acc + c.byteLength, 0);
          const result = new Uint8Array(total);
          let offset = 0;
          for (const c of chunks) { result.set(c, offset); offset += c.byteLength; }
          store.set(name, result);
        },
      };
    },
  });

  return {
    dir: {
      getFileHandle: async (name: string, opts?: { create?: boolean }) => {
        if (!opts?.create && !store.has(name))
          throw new DOMException("Not found", "NotFoundError");
        if (!store.has(name)) store.set(name, new Uint8Array());
        return makeFileHandle(name);
      },
    } as unknown as FileSystemDirectoryHandle,
    store,
  };
}

// ── generateSalt ─────────────────────────────────────────────────────────────

describe("generateSalt", () => {
  it("produces a 16-byte Uint8Array", async () => {
    const salt = await generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.byteLength).toBe(16);
  });

  it("produces different values each call", async () => {
    const a = await generateSalt();
    const b = await generateSalt();
    expect(Array.from(a)).not.toEqual(Array.from(b));
  });
});

// ── deriveKey ────────────────────────────────────────────────────────────────

describe("deriveKey", () => {
  it("returns a CryptoKey with AES-GCM algorithm", async () => {
    const salt = await generateSalt();
    const key = await deriveKey("password123", salt, 1000); // low iterations for speed
    expect(key).toBeDefined();
    expect(key.type).toBe("secret");
    expect(key.algorithm.name).toBe("AES-GCM");
  });

  it("produces different keys for different passwords", async () => {
    const salt = await generateSalt();
    const key1 = await deriveKey("passwordA", salt, 1000);
    const key2 = await deriveKey("passwordB", salt, 1000);
    // Export raw is not possible (extractable=false), so verify via encrypt behaviour
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode("test");
    const ct1 = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key1, plaintext);
    const ct2 = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key2, plaintext);
    expect(new Uint8Array(ct1)).not.toEqual(new Uint8Array(ct2));
  });
});

// ── encryptFile / decryptFile round-trip ─────────────────────────────────────

describe("encryptFile / decryptFile", () => {
  it("encrypts and decrypts a file back to original content", async () => {
    const content = "Hello, secret world!";
    const file = new File([content], "hello.txt");
    const salt = await generateSalt();
    const key = await deriveKey("mypassword", salt, 1000);
    const { dir } = createMockDir();

    await encryptFile(file, key, dir, "hello.txt.enc");

    const fileHandle = await (dir as any).getFileHandle("hello.txt.enc");
    const decrypted = await decryptFile(fileHandle, key);
    const text = await decrypted.text();

    expect(text).toBe(content);
  });

  it("encrypts larger content correctly", async () => {
    // 200KB to exercise the chunking path
    const content = "A".repeat(200 * 1024);
    const file = new File([content], "big.txt");
    const salt = await generateSalt();
    const key = await deriveKey("pass", salt, 1000);
    const { dir } = createMockDir();

    await encryptFile(file, key, dir, "big.txt.enc");
    const fileHandle = await (dir as any).getFileHandle("big.txt.enc");
    const decrypted = await decryptFile(fileHandle, key);

    expect(await decrypted.text()).toBe(content);
  });

  it("decryption fails with wrong key", async () => {
    const file = new File(["secret"], "s.txt");
    const salt = await generateSalt();
    const rightKey = await deriveKey("right", salt, 1000);
    const wrongKey = await deriveKey("wrong", salt, 1000);
    const { dir } = createMockDir();

    await encryptFile(file, rightKey, dir, "s.txt.enc");
    const fileHandle = await (dir as any).getFileHandle("s.txt.enc");

    await expect(decryptFile(fileHandle, wrongKey)).rejects.toThrow();
  });

  it("reports progress during encryption", async () => {
    const content = "X".repeat(50 * 1024);
    const file = new File([content], "prog.txt");
    const salt = await generateSalt();
    const key = await deriveKey("pw", salt, 1000);
    const { dir } = createMockDir();
    const progressValues: number[] = [];

    await encryptFile(file, key, dir, "prog.txt.enc", undefined, (p) => progressValues.push(p));

    expect(progressValues.length).toBeGreaterThan(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
  });
});

// ── verifyKey / createTestFile ────────────────────────────────────────────────

describe("verifyKey", () => {
  it("returns true when the correct key is used", async () => {
    const salt = await generateSalt();
    const key = await deriveKey("correct", salt, 1000);
    const { dir } = createMockDir();

    await createTestFile(dir, key);
    expect(await verifyKey(dir, key)).toBe(true);
  });

  it("returns false when wrong key is used", async () => {
    const salt = await generateSalt();
    const rightKey = await deriveKey("right", salt, 1000);
    const wrongKey = await deriveKey("wrong", salt, 1000);
    const { dir } = createMockDir();

    await createTestFile(dir, rightKey);
    expect(await verifyKey(dir, wrongKey)).toBe(false);
  });

  it("returns false when test file is absent", async () => {
    const salt = await generateSalt();
    const key = await deriveKey("pass", salt, 1000);
    const { dir } = createMockDir();

    expect(await verifyKey(dir, key)).toBe(false);
  });
});
