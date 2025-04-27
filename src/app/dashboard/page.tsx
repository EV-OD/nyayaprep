
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { getUserProfile, getUserQuizResults, updateAskTeacherUsage, saveTeacherQuestion, getUserTeacherQuestions } from '@/lib/firebase/firestore'; // Added saveTeacherQuestion, getUserTeacherQuestions
import type { UserProfile, QuizResult, SubscriptionPlan, TeacherQuestion } from '@/types/user'; // Import TeacherQuestion
import { formatDistanceToNow, isToday, format } from 'date-fns'; // Added format
import { FileText, User as UserIcon, Target, Star, Zap, AlertTriangle, MessageSquare, CheckCircle, Lock, Newspaper, Video, History, BarChart2, X, ExternalLink, MessageSquareQuote, HelpCircle, Clock, Check } from 'lucide-react'; // Added icons for questions
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { AskTeacherDialog } from '@/components/user/ask-teacher-dialog'; // Import AskTeacherDialog

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
  const [results, setResults] = useState<QuizResult[]>([]);
  const [teacherQuestions, setTeacherQuestions] = useState<TeacherQuestion[]>([]); // State for user's asked questions
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [loadingTeacherQuestions, setLoadingTeacherQuestions] = useState(true); // Loading state for teacher questions
  const [isAskTeacherDialogOpen, setIsAskTeacherDialogOpen] = useState(false);
  const [canAskTeacher, setCanAskTeacher] = useState(false); // State to control if user can ask based on limit
  const [askTeacherUsage, setAskTeacherUsage] = useState(0); // Current usage count for the day
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        setLoadingResults(true);
        setLoadingTeacherQuestions(true); // Start loading teacher questions
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          if (userProfile) {
            // Fetch results and teacher questions in parallel
            const [quizResults, fetchedTeacherQuestions] = await Promise.all([
                getUserQuizResults(currentUser.uid, 5),
                getUserTeacherQuestions(currentUser.uid) // Fetch user's asked questions
            ]);
            setResults(quizResults);
            setTeacherQuestions(fetchedTeacherQuestions); // Set fetched questions

            // --- Ask Teacher Usage Check ---
            const todayUsage = userProfile.lastAskTeacherDate && isToday(userProfile.lastAskTeacherDate.toDate())
              ? userProfile.askTeacherCount || 0
              : 0;

            const limit = subscriptionDetails[userProfile.subscription]?.askLimit ?? 0;

            setAskTeacherUsage(todayUsage);
            setCanAskTeacher(todayUsage < limit && userProfile.subscription !== 'free' && userProfile.validated);

          } else {
            setResults([]);
            setTeacherQuestions([]); // Clear if no profile
            setCanAskTeacher(false);
            console.warn("User profile not found for UID:", currentUser.uid);
          }
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
        } finally {
          setLoadingProfile(false);
          setLoadingResults(false);
          setLoadingTeacherQuestions(false); // Finish loading teacher questions
        }
      } else {
        setProfile(null);
        setResults([]);
        setTeacherQuestions([]); // Clear on logout
        setCanAskTeacher(false);
        setLoadingProfile(false);
        setLoadingResults(false);
        setLoadingTeacherQuestions(false); // Finish loading
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to handle asking a question
  const handleAskQuestionSubmit = async (questionText: string) => {
      if (!profile || !user || !canAskTeacher) return; // Guard clause including user object

       const newCount = askTeacherUsage + 1;
       try {
           // 1. Save the question to Firestore
            await saveTeacherQuestion(user.uid, questionText, profile.name, profile.email);

           // 2. Update Firestore usage count
           await updateAskTeacherUsage(profile.uid, newCount);

           // 3. Update local state for immediate UI feedback
           setAskTeacherUsage(newCount);
           const limit = subscriptionDetails[profile.subscription]?.askLimit || 0;
           setCanAskTeacher(newCount < limit && profile.validated); // Re-check canAskTeacher state

            // 4. Refetch teacher questions to show the new one (optimistic UI update could be added too)
            setLoadingTeacherQuestions(true);
            const updatedQuestions = await getUserTeacherQuestions(user.uid);
            setTeacherQuestions(updatedQuestions);
            setLoadingTeacherQuestions(false);

           console.log("Question asked. New count:", newCount);
           // Close dialog after successful submission
           setIsAskTeacherDialogOpen(false);
       } catch (error) {
            console.error("Failed to submit question or update usage:", error);
            // Optionally show an error toast to the user
            // The UI state won't update if the Firestore update fails
       }
   };


  const calculateAverageScore = () => {
        if (results.length === 0) return 0;
        const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
        return Math.round(totalPercentage / results.length);
    };

    const getSubscriptionBadgeVariant = (plan?: SubscriptionPlan): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
        switch (plan) {
            case 'premium': return 'default';
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

     const showValidationAlert = profile && profile.subscription !== 'free' && !profile.validated;
     const currentPlanDetails = profile?.subscription ? subscriptionDetails[profile.subscription] : subscriptionDetails.free;

     const contentLocked = !profile || !(profile.subscription === 'premium' && profile.validated);
     const analyticsLocked = !profile || !(profile.subscription === 'premium' && profile.validated);

     const askTeacherLocked = !profile || profile.subscription === 'free'; // Lock for free users
     const askLimit = profile ? currentPlanDetails.askLimit : 0;
     const askLimitReached = askTeacherUsage >= askLimit;

    const handleUpgradeClick = () => {
        // Directly go to pricing page. Pricing page handles logic based on login status.
        router.push('/pricing');
    };


     const UpgradeAlertDialog = ({ triggerButton }: { triggerButton: React.ReactNode }) => (
        <AlertDialog>
            <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Lock className="text-primary" /> Feature Locked
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
                 return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock size={12} className="mr-1"/> Pending</Badge>;
             case 'answered':
                 return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><Check size={12} className="mr-1"/> Answered</Badge>;
             case 'rejected':
                 return <Badge variant="destructive"><X size={12} className="mr-1"/> Rejected</Badge>;
             default:
                 return <Badge variant="secondary">Unknown</Badge>;
         }
     };


  return (
    <div className="p-6 md:p-10 space-y-8"> {/* Added space-y */}
      <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>

      {/* Validation Alert */}
      {showValidationAlert && (
         <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle className="font-semibold">Account Pending Validation</AlertTitle>
           <AlertDescription>
             Your <span className="font-medium">{profile?.subscription}</span> plan payment needs verification. Please send your payment screenshot to our WhatsApp:
              <strong className="ml-1">{WHATSAPP_NUMBER}</strong>.
             <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block">
                 <Button variant="link" size="sm" className="p-0 h-auto text-xs text-yellow-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200">
                     <MessageSquare className="mr-1 h-3 w-3"/> Send on WhatsApp
                 </Button>
             </a>
           </AlertDescription>
         </Alert>
      )}

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

        {/* Average Score Card - Locked for Free/Basic */}
         <Card className="lg:col-span-1 relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="relative">
                  {analyticsLocked && (
                     <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10 rounded-b-lg">
                         <Lock size={24} className="text-primary mb-2" />
                         <p className="text-center text-xs font-semibold mb-2">Available for Premium Users</p>
                         <UpgradeAlertDialog
                             triggerButton={<Button variant="default" size="sm"><Zap className="mr-1 h-3 w-3" /> Upgrade</Button>}
                         />
                     </div>
                  )}
                   <div className={cn(analyticsLocked ? "opacity-30 pointer-events-none" : "")}>
                     {loadingResults ? (
                       <Skeleton className="h-8 w-1/4 mb-2" />
                     ) : (
                       <div className="text-2xl font-bold">{calculateAverageScore()}%</div>
                     )}
                     {loadingResults ? (
                         <Skeleton className="h-4 w-3/4 mt-1" />
                     ) : (
                         <p className="text-xs text-muted-foreground">
                             Based on your last {results.length} quiz attempt(s)
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
                         ? profile?.validated
                            ? 'Take one of your 5 daily quizzes (10 questions).'
                            : 'Activate your Basic plan to start quizzes.'
                         : profile?.validated // Premium
                           ? 'Take a new quiz to test your knowledge.'
                           : 'Activate your Premium plan to start quizzes.'
                     }
                 </p>
                 <Link href="/quiz" passHref>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        disabled={showValidationAlert} // Disable quiz if validation needed
                    >
                        Start New Quiz
                    </Button>
                  </Link>
            </CardContent>
        </Card>
      </div>


      {/* Second Row: Subscription, Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
         {/* Subscription Details Card */}
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
                          <div className="flex justify-between items-center mb-3">
                              <h3 className="text-lg font-semibold">{currentPlanDetails.name} Plan</h3>
                              <Badge variant={getSubscriptionBadgeVariant(profile?.subscription)}>
                                  {profile?.subscription === 'premium' && <Star className="mr-1 h-3 w-3 fill-current" />}
                                  <span className="capitalize">{profile?.subscription || 'Free'}</span>
                              </Badge>
                          </div>
                         <p className="text-sm font-medium mb-1">{currentPlanDetails.price}</p>
                          {profile?.subscription !== 'free' && (
                             <div className="text-xs mb-3 flex items-center gap-1">
                                 {profile?.validated ? (
                                     <><CheckCircle size={14} className="text-green-600 dark:text-green-400"/> Validated</>
                                 ) : (
                                      <><AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400"/> Pending Validation</>
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
                             Upgrade Plan
                             <Zap className="ml-1.5 h-4 w-4" />
                         </Button>
                       )}
                    </>
                 )}
             </CardContent>
         </Card>

         {/* Recent Quiz Results Table Card - Locked for Free/Basic */}
         <Card className="lg:col-span-2 relative overflow-hidden">
           <CardHeader>
             <CardTitle className="flex items-center gap-2"><History size={20} /> Recent Activity</CardTitle>
             <CardDescription>Your most recent quiz attempts.</CardDescription>
           </CardHeader>
           <CardContent className="relative">
              {analyticsLocked && (
                 <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                     <Lock size={40} className="text-primary mb-4" />
                     <p className="text-center font-semibold mb-4">Answer history available for Premium Users.</p>
                     <UpgradeAlertDialog
                         triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                     />
                 </div>
              )}
              <div className={cn(analyticsLocked ? "opacity-30 pointer-events-none" : "")}>
                 {loadingResults ? (
                   <ResultsTableSkeleton />
                 ) : results.length > 0 ? (
                   <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Date</TableHead>
                         <TableHead>Score</TableHead>
                         <TableHead>Percentage</TableHead>
                         <TableHead className="text-right">Questions</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {results.map((result) => (
                         <TableRow key={result.id}>
                           <TableCell>
                             {result.completedAt ? formatDistanceToNow(result.completedAt.toDate(), { addSuffix: true }) : 'N/A'}
                           </TableCell>
                           <TableCell>{result.score} / {result.totalQuestions}</TableCell>
                           <TableCell>
                             <Badge variant={result.percentage >= 70 ? 'default' : result.percentage >= 40 ? 'secondary' : 'destructive'}>
                               {result.percentage}%
                             </Badge>
                           </TableCell>
                           <TableCell className="text-right">{result.totalQuestions}</TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 ) : (
                   <p className="text-center text-muted-foreground py-6">No quiz results found yet. Take a quiz to see your progress!</p>
                 )}
              </div>
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

       {/* Fourth Row: Ask Teacher & My Questions */}
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
                         />
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
                          <Button size="lg" onClick={() => setIsAskTeacherDialogOpen(true)} disabled={showValidationAlert || askTeacherLocked}>
                              Ask Question
                          </Button>
                     )}
                     {showValidationAlert && profile?.subscription !== 'free' && <p className="text-xs text-destructive mt-2">Please validate your account to use this feature.</p>}
                 </div>
              </CardContent>
           </Card>

           {/* My Questions Section */}
           <Card className="relative overflow-hidden flex flex-col">
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
                          />
                      </div>
                   )}
                   <div className={cn("space-y-3", askTeacherLocked ? "opacity-30 pointer-events-none" : "")}>
                      {loadingTeacherQuestions ? (
                          <MyQuestionsSkeleton />
                      ) : teacherQuestions.length > 0 ? (
                           <Accordion type="single" collapsible className="w-full">
                              {teacherQuestions.map((q, index) => (
                                 <AccordionItem value={`item-${index}`} key={q.id}>
                                   <AccordionTrigger className="text-sm hover:no-underline">
                                       <div className="flex justify-between items-center w-full pr-2">
                                          <span className="truncate flex-1 mr-2">{q.questionText}</span>
                                          {getStatusBadge(q.status)}
                                       </div>
                                   </AccordionTrigger>
                                   <AccordionContent className="text-sm text-muted-foreground px-2 pt-2 pb-4 space-y-2">
                                       <p><strong>Asked:</strong> {q.askedAt ? format(q.askedAt.toDate(), 'PPP p') : 'N/A'}</p>
                                       {q.status === 'answered' && q.answerText ? (
                                           <>
                                           <p><strong>Answered:</strong> {q.answeredAt ? format(q.answeredAt.toDate(), 'PPP p') : 'N/A'}</p>
                                           <p className="whitespace-pre-wrap"><strong>Answer:</strong> {q.answerText}</p>
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

function ResultsTableSkeleton() {
    return (
         <div className="space-y-4">
           <Skeleton className="h-8 w-full rounded" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b">
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                   <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-1/6 rounded" />
                </div>
            ))}
         </div>
    );
}

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
