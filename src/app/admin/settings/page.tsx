'use client';

import * as React from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input'; // Temporarily removed password fields
// import { Label } from '@/components/ui/label'; // Temporarily removed password fields
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
// import { auth } from '@/lib/firebase/config'; // Keep if needed for user info display
// import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Firebase password change requires re-auth

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    // const [currentPassword, setCurrentPassword] = React.useState(''); // Removed
    // const [newPassword, setNewPassword] = React.useState(''); // Removed
    // const [confirmPassword, setConfirmPassword] = React.useState(''); // Removed
    const [enableDarkMode, setEnableDarkMode] = React.useState(false); // Example setting

    // Fetch current theme settings
    React.useEffect(() => {
        const darkModePref = localStorage.getItem('darkMode') === 'true';
        setEnableDarkMode(darkModePref);
        if (darkModePref) {
             document.documentElement.classList.add('dark');
        } else {
             document.documentElement.classList.remove('dark');
        }
    }, []);


    // Password change requires re-authentication, which is complex UI.
    // Removing this functionality for now to keep it simple.
    // const handlePasswordChange = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     // ... (Password validation logic) ...
    //     setIsLoading(true);
    //     try {
    //         const user = auth.currentUser;
    //         if (!user || !user.email) {
    //             throw new Error("User not found or email missing.");
    //         }
    //         const credential = EmailAuthProvider.credential(user.email, currentPassword);
    //         await reauthenticateWithCredential(user, credential);
    //         await updatePassword(user, newPassword);
    //         toast({ title: 'Success', description: 'Password changed successfully.' });
    //         // Clear fields
    //     } catch (error) {
    //         console.error("Password change error:", error);
    //         toast({ variant: 'destructive', title: 'Error', description: 'Failed to change password. Check current password or try again.' });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleThemeChange = (checked: boolean) => {
        setEnableDarkMode(checked);
         localStorage.setItem('darkMode', String(checked)); // Persist preference
         if (checked) {
           document.documentElement.classList.add('dark');
           toast({ title: 'Theme Changed', description: 'Dark mode enabled.' });
         } else {
           document.documentElement.classList.remove('dark');
           toast({ title: 'Theme Changed', description: 'Light mode enabled.' });
         }
        // No separate save button needed for theme, it applies instantly.
    };

    // Optional: Save other general settings if added later
    // const handleSaveChanges = async () => {
    //     setIsLoading(true);
    //     // Simulate saving general settings
    //     await new Promise(resolve => setTimeout(resolve, 1000));
    //     setIsLoading(false);
    //     toast({title: "Settings Saved", description: "Your preferences have been updated."})
    // }


    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Settings" />
            <main className="flex-1 p-6 md:p-10 bg-muted/30">
                <div className="grid gap-6 max-w-3xl mx-auto">

                    {/* Appearance Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel of the admin panel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="dark-mode-switch" className="flex flex-col space-y-1">
                                 <span>Dark Mode</span>
                                 <span className="font-normal leading-snug text-muted-foreground">
                                   Enable dark theme for the admin interface.
                                 </span>
                               </Label>
                                <Switch
                                    id="dark-mode-switch"
                                    checked={enableDarkMode}
                                    onCheckedChange={handleThemeChange}
                                />
                             </div>
                        </CardContent>
                         {/* Removed footer with save button for appearance */}
                    </Card>


                     {/* Account Settings - Password Change (Temporarily Removed) */}
                    {/*
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Change your admin password (Requires re-authentication).</CardDescription>
                        </CardHeader>
                         <form onSubmit={handlePasswordChange}>
                             <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">Password change requires re-entering your current password.</p>
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} disabled={isLoading}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLoading}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading}/>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Change Password
                                </Button>
                            </CardFooter>
                         </form>
                    </Card>
                    */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Password changes are handled through standard Firebase methods (e.g., password reset emails).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                To change your password, please use the standard password reset functionality provided by Firebase Authentication.
                            </p>
                             {/* Optionally add a button/link to trigger password reset email if implemented */}
                            {/*
                             <Button variant="outline" className="mt-4" onClick={handlePasswordReset} disabled={isLoading}>
                                 Send Password Reset Email
                             </Button>
                            */}
                        </CardContent>
                    </Card>


                </div>
            </main>
        </div>
    );
}
// Need to add this import back if using the Label component
import { Label } from '@/components/ui/label';
