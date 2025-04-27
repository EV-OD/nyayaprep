
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const plans = [
  {
    name: 'Free',
    price: 'NRS 0',
    description: 'Get started with basic access.',
    features: [
      'Limited access (20 questions/day)',
      'No premium content',
      'No PDF downloads',
      'Basic support',
    ],
    planId: 'free',
    cta: 'Select Plan',
    highlight: false,
  },
  {
    name: 'Basic',
    price: 'NRS 20 / week',
    description: 'More practice questions for regular learners.',
    features: [
       'Increased access (100 questions/day)',
       'No premium content',
       'No PDF downloads',
       'Basic support',
    ],
    planId: 'basic',
    cta: 'Select Plan',
    highlight: false, // Can be highlighted if desired
  },
  {
    name: 'Premium',
    price: 'NRS 100 / week',
    description: 'Unlimited access and all features.',
    features: [
      'Unlimited quiz access',
      'Access to all premium content',
      'Downloadable notes & PDFs',
      'Priority support',
    ],
    planId: 'premium',
    cta: 'Select Plan',
    highlight: true, // Highlight the premium plan
    badge: 'Best Value',
  },
];

export default function SelectPlanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">Choose Your Plan</h1>
        <p className="text-lg text-foreground/80 max-w-xl mx-auto">
          Select the plan that best fits your preparation needs and unlock more features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl">
        {plans.map((plan) => (
          <Card
            key={plan.planId}
            className={cn(
              'flex flex-col transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl relative overflow-hidden',
              plan.highlight ? 'border-primary border-2 shadow-lg' : 'border'
            )}
          >
             {plan.highlight && plan.badge && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Star size={12} className="fill-current" /> {plan.badge}
                </div>
             )}
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <ul className="space-y-2 text-sm text-foreground/90">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="mt-auto border-t pt-6">
              <Link href={`/register?plan=${plan.planId}`} passHref className="w-full">
                <Button
                  className={cn('w-full', plan.highlight ? 'bg-primary hover:bg-primary/90' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground')}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
       <p className="mt-8 text-center text-muted-foreground text-sm">
         Already have an account?{' '}
         <Link href="/login" className="underline hover:text-primary font-medium">
           Login here
         </Link>
       </p>
    </div>
  );
}

