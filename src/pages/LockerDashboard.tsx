import { useEffect, useState } from "react";
import { useLockerStore, type LockerFile } from "@/store/lockerStore";
import { useLockerActions } from "@/hooks/useLockerActions";
import FileCard from "@/components/dashboard/FileCard";
import Header from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import FileDropper from "@/components/dashboard/FileDropper";
import DeleteFileDialog from "@/components/dashboard/DeleteFileDialog";

export default function LockerDashboard() {
  const {
    isLockerInitialized,
    loadFiles,
    filteredLockerFiles,
    lockerFiles,
    setFilters,
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
    if (isLockerInitialized) {
      loadFiles();
    }
  }, [isLockerInitialized, loadFiles]);

  const files = filteredLockerFiles();

  const confirmDelete = () => {
    if (fileToDelete) {
      handleDelete(fileToDelete);
      setFileToDelete(null);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-3 p-3 bg-gray-100 min-h-screen">
      <Header />
      <FileDropper />

      <DeleteFileDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={confirmDelete}
        fileName={fileToDelete?.originalName}
      />

      {isLockerInitialized && (
        <>
          {files.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {files.map((file) => (
                  <motion.div
                    key={file.name}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FileCard
                      title={file.originalName}
                      type={file.extension}
                      isEncrypted={file.isEncrypted}
                      isLoading={loadingFileName === file.name}
                      onDownload={() => handleDownload(file)}
                      onEncrypt={() => handleEncrypt(file)}
                      onDecrypt={() => handleDecrypt(file)}
                      progress={fileProgress[file.name]}
                      onDelete={() => {
                        setFileToDelete(file);
                        setIsDialogOpen(true);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : lockerFiles.length === 0 ? (
            <div className="flex flex-col justify-center text-l items-center text-center text-muted-foreground mt-8">
              Your locker looks empty. Add some files to get started! <br />
              Simply drag files here.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {files.length === 0 && lockerFiles.length > 0 && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center text-muted-foreground mt-8 space-y-4">
                    <p>Nothing to show</p>
                    <Button
                      variant="default"
                      onClick={() =>
                        setFilters({ searchQuery: "", fileType: "all" })
                      }
                    >
                      Reset Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </>
      )}
    </div>
  );
}
