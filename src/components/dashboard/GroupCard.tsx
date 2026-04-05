import { useState, useRef } from "react";
import {
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  X,
  Pencil,
  Ungroup,
  ArrowUpLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { LockerFile } from "@/store/lockerStore";
import FileCard from "./FileCard";

type Actions = {
  loadingFileName: string | null;
  fileProgress: Record<string, number | undefined>;
  onDownload: (file: LockerFile) => void;
  onEncrypt: (file: LockerFile) => void;
  onDecrypt: (file: LockerFile) => void;
  onDelete: (file: LockerFile) => void;
};

type GroupCardProps = {
  name: string;
  files: LockerFile[];
  actions: Actions;
  onRename: (name: string) => void;
  onDissolve: () => void;
  onRemoveFile: (fileName: string) => void;
};

function iconForExt(ext: string): { Icon: LucideIcon; color: string } {
  const e = ext.toLowerCase();
  if (["txt", "md", "doc", "docx", "pdf"].includes(e))
    return { Icon: FileText, color: "text-blue-400" };
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(e))
    return { Icon: FileImage, color: "text-green-400" };
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e))
    return { Icon: FileVideo, color: "text-purple-400" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(e))
    return { Icon: FileArchive, color: "text-orange-400" };
  return { Icon: FileText, color: "text-gray-300" };
}

export default function GroupCard({
  name,
  files,
  actions,
  onRename,
  onDissolve,
  onRemoveFile,
}: GroupCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // 2×2 preview icons (pad to 4)
  const previews = [...files.slice(0, 4).map(f => iconForExt(f.extension))];
  while (previews.length < 4) previews.push({ Icon: FileText, color: "text-transparent" });

  const saveRename = () => {
    const v = editName.trim();
    if (v) onRename(v);
    else setEditName(name);
    setIsEditing(false);
  };

  return (
    <>
      {/* Group card — acts as drag handle */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-white rounded-xl border border-gray-200 p-4 xl:p-5 flex flex-col gap-3 xl:gap-4 hover:border-gray-300 transition-colors text-left select-none"
      >
        {/* 2×2 mini grid */}
        <div className="w-14 h-14 xl:w-16 xl:h-16 grid grid-cols-2 gap-0.5 bg-gray-100 rounded-xl p-2.5">
          {previews.map(({ Icon, color }, i) => (
            <div key={i} className="flex items-center justify-center">
              <Icon size={12} className={color} />
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <p className="text-sm xl:text-base font-medium text-gray-900 truncate">
            {name}
          </p>
          <p className="text-xs xl:text-sm text-gray-400 mt-0.5">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </p>
        </div>
      </button>

      {/* Group modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-xl max-h-[80vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") {
                      setEditName(name);
                      setIsEditing(false);
                    }
                  }}
                  className="text-base font-semibold text-gray-900 bg-transparent border-b border-blue-400 outline-none flex-1 mr-4"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditName(name);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="flex items-center gap-1.5 group min-w-0"
                >
                  <span className="text-base font-semibold text-gray-900 truncate">
                    {name}
                  </span>
                  <Pencil
                    size={11}
                    className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0"
                  />
                </button>
              )}

              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button
                  onClick={() => {
                    onDissolve();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Dissolve group — move all files back to grid"
                >
                  <Ungroup size={12} />
                  <span>Dissolve</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Files */}
            <div className="overflow-y-auto p-5 grid gap-3 sm:grid-cols-2">
              {files.map((file) => (
                <div key={file.name} className="relative group/file">
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
                  {/* Remove from group */}
                  <button
                    onClick={() => onRemoveFile(file.name)}
                    title="Remove from group"
                    className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center opacity-0 group-hover/file:opacity-100 transition-opacity text-gray-500 hover:text-blue-600 hover:border-blue-300"
                  >
                    <ArrowUpLeft size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
