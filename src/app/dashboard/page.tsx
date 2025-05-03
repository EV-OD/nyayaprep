
'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, AlertTriangle, MessageSquare, RefreshCw, Lock } from 'lucide-react'; // Added Lock
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    getUserProfile,
    getUserQuizResults,
    updateAskTeacherUsage,
    saveTeacherQuestion,
    getUserTeacherQuestions,
    clearUserNotifications,
    handleSubscriptionExpiry,
    calculateUserPerformanceStats,
    UserPerformanceStats,
} from '@/lib/firebase/firestore';
import type { UserProfile, QuizResult, SubscriptionPlan, TeacherQuestion } from '@/types/user';
import { isToday, format } from 'date-fns'; // Removed differenceInDays as it's handled in profile page
import { AskTeacherDialog } from '@/components/user/ask-teacher-dialog';
import { useToast } from '@/hooks/use-toast';

// Import refactored components
import { WelcomeCard } from '@/components/dashboard/WelcomeCard';
import { ScoreCard } from '@/components/dashboard/ScoreCard';
import { StartQuizCard } from '@/components/dashboard/StartQuizCard';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { NotesResourcesCard } from '@/components/dashboard/NotesResourcesCard';
import { VideoLecturesCard } from '@/components/dashboard/VideoLecturesCard';
import { AnswerHistoryCard } from '@/components/dashboard/AnswerHistoryCard';
import { PerformanceAnalyticsCard } from '@/components/dashboard/PerformanceAnalyticsCard';
import { AskTeacherCard } from '@/components/dashboard/AskTeacherCard';
import { MyQuestionsCard } from '@/components/dashboard/MyQuestionsCard';
import { SubscriptionSkeleton, MyQuestionsSkeleton, AnswerHistorySkeleton, PerformanceAnalyticsSkeleton } from '@/components/dashboard/skeletons'; // Import skeletons

// Keep subscription details and WhatsApp number here as they are config-like
const WHATSAPP_NUMBER = '+977 986-0249284'; // Placeholder number

const subscriptionDetails: Record<SubscriptionPlan, { name: string; features: { text: string; included: boolean }[]; colorClass: string; price: string, askLimit: number, quizLimit: number | Infinity }> = {
    free: {
        name: 'Free',
        features: [
          { text: '2 Quizzes per day (10 questions each)', included: true },
          { text: 'Answer History Tracking', included: false },
          { text: 'Performance Analytics', included: false },
          { text: 'Downloadable Notes & PDFs', included: false },
          { text: 'Ask Teacher (0 questions/day)', included: false },
          { text: 'Basic Support', included: true },
        ],
        colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
        price: 'NRS 0',
        askLimit: 0,
        quizLimit: 2,
    },
    basic: {
        name: 'Basic',
        features: [
          { text: '5 Quizzes per day (10 questions each)', included: true },
          { text: 'Answer History Tracking', included: false },
          { text: 'Performance Analytics', included: false },
          { text: 'Downloadable Notes & PDFs', included: false },
          { text: 'Ask Teacher (2 questions/day)', included: true },
          { text: 'Basic Support', included: true },
        ],
        colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
        price: 'NRS 50 / week',
        askLimit: 2,
        quizLimit: 5,
    },
    premium: {
        name: 'Premium',
        features: [
          { text: 'Unlimited Quizzes (10 questions each)', included: true },
          { text: 'Answer History Tracking', included: true },
          { text: 'Performance Analytics', included: true },
          { text: 'Downloadable Notes & PDFs', included: true },
          { text: 'Ask Teacher (20 questions/day)', included: true },
          { text: 'Priority Support', included: true },
        ],
        colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
        price: 'NRS 100 / week',
        askLimit: 20,
        quizLimit: Infinity,
    },
};


export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [performanceStats, setPerformanceStats] = useState<UserPerformanceStats | null>(null);
  const [teacherQuestions, setTeacherQuestions] = useState<TeacherQuestion[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [loadingTeacherQuestions, setLoadingTeacherQuestions] = useState(true);
  const [isAskTeacherDialogOpen, setIsAskTeacherDialogOpen] = useState(false);
  const [canAskTeacher, setCanAskTeacher] = useState(false);
  const [askTeacherUsage, setAskTeacherUsage] = useState(0);
  const [isValidated, setIsValidated] = useState(false);
  const [hasSubscriptionExpired, setHasSubscriptionExpired] = useState(false); // State for expiry
  const router = useRouter();
  const { toast } = useToast();
  const myQuestionsRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        setLoadingResults(true);
        setLoadingTeacherQuestions(true);
        try {
          const expired = await handleSubscriptionExpiry(currentUser.uid);
          setHasSubscriptionExpired(expired); // Store expiry status
          if (expired) {
              toast({ variant: "destructive", title: "Subscription Expired", description: "Your access has been updated. Please renew your subscription." });
          }

          // Fetch potentially updated profile
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);

          if (userProfile) {
             setIsValidated(userProfile.validated); // Update validation state
             setUnreadNotifications(userProfile.unreadNotifications || 0);

             // Determine if features should be enabled based on VALIDATED status (except for free plan)
             const featuresEnabled = userProfile.subscription === 'free' || userProfile.validated;

             // Fetch data based on subscription AND validation status
             const [allQuizResults, fetchedTeacherQuestions, fetchedStats] = await Promise.all([
                  (userProfile.subscription === 'premium' && featuresEnabled) ? getUserQuizResults(currentUser.uid) : Promise.resolve([]),
                  ((userProfile.subscription === 'basic' || userProfile.subscription === 'premium') && featuresEnabled) ? getUserTeacherQuestions(currentUser.uid) : Promise.resolve([]),
                  (userProfile.subscription === 'premium' && featuresEnabled) ? calculateUserPerformanceStats(currentUser.uid) : Promise.resolve(null)
             ]);
             setResults(allQuizResults);
             setTeacherQuestions(fetchedTeacherQuestions);
             setPerformanceStats(fetchedStats);

             // Calculate Ask Teacher limits based on validation
             const askLimit = subscriptionDetails[userProfile.subscription]?.askLimit ?? 0;
             const todayAskUsage = userProfile.lastAskTeacherDate && isToday(userProfile.lastAskTeacherDate.toDate())
               ? userProfile.askTeacherCount || 0
               : 0;
             setAskTeacherUsage(todayAskUsage);
             setCanAskTeacher(todayAskUsage < askLimit && featuresEnabled && (userProfile.subscription === 'basic' || userProfile.subscription === 'premium'));

          } else {
             // Handle profile not found case
             setProfile(null);
             setResults([]);
             setTeacherQuestions([]);
             setPerformanceStats(null);
             setCanAskTeacher(false);
             setUnreadNotifications(0);
             setIsValidated(false);
             console.warn("User profile not found for UID:", currentUser.uid);
             // Optionally redirect or show an error state
          }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            const firebaseError = error as Error;
             if (firebaseError.message.includes('Firestore Query Requires Index')) {
                 console.warn('Dashboard data loading delayed due to Firestore index creation/update.');
             } else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to load some dashboard data.' });
             }
        } finally {
          setLoadingProfile(false);
          setLoadingResults(false);
          setLoadingTeacherQuestions(false);
        }
      } else {
        // User logged out
        setProfile(null);
        setResults([]);
        setPerformanceStats(null);
        setTeacherQuestions([]);
        setUnreadNotifications(0);
        setCanAskTeacher(false);
        setIsValidated(false);
        setHasSubscriptionExpired(false);
        setLoadingProfile(false);
        setLoadingResults(false);
        setLoadingTeacherQuestions(false);
      }
    });
    return () => unsubscribe();
  }, [toast]); // Added toast dependency

  const handleAskQuestionSubmit = async (questionText: string) => {
      if (!profile || !user || !canAskTeacher) return; // Rely on canAskTeacher state

       const newCount = askTeacherUsage + 1;
       try {
            await saveTeacherQuestion(user.uid, questionText, profile.name, profile.email);
            await updateAskTeacherUsage(profile.uid, newCount);

            setAskTeacherUsage(newCount); // Update local usage count
            const limit = subscriptionDetails[profile.subscription]?.askLimit || 0;
            setCanAskTeacher(newCount < limit && isValidated); // Recalculate canAskTeacher

            // Refresh questions list
            setLoadingTeacherQuestions(true);
            const updatedQuestions = await getUserTeacherQuestions(user.uid);
            setTeacherQuestions(updatedQuestions);
            setLoadingTeacherQuestions(false);

           toast({ title: 'Question Submitted', description: 'Your question has been sent to the teacher.' });
           setIsAskTeacherDialogOpen(false);
       } catch (error) {
            console.error("Failed to submit question or update usage:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit your question.' });
       }
   };

  const handleNotificationClick = async () => {
      if (myQuestionsRef.current) {
          myQuestionsRef.current.scrollIntoView({ behavior: 'smooth' });
          if (user && unreadNotifications > 0) {
              try {
                  await clearUserNotifications(user.uid);
                  setUnreadNotifications(0); // Optimistically update UI
              } catch (error) {
                  console.error("Failed to clear notifications:", error);
                  toast({ variant: 'destructive', title: 'Error', description: 'Could not clear notifications.' });
              }
          }
      }
  };

    const handleUpgradeClick = () => {
       if (!user) {
           router.push('/login?redirect=/pricing');
       } else {
            // If logged in, always go to pricing to choose plan
            // Pricing page will handle redirect to payment if needed
            router.push('/pricing');
       }
    };

     // Determine alert to show based on validation status and expiry
     const getValidationAlert = () => {
          if (!profile || profile.subscription === 'free') return null;

          if (hasSubscriptionExpired) { // Use the state set by handleSubscriptionExpiry
              return (
                 <Alert variant="destructive" className="border-red-500 bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700 [&>svg]:text-red-600 dark:[&>svg]:text-red-400">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle className="font-semibold">Subscription Expired</AlertTitle>
                     <AlertDescription>
                         Your {profile.subscription} plan has expired. Please renew to regain access to features.
                         <Button variant="link" size="sm" className="p-0 h-auto ml-2 text-xs text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" onClick={handleUpgradeClick}>
                             <RefreshCw className="mr-1 h-3 w-3"/> Renew Now
                         </Button>
                     </AlertDescription>
                 </Alert>
              );
          } else if (!isValidated) {
               // Not expired but pending validation
              return (
                   <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle className="font-semibold">Account Pending Validation</AlertTitle>
                     <AlertDescription>
                       Your <span className="font-medium">{profile.subscription}</span> plan payment needs verification. Please send your payment screenshot to our WhatsApp:
                        <strong className="ml-1">{WHATSAPP_NUMBER}</strong>.
                       <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block">
                           <Button variant="link" size="sm" className="p-0 h-auto text-xs text-yellow-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200">
                               <MessageSquare className="mr-1 h-3 w-3"/> Send on WhatsApp
                           </Button>
                       </a>
                     </AlertDescription>
                   </Alert>
               );
          }
          return null; // Validated and not expired
     };

     // Determine locking based on validation and subscription plan
     const featuresLocked = !profile || (profile.subscription !== 'free' && !isValidated); // Locked if paid and not validated
     const contentLocked = !profile || (profile.subscription !== 'premium' || featuresLocked); // Locked if not premium OR features locked
     const historyAndAnalyticsLocked = !profile || (profile.subscription !== 'premium' || featuresLocked); // Locked if not premium OR features locked
     const askTeacherLocked = !profile || ((profile.subscription !== 'basic' && profile.subscription !== 'premium') || featuresLocked); // Locked if not basic/premium OR features locked

     const currentPlan = profile?.subscription || 'free';
     const askLimit = subscriptionDetails[currentPlan]?.askLimit ?? 0;
     const askLimitReached = askTeacherUsage >= askLimit;


  return (
    <div className="p-6 md:p-10 space-y-8">
       {/* Dashboard Header Row */}
       <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>
          <div className="relative">
              <Button variant="ghost" size="icon" onClick={handleNotificationClick} className="relative">
                   <Bell size={20} />
                   {unreadNotifications > 0 && (
                       <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                           {unreadNotifications}
                       </span>
                   )}
              </Button>
          </div>
       </div>

      {/* Validation / Expiry Alert */}
       {getValidationAlert()}


       {/* First Row: Welcome, Score, Start Quiz */}
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <WelcomeCard profile={profile} loading={loadingProfile} />
            <ScoreCard
                profile={profile}
                isValidated={isValidated} // Pass validation status
                loading={loadingResults}
                results={results}
                performanceStats={performanceStats}
                onUpgradeClick={handleUpgradeClick}
            />
            <StartQuizCard
                profile={profile}
                isValidated={isValidated}
                featuresLocked={featuresLocked}
            />
       </div>


      {/* Second Row: Subscription Details Card */}
      <div className="grid gap-6 lg:grid-cols-1">
         <SubscriptionCard
            profile={profile}
            isValidated={isValidated} // Pass validation status
            loading={loadingProfile}
            subscriptionDetails={subscriptionDetails}
            onUpgradeClick={handleUpgradeClick}
         />
      </div>


      {/* Third Row: Notes/Resources, Videos */}
      <div className="grid gap-6 md:grid-cols-2">
            <NotesResourcesCard locked={contentLocked} onUpgradeClick={handleUpgradeClick} />
            <VideoLecturesCard locked={contentLocked} onUpgradeClick={handleUpgradeClick} />
       </div>

        {/* Fourth Row: Answer History & Performance Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
            <AnswerHistoryCard
                locked={historyAndAnalyticsLocked}
                loading={loadingResults}
                results={results}
                onUpgradeClick={handleUpgradeClick}
            />
            <PerformanceAnalyticsCard
                locked={historyAndAnalyticsLocked}
                loading={loadingResults}
                performanceStats={performanceStats}
                onUpgradeClick={handleUpgradeClick}
            />
        </div>


       {/* Fifth Row: Ask Teacher & My Questions */}
       <div className="grid gap-6 lg:grid-cols-2">
            <AskTeacherCard
                locked={askTeacherLocked} // Use specific lock state for this feature
                featuresLocked={featuresLocked} // Pass general feature lock state
                profile={profile}
                limit={askLimit}
                usage={askTeacherUsage}
                limitReached={askLimitReached}
                onAskClick={() => setIsAskTeacherDialogOpen(true)}
                onUpgradeClick={handleUpgradeClick}
            />
            <MyQuestionsCard
                ref={myQuestionsRef} // Pass the ref here
                locked={askTeacherLocked} // Use specific lock state
                featuresLocked={featuresLocked} // Pass general feature lock state
                loading={loadingTeacherQuestions}
                questions={teacherQuestions}
                profile={profile}
                onUpgradeClick={handleUpgradeClick}
            />
       </div>

        {/* Ask Teacher Dialog */}
         {profile && (
             <AskTeacherDialog
                 isOpen={isAskTeacherDialogOpen}
                 onClose={() => setIsAskTeacherDialogOpen(false)}
                 onSubmit={handleAskQuestionSubmit}
                 limit={askLimit}
                 usage={askTeacherUsage}
                 planName={profile.subscription || 'free'}
             />
         )}

    </div>
  );
}
