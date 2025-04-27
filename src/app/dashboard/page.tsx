
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
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, getUserQuizResults } from '@/lib/firebase/firestore';
import type { UserProfile, QuizResult } from '@/types/user';
import { formatDistanceToNow } from 'date-fns';
import { FileText, User as UserIcon, Target, Star, Zap } from 'lucide-react'; // Import icons

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
          const quizResults = await getUserQuizResults(currentUser.uid, 5); // Fetch latest 5 results
          setResults(quizResults);
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

    const getSubscriptionBadgeVariant = (plan?: string) => {
        switch (plan) {
            case 'premium': return 'default'; // Primary color
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">My Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader className="pb-2">
             <div className="flex flex-row items-center justify-between space-y-0 mb-1">
                 <CardTitle className="text-sm font-medium">Welcome Back</CardTitle>
                 <UserIcon className="h-4 w-4 text-muted-foreground" />
             </div>
             {loadingProfile ? (
                <Skeleton className="h-8 w-3/4" />
             ) : (
                <div className="text-2xl font-bold">{profile?.name || 'User'}</div>
             )}
          </CardHeader>
          <CardContent className="pt-0">
             {loadingProfile ? (
               <Skeleton className="h-4 w-1/2 mb-3" />
             ) : (
               <p className="text-xs text-muted-foreground mb-3">{profile?.email}</p>
             )}
             {/* Subscription Status */}
             <div className="flex items-center justify-between gap-2 mt-1">
                 {loadingProfile ? (
                    <Skeleton className="h-6 w-20 rounded-full" />
                 ) : (
                    <Badge variant={getSubscriptionBadgeVariant(profile?.subscription)}>
                         <span className="capitalize">{profile?.subscription || 'Free'}</span> Plan
                     </Badge>
                 )}
                {profile?.subscription !== 'premium' && (
                     <Button variant="link" size="sm" className="p-0 h-auto text-xs" disabled>
                         Upgrade Plan
                         <Zap className="ml-1 h-3 w-3" />
                     </Button>
                 )}
             </div>
             <Link href="/dashboard/profile" passHref className="mt-4 inline-block">
               <Button variant="outline" size="sm">View Profile</Button>
             </Link>
          </CardContent>
        </Card>

         {/* Average Score Card */}
        <Card>
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
        <Card className="bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready to Practice?</CardTitle>
              <FileText className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
                 <p className="text-primary-foreground/90 mb-4">
                     {profile?.subscription === 'free'
                       ? 'Take your daily free quiz.'
                       : 'Take a new quiz to test your knowledge.'}
                 </p>
                 <Link href="/quiz" passHref>
                    <Button variant="secondary" size="lg" className="w-full">Start New Quiz</Button>
                  </Link>
            </CardContent>
        </Card>
      </div>

      {/* Recent Quiz Results Table */}
      <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>Latest Quiz Results</CardTitle>
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
  );
}

function ResultsTableSkeleton() {
    return (
         <div className="space-y-4">
           <Skeleton className="h-8 w-full" />
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2 border-b">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/6" />
                   <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-1/6" />
                </div>
            ))}
         </div>
    );
}
