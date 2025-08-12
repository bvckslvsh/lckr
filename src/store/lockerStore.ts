import { create } from "zustand";

export type LockerFile = {
  name: string;
  originalName: string;
  extension: string;
  isEncrypted: boolean;
};

interface LockerState {
  cryptoKey: CryptoKey | null;
  salt: Uint8Array | null;
  directoryHandle: FileSystemDirectoryHandle | null;

  isLockerInitialized: boolean;
  loadFiles: () => Promise<void>;

  lockerFiles: LockerFile[];
  setLockerFiles: (files: LockerFile[]) => void;

  filters: {
    searchQuery: string;
    fileType: string;
  };
  setFilters: (filters: Partial<LockerState["filters"]>) => void;

  filteredLockerFiles: () => LockerFile[];

  setLocker: (
    key: CryptoKey,
    salt: Uint8Array,
    directoryHandle: FileSystemDirectoryHandle
  ) => void;

  clearLocker: () => void;
}

export const useLockerStore = create<LockerState>((set, get) => ({
  cryptoKey: null,
  salt: null,
  directoryHandle: null,
  isLockerInitialized: false,

  lockerFiles: [],
  setLockerFiles: (files) => set({ lockerFiles: files }),

  filters: {
    searchQuery: "",
    fileType: "all",
  },
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  loadFiles: async () => {
    const { directoryHandle, setLockerFiles } = get();
    if (!directoryHandle) return;

    const files: LockerFile[] = [];

    // @ts-expect-error values() exists in browsers but not in TS types
    for await (const entry of directoryHandle.values()) {
      if (
        entry.kind === "file" &&
        entry.name !== "locker.metadata.json" &&
        entry.name !== ".DS_Store" &&
        entry.name !== "test.encrypted"
      ) {
        const isEncrypted = entry.name.endsWith(".enc");
        const name = entry.name;
        const originalName = isEncrypted ? name.replace(/\.enc$/, "") : name;
        const extension = originalName.split(".").pop() || "txt";

        files.push({ name, originalName, extension, isEncrypted });
      }
    }

    files.sort((a, b) =>
      a.originalName.toLowerCase().localeCompare(b.originalName.toLowerCase())
    );

    setLockerFiles(files);
  },

  filteredLockerFiles: () => {
    const { lockerFiles, filters } = get();
    const query = filters.searchQuery.toLowerCase();
    const type = filters.fileType;

    return lockerFiles.filter((file) => {
      const matchesQuery = file.originalName.toLowerCase().includes(query);

      const matchesType =
        type === "all"
          ? true
          : type === "enc"
          ? file.isEncrypted
          : type === "dec"
          ? !file.isEncrypted
          : type === "txt"
          ? file.extension === "txt"
          : type === "img"
          ? ["jpg", "jpeg", "png", "gif", "webp"].includes(file.extension)
          : type === "vid"
          ? ["mp4", "avi", "mov", "webm", "mkv"].includes(file.extension)
          : type === "zip"
          ? ["zip", "rar", "7z"].includes(file.extension)
          : true;

      return matchesQuery && matchesType;
    });
  },

  setLocker: (key, salt, directoryHandle) =>
    set({
      cryptoKey: key,
      salt,
      directoryHandle,
      isLockerInitialized: true,
    }),

  clearLocker: () =>
    set({
      cryptoKey: null,
      salt: null,
      directoryHandle: null,
      isLockerInitialized: false,
      lockerFiles: [],
    }),
}));
