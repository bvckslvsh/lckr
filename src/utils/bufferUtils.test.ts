import { describe, it, expect } from "vitest";
import { bufferToBase64, base64ToBuffer } from "./bufferUtils";

describe("bufferToBase64 / base64ToBuffer", () => {
  it("encodes and decodes a known byte sequence", () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const encoded = bufferToBase64(original);
    expect(encoded).toBe("SGVsbG8=");
    const decoded = base64ToBuffer(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it("round-trips arbitrary binary data", () => {
    const original = new Uint8Array(256).map((_, i) => i);
    const decoded = base64ToBuffer(bufferToBase64(original));
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it("handles an empty buffer", () => {
    const empty = new Uint8Array(0);
    expect(bufferToBase64(empty)).toBe("");
    expect(Array.from(base64ToBuffer(""))).toEqual([]);
  });

  it("handles salt-sized buffers (16 bytes)", () => {
    const salt = new Uint8Array(16).fill(0xab);
    const rt = base64ToBuffer(bufferToBase64(salt));
    expect(Array.from(rt)).toEqual(Array.from(salt));
  });
});
