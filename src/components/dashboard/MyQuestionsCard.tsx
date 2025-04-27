
import type * as React from 'react';
import { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Lock, Zap, Clock, Check, X } from 'lucide-react';
import type { UserProfile, TeacherQuestion } from '@/types/user';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { MyQuestionsSkeleton } from './skeletons';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface MyQuestionsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  locked: boolean;
  featuresLocked: boolean; // For validation lock specifically
  loading: boolean;
  questions: TeacherQuestion[];
  profile: UserProfile | null;
  onUpgradeClick: () => void;
}

const getStatusBadge = (status: TeacherQuestion['status']) => {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"><Clock size={12} className="mr-1"/> Pending</Badge>;
        case 'answered':
            return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"><Check size={12} className="mr-1"/> Answered</Badge>;
        case 'rejected':
            return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"><X size={12} className="mr-1"/> Rejected</Badge>;
        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
};


export const MyQuestionsCard = forwardRef<HTMLDivElement, MyQuestionsCardProps>(
  ({ locked, featuresLocked, loading, questions, profile, onUpgradeClick, ...props }, ref) => {
  return (
    <Card className="relative overflow-hidden flex flex-col" ref={ref} {...props}>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><HelpCircle size={20} /> My Questions</CardTitle>
            <CardDescription>View the status and answers to your submitted questions.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative">
            {locked && (
               <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                   <Lock size={40} className="text-primary mb-4" />
                   <p className="text-center font-semibold mb-4">Available for Basic & Premium plans.</p>
                    <UpgradeAlertDialog
                       triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Plan</Button>}
                       featureName="My Questions"
                       onUpgradeClick={onUpgradeClick}
                   />
                    {featuresLocked && profile?.subscription !== 'free' && <p className="text-xs text-muted-foreground mt-2">Account validation pending or expired.</p>}
               </div>
            )}
            <div className={cn("space-y-3", locked ? "opacity-30 pointer-events-none" : "")}>
               {loading ? (
                   <MyQuestionsSkeleton />
               ) : questions.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                       {questions.map((q, index) => (
                          <AccordionItem
                             value={`item-${index}`}
                             key={q.id}
                              className={cn(
                                  'border-b',
                                  q.status === 'answered' && (profile?.lastNotificationCheck ? q.answeredAt && q.answeredAt > profile.lastNotificationCheck : true)
                                      ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 rounded-md mb-1'
                                      : ''
                              )}
                          >
                            <AccordionTrigger className="text-sm hover:no-underline px-4 py-3">
                                <div className="flex justify-between items-center w-full">
                                   <span className="truncate flex-1 mr-2">{q.questionText}</span>
                                   {getStatusBadge(q.status)}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground px-4 pt-2 pb-4 space-y-2">
                                <p><strong>Asked:</strong> {q.askedAt ? format(q.askedAt.toDate(), 'PPp') : 'N/A'}</p>
                                {q.status === 'answered' && q.answerText ? (
                                    <>
                                    <p><strong>Answered:</strong> {q.answeredAt ? format(q.answeredAt.toDate(), 'PPP p') : 'N/A'}</p>
                                    <p className="whitespace-pre-wrap p-2 bg-muted/50 rounded"><strong>Answer:</strong> {q.answerText}</p>
                                    </>
                                ) : q.status === 'pending' ? (
                                    <p>Awaiting answer from the teacher.</p>
                                ): q.status === 'rejected' ? (
                                     <p>This question was rejected.</p>
                                ): (
                                     <p>No answer yet.</p>
                                )}
                            </AccordionContent>
                          </AccordionItem>
                       ))}
                     </Accordion>
               ) : (
                   <p className="text-center text-muted-foreground py-6">You haven't asked any questions yet.</p>
               )}
            </div>
        </CardContent>
    </Card>
  );
});
MyQuestionsCard.displayName = 'MyQuestionsCard';
