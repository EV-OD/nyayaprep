
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'; // Import Card components

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
  const [canTakeQuiz, setCanTakeQuiz] = React.useState<boolean | null>(null); // Use null for initial state
  const [loadingAuth, setLoadingAuth] = React.useState(true);
  const [limitExceeded, setLimitExceeded] = React.useState(false);
  const [quizCountToday, setQuizCountToday] = React.useState(0);
  const [quizLimit, setQuizLimit] = React.useState(0);
  const [validationNeeded, setValidationNeeded] = React.useState(false);
  const [quizActive, setQuizActive] = React.useState(false); // New state to track if quiz is active/just finished

  const router = useRouter();

  // 1. Check Authentication and User Profile
  useEffect(() => {
    setLoadingAuth(true);
    setCanTakeQuiz(null); // Reset eligibility check on auth change
    setLimitExceeded(false);
    setValidationNeeded(false);
    setQuizActive(false); // Reset quiz active state

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
            } else {
               // Reset count if not today
               todayCount = 0;
            }
            setQuizCountToday(todayCount);

            const isPaidAndNotValidated = profile.subscription !== 'free' && !profile.validated;
            const isOverLimit = limit !== Infinity && todayCount >= limit;

            if (isPaidAndNotValidated) {
               setCanTakeQuiz(false);
               setValidationNeeded(true);
               console.log(`User ${user.uid} needs validation for ${profile.subscription} plan.`);
            } else if (isOverLimit) {
               setCanTakeQuiz(false);
               setLimitExceeded(true); // Set limit exceeded here
               console.log(`User ${user.uid} reached daily quiz limit.`);
            } else {
               setCanTakeQuiz(true); // Can take quiz initially
               console.log(`User ${user.uid} can take a quiz. Count: ${todayCount}, Limit: ${limit}`);
            }
          } else {
            // Profile not found
            setCanTakeQuiz(false);
            setError("User profile not found. Cannot start quiz.");
            console.warn(`Profile not found for UID: ${user.uid}`);
          }
        } catch (err) {
          console.error("Failed to fetch user profile for quiz check:", err);
          setError("Could not verify your quiz eligibility. Please try again.");
          setCanTakeQuiz(false);
        }
      } else {
        // Not logged in - allow guests to take quiz (results not saved)
        setUserProfile(null);
        setCanTakeQuiz(true);
        setQuizLimit(QUIZ_LIMITS.free);
        setQuizCountToday(0);
        console.log("Guest user can take a quiz.");
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Questions only if allowed
  useEffect(() => {
    // Wait until auth check is complete AND eligibility is determined (not null)
    if (loadingAuth || canTakeQuiz === null) {
      setLoading(false); // Don't show question loading skeleton yet
      return;
    }

    if (!canTakeQuiz) {
        setLoading(false); // Stop loading if not allowed initially
        return;
    }

    // If allowed to take quiz, start fetching and set quizActive
    setQuizActive(true); // Mark quiz as active
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching random questions...");
        const fetchedQuestions = await getRandomMcqs(NUMBER_OF_QUESTIONS);
        if (fetchedQuestions.length === 0) {
          setError("No questions available to start a quiz at this moment.");
           console.warn("No questions fetched from getRandomMcqs.");
           setQuizActive(false); // Set quiz inactive if no questions found
        } else if (fetchedQuestions.length < NUMBER_OF_QUESTIONS) {
          console.warn(`Fetched only ${fetchedQuestions.length} questions, less than required ${NUMBER_OF_QUESTIONS}.`);
          setQuestions(fetchedQuestions);
        } else {
          setQuestions(fetchedQuestions);
          console.log("Successfully fetched questions.");
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError("Failed to load questions due to a database error. Please try again later.");
         setQuizActive(false); // Set quiz inactive on fetch error
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [loadingAuth, canTakeQuiz]); // Rerun when auth/eligibility changes

  // Function to call after quiz submission
  const handleQuizSubmit = async () => {
    if (currentUser) {
      try {
        console.log(`Updating quiz usage for user: ${currentUser.uid}`);
        // The updateUserQuizUsage function internally checks the date and increments/resets
        await updateUserQuizUsage(currentUser.uid);

        // Update local state immediately for feedback, although it might cause flicker
        // Fetch profile again to get the absolute latest count after update
        const updatedProfile = await getUserProfile(currentUser.uid);
        if (updatedProfile) {
            const newCount = updatedProfile.quizCountToday || 0;
            setQuizCountToday(newCount); // Update local state with accurate count
             const limit = QUIZ_LIMITS[updatedProfile.subscription];
             if (limit !== Infinity && newCount >= limit) {
                 setLimitExceeded(true); // Set limitExceeded *after* submitting
                 // We don't set canTakeQuiz = false here, let the next page load handle eligibility
                 console.log(`User ${currentUser.uid} reached limit after submission.`);
             }
        }
        console.log(`Quiz usage updated for user: ${currentUser.uid}.`);
      } catch (err) {
        console.error("Failed to update quiz usage:", err);
        // Handle error, maybe notify user but let quiz submission proceed
      }
    }
    // Navigation happens inside QuizClient after saving results if needed, or user clicks button
    // Set quizActive to false maybe? Or let the component lifecycle handle it?
    // Let lifecycle handle it for now.
  };


  const renderContent = () => {
    // Show loading skeleton during auth check or initial eligibility check
     if (loadingAuth || canTakeQuiz === null) {
       return <QuizLoadingSkeleton />;
     }

    // If quiz is active (started or finished), render QuizClient to handle display
    if (quizActive) {
       // Show loading skeleton only if questions are still loading *while* active
       if (loading) {
           return <QuizLoadingSkeleton />;
       }
       // Render QuizClient if questions are ready or if there was an error loading them (QuizClient might show error)
       if (questions.length > 0 || error) {
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
         // Fallback if active but no questions and no error yet (should be brief)
         return <QuizLoadingSkeleton />;
    }

    // --- If Quiz is NOT active, check for blocking conditions ---

     if (validationNeeded && currentUser) {
         return (
            <div className="flex flex-1 items-center justify-center p-4 text-center">
                <Card className="w-full max-w-md text-center p-6 md:p-8 rounded-xl shadow-lg border">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                            <Lock className="h-6 w-6" /> Validation Required
                        </CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Your <span className="font-medium capitalize">{userProfile?.subscription}</span> plan requires validation to access quizzes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6">Please complete the payment verification process outlined in your dashboard.</p>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
                        <Link href="/dashboard" passHref>
                            <Button variant="outline" size="lg"><ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
         );
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

    if (error && !quizActive) { // Show general error only if quiz wasn't active
      return (
        <div className="flex flex-1 items-center justify-center p-4 text-center">
           <Alert variant="destructive" className="max-w-lg">
             <AlertTriangle className="h-4 w-4" />
             <AlertTitle>Error</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
              <Link href={currentUser ? "/dashboard" : "/"} className="mt-4 inline-block">
                 <Button variant="secondary" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
              </Link>
           </Alert>
        </div>
      );
    }

    // Fallback if eligibility check is done, user CAN take quiz, but questions aren't ready yet and no error (should be brief)
     if (canTakeQuiz && !loading && questions.length === 0 && !error && !quizActive) {
       return (
         <div className="flex flex-1 items-center justify-center p-4 text-center">
           <Alert variant="default" className="max-w-lg">
             <AlertTitle>Quiz Unavailable</AlertTitle>
             <AlertDescription>No questions are available for a quiz right now. Please try again later.</AlertDescription>
             <Link href={currentUser ? "/dashboard" : "/"} className="mt-4 inline-block">
               <Button variant="secondary" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Go Back</Button>
             </Link>
           </Alert>
         </div>
       );
     }

    // Default fallback (should ideally not be reached often)
    return (
         <div className="flex flex-1 items-center justify-center p-4 text-center">
             <p className="text-muted-foreground">Loading quiz status...</p>
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
