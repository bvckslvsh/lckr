import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";
import { validatePassword } from "@/utils/password";
import { useLockerStore } from "@/store/lockerStore";
import { useLockerActions } from "@/hooks/useLockerActions";
import { Github } from "lucide-react";
import CreateLockerWarningDialog from "@/components/lockerSetup/CreateLockerWarningDialog";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

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
  const [warning, setWarning] = useState("");
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    setError("");
    setWarning("");

    const validation = validatePassword(password, {
      requireStrong: mode === LockerMode.Create,
    });
    if (!validation.valid) {
      if (validation.error) setError(validation.error);
      if (validation.warning) setWarning(validation.warning);
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="absolute top-4 right-4 z-50 flex flex-row align-bottom gap-2">
        <a
          href="https://github.com/bvckslvsh/lckr"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="icon">
            <Github className="w-5 h-5" />
          </Button>
        </a>
      </div>

      <Button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50"
      >
        ← Return
      </Button>
      <AnimatePresence mode="wait">
        <motion.div
          key="locker-setup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="max-w-md w-full mx-auto p-6 bg-gray-100 rounded-lg"
        >
          <div className="max-w-md w-full p-6 bg-gray-100 rounded-lg">
            <img src={logo} alt="Logo" className="w-32 h-32 mx-auto" />

            <div className="flex flex-row align-center justify-center gap-4 mt-4">
              {mode === LockerMode.Select && (
                <>
                  <Button
                    onClick={() => setMode(LockerMode.Open)}
                    disabled={isLockerInitialized}
                  >
                    Open existing locker
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMode(LockerMode.Create)}
                    disabled={isLockerInitialized}
                  >
                    Create new locker
                  </Button>
                </>
              )}

              {mode !== LockerMode.Select && (
                <div className="w-full flex flex-col gap-1">
                  <Input
                    type="password"
                    placeholder={
                      mode === LockerMode.Open
                        ? "Enter master password"
                        : "Create master password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && password && !loading) {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAction();
                      }
                    }}
                    className={cn(
                      error && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />

                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              )}

              {mode !== LockerMode.Select && (
                <Button disabled={!password || loading} onClick={handleAction}>
                  {loading
                    ? "Processing..."
                    : mode === LockerMode.Open
                    ? "Open"
                    : "Create"}
                </Button>
              )}

              {mode !== LockerMode.Select && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setMode(LockerMode.Select);
                    setError("");
                    setPassword("");
                    setWarning("");
                  }}
                >
                  Back
                </Button>
              )}
            </div>

            {warning && (
              <p className="text-yellow-800 text-sm mt-2 text-center">
                {warning}
              </p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <CreateLockerWarningDialog
        isOpen={isWarningDialogOpen}
        onOpenChange={setIsWarningDialogOpen}
        onConfirm={proceedCreateLocker}
      />
    </div>
  );
}
