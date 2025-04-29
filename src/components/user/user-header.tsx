
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, ClipboardList } from 'lucide-react'; // Removed BookOpenCheck
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase/config';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types/user';

// Define the SVG logo component
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="h-6 w-6">
        <path d="M10 90 L50 70 L90 90 L90 80 L50 60 L10 80 Z" fill="#2E8B57" stroke="black" strokeWidth="2"/> {/* Bottom layer (Greenish) */}
        <path d="M10 80 L50 60 L90 80 L90 70 L50 50 L10 70 Z" fill="#2E8B57" stroke="black" strokeWidth="2"/> {/* Middle layer (Greenish) */}
        <path d="M10 70 L50 50 L90 70 V60 Q 50 40 10 60 Z" fill="white" stroke="black" strokeWidth="2"/> {/* Book pages (White) */}
        <path d="M50 50 L50 70" stroke="black" strokeWidth="2"/> {/* Book spine */}
    </svg>
);


export function UserHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

   useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setCurrentUser(user);
            if (user) {
                setLoadingProfile(true);
                try {
                    const profile = await getUserProfile(user.uid);
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Failed to fetch user profile:", error);
                    // Handle error appropriately, maybe show a toast
                } finally {
                    setLoadingProfile(false);
                }
            } else {
                setUserProfile(null);
                setLoadingProfile(false);
            }
        });

        return () => unsubscribe();
    }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.replace('/login'); // Redirect to login page
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  };

  const getInitials = (name?: string): string => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length === 1) return names[0][0]?.toUpperCase() || 'U';
        return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
    };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-lg font-semibold md:text-xl text-primary flex items-center gap-2">
           <LogoIcon /> {/* Use the SVG Logo */}
           NyayaPrep
        </Link>
         {/* Optional: Breadcrumbs or navigation links */}
          <nav className="hidden md:flex items-center gap-4 text-sm ml-6">
           <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard size={16} /> Dashboard
           </Link>
           <Link href="/quiz" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ClipboardList size={16} /> Start New Quiz
           </Link>
         </nav>
      </div>
      <div className="flex items-center gap-4">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-8 w-8">
              <Avatar className="h-8 w-8">
                 {/* Future: <AvatarImage src={currentUser?.photoURL || undefined} alt="User" /> */}
                 <AvatarFallback>
                     {loadingProfile ? '...' : getInitials(userProfile?.name)}
                  </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{userProfile?.name || currentUser?.email || 'My Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
               <User className="mr-2 h-4 w-4" />
               Profile
             </DropdownMenuItem>
             {/* Add other relevant links here if needed */}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
               <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
