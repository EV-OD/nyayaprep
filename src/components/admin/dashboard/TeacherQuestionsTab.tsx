
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Clock, Check, X, Star } from 'lucide-react';
import type { TeacherQuestion, UserProfile, SubscriptionPlan } from '@/types/user';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TeacherQuestionsTabProps {
  groupedQuestions: Record<string, { userName: string; userEmail: string; userId: string, questions: TeacherQuestion[], subscription: SubscriptionPlan }>;
  onOpenAnswerDialog: (question: TeacherQuestion) => void;
  isLoading: boolean;
  isSubmittingAnswer: boolean; // Add this prop
  searchTerm: string; // Add this prop
  users: UserProfile[]; // Add this prop
}


// Helper functions for badge styling (can be shared or duplicated)
const getSubscriptionBadgeDetails = (plan?: SubscriptionPlan) => {
    switch (plan) {
        case 'premium': return { variant: 'default', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', icon: <Star className="mr-1 h-3 w-3 fill-current" /> };
        case 'basic': return { variant: 'secondary', colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', icon: null };
        case 'free': return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
        default: return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
    }
};

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


export function TeacherQuestionsTab({
  groupedQuestions,
  onOpenAnswerDialog,
  isLoading,
  isSubmittingAnswer,
}: TeacherQuestionsTabProps) {

  if (isLoading) {
    return <TeacherQuestionsSkeleton />;
  }

  if (Object.keys(groupedQuestions).length === 0) {
     return (
       <Card className="text-center text-muted-foreground py-10 border shadow-sm">
         <CardContent>
            No pending questions found.
         </CardContent>
       </Card>
     );
   }


  return (
    <div className="space-y-6">
      {Object.entries(groupedQuestions).map(([userId, userData]) => {
        const planDetails = getSubscriptionBadgeDetails(userData.subscription);
        return (
          <Card key={userId} className="border shadow-sm">
            <CardHeader className="bg-muted/30 p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">{userData.userName}</CardTitle>
                  <CardDescription className="text-xs">{userData.userEmail}</CardDescription>
                </div>
                <Badge variant={planDetails.variant} className={cn("capitalize text-xs w-fit", planDetails.colorClass)}>
                  {planDetails.icon}
                  {userData.subscription || 'Free'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {userData.questions.map((q) => (
                <div key={q.id} className="border p-3 rounded-md bg-background">
                  <p className="text-sm mb-2"><strong>Question:</strong> {q.questionText}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                    <span>Asked: {q.askedAt ? format(q.askedAt.toDate(), 'PPp') : 'N/A'}</span>
                    {getStatusBadge(q.status)}
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onOpenAnswerDialog(q)}
                    className="bg-primary hover:bg-primary/90"
                    disabled={isSubmittingAnswer}
                  >
                    <Send className="mr-1 h-3.5 w-3.5" /> Answer
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


export function TeacherQuestionsSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(2)].map((_, userIndex) => (
                <Card key={userIndex} className="border shadow-sm">
                     <CardHeader className="bg-muted/30 p-4 border-b">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                             <div>
                                 <Skeleton className="h-5 w-32 mb-1" />
                                 <Skeleton className="h-3 w-40" />
                             </div>
                             <Skeleton className="h-6 w-20 rounded-full" />
                         </div>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3">
                        {[...Array(2)].map((_, qIndex) => (
                             <div key={qIndex} className="border p-3 rounded-md bg-background">
                                <Skeleton className="h-4 w-full mb-2" />
                                <div className="flex justify-between items-center text-xs mb-3">
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="mt-2 space-y-2">
                                    <Skeleton className="h-8 w-24 rounded-md" />
                                </div>
                             </div>
                         ))}
                     </CardContent>
                </Card>
             ))}
        </div>
    );
}
