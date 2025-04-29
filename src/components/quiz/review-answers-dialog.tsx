
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
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Question, Answer, Language } from '@/types/quiz';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewAnswersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  answers: Answer[]; // Final answers array
  questions: Question[]; // Original questions (optional, might not be needed if Answer has all text)
  language: Language; // Original language the quiz was taken in (for selectedAnswer)
}

export function ReviewAnswersDialog({
  isOpen,
  onClose,
  answers,
  questions, // We might not need this if Answer contains all necessary text
  language, // Keep this to display the selected answer as it was chosen
}: ReviewAnswersDialogProps) {
  // Helper to find original question if needed, though Answer type should have text
  const getQuestionById = (id: string): Question | undefined => questions.find(q => q.id === id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col"> {/* Use flex column */}
        <DialogHeader>
          <DialogTitle>Review Your Answers</DialogTitle>
          <DialogDescription>
            Check your selections or review your final results. (Content shown in English)
          </DialogDescription>
        </DialogHeader>
        {/* Make ScrollArea flexible and define its height */}
        {/* Ensure ScrollArea uses available vertical space */}
        <ScrollArea className="flex-1 my-4 border rounded-md min-h-[300px] overflow-y-auto"> {/* Use flex-1 and explicit overflow */}
          <div className="p-4 space-y-4">
            {answers.length > 0 ? answers.map((userAnswer, index) => {
              // Use the text directly from the userAnswer object (which should be English)
              const questionText = userAnswer.questionText || 'Question text unavailable';
              const correctAnswerText = userAnswer.correctAnswerText || 'Correct answer unavailable';
              const selectedAnswerText = userAnswer.selectedAnswer;
              const isCorrect = userAnswer.isCorrect;
              const isAnswered = userAnswer.selectedAnswer !== "Not Answered";

              return (
                <div key={userAnswer.questionId} className="p-4 border rounded-lg bg-card shadow-sm"> {/* Added shadow */}
                  <p className="font-semibold mb-2 text-sm">
                    {`Q${index + 1}: ${questionText}`}
                  </p>
                  <div className="text-xs space-y-1.5"> {/* Increased spacing slightly */}
                    {isAnswered ? (
                      <>
                        <p className={cn(
                            "flex items-start gap-1.5", // Use start alignment and gap
                            isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                           {isCorrect ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
                           {/* Display selected answer as it was chosen */}
                           <span className="font-medium">Your Answer:</span> <span className="flex-1">{selectedAnswerText}</span>
                        </p>
                         {/* Show correct answer (English) only if the selected one was wrong */}
                         {!isCorrect && (
                           <p className="flex items-start gap-1.5 text-green-600 dark:text-green-400"> {/* Use start alignment and gap */}
                              <CheckCircle size={14} className="mt-0.5 shrink-0" />
                              <span className="font-medium">Correct Answer:</span> <span className="flex-1">{correctAnswerText}</span> {/* Use flex-1 */}
                           </p>
                          )}
                      </>
                    ) : (
                       // User did not answer this question
                       <>
                        <p className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400"> {/* Use start alignment and gap */}
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <span className="font-medium">Your Answer:</span> <span className="flex-1 italic">Not Answered</span> {/* Use flex-1 */}
                        </p>
                        {/* Always show the correct answer (English) if unanswered */}
                        <p className="flex items-start gap-1.5 text-green-600 dark:text-green-400"> {/* Use start alignment and gap */}
                            <CheckCircle size={14} className="mt-0.5 shrink-0" />
                            <span className="font-medium">Correct Answer:</span> <span className="flex-1">{correctAnswerText}</span> {/* Use flex-1 */}
                        </p>
                       </>
                    )}
                  </div>
                </div>
              );
            }) : (
                 <p className="text-center text-muted-foreground p-4">No answers to review for this quiz.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 flex-shrink-0"> {/* Ensure footer doesn't overlap scroll and doesn't shrink */}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
