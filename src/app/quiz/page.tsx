'use client';

import * as React from 'react';
import { QuizClient } from '@/components/quiz/quiz-client';
import type { Question } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { getRandomMcqs } from '@/lib/firebase/firestore'; // Import Firestore function

const NUMBER_OF_QUESTIONS = 10; // Define the number of questions for a quiz

export default function QuizPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch questions from Firestore
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch random questions from Firestore
        const fetchedQuestions = await getRandomMcqs(NUMBER_OF_QUESTIONS);

        if (fetchedQuestions.length === 0) {
             console.warn("No questions fetched from Firestore.");
             setError("No questions available to start a quiz at this moment.");
        } else if (fetchedQuestions.length < NUMBER_OF_QUESTIONS) {
             console.warn(`Fetched only ${fetchedQuestions.length} questions, less than the required ${NUMBER_OF_QUESTIONS}.`);
             setQuestions(fetchedQuestions); // Use the fetched questions anyway
             // Optionally show a message that the quiz is shorter than usual
        } else {
            setQuestions(fetchedQuestions);
        }

      } catch (err) {
         console.error("Failed to fetch questions:", err);
         setError("Failed to load questions due to a database error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []); // Empty dependency array means this runs once on mount

  const renderContent = () => {
      if (loading) {
        return <QuizLoadingSkeleton />;
      }

      if (error) {
        return (
          <div className="flex flex-1 items-center justify-center p-4 text-center">
             <Alert variant="destructive" className="max-w-lg">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Error Loading Quiz</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          </div>
        );
      }

      // Render QuizClient only if questions are loaded successfully and no error occurred
      // Note: We already handled the case where fetchedQuestions.length is 0 by setting an error.
      return <QuizClient questions={questions} />;
  }

  return (
      <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <main className="flex flex-1">
             {renderContent()}
          </main>
           {/* Footer can be added if needed */}
      </div>
  );
}


function QuizLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 md:p-8">
      <div className="w-full max-w-2xl bg-card p-6 md:p-8 rounded-xl shadow-lg border">
         <Skeleton className="h-4 w-1/4 mb-4" />
        <Skeleton className="h-8 w-full mb-6" />
        <div className="space-y-4 mb-8">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Skeleton className="h-10 w-24 rounded-md" />
           <Skeleton className="h-8 w-28 rounded-md" />
          <div className="flex gap-2 flex-wrap justify-end">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
