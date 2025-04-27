
'use client'; // Mark as client component

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, DollarSign, BrainCircuit, UserPlus } from 'lucide-react'; // Adjusted icons
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar

export default function Home() {
  // PublicNavbar now handles the conditional rendering of Login/Register/Dashboard buttons
  // No need for local auth state here anymore.

  return (
    <div className="flex flex-col min-h-screen">
       <PublicNavbar />
       <main className="flex flex-1 flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50">
         <div className="text-center max-w-3xl"> {/* Increased max-width */}
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-4 sm:text-5xl md:text-6xl">
              NyayaPrep {/* Updated Title */}
            </h1>
            <p className="text-lg text-foreground/80 mb-6 sm:text-xl"> {/* Updated Description */}
              Prepare for success with NyayaPrep — your all-in-one platform for Law entrance and licensing exam preparation. We offer a wide range of MCQs, practice tests, and study tools designed for BALLB Entrance Exams, Advocate License Preparation, and LLB Entrance Exams. Practice daily quizzes, track your progress, review your performance history, and strengthen your legal knowledge to excel in your career journey.
            </p>
             <p className="text-base italic text-muted-foreground mb-8"> {/* Added Tagline */}
               "Study Smarter. Practice Harder. Achieve Greater."
             </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Start Quiz is always available */}
              <Link href="/quiz" passHref>
                 <Button size="lg" className="w-full sm:w-auto">
                    <BrainCircuit className="mr-2 h-5 w-5" /> Start Quiz
                 </Button>
              </Link>
              {/* Login and Register/Pricing buttons are now handled by PublicNavbar */}
              {/* Removed local Login/Register buttons */}
            </div>
         </div>
         {/* Placeholder for potential future elements like featured categories or testimonials */}
       </main>
        <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
          NyayaPrep &copy; {new Date().getFullYear()}
        </footer>
    </div>
  );
}
