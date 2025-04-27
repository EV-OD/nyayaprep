
import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function SubscriptionSkeleton() {
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

export function MyQuestionsSkeleton() {
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

export function AnswerHistorySkeleton() {
    return (
        <div className="space-y-3 flex-grow"> {/* Added flex-grow */}
            {[...Array(4)].map((_, i) => ( // Show more skeleton items
                 <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1 space-y-1.5 mr-4">
                        <Skeleton className="h-4 w-1/2" /> {/* Quiz Date */}
                        <Skeleton className="h-3 w-1/3" /> {/* Score */}
                    </div>
                    <Skeleton className="h-8 w-16 rounded-md" /> {/* View button */}
                 </div>
            ))}
        </div>
    );
}

export function PerformanceAnalyticsSkeleton() {
    return (
        <div className="space-y-6">
           {/* Skeleton for Key Stats Section */}
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                     <div key={i} className="p-4 border rounded-lg bg-card shadow-sm">
                         <div className="flex items-center gap-2 mb-2">
                              <Skeleton className="h-4 w-4 rounded-full" /> {/* Icon Skeleton */}
                              <Skeleton className="h-3 w-3/4" /> {/* Title Skeleton */}
                          </div>
                          <Skeleton className="h-6 w-1/2" /> {/* Value Skeleton */}
                     </div>
                 ))}
           </div>
            {/* Skeleton for Chart Section */}
            <div className="mt-6">
                <Skeleton className="h-4 w-1/3 mx-auto mb-3" /> {/* Chart Title Skeleton */}
                <Skeleton className="h-[200px] w-full rounded-md" /> {/* Chart Skeleton */}
            </div>
        </div>
    );
}

