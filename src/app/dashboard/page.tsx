
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, getUserQuizResults } from '@/lib/firebase/firestore';
import type { UserProfile, QuizResult, SubscriptionPlan } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { FileText, User as UserIcon, Target, Star, Zap, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react'; // Import icons
import { cn } from '@/lib/utils';

// WhatsApp number for validation
const WHATSAPP_NUMBER = '+97798XXXXXXXX'; // Placeholder number

// Subscription details including color classes
const subscriptionDetails: Record<SubscriptionPlan, { name: string; features: string[]; colorClass: string; price: string }> = {
    free: {
        name: 'Free',
        features: ['20 questions/day', 'Basic support'],
        colorClass: 'bg-gray-100 text-gray-800 border-gray-300', // Gray for Free
        price: 'NRS 0'
    },
    basic: {
        name: 'Basic',
        features: ['100 questions/day', 'Basic support'],
        colorClass: 'bg-green-100 text-green-800 border-green-300', // Green for Basic
        price: 'NRS 20 / week'
    },
    premium: {
        name: 'Premium',
        features: ['Unlimited questions', 'Premium content access', 'PDF downloads', 'Priority support'],
        colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-400', // Gold/Yellow for Premium
        price: 'NRS 100 / week'
    },
};


export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoadingProfile(true);
        setLoadingResults(true);
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          if (userProfile) { // Fetch results only if profile exists
             const quizResults = await getUserQuizResults(currentUser.uid, 5); // Fetch latest 5 results
             setResults(quizResults);
          } else {
             setResults([]); // No profile, no results
          }
        } catch (error) {
          console.error('Failed to load dashboard data:', error);
          // Add toast notification here if needed
        } finally {
          setLoadingProfile(false);
          setLoadingResults(false);
        }
      } else {
        // User is logged out, clear state (though layout should redirect)
        setProfile(null);
        setResults([]);
        setLoadingProfile(false);
        setLoadingResults(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const calculateAverageScore = () => {
        if (results.length === 0) return 0;
        const totalPercentage = results.reduce((sum, result) => sum + result.percentage, 0);
        return Math.round(totalPercentage / results.length);
    };

    const getSubscriptionBadgeVariant = (plan?: SubscriptionPlan): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
        switch (plan) {
            case 'premium': return 'default'; // Using ShadCN default (usually primary color) for premium badge
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

     // Check if validation alert should be shown
     const showValidationAlert = profile && profile.subscription !== 'free' && !profile.validated;
     const currentPlanDetails = profile?.subscription ? subscriptionDetails[profile.subscription] : subscriptionDetails.free;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Dashboard</h1>

      {/* Validation Alert */}
      {showValidationAlert && (
         <Alert variant="destructive" className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle className="font-semibold">Account Pending Validation</AlertTitle>
           <AlertDescription>
             Your <span className="font-medium">{profile?.subscription}</span> plan payment needs verification. Please send your payment screenshot to our WhatsApp:
              <strong className="ml-1">{WHATSAPP_NUMBER}</strong>.
             <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block">
                 <Button variant="link" size="sm" className="p-0 h-auto text-xs text-yellow-700 hover:text-yellow-900">
                     <MessageSquare className="mr-1 h-3 w-3"/> Send on WhatsApp
                 </Button>
             </a>
           </AlertDescription>
         </Alert>
      )}

       {/* First Row: Welcome, Score, Start Quiz */}
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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

        {/* Average Score Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
             <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

         {/* Start Quiz Card */}
        <Card className="bg-primary text-primary-foreground lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Practice?</CardTitle>
              <FileText className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
                 <p className="text-primary-foreground/90 mb-4">
                     {profile?.subscription === 'free'
                       ? 'Take your daily free quiz.'
                       : profile?.validated
                         ? 'Take a new quiz to test your knowledge.'
                         : 'Activate your plan to start unlimited quizzes.'
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


      {/* Second Row: Subscription Details & Recent Activity */}
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
                     <div className={cn("p-4 rounded-lg border", currentPlanDetails.colorClass)}>
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
                                     <> <CheckCircle size={14} className="text-green-600"/> Validated </>
                                 ) : (
                                      <> <AlertTriangle size={14} className="text-yellow-600"/> Pending Validation </>
                                 )}
                             </div>
                          )}
                         <ul className="space-y-1.5 text-xs mt-3">
                              {currentPlanDetails.features.map((feature, index) => (
                                 <li key={index} className="flex items-center gap-2">
                                      <CheckCircle size={14} />
                                     <span>{feature}</span>
                                  </li>
                              ))}
                          </ul>
                           {profile?.subscription !== 'premium' && (
                             <Link href="/pricing" passHref className="mt-4 inline-block">
                                 <Button variant="link" size="sm" className="p-0 h-auto text-xs text-primary hover:underline">
                                     Upgrade Plan
                                     <Zap className="ml-1 h-3 w-3" />
                                 </Button>
                              </Link>
                           )}
                      </div>
                 )}
             </CardContent>
         </Card>

         {/* Recent Quiz Results Table Card */}
         <Card className="lg:col-span-2">
           <CardHeader>
             <CardTitle>Recent Activity</CardTitle>
             <CardDescription>Your most recent quiz attempts.</CardDescription>
           </CardHeader>
           <CardContent>
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
           </CardContent>
         </Card>
      </div>
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
        <div className="p-4 rounded-lg border border-muted bg-muted/50 animate-pulse">
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
               <Skeleton className="h-5 w-1/4 mt-4 rounded" />
         </div>
    );
}
