import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import type { LockerFile } from "@/store/lockerStore";
import { useLockerStore } from "@/store/lockerStore";
import type { LayoutData } from "@/utils/layout";
import { loadLayout, saveLayout } from "@/utils/layout";
import FileCard from "./FileCard";
import GroupCard from "./GroupCard";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLS = 4;
const EXTRA_ROWS = 2; // always keep 2 empty rows at the bottom
const MERGE_DELAY_MS = 600;

// ─── Types ───────────────────────────────────────────────────────────────────

type Actions = {
  loadingFileName: string | null;
  fileProgress: Record<string, number | undefined>;
  onDownload: (file: LockerFile) => void;
  onEncrypt: (file: LockerFile) => void;
  onDecrypt: (file: LockerFile) => void;
  onDelete: (file: LockerFile) => void;
};

// ─── Slot builder ────────────────────────────────────────────────────────────

function buildSlots(files: LockerFile[], layout: LayoutData): (string | null)[] {
  const filesInGroups = new Set(
    Object.values(layout.groups).flatMap((g) => g.files)
  );
  const fileNames = new Set(files.map((f) => f.name));
  const groupIds = new Set(Object.keys(layout.groups));

  const isValid = (id: string) =>
    (fileNames.has(id) && !filesInGroups.has(id)) || groupIds.has(id);

  // Clean saved slots (remove stale entries)
  const slots: (string | null)[] = layout.slots.map((id) =>
    id && isValid(id) ? id : null
  );

  // Find items not yet assigned a slot
  const inSlots = new Set(slots.filter(Boolean) as string[]);
  const newItems = [
    ...files
      .filter((f) => !filesInGroups.has(f.name) && !inSlots.has(f.name))
      .map((f) => f.name),
    ...Array.from(groupIds).filter((g) => !inSlots.has(g)),
  ];

  // Place new items in the first available null slots
  for (const id of newItems) {
    const idx = slots.indexOf(null);
    if (idx !== -1) slots[idx] = id;
    else slots.push(id);
  }

  // Pad to ensure EXTRA_ROWS of empty space at the bottom
  const lastFilled = slots.reduce((last, id, i) => (id ? i : last), -1);
  const rowsNeeded = Math.ceil((lastFilled + 1) / COLS) + EXTRA_ROWS;
  const target = Math.max(rowsNeeded, EXTRA_ROWS + 1) * COLS;
  while (slots.length < target) slots.push(null);

  return slots.slice(0, target);
}

// ─── DroppableCell ───────────────────────────────────────────────────────────

function DroppableCell({
  slotIndex,
  occupied,
  isHovered,
  isMergeTarget,
  children,
}: {
  slotIndex: number;
  occupied: boolean;
  isHovered: boolean;
  isMergeTarget: boolean;
  children?: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: `slot-${slotIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={[
        "relative rounded-xl min-h-[100px] transition-all duration-150",
        !occupied && isHovered
          ? "bg-blue-50 border-2 border-dashed border-blue-300"
          : !occupied
          ? "border-2 border-dashed border-transparent"
          : "",
        isMergeTarget ? "ring-2 ring-blue-500 ring-offset-2 scale-[1.02]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

// ─── DraggableItem ───────────────────────────────────────────────────────────

function DraggableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`touch-none outline-none ${isDragging ? "opacity-0" : ""}`}
    >
      {children}
    </div>
  );
}

// ─── LockerGrid ───────────────────────────────────────────────────────────────

export default function LockerGrid({
  files,
  actions,
}: {
  files: LockerFile[];
  actions: Actions;
}) {
  const { directoryHandle } = useLockerStore();
  const [layout, setLayout] = useState<LayoutData>({ slots: [], groups: {} });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [mergeTargetSlot, setMergeTargetSlot] = useState<number | null>(null);
  const mergeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastOverSlotRef = useRef<number | null>(null);

  // Load layout from disk on mount
  useEffect(() => {
    if (directoryHandle) loadLayout(directoryHandle).then(setLayout);
  }, [directoryHandle]);

  // Cleanup stale entries when file list changes
  useEffect(() => {
    if (!files.length && !layout.slots.some(Boolean)) return;

    const fileNames = new Set(files.map((f) => f.name));
    // Remove groups with < 2 valid files
    const newGroups = Object.fromEntries(
      Object.entries(layout.groups)
        .map(([gid, g]) => [
          gid,
          { ...g, files: g.files.filter((f) => fileNames.has(f)) },
        ])
        .filter(([, g]) => (g as { files: string[] }).files.length >= 2)
    );
    const validGroupIds = new Set(Object.keys(newGroups));
    const filesInGroups = new Set(
      Object.values(newGroups).flatMap((g) => (g as { files: string[] }).files)
    );

    // Clean slots: keep if valid file (not in group) or valid group
    const newSlots = layout.slots.map((id) => {
      if (!id) return null;
      if (validGroupIds.has(id)) return id;
      if (fileNames.has(id) && !filesInGroups.has(id)) return id;
      return null;
    });

    setLayout({ slots: newSlots, groups: newGroups });
  }, [files]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = useCallback(
    (next: LayoutData) => {
      setLayout(next);
      if (directoryHandle) saveLayout(directoryHandle, next);
    },
    [directoryHandle]
  );

  const slots = buildSlots(files, layout);
  const fileMap = new Map(files.map((f) => [f.name, f]));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const clearMergeTimer = () => {
    if (mergeTimerRef.current) clearTimeout(mergeTimerRef.current);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    setMergeTargetSlot(null);
    lastOverSlotRef.current = null;
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) {
      setHoveredSlot(null);
      clearMergeTimer();
      setMergeTargetSlot(null);
      lastOverSlotRef.current = null;
      return;
    }

    const overId = over.id as string;
    if (!overId.startsWith("slot-")) return;

    const toSlot = parseInt(overId.replace("slot-", ""));
    const fromSlot = slots.findIndex((id) => id === (active.id as string));

    setHoveredSlot(toSlot);

    if (toSlot === fromSlot) {
      clearMergeTimer();
      setMergeTargetSlot(null);
      lastOverSlotRef.current = null;
      return;
    }

    const toItem = slots[toSlot];

    // Potential merge: file dragged over another file
    if (toItem && toItem !== (active.id as string)) {
      if (lastOverSlotRef.current !== toSlot) {
        clearMergeTimer();
        lastOverSlotRef.current = toSlot;
        mergeTimerRef.current = setTimeout(
          () => setMergeTargetSlot(toSlot),
          MERGE_DELAY_MS
        );
      }
    } else {
      clearMergeTimer();
      setMergeTargetSlot(null);
      lastOverSlotRef.current = toSlot;
    }
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    clearMergeTimer();
    setActiveId(null);
    setHoveredSlot(null);

    const fromSlot = slots.findIndex((id) => id === (active.id as string));
    const shouldMerge = mergeTargetSlot !== null;
    const mergedSlot = mergeTargetSlot;
    setMergeTargetSlot(null);
    lastOverSlotRef.current = null;

    if (!over) return;
    const overId = over.id as string;
    if (!overId.startsWith("slot-")) return;

    const toSlot = parseInt(overId.replace("slot-", ""));
    if (toSlot === fromSlot || fromSlot === -1) return;

    const activeItemId = active.id as string;
    const toItem = slots[toSlot];

    if (shouldMerge && mergedSlot === toSlot && toItem && toItem !== activeItemId) {
      // ── Create group (iOS-style merge) ──────────────────────────────────
      const activeIsGroup = !!layout.groups[activeItemId];
      const toIsGroup = !!layout.groups[toItem];

      if (!activeIsGroup && !toIsGroup) {
        // file + file → new group
        const groupId = `group-${Date.now()}`;
        const newSlots = [...slots];
        newSlots[fromSlot] = null;
        newSlots[toSlot] = groupId;
        persist({
          slots: newSlots,
          groups: {
            ...layout.groups,
            [groupId]: { name: "Group", files: [toItem, activeItemId] },
          },
        });
      } else if (!activeIsGroup && toIsGroup) {
        // file dragged onto group → add to group
        const newSlots = [...slots];
        newSlots[fromSlot] = null;
        persist({
          slots: newSlots,
          groups: {
            ...layout.groups,
            [toItem]: {
              ...layout.groups[toItem],
              files: [...layout.groups[toItem].files, activeItemId],
            },
          },
        });
      }
    } else if (!toItem) {
      // ── Move to empty cell ──────────────────────────────────────────────
      const newSlots = [...slots];
      newSlots[fromSlot] = null;
      newSlots[toSlot] = activeItemId;
      persist({ ...layout, slots: newSlots });
    }
    // Occupied cell + no merge → do nothing (don't displace other file)
  };

  // ── Group management ──────────────────────────────────────────────────────

  const handleRenameGroup = (groupId: string, name: string) =>
    persist({
      ...layout,
      groups: { ...layout.groups, [groupId]: { ...layout.groups[groupId], name } },
    });

  const handleDissolveGroup = (groupId: string) => {
    const group = layout.groups[groupId];
    if (!group) return;
    const pos = slots.findIndex((id) => id === groupId);
    const newSlots = [...slots];
    // Place first file at group's position, rest at next available empties
    newSlots[pos] = group.files[0] ?? null;
    const remaining = group.files.slice(1);
    for (const fileId of remaining) {
      const idx = newSlots.indexOf(null);
      if (idx !== -1) newSlots[idx] = fileId;
      else newSlots.push(fileId);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [groupId]: _removed, ...rest } = layout.groups;
    persist({ slots: newSlots, groups: rest });
  };

  const handleRemoveFromGroup = (groupId: string, fileName: string) => {
    const group = layout.groups[groupId];
    if (!group) return;
    const remaining = group.files.filter((f) => f !== fileName);
    if (remaining.length < 2) {
      handleDissolveGroup(groupId);
    } else {
      // Add file to first empty slot
      const newSlots = [...slots];
      const idx = newSlots.indexOf(null);
      if (idx !== -1) newSlots[idx] = fileName;
      else newSlots.push(fileName);
      persist({
        slots: newSlots,
        groups: { ...layout.groups, [groupId]: { ...group, files: remaining } },
      });
    }
  };

  // ── Active item for DragOverlay ───────────────────────────────────────────

  const activeSlot = activeId ? slots.findIndex((id) => id === activeId) : -1;
  const activeGroupData =
    activeId && layout.groups[activeId] ? layout.groups[activeId] : null;
  const activeFile =
    activeId && !activeGroupData ? fileMap.get(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className="grid gap-3 xl:gap-4"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        <AnimatePresence>
          {slots.map((id, index) => {
            const isOccupied = !!id;
            const isHovered = hoveredSlot === index;
            const isMergeTarget = mergeTargetSlot === index;
            const isActiveSlot = activeSlot === index;
            const groupData = id ? layout.groups[id] : null;
            const file = id && !groupData ? fileMap.get(id) : null;

            return (
              <motion.div
                key={`slot-${index}`}
                layout
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <DroppableCell
                  slotIndex={index}
                  occupied={isOccupied}
                  isHovered={isHovered}
                  isMergeTarget={isMergeTarget}
                >
                  {id && !isActiveSlot && (
                    <DraggableItem id={id}>
                      {groupData ? (
                        <GroupCard
                          name={groupData.name}
                          files={groupData.files
                            .map((n) => fileMap.get(n))
                            .filter(Boolean) as LockerFile[]}
                          actions={actions}
                          onRename={(name) => handleRenameGroup(id, name)}
                          onDissolve={() => handleDissolveGroup(id)}
                          onRemoveFile={(fn) => handleRemoveFromGroup(id, fn)}
                        />
                      ) : file ? (
                        <FileCard
                          title={file.originalName}
                          type={file.extension}
                          isEncrypted={file.isEncrypted}
                          isLoading={actions.loadingFileName === file.name}
                          progress={actions.fileProgress[file.name]}
                          onDownload={() => actions.onDownload(file)}
                          onEncrypt={() => actions.onEncrypt(file)}
                          onDecrypt={() => actions.onDecrypt(file)}
                          onDelete={() => actions.onDelete(file)}
                        />
                      ) : null}
                    </DraggableItem>
                  )}
                </DroppableCell>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Drag ghost */}
      {createPortal(
        <DragOverlay dropAnimation={null}>
          {activeFile && (
            <div className="rotate-2 scale-105 shadow-2xl pointer-events-none opacity-90">
              <FileCard
                title={activeFile.originalName}
                type={activeFile.extension}
                isEncrypted={activeFile.isEncrypted}
              />
            </div>
          )}
          {activeGroupData && (
            <div className="rotate-2 scale-105 shadow-2xl pointer-events-none opacity-90">
              <GroupCard
                name={activeGroupData.name}
                files={activeGroupData.files
                  .map((n) => fileMap.get(n))
                  .filter(Boolean) as LockerFile[]}
                actions={actions}
                onRename={() => {}}
                onDissolve={() => {}}
                onRemoveFile={() => {}}
              />
            </div>
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
