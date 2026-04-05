import {
  ArrowDownToLine,
  FileArchive,
  FileImage,
  FileVideo,
  FileText,
  Loader,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Progress } from "../ui/progress";

type FileCardProps = {
  title: string;
  type: string;
  isEncrypted: boolean;
  isLoading?: boolean;
  progress?: number;
  onDownload?: () => void;
  onEncrypt?: () => void;
  onDecrypt?: () => void;
  onDelete?: () => void;
};

type IconMeta = { icon: LucideIcon; bg: string; color: string };

function getIconMeta(ext: string): IconMeta {
  const e = ext.toLowerCase();
  if (["txt", "md", "doc", "docx", "pdf"].includes(e))
    return { icon: FileText, bg: "bg-blue-50", color: "text-blue-500" };
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(e))
    return { icon: FileImage, bg: "bg-green-50", color: "text-green-500" };
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(e))
    return { icon: FileVideo, bg: "bg-purple-50", color: "text-purple-500" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(e))
    return { icon: FileArchive, bg: "bg-orange-50", color: "text-orange-500" };
  return { icon: FileText, bg: "bg-gray-100", color: "text-gray-400" };
}

export default function FileCard({
  title,
  type,
  isEncrypted,
  onDownload,
  onEncrypt,
  isLoading,
  onDecrypt,
  onDelete,
  progress,
}: FileCardProps) {
  const { icon: FileIcon, bg, color } = getIconMeta(type);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 xl:p-5 flex flex-col gap-3 xl:gap-4 hover:border-gray-300 transition-colors">
      {/* Top row: icon + name */}
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 xl:w-11 xl:h-11 rounded-lg xl:rounded-xl ${bg} flex items-center justify-center shrink-0`}
        >
          <FileIcon size={16} className={`${color} xl:w-5 xl:h-5`} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm xl:text-base font-medium text-gray-900 truncate"
            title={title}
          >
            {title}
          </p>
          <p className="text-xs xl:text-sm text-gray-400 mt-0.5 uppercase tracking-wide">
            {type}
          </p>
        </div>
      </div>

      {/* Progress bar (during upload) */}
      {progress !== undefined && (
        <Progress value={progress} className="h-1.5" />
      )}

      {/* Bottom row: status badge + actions */}
      {progress === undefined && (
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center text-xs xl:text-sm font-medium px-2 xl:px-2.5 py-0.5 rounded-full ${
              isEncrypted
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isEncrypted ? "Encrypted" : "Decrypted"}
          </span>

          <div className="flex items-center gap-3 xl:gap-4 text-gray-400">
            {isLoading ? (
              <Loader size={15} className="animate-spin xl:w-4 xl:h-4" />
            ) : (
              <>
                <button
                  onClick={onDownload}
                  className="hover:text-gray-700 transition-colors"
                  title="Download"
                >
                  <ArrowDownToLine size={15} className="xl:w-4 xl:h-4" />
                </button>
                {isEncrypted ? (
                  <button
                    onClick={onDecrypt}
                    className="hover:text-blue-600 transition-colors"
                    title="Decrypt"
                  >
                    <LockOpen size={15} className="xl:w-4 xl:h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onEncrypt}
                    className="hover:text-blue-600 transition-colors"
                    title="Encrypt"
                  >
                    <Lock size={15} className="xl:w-4 xl:h-4" />
                  </button>
                )}
                <button
                  onClick={onDelete}
                  className="hover:text-red-500 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} className="xl:w-4 xl:h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
