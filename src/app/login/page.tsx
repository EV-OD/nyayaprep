
'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { getUserProfile, handleSubscriptionExpiry } from '@/lib/firebase/firestore'; // Import Firestore function to check role and handle expiry
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof formSchema>;

// Component containing the form logic
function LoginFormComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params directly
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    // Access redirectUrl directly from searchParams
    const redirectUrl = searchParams.get('redirect');

    try {
      // Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Check for subscription expiry immediately after login
      const expired = await handleSubscriptionExpiry(user.uid);
      if (expired) {
          toast({ variant: "destructive", title: "Subscription Expired", description: "Your subscription has expired. Please renew." });
          // Fetch profile again to get the potentially updated (non-validated) status
          const updatedProfile = await getUserProfile(user.uid);
          // Redirect based on expired status (likely back to pricing or dashboard showing expired state)
          if (updatedProfile?.role === 'admin') {
               router.push('/admin/dashboard'); // Admins might still access dashboard
          } else {
              router.push('/dashboard'); // Regular users go to dashboard to see expired status
          }
          return; // Stop further execution if expired
      }

      // If not expired, proceed to check role and redirect
      const userProfile = await getUserProfile(user.uid);

      toast({
        title: 'Login Successful',
        description: `Welcome back${userProfile?.name ? `, ${userProfile.name}` : ''}! Redirecting...`,
      });

      // Redirect logic
      if (redirectUrl) {
        // If a redirect URL is provided, go there
        router.push(redirectUrl);
      } else if (userProfile?.role === 'admin') {
        // Otherwise, redirect admins to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // Redirect regular users to user dashboard
        router.push('/dashboard');
      }

    } catch (err: unknown) {
      const authError = err as AuthError;
      console.error('Firebase Login Error:', authError.code, authError.message);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address format is not valid.';
          break;
        case 'auth/user-disabled':
           errorMessage = 'This user account has been disabled.';
           break;
        case 'auth/too-many-requests':
          errorMessage = 'Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.';
          break;
        default:
           console.warn(`Unhandled Firebase Auth Error Code: ${authError.code}`);
           break;
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
       <PublicNavbar />
       <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
          <Card className="w-full max-w-sm shadow-xl border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                <LogIn size={24} /> Login to NyayaPrep
              </CardTitle>
              <CardDescription>Access your account or the admin panel.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <CardContent className="space-y-4 pb-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <p className="text-sm font-medium text-destructive text-center pt-2">{error}</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging In...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                     Don't have an account?{' '}
                     <Link href="/pricing" className="underline hover:text-primary font-medium">
                       Register here
                     </Link>
                   </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
       </main>
        <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
          NyayaPrep &copy; {new Date().getFullYear()}
        </footer>
    </div>
  );
}


// Wrap the component that uses useSearchParams with Suspense
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-1 items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginFormComponent />
        </Suspense>
    );
}
