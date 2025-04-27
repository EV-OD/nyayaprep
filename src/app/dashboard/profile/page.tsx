
'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import type { UserProfile } from '@/types/user';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Use Input for display
import { format } from 'date-fns'; // For formatting date
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Star, Zap } from 'lucide-react'; // Import icons
import { Badge } from '@/components/ui/badge';

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

    const getSubscriptionBadgeVariant = (plan?: string) => {
        switch (plan) {
            case 'premium': return 'default'; // Primary color
            case 'basic': return 'secondary';
            case 'free': return 'outline';
            default: return 'outline';
        }
    };

  return (
    <div className="p-6 md:p-10 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
             {loading ? (
                 <Skeleton className="h-16 w-16 rounded-full" />
             ) : (
                 <Avatar className="h-16 w-16 border">
                     <AvatarImage src={profile?.profilePicture || undefined} alt={profile?.name || 'User'} />
                     <AvatarFallback className="text-xl bg-muted">
                         {getInitials(profile?.name)}
                     </AvatarFallback>
                 </Avatar>
             )}
            <div>
                 <CardTitle className="text-2xl">My Profile</CardTitle>
                 <CardDescription>View and manage your account details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profile.name} readOnly disabled className="bg-muted/50"/>
                 </div>
                  <div className="space-y-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={profile.email} readOnly disabled className="bg-muted/50"/>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={profile.phone} readOnly disabled className="bg-muted/50"/>
                 </div>
                  <div className="space-y-1">
                    <Label htmlFor="role">Account Type</Label>
                    <Input id="role" value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} readOnly disabled className="bg-muted/50"/>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                   <div className="space-y-1">
                      <Label htmlFor="createdAt">Member Since</Label>
                      <Input id="createdAt" value={profile.createdAt ? format(profile.createdAt.toDate(), 'PPP') : 'N/A'} readOnly disabled className="bg-muted/50"/>
                   </div>
                    <div className="space-y-1">
                         <Label htmlFor="subscription">Subscription Plan</Label>
                         <div className="flex items-center gap-2">
                             <Badge id="subscription" variant={getSubscriptionBadgeVariant(profile.subscription)} className="text-sm px-3 py-1 capitalize">
                                 {profile.subscription === 'premium' && <Star className="mr-1.5 h-3.5 w-3.5 fill-current" />}
                                 {profile.subscription || 'Free'} Plan
                             </Badge>
                            {profile.subscription !== 'premium' && (
                                <Button variant="outline" size="sm" disabled> {/* Add Link/onClick later */}
                                    Upgrade
                                    <Zap className="ml-1.5 h-4 w-4" />
                                </Button>
                             )}
                         </div>
                   </div>
               </div>

              {/* Add edit profile button later if needed */}
              {/* <div className="pt-4 border-t mt-6">
                <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
              </div> */}
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                  <div className="space-y-2">
                     <Skeleton className="h-4 w-1/4" />
                     <Skeleton className="h-10 w-full" />
                  </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                     <Skeleton className="h-4 w-1/4" />
                     <Skeleton className="h-10 w-full" />
                  </div>
                   <div className="space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-10 w-full" />
                   </div>
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                         <Skeleton className="h-4 w-1/4" />
                         <Skeleton className="h-8 w-24 rounded-full" />
                     </div>
                </div>
        </div>
    );
}
