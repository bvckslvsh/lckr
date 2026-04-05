import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { validatePassword } from "@/utils/password";
import { useLockerStore } from "@/store/lockerStore";
import { useLockerActions } from "@/hooks/useLockerActions";
import { Github, ArrowLeft, FolderOpen, FolderPlus, Lock } from "lucide-react";
import CreateLockerWarningDialog from "@/components/lockerSetup/CreateLockerWarningDialog";
import { useNavigate } from "react-router-dom";

export const LockerMode = {
  Select: "select",
  Open: "open",
  Create: "create",
} as const;

export default function LockerSetup() {
  const [mode, setMode] = useState<
    (typeof LockerMode)[keyof typeof LockerMode]
  >(LockerMode.Select);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

  const isLockerInitialized = useLockerStore(
    (state) => state.isLockerInitialized
  );
  const { createLocker, openLocker } = useLockerActions();

  const proceedCreateLocker = async () => {
    try {
      setLoading(true);
      await createLocker(password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setError("");

    const validation = validatePassword(password, {
      requireStrong: mode === LockerMode.Create,
    });
    if (!validation.valid) {
      if (validation.error) setError(validation.error);
      return;
    }

    if (mode === LockerMode.Create) {
      setIsWarningDialogOpen(true);
    } else if (mode === LockerMode.Open) {
      try {
        setLoading(true);
        await openLocker(password);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetToSelect = () => {
    setMode(LockerMode.Select);
    setError("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Back to landing */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* GitHub */}
      <a
        href="https://github.com/bvckslvsh/lckr"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
      >
        <Github size={18} />
      </a>

      <div className="w-full max-w-sm md:max-w-md xl:max-w-lg">
        {/* Logo + title */}
        <div className="text-center mb-8 xl:mb-10">
          <img src={logo} alt="LCKR" className="w-16 h-16 xl:w-20 xl:h-20 mx-auto mb-4" />
          <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">Your locker</h1>
          <p className="text-sm xl:text-base text-gray-500 mt-1">
            {mode === LockerMode.Select
              ? "Choose an option to get started"
              : mode === LockerMode.Open
              ? "Enter your master password to unlock"
              : "Create a strong password for your locker"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 xl:p-8">
          {mode === LockerMode.Select && (
            <div className="flex flex-col gap-3 xl:gap-4">
              <button
                onClick={() => setMode(LockerMode.Open)}
                disabled={isLockerInitialized}
                className="flex items-center gap-3 xl:gap-4 p-4 xl:p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <FolderOpen size={18} className="text-blue-600 xl:w-5 xl:h-5" />
                </div>
                <div>
                  <p className="text-sm xl:text-base font-semibold text-gray-900">
                    Open existing locker
                  </p>
                  <p className="text-xs xl:text-sm text-gray-500 mt-0.5">
                    Select a folder with an existing locker
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMode(LockerMode.Create)}
                disabled={isLockerInitialized}
                className="flex items-center gap-3 xl:gap-4 p-4 xl:p-5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-left transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                  <FolderPlus size={18} className="text-gray-600 xl:w-5 xl:h-5" />
                </div>
                <div>
                  <p className="text-sm xl:text-base font-semibold text-gray-900">
                    Create new locker
                  </p>
                  <p className="text-xs xl:text-sm text-gray-500 mt-0.5">
                    Encrypt a new folder with a master password
                  </p>
                </div>
              </button>
            </div>
          )}

          {mode !== LockerMode.Select && (
            <div className="flex flex-col gap-3 xl:gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Lock size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {mode === LockerMode.Open ? "Unlock locker" : "New locker"}
                </span>
              </div>

              <Input
                type="password"
                placeholder={
                  mode === LockerMode.Open
                    ? "Master password"
                    : "Create master password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password && !loading) {
                    e.preventDefault();
                    handleAction();
                  }
                }}
                className={cn(
                  error && "border-red-400 focus-visible:ring-red-400"
                )}
                autoFocus
              />

              {error && (
                <p className="text-xs xl:text-sm text-red-500 leading-relaxed">{error}</p>
              )}

              <Button
                disabled={!password || loading}
                onClick={handleAction}
                className="w-full mt-1"
              >
                {loading
                  ? "Processing..."
                  : mode === LockerMode.Open
                  ? "Unlock"
                  : "Create locker"}
              </Button>

              <button
                onClick={resetToSelect}
                className="text-sm text-gray-400 hover:text-gray-700 text-center transition-colors py-1"
              >
                Back
              </button>
            </div>
          )}
        </div>

        {/* Trust strip */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {["AES-256-GCM", "PBKDF2 · 600k", "Zero Knowledge"].map(
            (badge, i, arr) => (
              <span key={badge} className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-400">{badge}</span>
                {i < arr.length - 1 && (
                  <span className="text-gray-300 text-xs">·</span>
                )}
              </span>
            )
          )}
        </div>
      </div>

      <CreateLockerWarningDialog
        isOpen={isWarningDialogOpen}
        onOpenChange={setIsWarningDialogOpen}
        onConfirm={proceedCreateLocker}
      />
    </div>
  );
}
