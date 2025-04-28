import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Lock, Zap } from 'lucide-react';

interface UpgradeAlertDialogProps {
  triggerButton?: React.ReactNode | null; // Make trigger optional
  featureName: string;
  onUpgradeClick: () => void;
  isOpen?: boolean; // Add isOpen prop
  onClose?: () => void; // Add onClose prop
}

export function UpgradeAlertDialog({
    triggerButton,
    featureName,
    onUpgradeClick,
    isOpen,
    onClose
}: UpgradeAlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Control open state based on props if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const handleOpenChange = (openState: boolean) => {
      if (onClose !== undefined) {
          if (!openState) onClose(); // Call onClose when dialog is closed
      } else {
          setInternalOpen(openState);
      }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {/* Only render trigger if it's provided */}
      {triggerButton && <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>}
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                  <Lock className="text-primary" /> Feature Locked: {featureName}
              </AlertDialogTitle>
              <AlertDialogDescription>
                  This feature requires a validated Basic or Premium plan. Please upgrade your plan and validate your payment to get access.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel onClick={onClose ?? (() => setInternalOpen(false))}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onUpgradeClick} asChild={false}>
                  <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
              </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

