
'use client';

import * as React from 'react';
import { QuizClient } from '@/components/quiz/quiz-client';
import type { Question } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For error display
import { AlertTriangle } from 'lucide-react'; // Icon for error

// Dummy data for initial structure - REPLACE with actual data fetching
// Make sure dummy data has at least 10 questions if possible for testing
const dummyQuestions: Question[] = [
  // Add 10 questions here... (example below)
  {
    id: '1', category: 'Constitutional Law', question: { en: 'Question 1 EN?', ne: 'Question 1 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'A', ne: 'क' }
  },
  {
    id: '2', category: 'Criminal Law', question: { en: 'Question 2 EN?', ne: 'Question 2 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'B', ne: 'ख' }
  },
   {
    id: '3', category: 'Legal Theory', question: { en: 'Question 3 EN?', ne: 'Question 3 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'C', ne: 'ग' }
  },
    {
    id: '4', category: 'Procedural Law', question: { en: 'Question 4 EN?', ne: 'Question 4 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'D', ne: 'घ' }
  },
      {
    id: '5', category: 'Constitutional Law', question: { en: 'Question 5 EN?', ne: 'Question 5 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'A', ne: 'क' }
  },
      {
    id: '6', category: 'Criminal Law', question: { en: 'Question 6 EN?', ne: 'Question 6 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'B', ne: 'ख' }
  },
     {
    id: '7', category: 'Legal Theory', question: { en: 'Question 7 EN?', ne: 'Question 7 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'C', ne: 'ग' }
  },
    {
    id: '8', category: 'Procedural Law', question: { en: 'Question 8 EN?', ne: 'Question 8 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'D', ne: 'घ' }
  },
      {
    id: '9', category: 'Constitutional Law', question: { en: 'Question 9 EN?', ne: 'Question 9 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'A', ne: 'क' }
  },
    {
    id: '10', category: 'Criminal Law', question: { en: 'Question 10 EN?', ne: 'Question 10 NE?' },
    options: { en: ['A', 'B', 'C', 'D'], ne: ['क', 'ख', 'ग', 'घ'] }, correctAnswer: { en: 'B', ne: 'ख' }
  },
  // Add more questions if your total pool is larger than 10
];

// Function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array: Question[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};


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
        // Replace with actual API call to fetch a pool of questions
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

        // --- LOGIC TO GET EXACTLY 10 QUESTIONS ---
        // 1. Fetch a larger pool (e.g., all questions or questions from selected categories)
        const fetchedPool = dummyQuestions; // Replace with actual fetched data

        if (fetchedPool.length < 10) {
            console.warn("Not enough questions in the pool to form a 10-question quiz.");
            // Handle this case: maybe show an error or use fewer questions?
            setQuestions(fetchedPool); // Use whatever is available for now
            if (fetchedPool.length === 0) {
                 setError("No questions available to start a quiz.");
            }
        } else {
            // 2. Shuffle the pool
            const shuffledPool = shuffleArray([...fetchedPool]); // Create a copy before shuffling

            // 3. Take the first 10 questions
            const selectedQuestions = shuffledPool.slice(0, 10);
            setQuestions(selectedQuestions);
        }
        // --- END OF 10 QUESTIONS LOGIC ---

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
             <Alert variant="destructive" className="max-w-lg">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>Error Loading Quiz</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          </div>
        );
      }

      // Check if questions array is empty *after* loading and potential error setting
      if (questions.length === 0 && !error) {
         return (
           <div className="flex flex-1 items-center justify-center p-4 text-center">
              <Alert className="max-w-lg">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle>No Questions Available</AlertTitle>
               <AlertDescription>We couldn't find any questions for your quiz right now. Please try again later.</AlertDescription>
             </Alert>
           </div>
         );
       }

      // Only render QuizClient if questions are loaded successfully
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
