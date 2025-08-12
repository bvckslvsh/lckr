import { useRef } from "react";
import logo from "@/assets/logo.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLockerStore } from "@/store/lockerStore";
import { encryptFile } from "@/utils/crypto";
import { Button } from "../ui/button";
import { FilePlus } from "lucide-react";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function Header() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { filters, setFilters, cryptoKey, directoryHandle, loadFiles } =
    useLockerStore();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!cryptoKey || !directoryHandle || !files) return;

    for (const file of files) {
      await encryptFile(file, cryptoKey, directoryHandle, `${file.name}.enc`);
    }

    await loadFiles();
    event.target.value = "";
  };

  return (
    <div className="flex flex-row justify-between items-center">
      <img src={logo} alt="Logo" className="w-32 h-32" />

      <div className="flex flex-row items-center gap-4">
        <Tooltip>
          <TooltipTrigger>
            <Button onClick={handleButtonClick}>
              <FilePlus size={32} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new file</TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleAddFile}
        />

        <Input
          type="text"
          placeholder="Search by filename..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
        />

        <Select
          value={filters.fileType}
          onValueChange={(value) => setFilters({ fileType: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="enc">Encrypted</SelectItem>
            <SelectItem value="dec">Decrypted</SelectItem>
            <SelectItem value="txt">Text</SelectItem>
            <SelectItem value="img">Images</SelectItem>
            <SelectItem value="vid">Videos</SelectItem>
            <SelectItem value="zip">Archives</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
