export type GroupData = {
  name: string;
  files: string[];
};

export type LayoutData = {
  slots: (string | null)[]; // index → file/group id or null (empty cell)
  groups: Record<string, GroupData>;
};

const LAYOUT_FILE = "locker.layout.json";

export async function loadLayout(
  handle: FileSystemDirectoryHandle
): Promise<LayoutData> {
  try {
    const fh = await handle.getFileHandle(LAYOUT_FILE);
    const data = JSON.parse(await (await fh.getFile()).text());
    // Migrate old format { order: string[] } → { slots: (string|null)[] }
    if (Array.isArray(data.order) && !data.slots) {
      return { slots: data.order as string[], groups: data.groups ?? {} };
    }
    return data as LayoutData;
  } catch {
    return { slots: [], groups: {} };
  }
}

export async function saveLayout(
  handle: FileSystemDirectoryHandle,
  layout: LayoutData
): Promise<void> {
  try {
    const fh = await handle.getFileHandle(LAYOUT_FILE, { create: true });
    const w = await fh.createWritable();
    await w.write(JSON.stringify(layout));
    await w.close();
  } catch {
    // silently ignore
  }
}
