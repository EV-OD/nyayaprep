
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { getUserProfile } from '@/lib/firebase/firestore'; // Import Firestore function to check role

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

    try {
      // Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Check user role from Firestore
      const userProfile = await getUserProfile(user.uid);

      toast({
        title: 'Login Successful',
        description: `Welcome back${userProfile?.name ? `, ${userProfile.name}` : ''}! Redirecting...`,
      });

      // Redirect based on role
      if (userProfile?.role === 'admin') {
        router.push('/admin/dashboard'); // Redirect admins to admin dashboard
      } else {
        router.push('/dashboard'); // Redirect regular users to user dashboard
      }

    } catch (err: unknown) {
      const authError = err as AuthError;
      console.error('Firebase Login Error:', authError);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many login attempts. Please try again later.';
          break;
        // Add other Firebase Auth error codes as needed
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
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
                <p className="text-sm text-destructive text-center pt-2">{error}</p>
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
                 <Link href="/register" className="underline hover:text-primary font-medium">
                   Register here
                 </Link>
               </p>
               {/* Link to admin login is removed as it's the same page now */}
               {/* <p className="text-xs text-center text-muted-foreground mt-2">
                 Admin? <Link href="/admin" className="underline hover:text-primary">Admin Login</Link>
               </p> */}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
