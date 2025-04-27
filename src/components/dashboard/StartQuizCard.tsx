
import type * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import type { UserProfile } from '@/types/user';

interface StartQuizCardProps {
  profile: UserProfile | null;
  isValidated: boolean;
  featuresLocked: boolean;
}

export function StartQuizCard({ profile, isValidated, featuresLocked }: StartQuizCardProps) {
  const getDescription = () => {
    if (profile?.subscription === 'free') {
        return 'Take one of your 2 daily quizzes (10 questions).';
    } else if (profile?.subscription === 'basic') {
        return isValidated ? 'Take one of your 5 daily quizzes (10 questions).' : 'Activate your Basic plan to start quizzes.';
    } else { // Premium
        return isValidated ? 'Take a new quiz to test your knowledge.' : 'Activate your Premium plan to start quizzes.';
    }
  };

  return (
    <Card className="bg-primary text-primary-foreground lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ready to Practice?</CardTitle>
        <FileText className="h-4 w-4 text-primary-foreground/80" />
      </CardHeader>
      <CardContent>
           <p className="text-primary-foreground/90 mb-4 text-sm">
                {getDescription()}
           </p>
           <Link href="/quiz" passHref>
              <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={featuresLocked} // Disable quiz if features are locked (paid and not validated)
              >
                  Start New Quiz
              </Button>
            </Link>
            {featuresLocked && profile?.subscription !== 'free' && (
               <p className="text-xs text-primary-foreground/70 mt-2 text-center">Account validation pending or expired.</p>
            )}
      </CardContent>
    </Card>
  );
}
