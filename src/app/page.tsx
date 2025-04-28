
'use client'; // Mark as client component

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogIn, DollarSign, BrainCircuit, UserPlus, BarChart2, BookOpen, MessageSquareQuote } from 'lucide-react'; // Adjusted icons
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Home() {

  const features = [
    {
      icon: <BookOpen size={24} className="text-primary" />,
      title: "Extensive MCQ Bank",
      description: "Practice with a vast collection of MCQs covering various law subjects.",
    },
    {
      icon: <BarChart2 size={24} className="text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your performance, track quiz history, and identify weak areas.",
    },
    {
      icon: <MessageSquareQuote size={24} className="text-primary" />,
      title: "Ask a Teacher",
      description: "Get clarification on difficult questions directly from experienced teachers.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-blue-50/30 to-teal-50/30 dark:from-gray-900 dark:via-gray-800/20 dark:to-teal-900/20">
       <PublicNavbar />

       {/* Hero Section */}
       <main className="flex-1">
         <section className="relative py-20 md:py-32 lg:py-40 flex items-center justify-center text-center px-4 overflow-hidden">
            {/* Background decorative elements - Enhanced & More Visible */}
            <div className="absolute inset-0 z-0 opacity-25 dark:opacity-15"> {/* Increased opacity */}
                {/* Larger blurred circles (blobs) */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-400"></div>
                {/* Subtle dot pattern - Example */}
                <div
                    className="absolute inset-0 opacity-50" // Increased opacity
                    style={{
                        backgroundImage: 'radial-gradient(hsl(var(--muted-foreground)/0.15) 1px, transparent 1px)', // Increased alpha
                        backgroundSize: '10px 10px'
                     }}
                 ></div>
                 {/* Adding a subtle grid pattern */}
                 <div className="absolute inset-0 opacity-50 bg-[linear-gradient(to_right,theme(colors.border/0.15)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/0.15)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div> {/* Increased alpha */}
                 {/* Another Animated Blob */}
                 <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-secondary/20 rounded-full filter blur-2xl animate-pulse animation-delay-200"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl leading-tight drop-shadow-lg">
                 NyayaPrep
                </h1>
                {/* Shortened and restyled description */}
                <p className="mt-6 text-xl font-medium text-foreground/90 sm:text-2xl md:text-3xl max-w-2xl mx-auto drop-shadow-sm">
                  Master Law Exams. <span className="text-primary">Practice MCQs</span>, Track Progress, Succeed.
                </p>
                <p className="mt-4 text-base italic text-muted-foreground max-w-lg mx-auto">
                 "Study Smarter. Practice Harder. Achieve Greater."
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                 <Link href="/quiz" passHref>
                    <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-primary/30 transition-shadow duration-300 transform hover:-translate-y-0.5">
                        <BrainCircuit className="mr-2 h-5 w-5" /> Start Quiz Now
                    </Button>
                 </Link>
                 <Link href="/pricing" passHref>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto shadow-sm hover:shadow-md transition-shadow duration-300 border-primary/50 hover:bg-primary/5 transform hover:-translate-y-0.5">
                        <DollarSign className="mr-2 h-5 w-5" /> View Plans
                    </Button>
                 </Link>
                </div>
            </div>
         </section>

         {/* Features Section */}
         <section className="py-16 md:py-24 bg-background px-4">
           <div className="container mx-auto max-w-6xl text-center">
             <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Why Choose NyayaPrep?</h2>
             <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
               Everything you need to succeed in your law exams, all in one place.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {features.map((feature, index) => (
                 <Card key={index} className="text-left hover:shadow-lg hover:border-primary/30 transition-all duration-300 transform hover:-translate-y-1">
                   <CardHeader>
                     <div className="mb-3 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 mx-auto md:mx-0">
                       {feature.icon}
                     </div>
                     <CardTitle className="text-xl font-semibold text-center md:text-left">{feature.title}</CardTitle>
                   </CardHeader>
                   <CardContent className="text-muted-foreground text-center md:text-left">
                     {feature.description}
                   </CardContent>
                 </Card>
               ))}
             </div>
           </div>
         </section>

         {/* Call to Action Section */}
         <section className="py-16 md:py-24 bg-gradient-to-r from-primary/80 to-teal-600/80 text-primary-foreground px-4 relative overflow-hidden">
             {/* Adding subtle patterns to CTA */}
              <div className="absolute inset-0 z-0 opacity-10">
                 <div
                     className="absolute inset-0 opacity-50"
                     style={{
                         backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                         backgroundSize: '15px 15px'
                      }}
                  ></div>
              </div>
             <div className="container mx-auto max-w-4xl text-center relative z-10">
                 <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Law Exams?</h2>
                 <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                     Join NyayaPrep today and take the first step towards your legal career. Start practicing or choose a plan that fits your needs.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/quiz" passHref>
                         <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg hover:shadow-white/20 transition-shadow duration-300 transform hover:-translate-y-0.5">
                             <BrainCircuit className="mr-2 h-5 w-5" /> Take a Free Quiz
                         </Button>
                      </Link>
                     <Link href="/pricing" passHref>
                         <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 border-white/50 text-white hover:bg-white/20 hover:border-white transition-colors duration-300 transform hover:-translate-y-0.5">
                             <UserPlus className="mr-2 h-5 w-5" /> Get Started
                         </Button>
                      </Link>
                 </div>
             </div>
         </section>
       </main>

        {/* Footer */}
        <footer className="py-8 text-center bg-background border-t">
            <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                 <p className="text-muted-foreground text-sm">
                    NyayaPrep &copy; {new Date().getFullYear()}. All rights reserved.
                 </p>
                 <div className="flex gap-4 text-sm text-muted-foreground">
                      <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                      <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                      <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                 </div>
            </div>
        </footer>
    </div>
  );
}
