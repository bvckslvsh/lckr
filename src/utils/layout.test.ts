import { describe, it, expect, beforeEach } from "vitest";
import { loadLayout, saveLayout, type LayoutData } from "./layout";

// ── In-memory FileSystem mock ────────────────────────────────────────────────

function createMockDir(initialFiles: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initialFiles));

  const makeFileHandle = (name: string) => ({
    getFile: async () => {
      if (!store.has(name)) throw new DOMException("Not found", "NotFoundError");
      return new File([store.get(name)!], name);
    },
    createWritable: async () => {
      const chunks: string[] = [];
      return {
        write: async (data: BlobPart) => {
          chunks.push(typeof data === "string" ? data : await new Blob([data]).text());
        },
        close: async () => { store.set(name, chunks.join("")); },
      };
    },
  });

  return {
    dir: {
      getFileHandle: async (name: string, opts?: { create?: boolean }) => {
        if (!opts?.create && !store.has(name))
          throw new DOMException("Not found", "NotFoundError");
        return makeFileHandle(name);
      },
    } as unknown as FileSystemDirectoryHandle,
    store,
  };
}

// ── loadLayout ───────────────────────────────────────────────────────────────

describe("loadLayout", () => {
  it("returns empty layout when no file exists", async () => {
    const { dir } = createMockDir();
    const layout = await loadLayout(dir);
    expect(layout).toEqual({ slots: [], groups: {} });
  });

  it("loads a valid layout from disk", async () => {
    const data: LayoutData = {
      slots: ["file1.enc", null, "file2.enc"],
      groups: {},
    };
    const { dir } = createMockDir({ "locker.layout.json": JSON.stringify(data) });
    const layout = await loadLayout(dir);
    expect(layout.slots).toEqual(data.slots);
    expect(layout.groups).toEqual({});
  });

  it("migrates old { order } format to { slots }", async () => {
    const legacy = { order: ["a.enc", "b.enc"] };
    const { dir } = createMockDir({ "locker.layout.json": JSON.stringify(legacy) });
    const layout = await loadLayout(dir);
    expect(layout.slots).toEqual(["a.enc", "b.enc"]);
    expect(layout.groups).toEqual({});
  });

  it("loads groups correctly", async () => {
    const data: LayoutData = {
      slots: ["group-1", null],
      groups: { "group-1": { name: "Docs", files: ["a.enc", "b.enc"] } },
    };
    const { dir } = createMockDir({ "locker.layout.json": JSON.stringify(data) });
    const layout = await loadLayout(dir);
    expect(layout.groups["group-1"].name).toBe("Docs");
    expect(layout.groups["group-1"].files).toHaveLength(2);
  });
});

// ── saveLayout ───────────────────────────────────────────────────────────────

describe("saveLayout", () => {
  it("persists layout to disk and can be re-read", async () => {
    const { dir, store } = createMockDir();
    const layout: LayoutData = {
      slots: ["file.enc", null, null],
      groups: {},
    };
    await saveLayout(dir, layout);
    expect(store.has("locker.layout.json")).toBe(true);

    const saved = JSON.parse(store.get("locker.layout.json")!);
    expect(saved.slots).toEqual(layout.slots);
  });

  it("persists groups", async () => {
    const { dir, store } = createMockDir();
    const layout: LayoutData = {
      slots: ["grp-1"],
      groups: { "grp-1": { name: "Images", files: ["x.enc", "y.enc"] } },
    };
    await saveLayout(dir, layout);
    const saved = JSON.parse(store.get("locker.layout.json")!);
    expect(saved.groups["grp-1"].name).toBe("Images");
  });

  it("round-trips layout through save + load", async () => {
    const { dir } = createMockDir();
    const layout: LayoutData = {
      slots: ["a.enc", null, "grp-1", null, "b.enc"],
      groups: { "grp-1": { name: "Work", files: ["c.enc", "d.enc"] } },
    };
    await saveLayout(dir, layout);
    const loaded = await loadLayout(dir);
    expect(loaded).toEqual(layout);
  });
});
