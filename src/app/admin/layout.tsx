'use client'; // Required for useEffect and useRouter

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Use null to indicate loading state

  useEffect(() => {
    // --- Mock Authentication Check ---
    // In a real app, verify the session/token with your backend here.
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAdminAuthenticated'); // Example: VERY insecure
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
         // Redirect to login only if not already on the login page
         if (pathname !== '/admin') {
           router.replace('/admin'); // Use replace to avoid adding login to history
         }
      }
    };
    checkAuth();
    // --- End Mock Authentication Check ---
  }, [router, pathname]); // Re-check if the route changes

  // Show loading state while checking authentication
   if (isAuthenticated === null && pathname !== '/admin') {
     return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }

  // If not authenticated and not on the login page, don't render children (redirect is handled in useEffect)
  if (!isAuthenticated && pathname !== '/admin') {
     return null; // Or return the loading spinner again
  }

  // If authenticated or on the login page, render the children
  return <>{children}</>;
}
