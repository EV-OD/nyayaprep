
import type * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Target, Lock, Zap } from 'lucide-react';
import type { UserProfile, QuizResult } from '@/types/user';
import type { UserPerformanceStats } from '@/lib/firebase/firestore';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface ScoreCardProps {
  profile: UserProfile | null;
  isValidated: boolean;
  loading: boolean;
  results: QuizResult[];
  performanceStats: UserPerformanceStats | null;
  onUpgradeClick: () => void;
}

export function ScoreCard({ profile, isValidated, loading, results, performanceStats, onUpgradeClick }: ScoreCardProps) {
  const calculateAverageScore = () => {
    if (performanceStats) {
      return performanceStats.averageScore;
    }
    if (results.length === 0) return 0;
    const recentResults = results.slice(0, 5);
    const totalPercentage = recentResults.reduce((sum, result) => sum + result.percentage, 0);
    return Math.round(totalPercentage / recentResults.length);
  };

  const averageScore = calculateAverageScore();
  const featuresLocked = !isValidated && profile?.subscription !== 'free';
  const historyAndAnalyticsLocked = profile?.subscription !== 'premium' || featuresLocked;

  return (
    <Card className="lg:col-span-1 relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
         <CardTitle className="text-sm font-medium">
              {profile?.subscription === 'premium' && isValidated ? 'Overall Average Score' : 'Recent Average Score'}
         </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="relative">
          {historyAndAnalyticsLocked && (
             <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10 rounded-b-lg">
                 <Lock size={24} className="text-primary mb-2" />
                 <p className="text-center text-xs font-semibold mb-2">Detailed stats require Premium</p>
                 <UpgradeAlertDialog
                     triggerButton={<Button variant="default" size="sm"><Zap className="mr-1 h-3 w-3" /> Upgrade</Button>}
                     featureName="Performance Analytics"
                     onUpgradeClick={onUpgradeClick}
                 />
             </div>
          )}
           <div className={cn(historyAndAnalyticsLocked ? "opacity-30 pointer-events-none" : "")}>
             {loading ? (
               <Skeleton className="h-8 w-1/4 mb-2" />
             ) : (
               <div className="text-2xl font-bold">{averageScore}%</div>
             )}
             {loading ? (
                 <Skeleton className="h-4 w-3/4 mt-1" />
             ) : (
                 <p className="text-xs text-muted-foreground">
                     {performanceStats
                       ? `Based on ${performanceStats.totalQuizzes} quiz attempt(s)`
                       : `Based on last ${results.slice(0,5).length} quiz attempt(s)`
                      }
                 </p>
             )}
             <Progress value={loading ? 0 : averageScore} className="w-full mt-3 h-2" />
         </div>
      </CardContent>
    </Card>
  );
}
