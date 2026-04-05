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
import { Input } from "../ui/input";
import { FilePlus, LogOut, Search } from "lucide-react";
import { useLockerActions } from "@/hooks/useLockerActions";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { filters, setFilters, cryptoKey, directoryHandle, clearLocker } =
    useLockerStore();
  const { addFiles } = useLockerActions();

  const handleAddFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!cryptoKey || !directoryHandle || !files) return;
    await addFiles(Array.from(files));
    event.target.value = "";
  };

  const handleLock = () => {
    clearLocker();
    navigate("/setup");
  };

  return (
    <header className="sticky top-0 z-20 bg-gray-100 border-b border-gray-200">
      <div className="max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 xl:px-10 h-14 xl:h-16 flex items-center justify-between gap-4">
        {/* Left: logo + title + folder name */}
        <div className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="LCKR" className="w-9 h-9 xl:w-10 xl:h-10" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm xl:text-base">LCKR</span>
            {directoryHandle && (
              <>
                <span className="text-gray-300 text-sm xl:text-base">/</span>
                <span className="text-sm xl:text-base text-gray-500 max-w-[160px] xl:max-w-[240px] truncate">
                  {directoryHandle.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 xl:gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search files..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="pl-7 h-8 xl:h-9 text-sm w-48 xl:w-64"
            />
          </div>

          {/* Filter */}
          <Select
            value={filters.fileType}
            onValueChange={(value) => setFilters({ fileType: value })}
          >
            <SelectTrigger className="h-8 xl:h-9 text-sm w-32 xl:w-36">
              <SelectValue placeholder="All files" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All files</SelectItem>
              <SelectItem value="enc">Encrypted</SelectItem>
              <SelectItem value="dec">Decrypted</SelectItem>
              <SelectItem value="txt">Text</SelectItem>
              <SelectItem value="img">Images</SelectItem>
              <SelectItem value="vid">Videos</SelectItem>
              <SelectItem value="zip">Archives</SelectItem>
            </SelectContent>
          </Select>

          {/* Add file */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="h-8 xl:h-9 px-3 xl:px-4 flex items-center gap-1.5 text-sm xl:text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FilePlus size={14} />
            <span className="hidden sm:inline">Add file</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleAddFile}
          />

          {/* Lock */}
          <button
            onClick={handleLock}
            className="h-8 w-8 xl:h-9 xl:w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            title="Lock and exit"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
