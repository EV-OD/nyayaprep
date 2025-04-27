
import type * as React from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"; // Import AreaChart, Area
import { TrendingUp, Lock, Zap, Activity, Target, Percent, ListChecks, HelpCircle } from 'lucide-react'; // Use Activity icon for trend, Added Target, Percent, ListChecks, HelpCircle
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
    // Example data structure - ensure your actual stats calculation provides similar data
    const exampleScoreOverTime = [
      { date: 'Week 1', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.8 : 65 },
      { date: 'Week 2', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.9 : 72 },
      { date: 'Week 3', score: performanceStats?.averageScore ? performanceStats.averageScore * 0.85 : 70 },
      { date: 'Week 4', score: performanceStats?.averageScore || 85 },
      { date: 'Week 5', score: performanceStats ? performanceStats.averageScore * 1.05 : 88 }, // Adding more points
      { date: 'Week 6', score: performanceStats ? performanceStats.averageScore * 1.1 : 92 },
    ];
    // TODO: Replace with actual performanceStats.scoreOverTime when implemented
    // return performanceStats?.scoreOverTime || exampleScoreOverTime;
    return exampleScoreOverTime;
  }, [performanceStats]);

  const chartConfig = {
    score: {
        label: "Average Score (%)",
        color: "hsl(var(--primary))", // Use primary color
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
             <div className={cn("space-y-6", locked ? "opacity-30 pointer-events-none" : "")}>
                {loading ? (
                   <PerformanceAnalyticsSkeleton />
                ) : performanceStats ? (
                    <>
                        {/* Key Stats Section - Improved UI */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg bg-card shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <Target className="h-4 w-4 text-blue-500" />
                                    <p className="text-xs font-medium text-muted-foreground">Overall Accuracy</p>
                                </div>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{performanceStats.accuracy}%</p>
                            </div>
                             <div className="p-4 border rounded-lg bg-card shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                     <Percent className="h-4 w-4 text-green-500" />
                                     <p className="text-xs font-medium text-muted-foreground">Avg. Score</p>
                                </div>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">{performanceStats.averageScore}%</p>
                            </div>
                             <div className="p-4 border rounded-lg bg-card shadow-sm">
                                 <div className="flex items-center gap-2 mb-1">
                                     <ListChecks className="h-4 w-4 text-purple-500" />
                                     <p className="text-xs font-medium text-muted-foreground">Quizzes Taken</p>
                                 </div>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{performanceStats.totalQuizzes}</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-card shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                     <HelpCircle className="h-4 w-4 text-orange-500" />
                                     <p className="text-xs font-medium text-muted-foreground">Questions Done</p>
                                </div>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{performanceStats.totalQuestions}</p>
                            </div>
                        </div>

                        {/* Score Trend Chart */}
                        <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3 text-center text-foreground">Score Trend (Weekly Avg.)</h4>
                             <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                <ResponsiveContainer>
                                    <AreaChart
                                        data={chartData}
                                        margin={{ top: 5, right: 10, left: -25, bottom: 0 }} // Adjusted margins
                                    >
                                        <defs>
                                            <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            fontSize={10}
                                            tickFormatter={(value) => value} // Use date string directly
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            fontSize={10}
                                            domain={[0, 100]} // Assuming score is percentage
                                            tickFormatter={(value) => `${value}%`}
                                        />
                                        <ChartTooltip
                                            cursor={true} // Show cursor line on hover
                                            content={<ChartTooltipContent indicator="line" hideLabel />}
                                        />
                                        <Area
                                            dataKey="score"
                                            type="natural" // Use natural for smooth curve
                                            fill="url(#gradientFill)" // Apply gradient
                                            fillOpacity={1}
                                            stroke="hsl(var(--primary))"
                                            strokeWidth={3} // Increase stroke width
                                            stackId="a" // Required for area charts
                                            dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                            activeDot={{ r: 6, strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </ChartContainer>
                             {/* <Button variant="link" size="sm" className="p-0 h-auto text-xs mt-2 float-right" disabled={locked}>View Detailed Analytics</Button> */}
                        </div>
                    </>
                ) : (
                     <div className="text-center py-10 text-muted-foreground">
                         <Activity size={32} className="mx-auto mb-3" />
                         <p>Take some quizzes to see your performance analytics.</p>
                     </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

