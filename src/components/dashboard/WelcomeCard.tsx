
import type * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserIcon } from 'lucide-react';
import type { UserProfile } from '@/types/user';

interface WelcomeCardProps {
  profile: UserProfile | null;
  loading: boolean;
}

export function WelcomeCard({ profile, loading }: WelcomeCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
         <div className="flex flex-row items-center justify-between space-y-0 mb-1">
             <CardTitle className="text-sm font-medium">Welcome Back</CardTitle>
             <UserIcon className="h-4 w-4 text-muted-foreground" />
         </div>
         {loading ? (
            <Skeleton className="h-8 w-3/4" />
         ) : (
            <div className="text-2xl font-bold truncate">{profile?.name || 'User'}</div>
         )}
      </CardHeader>
      <CardContent className="pt-0">
         {loading ? (
           <Skeleton className="h-4 w-1/2 mb-3" />
         ) : (
           <p className="text-xs text-muted-foreground mb-3 truncate">{profile?.email}</p>
         )}
         <Link href="/dashboard/profile" passHref className="mt-2 inline-block">
           <Button variant="outline" size="sm">View Profile</Button>
         </Link>
      </CardContent>
    </Card>
  );
}
