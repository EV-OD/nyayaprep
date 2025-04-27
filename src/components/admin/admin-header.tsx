
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, LayoutDashboard, ListChecks, PlusCircle } from 'lucide-react';
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
import { signOut, User as FirebaseUser } from 'firebase/auth'; // Import Firebase sign out function
import { useEffect, useState } from 'react';

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged((user) => {
         // We assume the layout already verified the user is an admin
         setAdminUser(user);
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
      router.replace('/login'); // Redirect to login page using replace
    } catch (error) {
      console.error("Logout Error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  };

   const getInitials = (email?: string | null): string => {
        if (!email) return 'A';
        return email[0]?.toUpperCase() || 'A';
   };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
         {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-4 text-sm ml-6">
           <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <LayoutDashboard size={16} /> Dashboard
           </Link>
           <Link href="/admin/mcqs" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <ListChecks size={16} /> Manage MCQs
           </Link>
            <Link href="/admin/mcqs/add" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              <PlusCircle size={16} /> Add MCQ
           </Link>
         </nav>
      </div>
      <div className="flex items-center gap-4">
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-8 w-8">
              <Avatar className="h-8 w-8">
                 {/* <AvatarImage src={adminUser?.photoURL || undefined} alt="Admin" /> */}
                 <AvatarFallback>{getInitials(adminUser?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{adminUser?.email || 'Admin Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
               <Settings className="mr-2 h-4 w-4" />
               Settings
             </DropdownMenuItem>
             {/* Remove Profile link for admin for now */}
             {/* <DropdownMenuItem disabled>
               <User className="mr-2 h-4 w-4" />
              Profile (Coming Soon)
            </DropdownMenuItem> */}
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
