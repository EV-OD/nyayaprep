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
  answers: Answer[]; // Can be partial (in-progress) or final
  questions: Question[];
  language: Language;
}

export function ReviewAnswersDialog({
  isOpen,
  onClose,
  answers,
  questions,
  language,
}: ReviewAnswersDialogProps) {
  const getQuestionById = (id: string): Question | undefined => questions.find(q => q.id === id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col"> {/* Use flex column */}
        <DialogHeader>
          <DialogTitle>Review Your Answers</DialogTitle>
          <DialogDescription>
            Check your selections or review your final results.
          </DialogDescription>
        </DialogHeader>
        {/* Make ScrollArea flexible and define its height */}
        <ScrollArea className="flex-grow my-4 border rounded-md min-h-[300px] max-h-[calc(80vh-150px)]"> {/* Allow ScrollArea to grow and set max-height */}
          <div className="p-4 space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers.find(a => a.questionId === question.id);
              const questionText = question.question?.[language] || 'Question text unavailable';
              const correctAnswerText = question.correctAnswer?.[language] || 'Correct answer unavailable';
              const selectedAnswerText = userAnswer?.selectedAnswer;
              const isCorrect = userAnswer?.isCorrect;
              const isAnswered = userAnswer && userAnswer.selectedAnswer !== "Not Answered";

              return (
                <div key={question.id} className="p-4 border rounded-lg bg-card shadow-sm"> {/* Added shadow */}
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
                           <span className="font-medium">Your Answer:</span> <span className="flex-1">{selectedAnswerText}</span> {/* Use flex-1 */}
                        </p>
                         {/* Show correct answer only if the selected one was wrong */}
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
                        {/* Always show the correct answer if unanswered */}
                        <p className="flex items-start gap-1.5 text-green-600 dark:text-green-400"> {/* Use start alignment and gap */}
                            <CheckCircle size={14} className="mt-0.5 shrink-0" />
                            <span className="font-medium">Correct Answer:</span> <span className="flex-1">{correctAnswerText}</span> {/* Use flex-1 */}
                        </p>
                       </>
                    )}
                  </div>
                </div>
              );
            })}
            {questions.length === 0 && (
                <p className="text-center text-muted-foreground p-4">No questions to review.</p>
            )}
             {questions.length > 0 && answers.length === 0 && (
                <p className="text-center text-muted-foreground p-4">No answers selected yet.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4"> {/* Ensure footer doesn't overlap scroll */}
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
