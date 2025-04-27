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
  const getQuestionById = (id: string) => questions.find(q => q.id === id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Your Answers</DialogTitle>
          <DialogDescription>
            Check your selections before submitting or see your results.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow border rounded-md my-4 max-h-[60vh] min-h-[30vh]">
          <div className="p-4 space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers.find(a => a.questionId === question.id);
              const questionText = question.question[language];
              const correctAnswerText = question.correctAnswer[language];
              const selectedAnswerText = userAnswer?.selectedAnswer;
              const isCorrect = userAnswer?.isCorrect;
              const isAnswered = userAnswer && userAnswer.selectedAnswer !== "Not Answered";

              return (
                <div key={question.id} className="p-4 border rounded-lg bg-card">
                  <p className="font-semibold mb-2 text-sm">
                    {`Q${index + 1}: ${questionText}`}
                  </p>
                  <div className="text-xs space-y-1">
                    {isAnswered ? (
                      <>
                        <p className={cn(
                            "flex items-center gap-1",
                            isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                          )}>
                           {isCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                           Your Answer: <span className="font-medium">{selectedAnswerText}</span>
                        </p>
                         {!isCorrect && (
                           <p className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircle size={14} /> Correct Answer: <span className="font-medium">{correctAnswerText}</span>
                           </p>
                          )}
                      </>
                    ) : (
                       <p className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                         <AlertCircle size={14} /> Not Answered
                         <span className="ml-2 text-muted-foreground">(Correct: {correctAnswerText})</span>
                       </p>
                    )}
                  </div>
                </div>
              );
            })}
            {answers.length === 0 && questions.length > 0 && (
                <p className="text-center text-muted-foreground p-4">No answers selected yet.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
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
