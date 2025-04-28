'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useRouter, useSearchParams } from 'next/navigation'; // Import useSearchParams
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { auth } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { createUserProfileDocument } from '@/lib/firebase/firestore'; // Import Firestore function
import type { SubscriptionPlan } from '@/types/user'; // Import SubscriptionPlan type
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name cannot exceed 50 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid phone number.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  confirmPassword: z.string(),
  profilePicture: z.any().optional(), // Allow any file type, make it optional
  // No need for plan in schema, we get it from URL
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // path of error
});

type RegisterFormValues = z.infer<typeof formSchema>;

// Define allowed plans
const allowedPlans: SubscriptionPlan[] = ['free', 'basic', 'premium'];

function RegisterFormComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  // Directly read plan from searchParams within the component
  const planFromUrl = searchParams.get('plan') as SubscriptionPlan | null;
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // For image preview

  useEffect(() => {
    if (planFromUrl && allowedPlans.includes(planFromUrl)) {
      setSelectedPlan(planFromUrl);
    } else {
      // Redirect if plan is missing or invalid
      toast({ variant: 'destructive', title: 'Invalid Plan', description: 'Please select a subscription plan first.' });
      router.replace('/pricing'); // Redirect to pricing page
    }
    // Depend on planFromUrl directly
  }, [planFromUrl, router, toast]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      profilePicture: undefined,
    },
  });

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        form.setValue('profilePicture', file); // Set file object in form state
      } else {
          setPreviewUrl(null);
          form.setValue('profilePicture', undefined);
      }
    };

  const onSubmit = async (data: RegisterFormValues) => {
     if (!selectedPlan) {
         setError("No subscription plan selected. Please go back and choose a plan.");
         toast({ variant: 'destructive', title: 'Error', description: 'Subscription plan missing.' });
         return;
     }
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Handle profile picture upload to Firebase Storage here if needed
      let profilePictureUrl: string | null = null;
      if (data.profilePicture && data.profilePicture instanceof File) {
         console.log("Profile picture file selected:", data.profilePicture.name);
         // In a real app: Upload and get URL
         profilePictureUrl = null; // Placeholder for now
         // toast({ title: "Note", description: "Profile picture upload not implemented yet." });
      }

      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // 2. Create user profile document in Firestore
      await createUserProfileDocument(user, {
          name: data.name,
          phone: data.phone,
          subscription: selectedPlan, // Add selected plan
          profilePicture: profilePictureUrl, // Add picture URL (or null)
      });

      toast({
        title: 'Registration Successful',
        description: `Your account for the ${selectedPlan} plan has been created.`,
        action: <CheckCircle className="text-green-500" />,
      });

      // 3. Redirect to login
      setTimeout(() => router.push('/login'), 1500);


    } catch (err: unknown) {
      const authError = err as AuthError;
      console.error('Firebase Registration Error:', authError);

      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (authError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already registered.';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

   if (!selectedPlan) {
      // Show loading or placeholder while checking plan or redirecting
      return (
          <div className="flex flex-col min-h-screen">
             <PublicNavbar />
             <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
             <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
                NyayaPrep &copy; {new Date().getFullYear()}
             </footer>
          </div>
      );
   }

  return (
    <div className="flex flex-col min-h-screen">
       <PublicNavbar />
       <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 py-10">
          <Card className="w-full max-w-md shadow-xl border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                 <UserPlus size={24} /> Create Your Account
              </CardTitle>
              <CardDescription>
                 You've selected the <span className="font-semibold capitalize">{selectedPlan}</span> plan. Fill in your details below.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
                <CardContent className="space-y-4 pb-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Enter your phone number" {...field} disabled={isLoading} />
                        </FormControl>
                         <FormMessage />
                      </FormItem>
                    )}
                  />
                   {/* Profile Picture Input */}
                   <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => ( // Don't destructure value/onChange for file input
                        <FormItem>
                            <FormLabel>Profile Picture (Optional)</FormLabel>
                            <FormControl>
                               <div className="flex items-center gap-4">
                                 <Label
                                   htmlFor="profile-picture-input"
                                   className="flex-1 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                 >
                                   <ImageIcon className="inline-block mr-2 h-4 w-4" />
                                   {previewUrl ? 'Change picture' : 'Choose a picture'}
                                 </Label>
                                 <Input
                                    id="profile-picture-input"
                                    type="file"
                                    accept="image/*" // Accept only image files
                                    onChange={handleFileChange} // Use custom handler
                                    className="sr-only" // Hide the default input visually
                                    disabled={isLoading}
                                  />
                                  {previewUrl && (
                                      <img src={previewUrl} alt="Preview" className="h-10 w-10 rounded-full object-cover border" />
                                  )}
                               </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Create a password (min. 6 characters)" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm your password" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {error && (
                    <p className="text-sm text-destructive text-center pt-2">{error}</p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Register & Proceed'
                    )}
                  </Button>
                   <p className="text-xs text-center text-muted-foreground">
                     Already have an account?{' '}
                     <Link href="/login" className="underline hover:text-primary font-medium">
                        Login here
                      </Link>
                   </p>
                   <p className="text-xs text-center text-muted-foreground">
                      Want to change plan?{' '}
                      <Link href="/pricing" className="underline hover:text-primary font-medium">
                         Go back to Pricing
                       </Link>
                    </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
       </main>
        <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
          NyayaPrep &copy; {new Date().getFullYear()}
        </footer>
    </div>
  );
}

// Wrap the component with Suspense for useSearchParams
export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col min-h-screen">
               <PublicNavbar />
               <div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
                  NyayaPrep &copy; {new Date().getFullYear()}
                </footer>
            </div>
        }>
            <RegisterFormComponent />
        </Suspense>
    );
}
