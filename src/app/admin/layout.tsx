
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserProfile } from '@/lib/firebase/firestore'; // Import Firestore function
import type { UserProfile } from '@/types/user';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get current path
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCheckingRole, setIsCheckingRole] = useState<boolean>(false); // State for role check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // User is logged in, now check their role
        setIsCheckingRole(true);
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          if (userProfile?.role !== 'admin') {
            // Not an admin, redirect to user dashboard or login
             console.warn(`User ${currentUser.uid} is not an admin. Redirecting.`);
             router.replace('/dashboard'); // Redirect non-admins
          } else {
              // Is an admin, allow access
              console.log(`Admin user ${currentUser.uid} accessed admin area.`);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          // Handle error, maybe redirect to login or show error message
          router.replace('/login');
        } finally {
          setIsCheckingRole(false);
          setLoading(false); // Stop overall loading once role check is done
        }
      } else {
        // User is not logged in, redirect to login page
         // No need to check role if not logged in
         setProfile(null);
         setIsCheckingRole(false);
         setLoading(false); // Stop loading
         router.replace('/login'); // Use replace to avoid adding admin route to history
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]); // Dependency array

   // Combined loading state
   const showLoading = loading || (user && isCheckingRole);

   if (showLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <span className="ml-2">Verifying access...</span>
       </div>
     );
   }

  // If loading is finished, and user is verified as admin, render children
  // The redirects handle cases where user is null or not admin
  if (user && profile?.role === 'admin') {
      return <>{children}</>;
  }

  // Fallback: Render nothing while redirects are happening or if conditions aren't met
  // (This state should ideally not be reached for long due to redirects)
  return null;
}
