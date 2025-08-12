import React, { useCallback, useRef, useState } from "react";
import { useLockerStore } from "@/store/lockerStore";
import { encryptFile } from "@/utils/crypto";
import { motion, AnimatePresence } from "framer-motion";

export default function FileDropper() {
  const { cryptoKey, directoryHandle, loadFiles } = useLockerStore();
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
        setIsDragging(true);
      }
    };
    const onDragLeave = (e: DragEvent) => {
      if (
        e.relatedTarget === null ||
        !(dropRef.current && dropRef.current.contains(e.relatedTarget as Node))
      ) {
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
      const files = Array.from(e.dataTransfer.files);
      for (const file of files) {
        await encryptFile(file, cryptoKey, directoryHandle, `${file.name}.enc`);
      }
      await loadFiles();
    },
    [cryptoKey, directoryHandle, loadFiles]
  );

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-black bg-white/80 rounded-xl p-12 flex flex-col items-center justify-center shadow-xl"
            style={{ minWidth: 340, minHeight: 180 }}
          >
            <span className="text-2xl font-semibold mb-2">Drop Here!</span>
            <span className="text-gray-500 text-sm">
              Files will be encrypted and added
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
