
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Lock, Zap, CheckCircle, XCircle } from 'lucide-react';
import type { QuizResult } from '@/types/user';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnswerHistorySkeleton } from './skeletons';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface AnswerHistoryCardProps {
  locked: boolean;
  loading: boolean;
  results: QuizResult[];
  onUpgradeClick: () => void;
}

export function AnswerHistoryCard({ locked, loading, results, onUpgradeClick }: AnswerHistoryCardProps) {
  return (
    <Card className="lg:col-span-1 relative overflow-hidden flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen size={20} /> Answer History</CardTitle>
            <CardDescription>Review your answers from previous quizzes.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative">
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
            <div className={cn("space-y-3", locked ? "opacity-30 pointer-events-none" : "")}>
                {loading ? (
                    <AnswerHistorySkeleton />
                ) : results.length > 0 ? (
                     <div className="space-y-2">
                        {results.slice(0, 3).map(result => (
                             <Accordion key={result.id} type="single" collapsible className="w-full border rounded-md px-3">
                                <AccordionItem value={`result-${result.id}`} className="border-b-0">
                                  <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                     Quiz on {format(result.completedAt.toDate(), 'PP')} ({result.score}/{result.totalQuestions})
                                  </AccordionTrigger>
                                  <AccordionContent className="text-xs space-y-1 pb-2">
                                     {result.answers.slice(0, 2).map((ans, idx) => (
                                         <p key={idx} className={cn("flex items-start gap-1", ans.isCorrect ? "text-green-600" : "text-red-600")}>
                                             {ans.isCorrect ? <CheckCircle size={12} className="mt-0.5"/> : <XCircle size={12} className="mt-0.5"/>}
                                              <span className="text-muted-foreground line-clamp-1">{ans.questionText}</span>
                                         </p>
                                     ))}
                                     {result.answers.length > 2 && <p className="text-muted-foreground">...and {result.answers.length - 2} more</p>}
                                  </AccordionContent>
                                </AccordionItem>
                             </Accordion>
                        ))}
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" disabled={locked}>View Full History</Button>
                     </div>
                ) : (
                    <p className="text-center text-muted-foreground py-6">No quiz history found yet.</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
