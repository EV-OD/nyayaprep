'use client'; // Required for useEffect, useState, useRouter

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth'; // Import Firebase auth state listener
import { auth } from '@/lib/firebase/config'; // Import Firebase auth instance

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null); // Store Firebase user object
  const [loading, setLoading] = useState<boolean>(true); // Unified loading state

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If user is not logged in and not already on the login page, redirect
      if (!currentUser && pathname !== '/admin') {
        router.replace('/admin'); // Use replace to avoid adding login to history
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, pathname]); // Re-check if the route or auth state changes

  // Show loading state while checking authentication, except on the login page itself
   if (loading && pathname !== '/admin') {
     return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

  // If not authenticated (and not loading) and not on the login page, render nothing
  // The redirect is handled within the useEffect hook
  if (!user && !loading && pathname !== '/admin') {
     return null; // Or return the loading spinner again
  }

  // If authenticated, loading is finished, or on the login page, render the children
  return <>{children}</>;
}
