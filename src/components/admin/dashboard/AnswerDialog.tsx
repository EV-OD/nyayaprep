
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import type { TeacherQuestion } from '@/types/user';
import { format } from 'date-fns';

interface AnswerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedQuestion: TeacherQuestion | null;
  answerText: string;
  setAnswerText: (text: string) => void;
  onSubmit: () => void; // Renamed from handleAnswerSubmit for clarity
  isSubmitting: boolean;
}

export function AnswerDialog({
  isOpen,
  onOpenChange,
  selectedQuestion,
  answerText,
  setAnswerText,
  onSubmit,
  isSubmitting,
}: AnswerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Answer Question</DialogTitle>
          <DialogDescription>
            Provide an answer for the question below. The user will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="text-sm p-3 border rounded-md bg-muted/50">
            <strong>Question:</strong> {selectedQuestion?.questionText}
            <p className="text-xs text-muted-foreground mt-1">
              Asked by: {selectedQuestion?.userName} ({selectedQuestion?.userEmail})
              on {selectedQuestion?.askedAt ? format(selectedQuestion.askedAt.toDate(), 'PPp') : 'N/A'}
            </p>
          </div>
          <Textarea
            placeholder="Type your answer here..."
            rows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isSubmitting}
            className="text-sm"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onSubmit} // Use the passed onSubmit prop
            disabled={isSubmitting || !answerText.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isSubmitting ? 'Submitting...' : 'Submit Answer & Notify'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
