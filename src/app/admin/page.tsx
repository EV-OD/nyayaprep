'use client'; // Needs client-side interaction for form handling

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase/config'; // Import Firebase auth instance
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth'; // Import Firebase auth functions

export default function AdminLoginPage() {
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign in using Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      toast({
        title: "Login Successful",
        description: "Redirecting to Admin Dashboard...",
      });
      router.push('/admin/dashboard'); // Redirect to dashboard

    } catch (err: unknown) {
      const authError = err as AuthError; // Type assertion for Firebase AuthError
      console.error("Firebase Login Error:", authError);

      // Provide user-friendly error messages
      let errorMessage = "An unexpected error occurred. Please try again.";
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // More generic error in newer SDK versions
          errorMessage = "Invalid email or password.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many login attempts. Please try again later.";
          break;
        // Add other Firebase Auth error codes as needed
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
    // No need to manually set loading to false on success, as navigation happens
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-sm shadow-xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Admin Login</CardTitle>
          <CardDescription>Access the NyayaPrep management panel.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label> {/* Changed from username */}
              <Input
                id="email"
                type="email" // Use email type
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
             {error && (
               <p className="text-sm text-destructive text-center pt-2">{error}</p>
             )}
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </form>
         <div className="p-4 text-center text-xs text-muted-foreground border-t">
           <a href="/" className="hover:text-primary underline">Back to Student View</a>
         </div>
      </Card>
    </div>
  );
}
