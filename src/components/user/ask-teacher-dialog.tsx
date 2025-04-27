
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionPlan } from '@/types/user';

interface AskTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questionText: string) => Promise<void>; // Submit function provided by parent
  limit: number;
  usage: number;
  planName: SubscriptionPlan;
}

export function AskTeacherDialog({
  isOpen,
  onClose,
  onSubmit,
  limit,
  usage,
  planName
}: AskTeacherDialogProps) {
  const [questionText, setQuestionText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const remaining = limit - usage;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(questionText); // Call the parent's submit function
      // Parent component will handle success toast and state updates
      setQuestionText(''); // Clear textarea after successful submission call
      // Let parent handle closing
    } catch (error) {
      console.error('Error submitting question via callback:', error);
      // Parent component might show a toast, or we can show a generic one here
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your question. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset text area when dialog opens/closes
  React.useEffect(() => {
      if (!isOpen) {
          setQuestionText('');
          setIsSubmitting(false); // Reset submitting state on close
      }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ask a Teacher</DialogTitle>
          <DialogDescription>
            Enter your question about MCQs or quizzes below. You have {remaining} question(s) left today for the {planName} plan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="Type your question about MCQs or quizzes here..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={6}
                required
                disabled={isSubmitting}
              />
              {/* Optional File Upload - Skipped for now
               <div className="mt-2">
                 <Label htmlFor="file-upload" className="text-xs text-muted-foreground">Attach file (Optional)</Label>
                 <Input id="file-upload" type="file" className="text-xs h-8 mt-1" disabled={isSubmitting}/>
               </div>
              */}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !questionText.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Question'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
