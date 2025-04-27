
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, DollarSign, BrainCircuit } from 'lucide-react'; // Adjusted icons
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar

export default function Home() {
  // This page serves as a landing or welcome page.
  // Provides links to start the quiz, login, or view pricing.
  return (
    <div className="flex flex-col min-h-screen">
       <PublicNavbar />
       <main className="flex flex-1 flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50">
         <div className="text-center max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-primary mb-4 sm:text-5xl md:text-6xl">
              Welcome to NyayaPrep
            </h1>
            <p className="text-lg text-foreground/80 mb-8 sm:text-xl">
              Prepare for your BALLB entrance exams with our comprehensive MCQ platform. Practice questions, track your progress, and ace your tests!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quiz" passHref>
                 <Button size="lg" className="w-full sm:w-auto">
                    <BrainCircuit className="mr-2 h-5 w-5" /> Start Quiz
                 </Button>
              </Link>
              <Link href="/login" passHref>
                 <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <LogIn className="mr-2 h-5 w-5" /> Login
                 </Button>
              </Link>
               {/* Changed Register button to link to Pricing page */}
               <Link href="/pricing" passHref>
                 <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                   <DollarSign className="mr-2 h-5 w-5" /> View Pricing
                 </Button>
               </Link>
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
