
import type * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Zap, Eye, CheckCircle, XCircle } from 'lucide-react';
import type { QuizResult } from '@/types/user';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnswerHistorySkeleton } from './skeletons';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';
import { QuizResultDetailDialog } from './QuizResultDetailDialog'; // Import the new dialog component
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AnswerHistoryCardProps {
  locked: boolean;
  loading: boolean;
  results: QuizResult[];
  onUpgradeClick: () => void;
}

export function AnswerHistoryCard({ locked, loading, results, onUpgradeClick }: AnswerHistoryCardProps) {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  const handleViewDetails = (result: QuizResult) => {
    setSelectedResult(result);
    setIsDetailDialogOpen(true);
  };

  const getScoreBadgeVariant = (percentage: number): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
      if (percentage >= 75) return 'default'; // Greenish/Primary for good scores
      if (percentage >= 50) return 'secondary'; // Yellowish/Secondary for average
      return 'destructive'; // Red for low scores
  };

  const getScoreBadgeStyle = (percentage: number) => {
       if (percentage >= 75) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
       if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
       return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
  }

  return (
    <>
      <Card className="lg:col-span-1 relative overflow-hidden flex flex-col min-h-[300px]"> {/* Added min-height */}
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen size={20} /> Answer History</CardTitle>
          <CardDescription>Review your answers from previous quizzes.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative flex flex-col"> {/* Ensure content area can grow */}
          {locked && (
            <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
              <Lock size={40} className="text-primary mb-4" />
              <p className="text-center font-semibold mb-4">Available for Premium Users.</p>
              <UpgradeAlertDialog
                triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                featureName="Answer History"
                onUpgradeClick={onUpgradeClick}
              />
            </div>
          )}
          <div className={cn("flex-grow flex flex-col", locked ? "opacity-30 pointer-events-none" : "")}>
            {loading ? (
              <AnswerHistorySkeleton />
            ) : results.length > 0 ? (
               <ScrollArea className="flex-grow h-0 min-h-[150px]"> {/* Allow scroll area to take up space */}
                   <div className="space-y-2 pr-3">
                     {results.map(result => (
                       <div key={result.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                         <div>
                           <p className="text-sm font-medium">Quiz on {format(result.completedAt.toDate(), 'PP')}</p>
                           <p className="text-xs text-muted-foreground">
                                Score: {result.score}/{result.totalQuestions}
                                <Badge
                                    variant={getScoreBadgeVariant(result.percentage)}
                                    className={cn("ml-2 text-xs", getScoreBadgeStyle(result.percentage))}
                                >
                                    {result.percentage}%
                                </Badge>
                           </p>
                         </div>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleViewDetails(result)}
                           className="flex items-center gap-1 text-primary"
                           disabled={locked}
                           aria-label={`View details for quiz on ${format(result.completedAt.toDate(), 'PP')}`}
                         >
                           <Eye size={14} /> View
                         </Button>
                       </div>
                     ))}
                   </div>
               </ScrollArea>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                 <p className="text-center text-muted-foreground py-6">No quiz history found yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedResult && (
          <QuizResultDetailDialog
             isOpen={isDetailDialogOpen}
             onClose={() => setIsDetailDialogOpen(false)}
             result={selectedResult}
          />
      )}
    </>
  );
}
