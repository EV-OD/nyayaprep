
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, DollarSign, Home, LayoutDashboard, Info, Mail } from 'lucide-react'; // Added Home, Info, Mail icons, removed BrainCircuit
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react'; // Import hooks
import { auth } from '@/lib/firebase/config'; // Import auth
import { onAuthStateChanged, User } from 'firebase/auth'; // Import auth types

// Define the SVG logo component
import LogoIcon from "@/components/LogoIcon";


export function PublicNavbar() {
    const pathname = usePathname();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoadingAuth(false);
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);


    const navItems = [
        { href: '/', label: 'Home', icon: <Home size={16} /> },
        { href: '/pricing', label: 'Pricing', icon: <DollarSign size={16} /> },
        { href: '/about', label: 'About', icon: <Info size={16} /> }, // Added About Us
        { href: '/contact', label: 'Contact', icon: <Mail size={16} /> }, // Added Contact
        // { href: '/quiz', label: 'Quiz', icon: <BrainCircuit size={16} /> }, // Removed Quiz link
    ];

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
            {/* Logo and Main Nav */}
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <LogoIcon /> {/* Use the SVG Logo */}
                    <span className="hidden sm:inline-block">NyayaPrep</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm">
                     {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "transition-colors flex items-center gap-1",
                                pathname === item.href ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                            )}
                            >
                            {item.icon} {item.label}
                        </Link>
                     ))}
                </nav>
            </div>

            {/* Action Buttons - Conditionally Rendered */}
            <div className="flex items-center gap-2">
                {loadingAuth ? (
                    // Optional: Add a loading indicator while checking auth state
                    // <Skeleton className="h-9 w-36 rounded-md" />
                    <div className="h-9 w-36"></div> // Placeholder to prevent layout shift
                ) : currentUser ? (
                    // Show Dashboard button if user is logged in
                    <Link href="/dashboard" passHref>
                        <Button variant={pathname.startsWith('/dashboard') ? 'default' : 'outline'} size="sm">
                            <LayoutDashboard className="mr-1.5 h-4 w-4" /> Dashboard
                        </Button>
                    </Link>
                ) : (
                    // Show Login and Register buttons if user is not logged in
                    <>
                        <Link href="/login" passHref>
                            <Button variant={pathname === '/login' ? 'default' : 'outline'} size="sm">
                                <LogIn className="mr-1.5 h-4 w-4" /> Login
                            </Button>
                        </Link>
                        <Link href="/pricing" passHref>
                            {/* Highlight Register if on pricing or register page */}
                            <Button variant={pathname.startsWith('/register') || pathname === '/pricing' ? 'default' : 'secondary'} size="sm">
                                <UserPlus className="mr-1.5 h-4 w-4" /> Register
                            </Button>
                        </Link>
                    </>
                )}
             </div>
        </header>
    );
}
