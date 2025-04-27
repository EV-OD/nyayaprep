
import type * as React from 'react';
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
  triggerButton: React.ReactNode;
  featureName: string;
  onUpgradeClick: () => void;
}

export function UpgradeAlertDialog({ triggerButton, featureName, onUpgradeClick }: UpgradeAlertDialogProps) {
  return (
    <AlertDialog>
        <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <Lock className="text-primary" /> Feature Locked: {featureName}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    This feature requires a validated Premium plan or higher. Please upgrade your plan and validate your payment to get access.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onUpgradeClick} asChild={false}>
                    <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
