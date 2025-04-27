
'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react'; // Added useRef, useMemo
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Import Accordion
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    getUserProfile,
    getUserQuizResults, // Fetch all results for history/stats
    updateAskTeacherUsage,
    saveTeacherQuestion,
    getUserTeacherQuestions,
    clearUserNotifications,
    handleSubscriptionExpiry,
    calculateUserPerformanceStats, // Import stats calculation function
    UserPerformanceStats, // Import stats type
} from '@/lib/firebase/firestore'; // Added functions
import type { UserProfile, QuizResult, SubscriptionPlan, TeacherQuestion, Answer } from '@/types/user'; // Import TeacherQuestion, Answer
import { formatDistanceToNow, isToday, format, differenceInDays } from 'date-fns'; // Added format, differenceInDays
import { FileText, User as UserIcon, Target, Star, Zap, AlertTriangle, MessageSquare, CheckCircle, Lock, Newspaper, Video, History, BarChart2, X, ExternalLink, MessageSquareQuote, HelpCircle, Clock, Check, Bell, CalendarClock, RefreshCw, BookOpen, TrendingUp,XCircle } from 'lucide-react'; // Added Bell, CalendarClock, RefreshCw, BookOpen, TrendingUp icons
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AskTeacherDialog } from '@/components/user/ask-teacher-dialog'; // Import AskTeacherDialog
import { useToast } from '@/hooks/use-toast'; // Import useToast
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart" // Import chart components
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts" // Import recharts components

// WhatsApp number for validation
const WHATSAPP_NUMBER = '+97798XXXXXXXX'; // Placeholder number

// Updated Subscription details including color classes and features
const subscriptionDetails: Record<SubscriptionPlan, { name: string; features: { text: string; included: boolean }[]; colorClass: string; price: string, askLimit: number }> = {
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
        colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', // Gray for Free
        price: 'NRS 0',
        askLimit: 0,
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
        colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', // Green for Basic
        price: 'NRS 50 / week',
        askLimit: 2,
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
        colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', // Gold/Yellow for Premium
        price: 'NRS 100 / week',
        askLimit: 20,
    },
};


export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]); // Stores all fetched results for history/stats
  const [performanceStats, setPerformanceStats] = useState<UserPerformanceStats | null>(null); // State for performance stats
  const [teacherQuestions, setTeacherQuestions] = useState<TeacherQuestion[]>([]); // State for user's asked questions
  const [unreadNotifications, setUnreadNotifications] = useState(0); // State for notification count
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true); // Combined loading for results/stats
  const [loadingTeacherQuestions, setLoadingTeacherQuestions] = useState(true); // Loading state for teacher questions
  const [isAskTeacherDialogOpen, setIsAskTeacherDialogOpen] = useState(false);
  const [canAskTeacher, setCanAskTeacher] = useState(false); // State to control if user can ask based on limit
  const [askTeacherUsage, setAskTeacherUsage] = useState(0); // Current usage count for the day
  const [isValidated, setIsValidated] = useState(false); // Local state for validation status after check
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast
  const myQuestionsRef = useRef<HTMLDivElement>(null); // Ref for scrolling


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        setLoadingResults(true);
        setLoadingTeacherQuestions(true); // Start loading teacher questions
        try {
          // --- Check for subscription expiry first ---
          const expired = await handleSubscriptionExpiry(currentUser.uid);
          if (expired) {
              toast({ variant: "destructive", title: "Subscription Expired", description: "Your access has been updated. Please renew your subscription." });
          }

          // --- Fetch potentially updated profile ---
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);

          if (userProfile) {
             setIsValidated(userProfile.validated); // Set local validation state
             setUnreadNotifications(userProfile.unreadNotifications || 0); // Set notification count

             // --- Check validation status for features ---
             const featuresEnabled = userProfile.validated;

             // Fetch results and teacher questions based on current plan and validation status
             const [allQuizResults, fetchedTeacherQuestions, fetchedStats] = await Promise.all([
                  // Fetch ALL results if Premium and VALIDATED for history/stats
                  (userProfile.subscription === 'premium' && featuresEnabled) ? getUserQuizResults(currentUser.uid) : Promise.resolve([]),
                  // Fetch teacher questions if Basic/Premium and VALIDATED
                  ((userProfile.subscription === 'basic' || userProfile.subscription === 'premium') && featuresEnabled) ? getUserTeacherQuestions(currentUser.uid) : Promise.resolve([]),
                  // Calculate stats if Premium and VALIDATED
                  (userProfile.subscription === 'premium' && featuresEnabled) ? calculateUserPerformanceStats(currentUser.uid) : Promise.resolve(null)
             ]);
             setResults(allQuizResults);
             setTeacherQuestions(fetchedTeacherQuestions); // Set fetched questions
             setPerformanceStats(fetchedStats); // Set calculated stats

             // --- Ask Teacher Usage Check ---
             const todayUsage = userProfile.lastAskTeacherDate && isToday(userProfile.lastAskTeacherDate.toDate())
               ? userProfile.askTeacherCount || 0
               : 0;

             const limit = subscriptionDetails[userProfile.subscription]?.askLimit ?? 0;

             setAskTeacherUsage(todayUsage);
             // User can ask if they are Basic/Premium, VALIDATED, and under the limit
             setCanAskTeacher(todayUsage < limit && (userProfile.subscription === 'basic' || userProfile.subscription === 'premium') && featuresEnabled);

          } else {
             // Handle case where profile doesn't exist after login/expiry check
             setResults([]);
             setTeacherQuestions([]);
             setPerformanceStats(null);
             setCanAskTeacher(false);
             setUnreadNotifications(0);
             setIsValidated(false);
             console.warn("User profile not found for UID:", currentUser.uid);
             // Optionally redirect to login or show an error
          }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            // Specific handling for index errors based on console warnings from firestore.ts
             const firebaseError = error as Error;
             if (firebaseError.message.includes('Firestore Query Requires Index')) {
                 console.warn('Dashboard data loading delayed due to Firestore index creation/update.');
             } else if (firebaseError.message.includes('expired')) {
                 // Already handled above with a toast
             }
              else {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to load some dashboard data.' });
             }
        } finally {
          setLoadingProfile(false);
          setLoadingResults(false);
          setLoadingTeacherQuestions(false); // Finish loading teacher questions
        }
      } else {
        // User logged out
        setProfile(null);
        setResults([]);
        setPerformanceStats(null);
        setTeacherQuestions([]); // Clear on logout
        setUnreadNotifications(0); // Reset count
        setCanAskTeacher(false);
        setIsValidated(false);
        setLoadingProfile(false);
        setLoadingResults(false);
        setLoadingTeacherQuestions(false); // Finish loading
      }
    });
    return () => unsubscribe();
  }, [toast]); // Added toast dependency

  // Function to handle asking a question
  const handleAskQuestionSubmit = async (questionText: string) => {
      if (!profile || !user || !canAskTeacher || !isValidated) return; // Guard clause including user object and validation

       const newCount = askTeacherUsage + 1;
       try {
           // 1. Save the question to Firestore
            await saveTeacherQuestion(user.uid, questionText, profile.name, profile.email);

           // 2. Update Firestore usage count
           await updateAskTeacherUsage(profile.uid, newCount);

           // 3. Update local state for immediate UI feedback
           setAskTeacherUsage(newCount);
           const limit = subscriptionDetails[profile.subscription]?.askLimit || 0;
           setCanAskTeacher(newCount < limit && isValidated); // Re-check canAskTeacher state

            // 4. Refetch teacher questions to show the new one (optimistic UI update could be added too)
            setLoadingTeacherQuestions(true);
            const updatedQuestions = await getUserTeacherQuestions(user.uid);
            setTeacherQuestions(updatedQuestions);
            setLoadingTeacherQuestions(false);

           console.log("Question asked. New count:", newCount);
           toast({ title: 'Question Submitted', description: 'Your question has been sent to the teacher.' }); // Success toast
           // Close dialog after successful submission
           setIsAskTeacherDialogOpen(false);
       } catch (error) {
            console.error("Failed to submit question or update usage:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit your question.' }); // Error toast
       }
   };

  // Function to handle clicking the notification bell
  const handleNotificationClick = async () => {
      if (myQuestionsRef.current) {
          myQuestionsRef.current.scrollIntoView({ behavior: 'smooth' });

         // Clear notifications if user is logged in and has unread notifications
          if (user && unreadNotifications > 0) {
              try {
                  await clearUserNotifications(user.uid);
                  setUnreadNotifications(0); // Update UI immediately
              } catch (error) {
                  console.error("Failed to clear notifications:", error);
                  toast({ variant: 'destructive', title: 'Error', description: 'Could not clear notifications.' });
              }
          }
      }
  };


  const calculateAverageScore = () => {
        // Use pre-calculated stats if available
        if (performanceStats) {
            return performanceStats.averageScore;
        }
        // Fallback calculation for free/basic or while loading stats
        if (results.length === 0) return 0;
        const recentResults = results.slice(0, 5); // Use only last 5 for basic calc
        const totalPercentage = recentResults.reduce((sum, result) => sum + result.percentage, 0);
        return Math.round(totalPercentage / recentResults.length);
    };

    const getSubscriptionBadgeVariant = (plan?: SubscriptionPlan): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
        switch (plan) {
            case 'premium': return 'default';
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

     // Determine alert to show based on validation status and expiry
     const getValidationAlert = () => {
          if (!profile || profile.subscription === 'free') return null; // No alert for free plan

          const now = new Date();
          const hasExpired = profile.expiryDate && now > profile.expiryDate.toDate();

          if (hasExpired) {
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

     const currentPlanDetails = profile?.subscription ? subscriptionDetails[profile.subscription] : subscriptionDetails.free;

     // Centralize locking logic based on validation
     const featuresLocked = !isValidated && profile?.subscription !== 'free';
     const contentLocked = profile?.subscription !== 'premium' || featuresLocked;
     const historyAndAnalyticsLocked = profile?.subscription !== 'premium' || featuresLocked; // Premium feature lock
     const askTeacherLocked = profile?.subscription === 'free' || featuresLocked; // Lock if free OR if paid but not validated

     const askLimit = profile ? currentPlanDetails.askLimit : 0;
     const askLimitReached = askTeacherUsage >= askLimit;

    const handleUpgradeClick = () => {
        // Direct logged-in users to payment page with their current choice if applicable
        if (profile && profile.subscription !== 'premium') {
            // Determine the "next" plan (simple logic: free/basic -> premium)
            const targetPlan: SubscriptionPlan = 'premium';
             router.push(`/payment?plan=${targetPlan}`);
        } else if (!profile) {
            // If not logged in (shouldn't happen in dashboard layout, but safeguard)
            router.push('/login?redirect=/pricing');
        } else {
             // Already premium, maybe link to profile or manage subscription?
             router.push('/dashboard/profile');
        }
    };


     const UpgradeAlertDialog = ({ triggerButton, featureName }: { triggerButton: React.ReactNode, featureName: string }) => (
        <AlertDialog>
            <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Lock className="text-primary" /> Feature Locked: {featureName}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This feature is exclusive to our validated Premium members. Please upgrade your plan and validate your payment to get access.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleUpgradeClick} asChild={false}>
                        <Zap className="mr-2 h-4 w-4" /> Upgrade to Premium
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     );

    // Dialog for Limit Reached
    const LimitReachedDialog = ({ triggerButton }: { triggerButton: React.ReactNode }) => (
        <AlertDialog>
            <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-yellow-500" /> Daily Limit Reached
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You have reached your daily limit of {askLimit} question(s) for the 'Ask Teacher' feature on the {profile?.subscription} plan.
                        Please try again tomorrow or upgrade your plan for a higher limit.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Ask Tomorrow</AlertDialogCancel>
                    {profile?.subscription !== 'premium' && (
                        <AlertDialogAction onClick={handleUpgradeClick} asChild={false}>
                            <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

     const pdfUrl = "https://ag.gov.np/files/Constitution-of-Nepal_2072_Eng_www.moljpa.gov_.npDate-72_11_16.pdf";

     const getStatusBadge = (status: TeacherQuestion['status']) => {
         switch (status) {
             case 'pending':
                 return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"><Clock size={12} className="mr-1"/> Pending</Badge>;
             case 'answered':
                 return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"><Check size={12} className="mr-1"/> Answered</Badge>;
             case 'rejected': // Added style for rejected
                 return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"><X size={12} className="mr-1"/> Rejected</Badge>;
             default:
                 return <Badge variant="secondary">Unknown</Badge>;
         }
     };

    // Calculate remaining days
    const getRemainingDays = () => {
        if (profile?.expiryDate) {
            const now = new Date();
            const expiry = profile.expiryDate.toDate();
            if (now > expiry) return 0; // Expired
            return differenceInDays(expiry, now);
        }
        return null; // No expiry date set
    };

    const remainingDays = getRemainingDays();

    // Chart Configuration (Example)
    const chartData = useMemo(() => {
        // Transform performanceStats.scoreOverTime if needed, or use recent results
        // Placeholder data for now
        return [
            { date: 'Week 1', score: 65 },
            { date: 'Week 2', score: 72 },
            { date: 'Week 3', score: 70 },
            { date: 'Week 4', score: 85 },
        ];
    }, [performanceStats]); // Depend on stats

    const chartConfig = {
        score: {
            label: "Average Score (%)",
            color: "hsl(var(--primary))", // Use primary color from theme
        },
    } satisfies ChartConfig;


  return (
    <div className="p-6 md:p-10 space-y-8"> {/* Added space-y */}
       {/* Dashboard Header Row */}
       <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>
          {/* Notification Bell */}
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
        {/* Welcome Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
             <div className="flex flex-row items-center justify-between space-y-0 mb-1">
                 <CardTitle className="text-sm font-medium">Welcome Back</CardTitle>
                 <UserIcon className="h-4 w-4 text-muted-foreground" />
             </div>
             {loadingProfile ? (
                <Skeleton className="h-8 w-3/4" />
             ) : (
                <div className="text-2xl font-bold truncate">{profile?.name || 'User'}</div>
             )}
          </CardHeader>
          <CardContent className="pt-0">
             {loadingProfile ? (
               <Skeleton className="h-4 w-1/2 mb-3" />
             ) : (
               <p className="text-xs text-muted-foreground mb-3 truncate">{profile?.email}</p>
             )}
             <Link href="/dashboard/profile" passHref className="mt-2 inline-block">
               <Button variant="outline" size="sm">View Profile</Button>
             </Link>
          </CardContent>
        </Card>

        {/* Average Score Card - Basic calculation shown, full stats for Premium */}
         <Card className="lg:col-span-1 relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium">
                      {profile?.subscription === 'premium' && isValidated ? 'Overall Average Score' : 'Recent Average Score'}
                 </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="relative">
                  {/* Lock overlay only if the detailed analytics section is locked */}
                  {historyAndAnalyticsLocked && (
                     <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10 rounded-b-lg">
                         <Lock size={24} className="text-primary mb-2" />
                         <p className="text-center text-xs font-semibold mb-2">Detailed stats require Premium</p>
                         <UpgradeAlertDialog
                             triggerButton={<Button variant="default" size="sm"><Zap className="mr-1 h-3 w-3" /> Upgrade</Button>}
                             featureName="Performance Analytics"
                         />
                     </div>
                  )}
                   <div className={cn(historyAndAnalyticsLocked ? "opacity-30 pointer-events-none" : "")}>
                     {loadingResults ? (
                       <Skeleton className="h-8 w-1/4 mb-2" />
                     ) : (
                       <div className="text-2xl font-bold">{calculateAverageScore()}%</div>
                     )}
                     {loadingResults ? (
                         <Skeleton className="h-4 w-3/4 mt-1" />
                     ) : (
                         <p className="text-xs text-muted-foreground">
                             {performanceStats
                               ? `Based on ${performanceStats.totalQuizzes} quiz attempt(s)`
                               : `Based on last ${results.slice(0,5).length} quiz attempt(s)`
                              }
                         </p>
                     )}
                     <Progress value={loadingResults ? 0 : calculateAverageScore()} className="w-full mt-3 h-2" />
                 </div>
              </CardContent>
          </Card>


         {/* Start Quiz Card */}
        <Card className="bg-primary text-primary-foreground lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Practice?</CardTitle>
              <FileText className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
                 <p className="text-primary-foreground/90 mb-4 text-sm">
                     {profile?.subscription === 'free'
                       ? 'Take one of your 2 daily quizzes (10 questions).'
                       : profile?.subscription === 'basic'
                         ? isValidated // Use local validated state
                            ? 'Take one of your 5 daily quizzes (10 questions).'
                            : 'Activate your Basic plan to start quizzes.'
                         : isValidated // Premium
                           ? 'Take a new quiz to test your knowledge.'
                           : 'Activate your Premium plan to start quizzes.'
                     }
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
      </div>


      {/* Second Row: Subscription Details Card */}
      <div className="grid gap-6 lg:grid-cols-1">
         <Card className="lg:col-span-1">
             <CardHeader>
                 <CardTitle>Subscription Details</CardTitle>
                 <CardDescription>Your current plan and features.</CardDescription>
             </CardHeader>
             <CardContent>
                 {loadingProfile ? (
                     <SubscriptionSkeleton />
                 ) : (
                    <>
                      <div className={cn("p-4 rounded-lg border mb-4", currentPlanDetails.colorClass)}>
                          <div className="flex justify-between items-center mb-1">
                              <h3 className="text-lg font-semibold">{currentPlanDetails.name} Plan</h3>
                              <Badge variant={getSubscriptionBadgeVariant(profile?.subscription)}>
                                  {profile?.subscription === 'premium' && <Star className="mr-1 h-3 w-3 fill-current" />}
                                  <span className="capitalize">{profile?.subscription || 'Free'}</span>
                              </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{currentPlanDetails.price}</p>
                          {profile?.subscription !== 'free' && (
                             <div className="text-xs mb-3 flex items-center gap-1">
                                 {isValidated ? ( // Use local validation state
                                     <><CheckCircle size={14} className="text-green-600 dark:text-green-400"/> Active</>
                                 ) : (
                                      <><AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400"/> Pending Validation / Expired</>
                                 )}
                             </div>
                          )}
                          {/* Display Expiry Date and Remaining Days */}
                          {profile?.subscription !== 'free' && profile.expiryDate && isValidated && (
                              <div className="text-xs mt-2 mb-3 space-y-0.5">
                                 <div className="flex items-center gap-1 text-muted-foreground">
                                     <CalendarClock size={12} />
                                     <span>Expires on: {format(profile.expiryDate.toDate(), 'PPP')}</span>
                                 </div>
                                 {remainingDays !== null && remainingDays >= 0 && (
                                     <div className="flex items-center gap-1 text-muted-foreground">
                                         <Clock size={12} />
                                         <span>{remainingDays} day{remainingDays !== 1 ? 's' : ''} remaining</span>
                                     </div>
                                 )}
                              </div>
                          )}

                         <ul className="space-y-1.5 text-xs mt-3">
                              {currentPlanDetails.features.map((feature, index) => (
                                 <li key={index} className="flex items-center gap-2">
                                      {feature.included ? (
                                         <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                                       ) : (
                                         <X size={14} className="text-red-500 dark:text-red-400" />
                                       )}
                                     <span>{feature.text}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                       {profile?.subscription !== 'premium' && (
                         <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={handleUpgradeClick} // Use handler function
                         >
                             {profile?.subscription === 'free' ? 'Upgrade Plan' : 'Renew / Upgrade'}
                             <Zap className="ml-1.5 h-4 w-4" />
                         </Button>
                       )}
                    </>
                 )}
             </CardContent>
         </Card>
      </div>


      {/* Third Row: Notes/Resources, Videos */}
      <div className="grid gap-6 md:grid-cols-2">
          {/* Notes & Resources Section */}
          <Card className="relative overflow-hidden flex flex-col">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Newspaper size={20} /> Notes & Resources</CardTitle>
                 <CardDescription>Access study materials, PDFs, and important notes.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow relative">
                 {contentLocked && (
                     <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                         <Lock size={40} className="text-primary mb-4" />
                         <p className="text-center font-semibold mb-4">Requires validated Premium plan.</p>
                          <UpgradeAlertDialog
                             triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                             featureName="Notes & Resources"
                          />
                     </div>
                 )}
                 {/* Actual content */}
                  <div className={cn("space-y-3", contentLocked ? "opacity-30 pointer-events-none" : "")}>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                          <span className="text-sm font-medium">Constitution of Nepal - Key Articles PDF</span>
                          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={cn(contentLocked ? 'pointer-events-none' : '')}>
                             <Button variant="outline" size="sm" disabled={contentLocked} aria-disabled={contentLocked}>
                                Open PDF <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                             </Button>
                          </a>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                          <span className="text-sm font-medium">Legal Theory Summaries</span>
                          <Button variant="outline" size="sm" disabled={contentLocked}>View</Button>
                      </div>
                       <div className="flex justify-between items-center p-3 border rounded-md">
                          <span className="text-sm font-medium">Sample Contract Drafts</span>
                          <Button variant="outline" size="sm" disabled={contentLocked}>View</Button>
                      </div>
                  </div>
              </CardContent>
          </Card>

          {/* Videos Section */}
           <Card className="relative overflow-hidden flex flex-col">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Video size={20} /> Video Lectures</CardTitle>
                 <CardDescription>Watch recorded lectures and tutorials.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow relative">
                  {contentLocked && (
                     <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                         <Lock size={40} className="text-primary mb-4" />
                         <p className="text-center font-semibold mb-4">Requires validated Premium plan.</p>
                         <UpgradeAlertDialog
                             triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                             featureName="Video Lectures"
                         />
                     </div>
                 )}
                  {/* Actual content */}
                   <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", contentLocked ? "opacity-30 pointer-events-none" : "")}>
                       <div className="border rounded-md overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center"> <Video size={48} className="text-muted-foreground" /> </div>
                            <div className="p-3"> <p className="text-sm font-medium mb-1 line-clamp-1">Intro to Criminal Law</p> <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled={contentLocked}>Watch Now</Button> </div>
                       </div>
                       <div className="border rounded-md overflow-hidden">
                            <div className="aspect-video bg-muted flex items-center justify-center"> <Video size={48} className="text-muted-foreground" /> </div>
                            <div className="p-3"> <p className="text-sm font-medium mb-1 line-clamp-1">Understanding Writs</p> <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled={contentLocked}>Watch Now</Button> </div>
                       </div>
                       {/* Add more video placeholders */}
                   </div>
              </CardContent>
          </Card>
       </div>

        {/* Fourth Row: Answer History & Performance Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
             {/* Answer History Section */}
            <Card className="lg:col-span-1 relative overflow-hidden flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BookOpen size={20} /> Answer History</CardTitle>
                    <CardDescription>Review your answers from previous quizzes.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                    {historyAndAnalyticsLocked && (
                        <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                            <Lock size={40} className="text-primary mb-4" />
                            <p className="text-center font-semibold mb-4">Available for Premium Users.</p>
                            <UpgradeAlertDialog
                                triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                                featureName="Answer History"
                            />
                        </div>
                    )}
                    <div className={cn("space-y-3", historyAndAnalyticsLocked ? "opacity-30 pointer-events-none" : "")}>
                        {loadingResults ? (
                            <AnswerHistorySkeleton />
                        ) : results.length > 0 ? (
                            // Display limited history preview or link to a full history page
                             <div className="space-y-2">
                                {results.slice(0, 3).map(result => ( // Show preview of first 3 quizzes
                                     <Accordion key={result.id} type="single" collapsible className="w-full border rounded-md px-3">
                                        <AccordionItem value={`result-${result.id}`} className="border-b-0">
                                          <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                             Quiz on {format(result.completedAt.toDate(), 'PP')} ({result.score}/{result.totalQuestions})
                                          </AccordionTrigger>
                                          <AccordionContent className="text-xs space-y-1 pb-2">
                                             {result.answers.slice(0, 2).map((ans, idx) => ( // Preview first 2 answers
                                                 <p key={idx} className={cn("flex items-start gap-1", ans.isCorrect ? "text-green-600" : "text-red-600")}>
                                                     {ans.isCorrect ? <CheckCircle size={12} className="mt-0.5"/> : <XCircle size={12} className="mt-0.5"/>}
                                                      <span className="text-muted-foreground line-clamp-1">{ans.questionText}</span>
                                                 </p>
                                             ))}
                                             {result.answers.length > 2 && <p className="text-muted-foreground">...and {result.answers.length - 2} more</p>}
                                          </AccordionContent>
                                        </AccordionItem>
                                     </Accordion>
                                ))}
                                {/* TODO: Add button/link to a full answer history page */}
                                <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" disabled={historyAndAnalyticsLocked}>View Full History</Button>
                             </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">No quiz history found yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

             {/* Performance Analytics Section */}
            <Card className="lg:col-span-1 relative overflow-hidden flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Performance Analytics</CardTitle>
                    <CardDescription>Track your progress and identify weak areas.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow relative">
                     {historyAndAnalyticsLocked && (
                        <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                            <Lock size={40} className="text-primary mb-4" />
                            <p className="text-center font-semibold mb-4">Available for Premium Users.</p>
                            <UpgradeAlertDialog
                                triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                                featureName="Performance Analytics"
                            />
                        </div>
                    )}
                     <div className={cn("space-y-4", historyAndAnalyticsLocked ? "opacity-30 pointer-events-none" : "")}>
                        {loadingResults ? (
                           <PerformanceAnalyticsSkeleton />
                        ) : performanceStats ? (
                            <>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col items-center p-3 border rounded-md">
                                        <span className="text-xs text-muted-foreground">Accuracy</span>
                                        <span className="text-lg font-bold">{performanceStats.accuracy}%</span>
                                    </div>
                                     <div className="flex flex-col items-center p-3 border rounded-md">
                                        <span className="text-xs text-muted-foreground">Avg. Score</span>
                                        <span className="text-lg font-bold">{performanceStats.averageScore}%</span>
                                    </div>
                                     <div className="flex flex-col items-center p-3 border rounded-md">
                                        <span className="text-xs text-muted-foreground">Quizzes Taken</span>
                                        <span className="text-lg font-bold">{performanceStats.totalQuizzes}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 border rounded-md">
                                        <span className="text-xs text-muted-foreground">Questions</span>
                                        <span className="text-lg font-bold">{performanceStats.totalQuestions}</span>
                                    </div>
                                </div>
                                {/* Example Chart (Score Over Time - Placeholder) */}
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2 text-center">Score Trend (Example)</h4>
                                     <ChartContainer config={chartConfig} className="h-[150px] w-full">
                                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, left:-10, right: 0, bottom: 0 }}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                                            <YAxis hide={true} domain={[0, 100]} />
                                            <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                                            <Bar dataKey="score" fill="var(--color-score)" radius={4}>
                                                <LabelList position="top" offset={5} fontSize={10} fill="hsl(var(--foreground))" />
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                    {/* TODO: Add Category Stats breakdown */}
                                     <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" disabled={historyAndAnalyticsLocked}>View Detailed Analytics</Button>
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-6">Take some quizzes to see your analytics.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>


       {/* Fifth Row: Ask Teacher & My Questions */}
       <div className="grid gap-6 lg:grid-cols-2">
            {/* Ask Teacher Section */}
             <Card className="relative overflow-hidden flex flex-col">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2"><MessageSquareQuote size={20} /> Ask a Teacher</CardTitle>
                 <CardDescription>Get your MCQs and quiz queries answered by experts.</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow relative flex flex-col items-center justify-center text-center">
                  {askTeacherLocked && (
                     <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                         <Lock size={40} className="text-primary mb-4" />
                         <p className="text-center font-semibold mb-4">Available for Basic & Premium plans.</p>
                          <UpgradeAlertDialog
                             triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Plan</Button>}
                              featureName="Ask a Teacher"
                          />
                          {featuresLocked && profile?.subscription !== 'free' && <p className="text-xs text-muted-foreground mt-2">Account validation pending or expired.</p>}
                     </div>
                 )}
                 {/* Content visible to Basic/Premium users */}
                 <div className={cn("flex flex-col items-center justify-center text-center", askTeacherLocked ? "opacity-30 pointer-events-none" : "")}>
                     <p className="text-sm text-muted-foreground mb-4">
                          You have {Math.max(0, askLimit - askTeacherUsage)} question(s) remaining today.
                     </p>
                     {askLimitReached && profile?.subscription !== 'free' ? (
                         <LimitReachedDialog
                             triggerButton={
                                <Button size="lg" disabled>
                                    <AlertTriangle className="mr-2 h-4 w-4" /> Limit Reached
                                </Button>
                             }
                         />
                     ) : (
                          <Button size="lg" onClick={() => setIsAskTeacherDialogOpen(true)} disabled={askTeacherLocked}>
                              Ask Question
                          </Button>
                     )}
                 </div>
              </CardContent>
           </Card>

           {/* My Questions Section */}
           <Card className="relative overflow-hidden flex flex-col" ref={myQuestionsRef}> {/* Added ref */}
               <CardHeader>
                   <CardTitle className="flex items-center gap-2"><HelpCircle size={20} /> My Questions</CardTitle>
                   <CardDescription>View the status and answers to your submitted questions.</CardDescription>
               </CardHeader>
               <CardContent className="flex-grow relative">
                   {askTeacherLocked && (
                      <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                          <Lock size={40} className="text-primary mb-4" />
                          <p className="text-center font-semibold mb-4">Available for Basic & Premium plans.</p>
                           <UpgradeAlertDialog
                              triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Plan</Button>}
                               featureName="My Questions"
                          />
                           {featuresLocked && profile?.subscription !== 'free' && <p className="text-xs text-muted-foreground mt-2">Account validation pending or expired.</p>}
                      </div>
                   )}
                   <div className={cn("space-y-3", askTeacherLocked ? "opacity-30 pointer-events-none" : "")}>
                      {loadingTeacherQuestions ? (
                          <MyQuestionsSkeleton />
                      ) : teacherQuestions.length > 0 ? (
                           <Accordion type="single" collapsible className="w-full">
                              {teacherQuestions.map((q, index) => (
                                 <AccordionItem
                                    value={`item-${index}`}
                                    key={q.id}
                                     // Highlight answered questions with unread notifications
                                     className={cn(
                                         'border-b', // Keep base border
                                         q.status === 'answered' && (profile?.lastNotificationCheck ? q.answeredAt && q.answeredAt > profile.lastNotificationCheck : true)
                                             ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 rounded-md mb-1' // Highlight style + spacing
                                             : ''
                                     )}
                                 >
                                   <AccordionTrigger className="text-sm hover:no-underline px-4 py-3"> {/* Adjusted padding */}
                                       <div className="flex justify-between items-center w-full">
                                          <span className="truncate flex-1 mr-2">{q.questionText}</span>
                                          {getStatusBadge(q.status)}
                                       </div>
                                   </AccordionTrigger>
                                   <AccordionContent className="text-sm text-muted-foreground px-4 pt-2 pb-4 space-y-2"> {/* Adjusted padding */}
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
       </div>

        {/* Ask Teacher Dialog */}
         {profile && (
             <AskTeacherDialog
                 isOpen={isAskTeacherDialogOpen}
                 onClose={() => setIsAskTeacherDialogOpen(false)}
                 onSubmit={handleAskQuestionSubmit}
                 limit={askLimit}
                 usage={askTeacherUsage}
                 planName={profile.subscription || 'free'} // Provide plan name
             />
         )}

    </div>
  );
}

// --- Skeleton Components ---

function SubscriptionSkeleton() {
    return (
        <div className="p-4 rounded-lg border border-muted bg-muted/50 dark:bg-muted/10 animate-pulse">
             <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-6 w-2/5 rounded" />
                 <Skeleton className="h-6 w-1/4 rounded-full" />
             </div>
              <Skeleton className="h-4 w-1/3 mb-3 rounded" />
              <Skeleton className="h-3 w-1/4 mb-4 rounded" />
              <div className="space-y-2.5 mt-3">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-3 w-full rounded" />
                   <Skeleton className="h-3 w-2/3 rounded" />
              </div>
               <Skeleton className="h-8 w-full mt-4 rounded" />
         </div>
    );
}

function MyQuestionsSkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
            ))}
        </div>
    );
}

function AnswerHistorySkeleton() {
    return (
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <Skeleton className="h-4 w-2/3" />
                     <Skeleton className="h-4 w-1/6" />
                 </div>
            ))}
        </div>
    );
}

function PerformanceAnalyticsSkeleton() {
    return (
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
               <Skeleton className="h-16 w-full rounded-md" />
               <Skeleton className="h-16 w-full rounded-md" />
               <Skeleton className="h-16 w-full rounded-md" />
               <Skeleton className="h-16 w-full rounded-md" />
           </div>
            <Skeleton className="h-4 w-1/3 mx-auto" />
            <Skeleton className="h-[150px] w-full rounded-md" />
        </div>
    );
}
