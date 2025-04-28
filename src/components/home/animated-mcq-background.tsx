
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react'; // Import icons

interface McqCardProps {
  className?: string;
  style?: React.CSSProperties;
  isCorrectExample?: boolean; // Add prop to alternate examples
}

const DummyMcqCard: React.FC<McqCardProps> = ({ className, style, isCorrectExample }) => {
    // Simulate different options being correct/incorrect
    const options = [
        { text: 'Option 1', isCorrect: isCorrectExample, isSelected: isCorrectExample },
        { text: 'Option 2', isCorrect: !isCorrectExample, isSelected: false },
        { text: 'Option 3', isCorrect: false, isSelected: !isCorrectExample },
        { text: 'Option 4', isCorrect: false, isSelected: false },
    ];

    // Shuffle options for visual variety (client-side only to avoid hydration issues)
    const [shuffledOptions, setShuffledOptions] = React.useState(options);
    React.useEffect(() => {
        setShuffledOptions(options.sort(() => Math.random() - 0.5));
    }, [isCorrectExample]); // Re-shuffle based on the example type

    return (
      <div
        className={cn(
          'absolute bg-card/70 dark:bg-card/50 backdrop-blur-md border border-border/40 rounded-xl p-4 shadow-xl w-56 md:w-64 pointer-events-none overflow-hidden', // Increased rounding and padding
          'animate-float', // Apply the floating animation
          className
        )}
        style={style}
      >
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-3">
             <Skeleton className="h-3 w-1/3" /> {/* Category */}
             <Skeleton className="h-5 w-5 rounded-full bg-primary/20" /> {/* Icon placeholder */}
        </div>

        {/* Question Skeleton */}
        <Skeleton className="h-3.5 w-full mb-1" />
        <Skeleton className="h-3.5 w-5/6 mb-4" />

        {/* Options with Icons */}
        <div className="space-y-2.5 mt-2">
          {shuffledOptions.map((option, index) => (
            <div key={index} className={cn("flex items-center justify-between p-1.5 rounded-md",
                option.isSelected && !option.isCorrect ? "bg-red-500/10" : "",
                option.isSelected && option.isCorrect ? "bg-green-500/10" : "",
                !option.isSelected && option.isCorrect ? "border border-dashed border-green-500/30" : "" // Highlight correct if not selected
             )}>
                <Skeleton className="h-2.5 flex-1 mr-2" />
                 {option.isSelected ? (
                    option.isCorrect ? <CheckCircle size={12} className="text-green-500 shrink-0"/> : <XCircle size={12} className="text-red-500 shrink-0"/>
                 ) : (
                    option.isCorrect ? <CheckCircle size={12} className="text-green-500/50 shrink-0"/> : <Skeleton className="h-3 w-3 bg-muted rounded-full shrink-0"/>
                 )}
            </div>
          ))}
        </div>

         {/* Simulated Analytics Footer */}
         <div className="mt-4 pt-2 border-t border-border/30 flex items-center justify-between">
            <div className="flex gap-1 items-end h-4">
                 <Skeleton className="h-full w-1.5 bg-primary/30"/>
                 <Skeleton className="h-2/3 w-1.5 bg-primary/30"/>
                 <Skeleton className="h-1/3 w-1.5 bg-primary/30"/>
            </div>
            <TrendingUp size={14} className="text-muted-foreground/50"/>
         </div>

      </div>
    );
};


export function AnimatedMcqBackground() {
  const cardPositions = [
    // Position and animation delay for each card
    { top: '15%', left: '10%', animationDelay: '0s', correct: true },
    { top: '60%', left: '5%', animationDelay: '2s', correct: false },
    { top: '25%', left: '75%', animationDelay: '1s', correct: true },
    { top: '70%', left: '80%', animationDelay: '3s', correct: false },
    { top: '5%', left: '40%', animationDelay: '1.5s', correct: false },
    { top: '85%', left: '30%', animationDelay: '2.5s', correct: true },
  ];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-60 dark:opacity-40"> {/* Adjusted opacity */}
      {cardPositions.map((pos, index) => (
        <DummyMcqCard
          key={index}
          className="opacity-90" // Increased opacity
          isCorrectExample={pos.correct}
          style={{
            top: pos.top,
            left: pos.left,
            animationDelay: pos.animationDelay,
            // Remove random rotation to fix hydration error
          }}
        />
      ))}
    </div>
  );
}
