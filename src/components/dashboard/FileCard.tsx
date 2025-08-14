import {
  ArrowDownToLine,
  FileArchive,
  FileImage,
  FileVideoCamera,
  LetterText,
  Loader,
  Lock,
  LockOpen,
  Trash,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardAction,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
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
function getIconByExtension(ext: string): LucideIcon {
  const extension = ext.toLowerCase();
  if (["txt", "md", "doc", "docx"].includes(extension)) return LetterText;
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension))
    return FileImage;
  if (["mp4", "mov", "avi", "mkv"].includes(extension)) return FileVideoCamera;
  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) return FileArchive;
  return LetterText;
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
  const FileIcon = getIconByExtension(type);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <FileIcon className="w-5 h-5 text-muted-foreground shrink-0" />
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {title}
          </span>
        </CardTitle>
        {progress === undefined ? (
          <CardAction className="flex gap-2">
            <Tooltip>
              <TooltipTrigger>
                <ArrowDownToLine
                  onClick={onDownload}
                  className="cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Get file</p>
              </TooltipContent>
            </Tooltip>
            {isLoading ? (
              <Loader className="animate-spin text-muted-foreground" />
            ) : (
              <>
                {isEncrypted ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <LockOpen
                        onClick={onDecrypt}
                        className="cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Decrypt file</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <Lock onClick={onEncrypt} className="cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Encrypt file</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            <Tooltip>
              <TooltipTrigger>
                <Trash onClick={onDelete} className="cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete file</p>
              </TooltipContent>
            </Tooltip>
          </CardAction>
        ) : (
          <Progress value={progress} className="w-full" />
        )}
      </CardHeader>
      <CardFooter className="flex gap-1">
        <Badge variant={isEncrypted ? "accept" : "destructive"}>
          {isEncrypted ? "Encrypted" : "Decrypted"}
        </Badge>
        <Badge variant={"secondary"}>{type}</Badge>
      </CardFooter>
    </Card>
  );
}
