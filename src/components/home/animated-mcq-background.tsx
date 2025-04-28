
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface McqCardProps {
  className?: string;
  style?: React.CSSProperties;
}

const DummyMcqCard: React.FC<McqCardProps> = ({ className, style }) => (
  <div
    className={cn(
      'absolute bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border/30 rounded-lg p-3 shadow-lg w-48 md:w-56 pointer-events-none',
      'animate-float', // Apply the floating animation
      className
    )}
    style={style}
  >
    <Skeleton className="h-3 w-3/4 mb-2" /> {/* Question skeleton */}
    <div className="space-y-1.5 mt-2">
      <Skeleton className="h-2.5 w-full" /> {/* Option 1 */}
      <Skeleton className="h-2.5 w-5/6" /> {/* Option 2 */}
      <Skeleton className="h-2.5 w-full" /> {/* Option 3 */}
      <Skeleton className="h-2.5 w-4/6" /> {/* Option 4 */}
    </div>
  </div>
);

export function AnimatedMcqBackground() {
  const cardPositions = [
    // Position and animation delay for each card
    { top: '15%', left: '10%', animationDelay: '0s' },
    { top: '60%', left: '5%', animationDelay: '2s' },
    { top: '25%', left: '75%', animationDelay: '1s' },
    { top: '70%', left: '80%', animationDelay: '3s' },
    { top: '5%', left: '40%', animationDelay: '1.5s' },
    { top: '85%', left: '30%', animationDelay: '2.5s' },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-50 dark:opacity-30">
      {cardPositions.map((pos, index) => (
        <DummyMcqCard
          key={index}
          className="opacity-80" // Start with some opacity
          style={{
            top: pos.top,
            left: pos.left,
            animationDelay: pos.animationDelay,
            // Add slight random rotation for uniqueness (optional)
             transform: `rotate(${Math.random() * 6 - 3}deg)`,
          }}
        />
      ))}
    </div>
  );
}
