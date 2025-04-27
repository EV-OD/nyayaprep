'use client';

import * as React from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [enableDarkMode, setEnableDarkMode] = React.useState(false); // Example setting

    // In a real app, fetch current settings state, e.g., dark mode preference
    React.useEffect(() => {
        // Example: Check localStorage or fetch from backend
        const darkModePref = localStorage.getItem('darkMode') === 'true';
        setEnableDarkMode(darkModePref);
        if (darkModePref) {
             document.documentElement.classList.add('dark');
        } else {
             document.documentElement.classList.remove('dark');
        }
    }, []);


    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
             toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
            return;
        }

        setIsLoading(true);
         // Simulate API call to change password
         console.log("Changing password for admin...");
         await new Promise(resolve => setTimeout(resolve, 1500));
         // Add error handling for incorrect current password from API
         setIsLoading(false);
         toast({ title: 'Success', description: 'Password changed successfully.' });
         // Clear fields
         setCurrentPassword('');
         setNewPassword('');
         setConfirmPassword('');
    };

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
        // Consider a more robust theme provider approach if needed
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        // Simulate saving general settings (like theme)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast({title: "Settings Saved", description: "Your preferences have been updated."})
    }


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
                         {/* <CardFooter className="border-t px-6 py-4">
                             <Button onClick={handleSaveChanges} disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                 Save Appearance
                             </Button>
                          </CardFooter> */}
                    </Card>


                     {/* Account Settings - Password Change */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Security</CardTitle>
                            <CardDescription>Change your admin password.</CardDescription>
                        </CardHeader>
                         <form onSubmit={handlePasswordChange}>
                             <CardContent className="space-y-4">
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

                    {/* Other Settings (Placeholder) */}
                     {/* <Card>
                       <CardHeader>
                         <CardTitle>General Settings</CardTitle>
                         <CardDescription>Other application settings.</CardDescription>
                       </CardHeader>
                       <CardContent>
                         <p className="text-muted-foreground">More settings will be available here...</p>
                       </CardContent>
                     </Card> */}

                </div>
            </main>
        </div>
    );
}
