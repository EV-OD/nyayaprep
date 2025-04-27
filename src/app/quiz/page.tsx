
'use client';

import * as React from 'react';
import { QuizClient } from '@/components/quiz/quiz-client';
import type { Question } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar

// Dummy data for initial structure - replace with actual data fetching
const dummyQuestions: Question[] = [
  {
    id: '1',
    category: 'Constitutional Law',
    question: {
      en: 'Which article of the Constitution of Nepal guarantees the right to freedom?',
      ne: 'नेपालको संविधानको कुन धाराले स्वतन्त्रताको हकको प्रत्याभूति गरेको छ?',
    },
    options: {
      en: ['Article 16', 'Article 17', 'Article 18', 'Article 19'],
      ne: ['धारा १६', 'धारा १७', 'धारा १८', 'धारा १९'],
    },
    correctAnswer: {
      en: 'Article 17',
      ne: 'धारा १७',
    },
  },
  {
    id: '2',
    category: 'Legal Theory',
    question: {
      en: 'Who is considered the father of the theory of Natural Law?',
      ne: 'प्राकृतिक कानूनको सिद्धान्तका पिता कसलाई मानिन्छ?',
    },
    options: {
      en: ['John Austin', 'Thomas Aquinas', 'Jeremy Bentham', 'H.L.A. Hart'],
      ne: ['जोन अस्टिन', 'थोमस एक्विनास', 'जेरेमी बेन्थम', 'एच.एल.ए. हार्ट'],
    },
    correctAnswer: {
      en: 'Thomas Aquinas',
      ne: 'थोमस एक्विनास',
    },
  },
   {
    id: '3',
    category: 'Criminal Law',
    question: {
      en: 'What does "mens rea" refer to in criminal law?',
      ne: 'फौजदारी कानूनमा "मेन्स रिया" भन्नाले के बुझिन्छ?',
    },
    options: {
      en: ['The guilty act', 'The guilty mind', 'The burden of proof', 'The standard of proof'],
      ne: ['दोषपूर्ण कार्य', 'दोषपूर्ण मनसाय', 'प्रमाणको भार', 'प्रमाणको स्तर'],
    },
    correctAnswer: {
      en: 'The guilty mind',
      ne: 'दोषपूर्ण मनसाय',
    },
  },
];

export default function QuizPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate fetching questions
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        // Assume API returns questions in the format of `dummyQuestions`
        setQuestions(dummyQuestions);
      } catch (err) {
         console.error("Failed to fetch questions:", err);
         setError("Failed to load questions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const renderContent = () => {
      if (loading) {
        return <QuizLoadingSkeleton />;
      }

      if (error) {
        return (
          <div className="flex flex-1 items-center justify-center p-4 text-center">
            <p className="text-destructive text-lg">{error}</p>
          </div>
        );
      }

      if (questions.length === 0) {
         return (
           <div className="flex flex-1 items-center justify-center p-4 text-center">
             <p className="text-muted-foreground text-lg">No questions available at the moment.</p>
           </div>
         );
       }
      return <QuizClient questions={questions} />;
  }

  return (
      <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <main className="flex flex-1">
             {renderContent()}
          </main>
           {/* Optionally add a footer if needed for public pages */}
           {/* <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
               NyayaPrep &copy; {new Date().getFullYear()}
           </footer> */}
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
