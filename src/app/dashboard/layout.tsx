
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { UserHeader } from '@/components/user/user-header'; // We'll create this component

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If user is not logged in, redirect to login page
      if (!currentUser) {
        router.replace('/login'); // Use replace to avoid adding dashboard to history
      }
      // Add role check here if needed, though maybe better handled in specific pages
      // Example: Check Firestore role and redirect if not 'user' role
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // User is not logged in, redirect is handled in useEffect.
    // Render nothing while redirecting.
    return null;
  }

  // If authenticated, render the layout with header and children
  return (
    <div className="flex flex-col min-h-screen">
      <UserHeader /> {/* User-specific header */}
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}
