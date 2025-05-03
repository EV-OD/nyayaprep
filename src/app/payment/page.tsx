'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, QrCode, MessageSquare, CheckCircle } from 'lucide-react';
import Image from 'next/image'; // Import next/image
import { PublicNavbar } from '@/components/layout/public-navbar'; // Import PublicNavbar
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, User } from 'firebase/auth';
import { updateUserProfileDocument } from '@/lib/firebase/user';

// Replace with your actual eSewa QR code image path and WhatsApp number
const ESEWA_QR_CODE_URL = '/images/esewa-qr-placeholder.png'; // Placeholder path
const WHATSAPP_NUMBER = '+977 986-0249284'; // Placeholder number

// Plan details (updated prices)
const planDetails = {
    basic: { name: 'Basic', price: 'NRS 50 / week' },
    premium: { name: 'Premium', price: 'NRS 100 / week' },
};

type SupportedPlan = keyof typeof planDetails;

function PaymentComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Directly access plan from searchParams within the component
    const plan = searchParams.get('plan') as SupportedPlan | null;
    const [isLoading, setIsLoading] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Redirect if plan is missing or invalid
    React.useEffect(() => {
        if (!plan || !(plan in planDetails)) {
            router.replace('/pricing');
        }
    }, [plan, router]);


    const handleDoneClick = () => {
        setIsLoading(true);
        // Optionally add a small delay or feedback
        // In a real app, you might want to check if payment was somehow confirmed,
        // but here we just redirect to login as validation is manual.
        setIsLoading(true);
        if (user && plan) {
          updateUserProfileDocument(user.uid, {
            subscription: plan,
            validated:false
          });
        }
        router.push('/dashboard');
    };


    const currentPlan = plan ? planDetails[plan] : null;

    if (!currentPlan) {
        // Show loading or redirecting state while plan is being determined or redirect happens
        return (
            <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4 py-10">
            <Card className="w-full max-w-md shadow-xl border">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Complete Your Payment</CardTitle>
                    <CardDescription>
                        You've selected the <span className="font-semibold capitalize">{currentPlan.name}</span> plan ({currentPlan.price}).
                        Please scan the QR code to pay.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    {/* QR Code Image */}
                    <div className="p-4 border rounded-lg bg-white">
                        <Image
                            src={ESEWA_QR_CODE_URL}
                            alt="eSewa Payment QR Code"
                            width={200}
                            height={200}
                            priority // Load QR code faster
                            unoptimized // If using a local static image without Next.js optimization
                        />
                    </div>

                    {/* Instructions */}
                    <div className="text-center text-sm text-muted-foreground space-y-2">
                        <p>Scan the QR code using your eSewa app to complete the payment for the {currentPlan.name} plan.</p>
                        <p className="flex items-center justify-center gap-1">
                            <MessageSquare size={14} /> After payment, please send a screenshot to our WhatsApp at:
                        </p>
                        <p className="font-semibold text-foreground">{WHATSAPP_NUMBER}</p>
                        <p>Your account will be activated upon verification (usually within a few hours).</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleDoneClick} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Done'}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
}


export default function PaymentPage() {
    return (
         <div className="flex flex-col min-h-screen">
            <PublicNavbar />
             {/* Wrap the component that uses useSearchParams with Suspense */}
             <Suspense fallback={
                <div className="flex flex-1 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            }>
                 <PaymentComponent />
             </Suspense>
              <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
                 NyayaPrep &copy; {new Date().getFullYear()}
             </footer>
         </div>
    );
}
