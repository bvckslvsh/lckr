import { useEffect, useState } from "react";
import { useLockerStore, type LockerFile } from "@/store/lockerStore";
import { useLockerActions } from "@/hooks/useLockerActions";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import FileDropper from "@/components/dashboard/FileDropper";
import DeleteFileDialog from "@/components/dashboard/DeleteFileDialog";
import LockerGrid from "@/components/dashboard/LockerGrid";
import FileCard from "@/components/dashboard/FileCard";
import { Upload } from "lucide-react";

export default function LockerDashboard() {
  const {
    isLockerInitialized,
    loadFiles,
    filteredLockerFiles,
    lockerFiles,
    setFilters,
    filters,
    fileProgress,
  } = useLockerStore();

  const {
    loadingFileName,
    handleDownload,
    handleEncrypt,
    handleDecrypt,
    handleDelete,
  } = useLockerActions();

  const [fileToDelete, setFileToDelete] = useState<LockerFile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isLockerInitialized) loadFiles();
  }, [isLockerInitialized, loadFiles]);

  const actions = {
    loadingFileName,
    fileProgress,
    onDownload: handleDownload,
    onEncrypt: handleEncrypt,
    onDecrypt: handleDecrypt,
    onDelete: (file: LockerFile) => {
      setFileToDelete(file);
      setIsDialogOpen(true);
    },
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      handleDelete(fileToDelete);
      setFileToDelete(null);
    }
    setIsDialogOpen(false);
  };

  const isFiltering =
    filters.searchQuery !== "" || filters.fileType !== "all";
  const filtered = filteredLockerFiles();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <FileDropper />

      <DeleteFileDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={confirmDelete}
        fileName={fileToDelete?.originalName}
      />

      <main className="max-w-6xl xl:max-w-7xl 2xl:max-w-screen-2xl mx-auto px-6 xl:px-10 py-6 xl:py-8">
        {isLockerInitialized && (
          <>
            {lockerFiles.length === 0 ? (
              /* Empty locker */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                  <Upload size={24} className="text-gray-400" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Your locker is empty
                </h2>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Drag files anywhere onto this page, or use the{" "}
                  <span className="font-medium text-gray-700">Add file</span>{" "}
                  button above.
                </p>
              </div>
            ) : isFiltering ? (
              /* Filtered view — simple list, no drag */
              filtered.length > 0 ? (
                <div className="grid gap-3 xl:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((file) => (
                      <motion.div
                        key={file.name}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                      >
                        <FileCard
                          title={file.originalName}
                          type={file.extension}
                          isEncrypted={file.isEncrypted}
                          isLoading={loadingFileName === file.name}
                          progress={fileProgress[file.name]}
                          onDownload={() => handleDownload(file)}
                          onEncrypt={() => handleEncrypt(file)}
                          onDecrypt={() => handleDecrypt(file)}
                          onDelete={() => {
                            setFileToDelete(file);
                            setIsDialogOpen(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
                    <p className="text-sm text-gray-500 mb-4">
                      No files match your search
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFilters({ searchQuery: "", fileType: "all" })
                      }
                    >
                      Clear filters
                    </Button>
                  </motion.div>
                </AnimatePresence>
              )
            ) : (
              /* Full drag-and-drop grid */
              <LockerGrid files={lockerFiles} actions={actions} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
