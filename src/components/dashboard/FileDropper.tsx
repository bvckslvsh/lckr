import React, { useCallback, useRef, useState } from "react";
import { useLockerStore } from "@/store/lockerStore";
import { motion, AnimatePresence } from "framer-motion";
import { useLockerActions } from "@/hooks/useLockerActions";
import { useNotification } from "@/notifications/NotificationProvider";
import { Upload } from "lucide-react";

export default function FileDropper() {
  const { cryptoKey, directoryHandle } = useLockerStore();
  const [isDragging, setIsDragging] = useState(false);
  const { addFiles } = useLockerActions();
  const { notify } = useNotification();
  const dropRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        setIsDragging(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };
    const onDrop = () => setIsDragging(false);

    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);

    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!cryptoKey || !directoryHandle) return;

      const files: File[] = [];
      let hasFolder = false;

      for (const item of e.dataTransfer.items) {
        const entry = item.webkitGetAsEntry?.();
        if (!entry) continue;
        if (entry.isFile) {
          const file = item.getAsFile();
          if (file) files.push(file);
        } else if (entry.isDirectory) {
          hasFolder = true;
        }
      }

      if (hasFolder) {
        notify("Folders not allowed", "Folders cannot be added!", "error");
      }

      if (files.length === 0) return;
      await addFiles(files);
    },
    [cryptoKey, directoryHandle, addFiles, notify]
  );

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/8 backdrop-blur-[2px]"
        >
          {/* Visual hint — pointer-events-none so drop fires on parent */}
          <div className="pointer-events-none flex flex-col items-center gap-4 bg-white/90 border-2 border-dashed border-blue-400 rounded-2xl px-20 py-14 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Upload size={24} className="text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                Drop files anywhere
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Files will be encrypted and added to your locker
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
