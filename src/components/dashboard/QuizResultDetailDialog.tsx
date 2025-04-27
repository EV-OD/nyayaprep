
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
import { Badge } from '@/components/ui/badge';
import type { QuizResult } from '@/types/user';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface QuizResultDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: QuizResult | null;
}

export function QuizResultDetailDialog({ isOpen, onClose, result }: QuizResultDetailDialogProps) {
  if (!result) return null;

  const getScoreBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
      if (percentage >= 75) return 'default';
      if (percentage >= 50) return 'secondary';
      return 'destructive';
  };

   const getScoreBadgeStyle = (percentage: number) => {
       if (percentage >= 75) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
       if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
       return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Quiz Result Details</DialogTitle>
          <DialogDescription>
            Review of your quiz taken on {format(result.completedAt.toDate(), 'PPP \'at\' p')}.
            <br />
            Final Score: {result.score}/{result.totalQuestions}
             <Badge
                  variant={getScoreBadgeVariant(result.percentage)}
                  className={cn("ml-2 text-xs", getScoreBadgeStyle(result.percentage))}
             >
                 {result.percentage}%
             </Badge>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow border rounded-md my-4 max-h-[60vh] min-h-[30vh]">
          <div className="p-4 space-y-4">
            {result.answers.map((answer, index) => (
              <div key={`${result.id}-ans-${index}`} className="p-4 border rounded-lg bg-card shadow-sm">
                 <p className="font-semibold mb-2 text-sm">
                   {`Q${index + 1}: ${answer.questionText}`}
                 </p>
                <div className="text-xs space-y-1.5">
                   {answer.selectedAnswer !== "Not Answered" ? (
                     <>
                       {/* Your Answer */}
                       <p className={cn(
                           "flex items-start gap-1.5", // Use start alignment and gap
                           answer.isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                       )}>
                          {answer.isCorrect ?
                              <CheckCircle size={14} className="mt-0.5 shrink-0" /> :
                              <XCircle size={14} className="mt-0.5 shrink-0" />
                          }
                          <span className="font-medium">Your Answer:</span>
                          <span className="flex-1">{answer.selectedAnswer}</span>
                       </p>
                        {/* Correct Answer (show if different) */}
                        {!answer.isCorrect && (
                          <p className="flex items-start gap-1.5 text-green-700 dark:text-green-400">
                              <CheckCircle size={14} className="mt-0.5 shrink-0" />
                              <span className="font-medium">Correct Answer:</span>
                              <span className="flex-1">{answer.correctAnswerText}</span>
                          </p>
                         )}
                     </>
                   ) : (
                     // Not Answered
                     <>
                       <p className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
                         <AlertCircle size={14} className="mt-0.5 shrink-0" />
                         <span className="font-medium">Your Answer:</span>
                          <span className="flex-1 italic">Not Answered</span>
                       </p>
                        <p className="flex items-start gap-1.5 text-green-700 dark:text-green-400">
                           <CheckCircle size={14} className="mt-0.5 shrink-0" />
                           <span className="font-medium">Correct Answer:</span>
                           <span className="flex-1">{answer.correctAnswerText}</span>
                        </p>
                     </>
                   )}
                 </div>
              </div>
            ))}
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

