
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Import Label
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { format, addWeeks } from 'date-fns';

interface ValidationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userToValidate: UserProfile | null;
  validationDuration: number;
  setValidationDuration: (duration: number) => void;
  onConfirm: () => void; // Renamed for clarity
  isUpdating: boolean;
}

export function ValidationDialog({
  isOpen,
  onOpenChange,
  userToValidate,
  validationDuration,
  setValidationDuration,
  onConfirm,
  isUpdating,
}: ValidationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Manage User Validation</DialogTitle>
          <DialogDescription>
            {userToValidate?.validated ? 'Invalidate' : 'Validate'} user "{userToValidate?.name}" ({userToValidate?.subscription} plan).
            {userToValidate?.validated ? ' This will mark their subscription as inactive/expired.' : ' Set the subscription duration.'}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!userToValidate?.validated && (
            <div className="space-y-2">
              <Label htmlFor="duration-weeks" className="text-sm font-medium">Set Duration (Weeks)</Label>
              <Input
                id="duration-weeks"
                type="number"
                min="1"
                value={validationDuration}
                onChange={(e) => setValidationDuration(parseInt(e.target.value) || 1)}
                disabled={isUpdating}
              />
              <p className="text-xs text-muted-foreground">
                Expiry Date will be set to: {format(addWeeks(new Date(), validationDuration), 'PPP')}
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {userToValidate?.validated
              ? 'Setting status to Pending/Expired will remove their access until re-validated.'
              : 'Setting status to Validated will activate their subscription for the specified duration.'
            }
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isUpdating}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onConfirm} // Use the passed onConfirm prop
            disabled={isUpdating || (!userToValidate?.validated && validationDuration < 1)}
            className={userToValidate?.validated ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {userToValidate?.validated ? 'Set to Pending/Expired' : 'Validate & Set Expiry'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
