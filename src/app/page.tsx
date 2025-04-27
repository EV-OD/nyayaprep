import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'; // Added icons

export default function Home() {
  // This page serves as a landing or welcome page.
  // Provides links to start the quiz or log in/register.
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-background to-muted/50">
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
                  Start Quiz <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          <Link href="/login" passHref>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
               <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </Link>
           {/* Updated Register button link */}
           <Link href="/register/select-plan" passHref>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" /> Register
            </Button>
          </Link>
        </div>
      </div>
      {/* Placeholder for potential future elements like featured categories or testimonials */}
       <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        NyayaPrep &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
