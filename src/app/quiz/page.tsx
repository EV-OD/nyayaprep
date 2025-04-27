
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizClient } from '@/components/quiz/quiz-client';
import type { Question } from '@/types/quiz';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock, Clock, ArrowLeft } from 'lucide-react';
import { getRandomMcqs, getUserProfile, updateUserQuizUsage } from '@/lib/firebase/firestore'; // Import Firestore functions
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { isToday } from 'date-fns';
import type { UserProfile, SubscriptionPlan } from '@/types/user';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link

const NUMBER_OF_QUESTIONS = 10; // Define the number of questions for a quiz

const QUIZ_LIMITS: Record<SubscriptionPlan, number> = {
  free: 2,
  basic: 5,
  premium: Infinity, // Unlimited
};

export default function QuizPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [canTakeQuiz, setCanTakeQuiz] = React.useState(false);
  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [limitExceeded, setLimitExceeded] = React.useState(false);
  const [quizCountToday, setQuizCountToday] = React.useState(0);
  const [quizLimit, setQuizLimit] = React.useState(0);

  const router = useRouter();

  // 1. Check Authentication and User Profile
  useEffect(() => {
    setLoadingAuth(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
          if (profile) {
            const limit = QUIZ_LIMITS[profile.subscription];
            setQuizLimit(limit);
            let todayCount = 0;
            // Reset count if last quiz was not today
            if (profile.lastQuizDate && isToday(profile.lastQuizDate.toDate())) {
              todayCount = profile.quizCountToday || 0;
            }
            setQuizCountToday(todayCount);

            const allowedToTake = todayCount < limit && profile.validated;
            setCanTakeQuiz(allowedToTake);
            setLimitExceeded(!allowedToTake && profile.validated); // Limit exceeded only if validated but over limit
          } else {
            // Profile not found, treat as unable to take quiz
            setCanTakeQuiz(false);
            setLimitExceeded(true); // Or handle differently? Maybe redirect?
            setError("User profile not found. Cannot start quiz.");
          }
        } catch (err) {
          console.error("Failed to fetch user profile for quiz check:", err);
          setError("Could not verify your quiz eligibility. Please try again.");
          setCanTakeQuiz(false);
        }
      } else {
        // Not logged in, can take quiz (but results won't be saved)
        // Or implement guest limit? For now, allow taking quiz but no saving.
        setUserProfile(null);
        setCanTakeQuiz(true); // Allow guests to take quizzes
        setLimitExceeded(false);
        setQuizLimit(QUIZ_LIMITS.free); // Assume guest uses free limit? Or a separate guest limit?
        setQuizCountToday(0); // Guests don't have saved counts
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Questions only if allowed
  useEffect(() => {
    if (loadingAuth || !canTakeQuiz) {
      if (!loadingAuth && !canTakeQuiz && currentUser && !limitExceeded) {
        // User is logged in but cannot take quiz (e.g., not validated)
        // LimitExceeded state already handles the daily limit case
        setError(`Your ${userProfile?.subscription || 'paid'} plan requires validation to take quizzes. Please check your dashboard.`);
      }
       setLoading(false); // Don't show question loading if not allowed or still checking auth
       return; // Don't fetch if auth loading or not allowed
    }

    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await getRandomMcqs(NUMBER_OF_QUESTIONS);
        if (fetchedQuestions.length === 0) {
          setError("No questions available to start a quiz at this moment.");
        } else if (fetchedQuestions.length < NUMBER_OF_QUESTIONS) {
          console.warn(`Fetched only ${fetchedQuestions.length} questions, less than required ${NUMBER_OF_QUESTIONS}.`);
          setQuestions(fetchedQuestions);
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
  }, [loadingAuth, canTakeQuiz, currentUser, limitExceeded, userProfile]); // Rerun when auth/eligibility changes

  // Function to call after quiz submission
  const handleQuizSubmit = async () => {
    if (currentUser) {
      try {
        await updateUserQuizUsage(currentUser.uid);
        // Optionally update local state if needed, though re-fetch on dashboard is safer
        setQuizCountToday(prev => prev + 1);
        if (quizCountToday + 1 >= quizLimit) {
            setLimitExceeded(true);
            setCanTakeQuiz(false);
        }
        console.log("Quiz usage updated for user:", currentUser.uid);
      } catch (err) {
        console.error("Failed to update quiz usage:", err);
        // Handle error, maybe notify user but let quiz submission proceed
      }
    }
    // Navigation happens inside QuizClient after saving results
  };


  const renderContent = () => {
    if (loadingAuth || loading) {
      return <QuizLoadingSkeleton />;
    }

     if (limitExceeded && currentUser) {
        return (
          <div className="flex flex-1 items-center justify-center p-4 text-center">
            <Card className="w-full max-w-md text-center p-6 md:p-8 rounded-xl shadow-lg border">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
                        <Clock className="h-6 w-6" /> Daily Limit Reached
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        You have reached your daily quiz limit of {quizLimit} for the <span className="font-medium capitalize">{userProfile?.subscription}</span> plan.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-6">Please come back tomorrow to take more quizzes or upgrade your plan for unlimited access.</p>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
                    <Link href="/dashboard" passHref>
                        <Button variant="outline" size="lg"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Button>
                    </Link>
                    {userProfile?.subscription !== 'premium' && (
                        <Link href="/pricing" passHref>
                            <Button size="lg">Upgrade Plan</Button>
                        </Link>
                    )}
                </CardFooter>
            </Card>
          </div>
        );
     }

    if (error) {
      return (
        <div className="flex flex-1 items-center justify-center p-4 text-center">
           <Alert variant="destructive" className="max-w-lg">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error Loading Quiz</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
              <Link href="/dashboard" className="mt-4 inline-block">
                 <Button variant="secondary" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard</Button>
              </Link>
           </Alert>
        </div>
      );
    }

    // Render QuizClient only if questions are loaded and allowed
    if (questions.length > 0 && canTakeQuiz) {
        return (
          <div className="flex flex-col items-center justify-center flex-1 w-full p-4 md:p-8"> {/* Make parent full width */}
             <QuizClient
                questions={questions}
                onQuizSubmit={handleQuizSubmit} // Pass the submit handler
                userId={currentUser?.uid || null} // Pass user ID
             />
          </div>
        );
    }

    // Fallback if questions aren't ready but no error/limit exceeded (should be rare)
    return (
         <div className="flex flex-1 items-center justify-center p-4 text-center">
             <p className="text-muted-foreground">Preparing your quiz...</p>
         </div>
     );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
       <main className="flex flex-1 flex-col items-center justify-center"> {/* Center content vertically and horizontally */}
         {renderContent()}
       </main>
       {/* Footer can be added if needed */}
    </div>
  );
}


function QuizLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-4 md:p-8">
      <div className="w-full max-w-3xl bg-card p-6 md:p-8 rounded-xl shadow-lg border">
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


import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; // Import Card components

