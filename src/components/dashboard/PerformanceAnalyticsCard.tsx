
import type * as React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { TrendingUp, Lock, Zap } from 'lucide-react';
import type { UserPerformanceStats } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { PerformanceAnalyticsSkeleton } from './skeletons';
import { UpgradeAlertDialog } from './UpgradeAlertDialog';

interface PerformanceAnalyticsCardProps {
  locked: boolean;
  loading: boolean;
  performanceStats: UserPerformanceStats | null;
  onUpgradeClick: () => void;
}

export function PerformanceAnalyticsCard({ locked, loading, performanceStats, onUpgradeClick }: PerformanceAnalyticsCardProps) {

  const chartData = useMemo(() => {
    // Placeholder data - replace with actual logic using performanceStats?.scoreOverTime if available
    return [
        { date: 'Week 1', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.8 : 65 }, // Example dynamic data
        { date: 'Week 2', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.9 : 72 },
        { date: 'Week 3', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.85 : 70 },
        { date: 'Week 4', score: performanceStats?.averageScore || 85 },
    ];
  }, [performanceStats]);

  const chartConfig = {
    score: {
        label: "Average Score (%)",
        color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="lg:col-span-1 relative overflow-hidden flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp size={20} /> Performance Analytics</CardTitle>
            <CardDescription>Track your progress and identify weak areas.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow relative">
             {locked && (
                <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10 rounded-b-lg">
                    <Lock size={40} className="text-primary mb-4" />
                    <p className="text-center font-semibold mb-4">Available for Premium Users.</p>
                    <UpgradeAlertDialog
                        triggerButton={<Button variant="default"><Zap className="mr-2 h-4 w-4" /> Upgrade Now</Button>}
                        featureName="Performance Analytics"
                        onUpgradeClick={onUpgradeClick}
                    />
                </div>
            )}
             <div className={cn("space-y-4", locked ? "opacity-30 pointer-events-none" : "")}>
                {loading ? (
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
                        {/* Example Chart */}
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
                             <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2" disabled={locked}>View Detailed Analytics</Button>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-muted-foreground py-6">Take some quizzes to see your analytics.</p>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
