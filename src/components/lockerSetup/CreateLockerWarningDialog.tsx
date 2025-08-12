import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CreateLockerWarningDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function CreateLockerWarningDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: CreateLockerWarningDialogProps) {
  const [ack1, setAck1] = useState(false);
  const [ack2, setAck2] = useState(false);

  const isConfirmed = ack1 && ack2;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Important notice!</AlertDialogTitle>
          <AlertDialogDescription>
            When creating a locker, system metadata files will be created in the
            locker folder.
            <br />
            <br />
            <strong>Never</strong> delete, move, or rename these files. If they
            are modified in any way, your locker will become unusable and you
            will lose access to all your files permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 mt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ack1"
              checked={ack1}
              onCheckedChange={(val) => setAck1(!!val)}
            />
            <Label htmlFor="ack1">I understand</Label>
          </div>

          {ack1 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ack2"
                checked={ack2}
                onCheckedChange={(val) => setAck2(!!val)}
              />
              <Label htmlFor="ack2">I REALLY understand!</Label>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!isConfirmed}
            onClick={() => {
              setAck1(false);
              setAck2(false);
              onConfirm();
            }}
          >
            Create Locker
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
