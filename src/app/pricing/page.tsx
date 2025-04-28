'use client';

import * as React from 'react';
import { useState, useEffect } from 'react'; // Added hooks for auth state
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Use router for navigation
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, X, Award, MessageSquareQuote, Loader2 } from 'lucide-react'; // Added Loader2
import { cn } from '@/lib/utils';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { auth } from '@/lib/firebase/config'; // Import auth
import { onAuthStateChanged, User } from 'firebase/auth'; // Import auth types
import { getUserProfile } from '@/lib/firebase/firestore'; // To check current plan
import type { UserProfile, SubscriptionPlan } from '@/types/user'; // Import types

const plans = [
  {
    name: 'Free',
    price: 'NRS 0',
    period: '/ forever',
    description: 'Start learning with basic access.',
    features: [
      { text: '2 Quizzes per day (10 questions each)', included: true },
      { text: 'Answer History Tracking', included: false },
      { text: 'Performance Analytics', included: false },
      { text: 'Downloadable Notes & PDFs', included: false },
      { text: 'Ask Teacher (0 questions/day)', included: false },
      { text: 'Basic Support', included: true },
    ],
    planId: 'free' as SubscriptionPlan,
    cta: 'Register for Free',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 'NRS 50',
    period: '/ week',
    description: 'More practice for regular learners.',
    features: [
      { text: '5 Quizzes per day (10 questions each)', included: true },
      { text: 'Answer History Tracking', included: false },
      { text: 'Performance Analytics', included: false },
      { text: 'Downloadable Notes & PDFs', included: false },
      { text: 'Ask Teacher (2 questions/day)', included: true },
      { text: 'Basic Support', included: true },
    ],
    planId: 'basic' as SubscriptionPlan,
    cta: 'Choose Basic',
    highlight: true,
    badge: 'Most Popular',
    badgeIcon: <Award size={12} className="fill-current" />,
  },
  {
    name: 'Premium',
    price: 'NRS 100',
    period: '/ week',
    description: 'Unlimited access and all features.',
    features: [
      { text: 'Unlimited Quizzes (10 questions each)', included: true },
      { text: 'Answer History Tracking', included: true },
      { text: 'Performance Analytics', included: true },
      { text: 'Downloadable Notes & PDFs', included: true },
      { text: 'Ask Teacher (20 questions/day)', included: true },
      { text: 'Priority Support', included: true },
    ],
    planId: 'premium' as SubscriptionPlan,
    cta: 'Go Premium',
    highlight: true,
    badge: 'Best Value',
    badgeIcon: <Star size={12} className="fill-current" />,
  },
];

export default function PricingPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
          try {
              const profile = await getUserProfile(user.uid);
              setUserProfile(profile);
          } catch (error) {
              console.error("Failed to fetch profile:", error);
              setUserProfile(null); // Ensure profile is null on error
          }
      } else {
          setUserProfile(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectPlan = (planId: SubscriptionPlan) => {
    if (loadingAuth) return; // Do nothing while loading

    if (currentUser) {
        // User is logged in
        if (planId === 'free') {
            // Redirect to dashboard if already logged in and tries to select free
            router.push('/dashboard');
        } else {
            // Direct logged-in users (even if already on a paid plan) to payment page for upgrade/renewal
            router.push(`/payment?plan=${planId}`);
        }
    } else {
        // User is not logged in
        // Redirect to the register page, passing the selected plan
        router.push(`/register?plan=${planId}`);
    }
  };


  if (loadingAuth) {
      return (
          <div className="flex flex-col min-h-screen">
              <PublicNavbar />
              <div className="flex flex-1 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
       <main className="flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 md:p-8 py-12">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-lg md:text-xl text-foreground/80">
             {currentUser ? 'Upgrade or manage your subscription.' : 'Select the plan that best fits your preparation needs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
          {plans.map((plan) => {
            const isCurrentPlan = userProfile?.subscription === plan.planId;
            const ctaText = isCurrentPlan ? 'Current Plan' : plan.cta;

            return (
                <Card
                  key={plan.planId}
                  className={cn(
                    'flex flex-col transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl relative overflow-hidden border',
                    plan.highlight && !isCurrentPlan ? 'border-primary border-2 shadow-lg bg-card' : 'bg-card',
                     isCurrentPlan ? 'border-blue-500 border-2 ring-2 ring-blue-500/50' : '' // Style for current plan
                  )}
                >
                   {plan.highlight && plan.badge && !isCurrentPlan && ( // Only show badge if not current plan
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                          {plan.badgeIcon || <Star size={12} className="fill-current" />} {plan.badge}
                      </div>
                   )}
                   {isCurrentPlan && (
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 z-10">
                            <Check size={12} className="fill-current" /> Current
                        </div>
                   )}
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-semibold text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground h-10">{plan.description}</CardDescription>
                     <div className="flex items-baseline gap-1 mt-2">
                         <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                         <span className="text-sm text-muted-foreground">{plan.period}</span>
                     </div>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3 pt-2">
                    <p className="text-sm font-medium text-foreground mb-3">Features:</p>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                           {feature.included ? (
                             <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                           ) : (
                             <X className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                           )}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-6 bg-muted/30">
                    <Button
                      className={cn('w-full', plan.highlight && !isCurrentPlan ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground', isCurrentPlan ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-not-allowed' : '')}
                      size="lg"
                      onClick={() => handleSelectPlan(plan.planId)} // Only call handler if not current plan
                      disabled={isCurrentPlan} // Disable button for current plan
                    >
                      {ctaText}
                    </Button>
                  </CardFooter>
                </Card>
            );
          })}
        </div>
         {!currentUser && (
             <p className="mt-10 text-center text-muted-foreground text-sm">
                 Already have an account?{' '}
                 <Link href="/login" className="underline hover:text-primary font-medium">
                 Login here
                 </Link>
             </p>
         )}
          {currentUser && (
             <p className="mt-10 text-center text-muted-foreground text-sm">
                 Manage your subscription and profile in your{' '}
                 <Link href="/dashboard" className="underline hover:text-primary font-medium">
                 Dashboard
                 </Link>.
             </p>
          )}
       </main>
        <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
          NyayaPrep &copy; {new Date().getFullYear()}
        </footer>
    </div>
  );
}
