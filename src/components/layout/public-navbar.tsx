
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, DollarSign, BrainCircuit, LayoutDashboard } from 'lucide-react'; // Removed BookOpenCheck
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react'; // Import hooks
import { auth } from '@/lib/firebase/config'; // Import auth
import { onAuthStateChanged, User } from 'firebase/auth'; // Import auth types

// Define the SVG logo component
const LogoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="h-6 w-6">
        <path d="M10 90 L50 70 L90 90 L90 80 L50 60 L10 80 Z" fill="#2E8B57" stroke="black" strokeWidth="2"/> {/* Bottom layer (Greenish) */}
        <path d="M10 80 L50 60 L90 80 L90 70 L50 50 L10 70 Z" fill="#2E8B57" stroke="black" strokeWidth="2"/> {/* Middle layer (Greenish) */}
        <path d="M10 70 L50 50 L90 70 V60 Q 50 40 10 60 Z" fill="white" stroke="black" strokeWidth="2"/> {/* Book pages (White) */}
        <path d="M50 50 L50 70" stroke="black" strokeWidth="2"/> {/* Book spine */}
    </svg>
);


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
        { href: '/', label: 'Home' }, // Removed icon temporarily, Logo is now used for Brand
        { href: '/pricing', label: 'Pricing', icon: <DollarSign size={16} /> },
        { href: '/quiz', label: 'Quiz', icon: <BrainCircuit size={16} /> },
        // Add other public links if needed
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
