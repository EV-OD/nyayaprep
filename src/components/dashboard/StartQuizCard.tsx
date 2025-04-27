
import type * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Lock } from 'lucide-react'; // Import Lock
import type { UserProfile, SubscriptionPlan } from '@/types/user';
import { isToday } from 'date-fns';

interface StartQuizCardProps {
  profile: UserProfile | null;
  isValidated: boolean;
  featuresLocked: boolean;
}

const QUIZ_LIMITS: Record<SubscriptionPlan, number> = {
  free: 2,
  basic: 5,
  premium: Infinity, // Unlimited
};

export function StartQuizCard({ profile, isValidated, featuresLocked }: StartQuizCardProps) {
  const plan = profile?.subscription || 'free';
  const limit = QUIZ_LIMITS[plan];
  let todayCount = 0;
  if (profile?.lastQuizDate && isToday(profile.lastQuizDate.toDate())) {
    todayCount = profile.quizCountToday || 0;
  }
  const remainingQuizzes = limit === Infinity ? Infinity : Math.max(0, limit - todayCount);
  const canTakeQuiz = remainingQuizzes > 0 && (!profile || plan === 'free' || isValidated); // Free users don't need validation here
  const isLimitReached = remainingQuizzes <= 0 && limit !== Infinity;

  const getDescription = () => {
      if (!profile) { // Guest user
          return 'Take a quiz to test your knowledge (results not saved).';
      }
      if (isLimitReached) {
          return `You've reached your daily limit of ${limit} quizzes for the ${plan} plan.`;
      }
      if (!isValidated && plan !== 'free') {
          return `Validate your ${plan} plan to start taking quizzes.`;
      }
      if (plan === 'free') {
          return `Take one of your ${limit} daily quizzes (${remainingQuizzes} left).`;
      }
      if (plan === 'basic') {
          return `Take one of your ${limit} daily quizzes (${remainingQuizzes} left).`;
      }
      // Premium
      return 'Take a new quiz to test your knowledge.';
  };

  return (
    <Card className="bg-primary text-primary-foreground lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ready to Practice?</CardTitle>
        <FileText className="h-4 w-4 text-primary-foreground/80" />
      </CardHeader>
      <CardContent>
           <p className="text-primary-foreground/90 mb-4 text-sm min-h-[3em]"> {/* Add min-height */}
                {getDescription()}
           </p>
           <Link href="/quiz" passHref>
              <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={!canTakeQuiz || isLimitReached} // Disable if cannot take quiz or limit reached
                  aria-disabled={!canTakeQuiz || isLimitReached}
              >
                  {isLimitReached ? 'Limit Reached' : 'Start New Quiz'}
              </Button>
            </Link>
            {!isValidated && profile && profile.subscription !== 'free' && (
               <p className="text-xs text-primary-foreground/70 mt-2 text-center flex items-center justify-center gap-1">
                  <Lock size={12}/> Account validation pending or expired.
               </p>
            )}
      </CardContent>
    </Card>
  );
}

