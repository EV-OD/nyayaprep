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

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = () => {
     // Clear authentication state
     localStorage.removeItem('isAdminAuthenticated'); // Example: Clear mock auth
     toast({
       title: "Logged Out",
       description: "You have been successfully logged out.",
     });
     router.replace('/admin'); // Redirect to login page
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
          {/* <Button variant="outline" size="icon" className="h-8 w-8 lg:hidden">
             <Menu className="h-4 w-4" /> // Optional: For mobile sidebar toggle
             <span className="sr-only">Toggle Menu</span>
           </Button> */}
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
         {/* Optional: Breadcrumbs or navigation links */}
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
                 {/* Use a real image source if available */}
                 {/* <AvatarImage src="https://picsum.photos/32/32" alt="Admin" /> */}
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
               <Settings className="mr-2 h-4 w-4" />
               Settings
             </DropdownMenuItem>
            <DropdownMenuItem disabled>
               <User className="mr-2 h-4 w-4" />
              Profile (Coming Soon)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10">
               <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
