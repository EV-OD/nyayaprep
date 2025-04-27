
'use client';

import * as React from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link
import { Users } from 'lucide-react'; // Import icon

export default function ManageUsersPage() {
    // This page now serves as a placeholder.
    // User management is handled within the Admin Dashboard tabs.

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Manage Users" />
            <main className="flex-1 p-6 md:p-10 bg-muted/30 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Users /> User Management
                        </CardTitle>
                        <CardDescription>
                            User management is now located in the Admin Dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Click the button below to navigate to the dashboard where you can manage users.
                        </p>
                        <Link href="/admin/dashboard?tab=users" passHref> {/* Link to dashboard with user tab preselected */}
                            <Button>Go to User Management Tab</Button>
                        </Link>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
