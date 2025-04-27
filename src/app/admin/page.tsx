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

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // --- Mock Authentication ---
    // Replace this with actual authentication logic (e.g., API call)
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    if (username === 'admin' && password === 'password') {
      // Store auth state (e.g., in localStorage/sessionStorage or context/state management)
      // For simplicity, we'll just navigate. In a real app, manage session state.
      localStorage.setItem('isAdminAuthenticated', 'true'); // Example: VERY insecure, use proper sessions/tokens

       toast({
        title: "Login Successful",
        description: "Redirecting to Admin Dashboard...",
      });
      router.push('/admin/dashboard'); // Redirect to dashboard
    } else {
       setError('Invalid username or password.');
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid username or password.",
        });
      setIsLoading(false);
    }
    // --- End Mock Authentication ---
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
