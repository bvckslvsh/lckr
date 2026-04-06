import { describe, it, expect, beforeEach } from "vitest";
import { useLockerStore, type LockerFile } from "./lockerStore";

const makeFile = (overrides: Partial<LockerFile> = {}): LockerFile => ({
  name: "file.txt",
  originalName: "file.txt",
  extension: "txt",
  isEncrypted: false,
  ...overrides,
});

describe("lockerStore", () => {
  beforeEach(() => {
    // Reset store between tests
    useLockerStore.setState({
      lockerFiles: [],
      filters: { searchQuery: "", fileType: "all" },
      cryptoKey: null,
      salt: null,
      directoryHandle: null,
      isLockerInitialized: false,
      fileProgress: {},
    });
  });

  // ── setLockerFiles ──────────────────────────────────────────────────────────

  it("setLockerFiles replaces the file list", () => {
    const files = [makeFile({ name: "a.txt", originalName: "a.txt" })];
    useLockerStore.getState().setLockerFiles(files);
    expect(useLockerStore.getState().lockerFiles).toHaveLength(1);
  });

  // ── setFilters ──────────────────────────────────────────────────────────────

  it("setFilters merges partial filter updates", () => {
    useLockerStore.getState().setFilters({ searchQuery: "hello" });
    expect(useLockerStore.getState().filters.searchQuery).toBe("hello");
    expect(useLockerStore.getState().filters.fileType).toBe("all"); // unchanged
  });

  // ── filteredLockerFiles ─────────────────────────────────────────────────────

  describe("filteredLockerFiles", () => {
    const files: LockerFile[] = [
      makeFile({ name: "doc.txt",       originalName: "doc.txt",       extension: "txt",  isEncrypted: false }),
      makeFile({ name: "photo.jpg.enc", originalName: "photo.jpg",     extension: "jpg",  isEncrypted: true  }),
      makeFile({ name: "video.mp4",     originalName: "video.mp4",     extension: "mp4",  isEncrypted: false }),
      makeFile({ name: "archive.zip",   originalName: "archive.zip",   extension: "zip",  isEncrypted: false }),
    ];

    beforeEach(() => {
      useLockerStore.getState().setLockerFiles(files);
    });

    it("returns all files when filters are empty", () => {
      expect(useLockerStore.getState().filteredLockerFiles()).toHaveLength(4);
    });

    it("filters by search query (case-insensitive)", () => {
      useLockerStore.getState().setFilters({ searchQuery: "PHOTO" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].originalName).toBe("photo.jpg");
    });

    it("filters encrypted files only", () => {
      useLockerStore.getState().setFilters({ fileType: "enc" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result.every((f) => f.isEncrypted)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it("filters decrypted files only", () => {
      useLockerStore.getState().setFilters({ fileType: "dec" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result.every((f) => !f.isEncrypted)).toBe(true);
      expect(result).toHaveLength(3);
    });

    it("filters by type: img", () => {
      useLockerStore.getState().setFilters({ fileType: "img" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("jpg");
    });

    it("filters by type: vid", () => {
      useLockerStore.getState().setFilters({ fileType: "vid" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("mp4");
    });

    it("filters by type: zip", () => {
      useLockerStore.getState().setFilters({ fileType: "zip" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("zip");
    });

    it("filters by type: txt", () => {
      useLockerStore.getState().setFilters({ fileType: "txt" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].extension).toBe("txt");
    });

    it("combines search and type filters", () => {
      useLockerStore.getState().setFilters({ searchQuery: "doc", fileType: "txt" });
      const result = useLockerStore.getState().filteredLockerFiles();
      expect(result).toHaveLength(1);
      expect(result[0].originalName).toBe("doc.txt");
    });

    it("returns empty when no files match", () => {
      useLockerStore.getState().setFilters({ searchQuery: "nonexistent" });
      expect(useLockerStore.getState().filteredLockerFiles()).toHaveLength(0);
    });
  });

  // ── setLocker / clearLocker ─────────────────────────────────────────────────

  it("clearLocker resets all auth state", () => {
    useLockerStore.getState().setLocker(
      {} as CryptoKey,
      new Uint8Array(16),
      {} as FileSystemDirectoryHandle,
      { algorithm: "AES-GCM", keyLength: 256, ivLength: 12, hash: "SHA-256", blockSize: 65536 }
    );
    expect(useLockerStore.getState().isLockerInitialized).toBe(true);

    useLockerStore.getState().clearLocker();
    const state = useLockerStore.getState();
    expect(state.isLockerInitialized).toBe(false);
    expect(state.cryptoKey).toBeNull();
    expect(state.directoryHandle).toBeNull();
    expect(state.lockerFiles).toHaveLength(0);
  });

  // ── fileProgress ────────────────────────────────────────────────────────────

  it("setFileProgress stores progress per file", () => {
    useLockerStore.getState().setFileProgress("file.enc", 42);
    expect(useLockerStore.getState().fileProgress["file.enc"]).toBe(42);
  });

  it("setFileProgress clears progress with undefined", () => {
    useLockerStore.getState().setFileProgress("file.enc", 100);
    useLockerStore.getState().setFileProgress("file.enc", undefined);
    expect(useLockerStore.getState().fileProgress["file.enc"]).toBeUndefined();
  });
});
