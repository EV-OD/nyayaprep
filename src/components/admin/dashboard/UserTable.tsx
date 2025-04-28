
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Star, CalendarPlus, CalendarCheck, CalendarOff, AlertTriangle } from 'lucide-react';
import type { UserProfile, SubscriptionPlan } from '@/types/user';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface UserTableProps {
  users: UserProfile[];
  onOpenValidationDialog: (user: UserProfile) => void;
}

// Helper functions for badge styling (moved here for encapsulation)
const getSubscriptionBadgeDetails = (plan?: SubscriptionPlan) => {
    switch (plan) {
        case 'premium': return { variant: 'default', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', icon: <Star className="mr-1 h-3 w-3 fill-current" /> };
        case 'basic': return { variant: 'secondary', colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', icon: null };
        case 'free': return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
        default: return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
    }
};

const getValidationStatusBadge = (user: UserProfile) => {
    if (user.subscription === 'free') {
        return <Badge variant="secondary" className="bg-transparent text-muted-foreground text-xs">N/A (Free)</Badge>;
    }

    const isExpired = user.expiryDate && user.expiryDate.toDate() < new Date();

    if (isExpired) {
        return (
            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white text-xs">
                <CalendarOff className="mr-1 h-3 w-3" /> Expired
            </Badge>
        );
    } else if (user.validated) {
        return (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                <CalendarCheck className="mr-1 h-3 w-3" /> Validated
            </Badge>
        );
    } else {
        return (
            <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" /> Pending
            </Badge>
        );
    }
};

export function UserTable({ users, onOpenValidationDialog }: UserTableProps) {
    const { toast } = useToast();

     // Placeholder delete handler within the component
     const handleDeleteUser = async (uid: string) => {
        console.log(`Deleting User with UID: ${uid}`);
        // Implement actual user deletion logic here (requires Admin SDK or Cloud Function usually)
        toast({ title: "Action Not Implemented", description: "User deletion functionality is not yet available." });
     };


    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => {
                const planDetails = getSubscriptionBadgeDetails(user.subscription);
                return (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={planDetails.variant} className={cn("capitalize", planDetails.colorClass)}>
                        {planDetails.icon}
                        {user.subscription || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.expiryDate ? format(user.expiryDate.toDate(), 'PP') : user.subscription !== 'free' ? 'Not Set' : 'N/A'}
                    </TableCell>
                    <TableCell>{getValidationStatusBadge(user)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end items-center">
                        {user.subscription !== 'free' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8", user.validated ? "text-green-600 hover:bg-green-100" : "text-yellow-600 hover:bg-yellow-100")}
                            onClick={() => onOpenValidationDialog(user)}
                            aria-label={user.validated ? "Manage Validation / Expiry" : "Validate User"}
                          >
                            {user.validated ? <CalendarCheck className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
                          </Button>
                        )}
                        {/* Placeholder for Edit User */}
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View/Edit User" disabled>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* Delete User Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete User">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete user "{user.name}" ({user.email})? This action cannot be undone. User data will be lost.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    );
}

export function UserTableSkeleton() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead> {/* Expiry Date */}
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead> {/* Status */}
                    <TableHead className="text-right w-[150px]"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                         <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell> {/* Expiry Date */}
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell> {/* Status */}
                        <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
