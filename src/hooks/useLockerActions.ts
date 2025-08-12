import {
  createTestFile,
  decryptFile,
  deriveKey,
  encryptAllFiles,
  encryptFile,
  generateSalt,
  loadLockerMetadata,
  saveLockerMetadata,
  verifyKey,
} from "@/utils/crypto";
import { useLockerStore, type LockerFile } from "@/store/lockerStore";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/notifications/NotificationProvider";
import { useState } from "react";

export function useLockerActions() {
  const setLocker = useLockerStore((state) => state.setLocker);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { cryptoKey, directoryHandle, loadFiles } = useLockerStore();
  const [loadingFileName, setLoadingFileName] = useState<string | null>(null);

  const pickDirectory = async (): Promise<FileSystemDirectoryHandle> => {
    return await (
      window as unknown as {
        showDirectoryPicker: () => Promise<FileSystemDirectoryHandle>;
      }
    ).showDirectoryPicker();
  };

  const createLocker = async (password: string) => {
    const handle = await pickDirectory();

    try {
      await handle.getFileHandle("locker.metadata.json");
      notify("Locker exists", "Locker already exists in this folder.", "error");
      throw new Error("Locker already exists in this folder.");
    } catch (error) {
      if ((error as DOMException).name !== "NotFoundError") {
        throw error;
      }
    }

    const salt = await generateSalt();
    const key = await deriveKey(password, salt);

    await saveLockerMetadata(handle, salt);
    await createTestFile(handle, key);
    await encryptAllFiles(handle, key);

    setLocker(key, salt, handle);
    navigate("/dashboard");
    notify("Created!", "New locker created successfully.", "success");
  };

  const openLocker = async (password: string) => {
    const handle = await pickDirectory();
    const salt = await loadLockerMetadata(handle);
    if (!salt) {
      notify("Locker not found", "Please create a locker first.", "error");
      throw new Error("Locker metadata not found");
    }
    const key = await deriveKey(password, salt);
    const isValid = await verifyKey(handle, key);
    if (!isValid) {
      notify("Oops!", "Invalid password or locker corrupted.", "error");
      throw new Error("Invalid password or locker corrupted.");
    }
    setLocker(key, salt, handle);
    navigate("/dashboard");
    notify("Opened!", "Locker opened successfully.", "success");
  };

  const handleDownload = async (file: LockerFile) => {
    if (!cryptoKey || !directoryHandle) return;
    const fileHandle = await directoryHandle.getFileHandle(file.name);
    const blob = file.isEncrypted
      ? await decryptFile(fileHandle, cryptoKey)
      : await fileHandle.getFile();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.originalName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEncrypt = async (file: LockerFile) => {
    if (!cryptoKey || !directoryHandle) return;
    setLoadingFileName(file.name);
    try {
      const fileHandle = await directoryHandle.getFileHandle(file.name);
      const fileData = await fileHandle.getFile();
      await encryptFile(
        fileData,
        cryptoKey,
        directoryHandle,
        `${file.name}.enc`
      );
      await directoryHandle.removeEntry(file.name);
      await loadFiles();
      notify("Encrypted!", "File encrypted successfully.", "success");
    } finally {
      setLoadingFileName(null);
    }
  };

  const handleDecrypt = async (file: LockerFile) => {
    if (!cryptoKey || !directoryHandle) return;
    setLoadingFileName(file.name);
    try {
      const fileHandle = await directoryHandle.getFileHandle(file.name);
      const decryptedBlob = await decryptFile(fileHandle, cryptoKey);

      const newFileHandle = await directoryHandle.getFileHandle(
        file.originalName,
        { create: true }
      );
      const writable = await newFileHandle.createWritable();
      await writable.write(decryptedBlob);
      await writable.close();

      await directoryHandle.removeEntry(file.name);
      await loadFiles();
      notify("Decrypted!", "File decrypted successfully.", "success");
    } finally {
      setLoadingFileName(null);
    }
  };

  const handleDelete = async (file: LockerFile) => {
    if (!directoryHandle) return;
    await directoryHandle.removeEntry(file.name);
    await loadFiles();
    notify("Deleted!", "File deleted successfully.", "success");
  };

  return {
    createLocker,
    openLocker,
    loadingFileName,
    handleDownload,
    handleEncrypt,
    handleDecrypt,
    handleDelete,
  };
}
