
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PublicNavbar } from '@/components/layout/public-navbar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';
import Link from 'next/link';

import {storeMessage} from '@/lib/firebase/firestore';

// Phone regex (adjust if needed for specific formats)
const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

// Form Schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name cannot exceed 50 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  address: z.string().optional(), // Address is optional
  phone: z.string().regex(phoneRegex, { message: "Please enter a valid phone number."}).optional().or(z.literal('')), // Phone is optional
  message: z.string().min(10, 'Message must be at least 10 characters.').max(500, 'Message cannot exceed 500 characters.'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const { toast } = useToast();

    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            address: '',
            phone: '',
            message: '',
        },
        mode: 'onChange', // Validate on change
    });

    // Placeholder Submit Handler
    const onSubmit = async (data: ContactFormValues) => {
        setIsLoading(true);
        console.log("Contact Form Submitted:", data);

        // --- !!! Backend Integration Needed !!! ---
        // In a real application, you would send this data to a backend API endpoint
        // which would then securely send an email using a service like SendGrid, Resend, etc.
        // Example (conceptual):
        try {
          await storeMessage(data)
          toast({ title: "Message Sent!", description: "Thank you for contacting us. We'll get back to you soon." });
          form.reset();
        } catch (error) {
          console.error("Contact form error:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to send message. Please try again later." });
        } finally {
          setIsLoading(false);
        }

        // --- Placeholder Logic ---
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
        toast({ title: "Message Sent)", description: "Thank you for contacting us. We'll get back to you soon." });
        form.reset(); // Reset form after submission
        setIsLoading(false);
        // --- End Placeholder Logic ---
    };

    return (
        <div className="flex flex-col min-h-screen">
            <PublicNavbar />
             <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-muted/50 py-12">
                {/* Contact Details Card */}
                <Card className="w-full max-w-3xl mb-10">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl text-primary">Contact Us</CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            For inquiries, support, or feedback, please reach out to us.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        <p className="mt-2 font-medium">Email: support@nyayaprep.com</p>
                        <p className="mt-1 font-medium">Phone: +977 98XXXXXXXX</p>
                    </CardContent>
                </Card>

                {/* Contact Form Card */}
                 <Card className="w-full max-w-3xl">
                     <CardHeader>
                         <CardTitle className="text-center text-2xl text-primary">Send Us a Message</CardTitle>
                         <CardDescription className="text-center text-muted-foreground">
                             Fill out the form below and we'll get back to you as soon as possible.
                         </CardDescription>
                     </CardHeader>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Full Name" {...field} disabled={isLoading} />
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
                                                <Input type="email" placeholder="your.email@example.com" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                            <FormLabel>Address (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your Address" {...field} disabled={isLoading}/>
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
                                            <FormLabel>Phone Number (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="tel" placeholder="Your Phone Number" {...field} disabled={isLoading}/>
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Your Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                            placeholder="Type your message here..."
                                            rows={5}
                                            {...field}
                                            disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                            <CardFooter className="border-t px-6 py-4">
                                <Button type="submit" disabled={isLoading} className="w-full md:w-auto ml-auto">
                                {isLoading ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                     <>
                                     <Send className="mr-2 h-4 w-4" /> Send Message
                                     </>
                                )}
                                </Button>
                            </CardFooter>
                         </form>
                     </Form>
                 </Card>
            </main>
             <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
                 <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                      <p className="text-muted-foreground text-sm">
                         NyayaPrep &copy; {new Date().getFullYear()}. All rights reserved.
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                           <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                           <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                           <Link href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link>
                      </div>
                 </div>
             </footer>
        </div>
    );
}

