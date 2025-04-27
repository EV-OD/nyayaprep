
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile, SubscriptionPlan } from '@/types/user'; // Import SubscriptionPlan
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Use Input for display
import { format } from 'date-fns'; // For formatting date
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Star, Zap, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'; // Import icons
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link'; // Import Link

// WhatsApp number for validation
const WHATSAPP_NUMBER = '+97798XXXXXXXX'; // Placeholder number

// Updated subscription details including color classes (consistent with dashboard)
const subscriptionDetails: Record<SubscriptionPlan, { name: string; colorClass: string; price: string; }> = {
    free: {
        name: 'Free',
        colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', // Gray
        price: 'NRS 0'
    },
    basic: {
        name: 'Basic',
        colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', // Green
        price: 'NRS 50 / week' // Updated price
    },
    premium: {
        name: 'Premium',
        colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', // Gold/Yellow
        price: 'NRS 100 / week'
    },
};


export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Add toast notification here if needed
        } finally {
          setLoading(false);
        }
      } else {
        // User is logged out (layout should handle redirect)
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

   const getInitials = (name?: string): string => {
        if (!name) return '?';
        const names = name.split(' ');
        if (names.length === 1) return names[0][0]?.toUpperCase() || '?';
        return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
    };

    const getSubscriptionBadgeVariant = (plan?: SubscriptionPlan): "default" | "secondary" | "outline" | "destructive" | null | undefined => {
        switch (plan) {
            case 'premium': return 'default';
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

    const showValidationAlert = profile && profile.subscription !== 'free' && !profile.validated;
    const currentPlanDetails = profile?.subscription ? subscriptionDetails[profile.subscription] : subscriptionDetails.free;

  return (
    <div className="p-6 md:p-10 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
             {loading ? (
                 <Skeleton className="h-16 w-16 rounded-full shrink-0" />
             ) : (
                 <Avatar className="h-16 w-16 border shrink-0">
                     <AvatarImage src={profile?.profilePicture || undefined} alt={profile?.name || 'User'} />
                     <AvatarFallback className="text-xl bg-muted">
                         {getInitials(profile?.name)}
                     </AvatarFallback>
                 </Avatar>
             )}
            <div className="flex-1">
                 <CardTitle className="text-2xl">My Profile</CardTitle>
                 <CardDescription>View and manage your account details.</CardDescription>
                 {/* Display name directly under title on mobile */}
                 {loading ? (
                     <Skeleton className="h-5 w-3/4 mt-2 sm:hidden" />
                 ) : (
                    <p className="text-lg font-medium mt-1 sm:hidden">{profile?.name}</p>
                 )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Alert */}
           {showValidationAlert && !loading && (
             <Alert variant="destructive" className="border-yellow-500 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600">
               <AlertTriangle className="h-4 w-4" />
               <AlertTitle className="font-semibold">Account Pending Validation</AlertTitle>
               <AlertDescription>
                 Your <span className="font-medium">{profile?.subscription}</span> plan needs verification. Please send your payment screenshot to WhatsApp:
                  <strong className="ml-1">{WHATSAPP_NUMBER}</strong>.
                 <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block">
                     <Button variant="link" size="sm" className="p-0 h-auto text-xs text-yellow-700 hover:text-yellow-900">
                         <MessageSquare className="mr-1 h-3 w-3"/> Send on WhatsApp
                     </Button>
                 </a>
               </AlertDescription>
             </Alert>
          )}

          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <>
              {/* Basic Info */}
              <Card className="border-muted shadow-none">
                  <CardHeader className="pb-3 pt-4 px-4">
                      <CardTitle className="text-base">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label htmlFor="name" className="text-xs text-muted-foreground">Full Name</Label>
                            <Input id="name" value={profile.name} readOnly disabled className="bg-muted/30 h-9"/>
                         </div>
                          <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs text-muted-foreground">Email Address</Label>
                            <Input id="email" type="email" value={profile.email} readOnly disabled className="bg-muted/30 h-9"/>
                          </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
                            <Input id="phone" type="tel" value={profile.phone} readOnly disabled className="bg-muted/30 h-9"/>
                         </div>
                          <div className="space-y-1">
                             <Label htmlFor="createdAt" className="text-xs text-muted-foreground">Member Since</Label>
                             <Input id="createdAt" value={profile.createdAt ? format(profile.createdAt.toDate(), 'PPP') : 'N/A'} readOnly disabled className="bg-muted/30 h-9"/>
                          </div>
                      </div>
                   </CardContent>
              </Card>

              {/* Subscription Info */}
              <Card className="border-muted shadow-none">
                   <CardHeader className="pb-3 pt-4 px-4">
                      <CardTitle className="text-base">Subscription Status</CardTitle>
                   </CardHeader>
                   <CardContent className="px-4 pb-4">
                        <div className={cn("p-3 rounded-md border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3", currentPlanDetails.colorClass)}>
                             <div>
                                 <div className="flex items-center gap-2 mb-1">
                                     <Badge variant={getSubscriptionBadgeVariant(profile.subscription)} className="text-xs capitalize">
                                         {profile.subscription === 'premium' && <Star className="mr-1 h-3 w-3 fill-current" />}
                                         {currentPlanDetails.name} Plan
                                     </Badge>
                                     {profile.subscription !== 'free' && (
                                          <span className={cn("text-xs flex items-center gap-1 font-medium", profile.validated ? "text-green-700" : "text-yellow-700")}>
                                             {profile.validated ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                             {profile.validated ? 'Validated' : 'Pending Validation'}
                                          </span>
                                     )}
                                 </div>
                                 <p className="text-xs font-medium">{currentPlanDetails.price}</p>
                              </div>
                             {profile.subscription !== 'premium' && (
                                <Link href="/pricing" passHref>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("w-full sm:w-auto bg-background/70 border-current hover:bg-background text-current",
                                            profile.subscription === 'basic' ? "border-green-600 text-green-700 dark:border-green-400 dark:text-green-400" : // Adjusted dark mode color
                                            profile.subscription === 'free' ? "border-gray-600 text-gray-700 dark:border-gray-400 dark:text-gray-400" : "" // Adjusted dark mode color
                                         )}
                                    >
                                         Upgrade Plan
                                         <Zap className="ml-1.5 h-4 w-4" />
                                     </Button>
                                 </Link>
                             )}
                         </div>
                   </CardContent>
               </Card>

            </>
          ) : (
            <p className="text-center text-muted-foreground py-6">Could not load profile information.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
             {/* Basic Info Skeleton */}
              <Card className="border-muted shadow-none">
                   <CardHeader className="pb-3 pt-4 px-4">
                      <Skeleton className="h-5 w-1/3" />
                   </CardHeader>
                   <CardContent className="space-y-4 px-4 pb-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                               <Skeleton className="h-3 w-1/4" />
                               <Skeleton className="h-9 w-full" />
                           </div>
                            <div className="space-y-1.5">
                               <Skeleton className="h-3 w-1/4" />
                               <Skeleton className="h-9 w-full" />
                            </div>
                       </div>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                               <Skeleton className="h-3 w-1/4" />
                               <Skeleton className="h-9 w-full" />
                            </div>
                            <div className="space-y-1.5">
                               <Skeleton className="h-3 w-1/4" />
                               <Skeleton className="h-9 w-full" />
                            </div>
                       </div>
                   </CardContent>
               </Card>

             {/* Subscription Skeleton */}
               <Card className="border-muted shadow-none">
                    <CardHeader className="pb-3 pt-4 px-4">
                       <Skeleton className="h-5 w-1/3" />
                    </CardHeader>
                     <CardContent className="px-4 pb-4">
                         <div className="p-3 rounded-md border border-muted bg-muted/30">
                             <div className="flex justify-between items-center mb-2">
                                 <Skeleton className="h-6 w-1/4 rounded-full" />
                                 <Skeleton className="h-4 w-1/5 rounded" />
                             </div>
                              <Skeleton className="h-4 w-1/3 rounded" />
                         </div>
                     </CardContent>
                </Card>
        </div>
    );
}
