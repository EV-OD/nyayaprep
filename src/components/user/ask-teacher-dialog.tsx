
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
  onSubmit: (questionText: string) => Promise<void>; // Make submit async
  limit: number;
  usage: number;
  planName: SubscriptionPlan; // Add plan name for context
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
      await onSubmit(questionText);
      toast({
        title: 'Question Submitted',
        description: 'Your question has been sent. Please allow some time for a response.',
      });
      setQuestionText(''); // Clear textarea after successful submission
      // onClose(); // Let the parent component handle closing if needed (already done in dashboard)
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your question. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ask a Teacher</DialogTitle>
          <DialogDescription>
            Enter your question about MCQs or quizzes below. You have {remaining} question(s) left today for the {planName} plan. {/* Updated description */}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="Type your question about MCQs or quizzes here..." // Updated placeholder
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={6}
                required
                disabled={isSubmitting}
              />
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

    