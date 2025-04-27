'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, ArrowLeft } from 'lucide-react';
import { AdminHeader } from '@/components/admin/admin-header';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMcqById, updateMcq } from '@/lib/firebase/firestore'; // Import Firestore functions
import type { Question } from '@/types/quiz';

// Define actual categories used
const categories = [
  { value: 'Constitutional Law', label: 'Constitutional Law' },
  { value: 'Criminal Law', label: 'Criminal Law' },
  { value: 'Legal Theory', label: 'Legal Theory' },
  { value: 'International Law', label: 'International Law' },
  { value: 'Procedural Law', label: 'Procedural Law' },
];

// Define the schema for a single option pair (English and Nepali)
const optionSchema = z.object({
  en: z.string().min(1, 'English option cannot be empty.'),
  ne: z.string().min(1, 'Nepali option cannot be empty.'),
});

// Define the main form schema using Zod for validation
const formSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  questionEn: z.string().min(10, 'English question must be at least 10 characters.'),
  questionNe: z.string().min(10, 'Nepali question must be at least 10 characters.'),
  options: z.array(optionSchema)
            .min(2, 'At least two options are required.')
            .max(6, 'Maximum of six options allowed.')
             .refine(options => {
                 const englishOptions = options.map(opt => opt.en.trim().toLowerCase());
                 return new Set(englishOptions).size === englishOptions.length;
             }, { message: 'All English options must be unique.' })
             .refine(options => {
                 const nepaliOptions = options.map(opt => opt.ne.trim().toLowerCase());
                 return new Set(nepaliOptions).size === nepaliOptions.length;
             }, { message: 'All Nepali options must be unique.' }),
  correctAnswerEn: z.string().min(1, 'Correct English answer must be selected.'),
}).refine(data => data.options.some(opt => opt.en === data.correctAnswerEn), {
    message: "The selected correct answer must be one of the provided English options.",
    path: ["correctAnswerEn"],
});

type McqFormValues = z.infer<typeof formSchema>;


export default function EditMCQPage() {
  const router = useRouter();
  const params = useParams();
  const mcqId = params.id as string; // Get ID from route parameters
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // For form submission loading
  const [isFetching, setIsFetching] = useState(true); // For initial data fetch loading
  const [fetchError, setFetchError] = useState<string | null>(null); // For fetch errors

  const form = useForm<McqFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set initial empty defaults, will be reset after fetch
      category: '',
      questionEn: '',
      questionNe: '',
      options: [],
      correctAnswerEn: '',
    },
     mode: 'onChange',
  });

    // Fetch existing data on component mount
   useEffect(() => {
     if (!mcqId) {
         setFetchError("Invalid MCQ ID.");
         setIsFetching(false);
         toast({ variant: "destructive", title: "Error", description: "No MCQ ID provided." });
         return;
     };

     const loadData = async () => {
       setIsFetching(true);
       setFetchError(null);
       try {
         const data = await getMcqById(mcqId); // Use Firestore function
         if (data) {
           // Transform Firestore data to form structure if needed
           const transformedOptions = data.options.en.map((enOption, index) => ({
             en: enOption,
             ne: data.options.ne[index] || '', // Handle potential mismatch
           }));

           // Reset the form with fetched data
           form.reset({
             category: data.category,
             questionEn: data.question.en,
             questionNe: data.question.ne,
             options: transformedOptions,
             correctAnswerEn: data.correctAnswer.en,
           });
         } else {
           setFetchError(`MCQ with ID ${mcqId} not found.`);
           toast({ variant: "destructive", title: "Error", description: `MCQ not found.` });
         }
       } catch (error) {
         console.error("Failed to fetch MCQ data:", error);
         setFetchError("Failed to load MCQ data. Please try again.");
         toast({ variant: "destructive", title: "Error", description: "Failed to load data." });
       } finally {
         setIsFetching(false);
       }
     };

     loadData();
   }, [mcqId, form, toast]); // Added toast to dependency array


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Handle form submission for update
  const onSubmit = async (data: McqFormValues) => {
    setIsLoading(true);
    console.log("Updated Form Data:", data);

     // Find the Nepali equivalent of the correct English answer
     const correctOptionPair = data.options.find(opt => opt.en === data.correctAnswerEn);
     if (!correctOptionPair) {
         toast({ variant: "destructive", title: "Error", description: "Correct answer mismatch. Please check your options." });
         setIsLoading(false);
         return;
     }
     const correctAnswerNe = correctOptionPair.ne;

    // --- Update Firestore ---
    try {
       // Construct payload for Firestore update
       const payload: Partial<Omit<Question, 'id' | 'createdAt'>> = { // Partial because we only update fields
         category: data.category,
         question: { en: data.questionEn, ne: data.questionNe },
         options: {
            en: data.options.map(opt => opt.en),
            ne: data.options.map(opt => opt.ne),
         },
         correctAnswer: { en: data.correctAnswerEn, ne: correctAnswerNe },
         // 'updatedAt' will be set automatically by the updateMcq function
       };
       console.log("Payload to send for update:", payload);

      await updateMcq(mcqId, payload); // Call Firestore update function

      toast({
        title: 'MCQ Updated Successfully',
        description: 'The changes have been saved.',
      });
      router.push('/admin/mcqs'); // Redirect back to the list
    } catch (error) {
      console.error('Failed to update MCQ:', error);
      toast({
        variant: 'destructive',
        title: 'Error Updating MCQ',
        description: 'Something went wrong while saving changes. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
    // --- End Firestore Update ---
  };

    // Watch options for the correct answer dropdown
    const currentOptions = form.watch('options');

   // Show loading skeleton while fetching initial data
   if (isFetching) {
     return <EditMCQLoadingSkeleton mcqId={mcqId} />;
   }

   // Show error message if fetching failed
   if (fetchError) {
     return (
       <div className="flex flex-col min-h-screen">
         <AdminHeader title="Edit MCQ" />
         <main className="flex-1 p-6 md:p-10 bg-muted/30 flex flex-col items-center justify-center text-center">
           <p className="text-destructive text-lg mb-4">{fetchError}</p>
           <Link href="/admin/mcqs" passHref>
             <Button variant="outline">
               <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
             </Button>
           </Link>
         </main>
       </div>
     );
   }

  // Render the form once data is loaded
  return (
     <div className="flex flex-col min-h-screen">
       <AdminHeader title={`Edit MCQ`} /> {/* Removed ID from title for simplicity */}
       <main className="flex-1 p-6 md:p-10 bg-muted/30 flex justify-center">
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-8">
             <Card className="border shadow-sm">
               <CardHeader>
                 <div className="flex justify-between items-center">
                   <CardTitle>Edit Question Details</CardTitle>
                   <Link href="/admin/mcqs" passHref>
                     <Button variant="outline" size="sm">
                       <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                     </Button>
                   </Link>
                 </div>
                 <CardDescription>Update the details for this question (ID: {mcqId}).</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                  {/* Category */}
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 {/* Question Fields */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="questionEn"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Question (English)</FormLabel>
                         <FormControl>
                           <Textarea placeholder="Enter the question in English" {...field} disabled={isLoading} rows={4} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="questionNe"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Question (Nepali)</FormLabel>
                         <FormControl>
                           <Textarea placeholder="नेपालीमा प्रश्न प्रविष्ट गर्नुहोस्" {...field} disabled={isLoading} rows={4} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>

                 {/* Options */}
                 <div>
                   <FormLabel>Options</FormLabel>
                   <FormDescription className="mb-2">Update answer options. Mark the correct one below.</FormDescription>
                   <div className="space-y-4">
                     {fields.map((field, index) => (
                       <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-start border p-3 rounded-md bg-background">
                          <span className="text-sm font-medium text-muted-foreground sm:pt-2">#{index + 1}</span>
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                           <FormField
                             control={form.control}
                             name={`options.${index}.en`}
                             render={({ field }) => (
                               <FormItem className="w-full">
                                 <FormControl>
                                   <Input placeholder={`Option ${index + 1} (English)`} {...field} disabled={isLoading} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                           <FormField
                             control={form.control}
                             name={`options.${index}.ne`}
                             render={({ field }) => (
                               <FormItem className="w-full">
                                 <FormControl>
                                   <Input placeholder={`विकल्प ${index + 1} (नेपाली)`} {...field} disabled={isLoading} />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                         </div>
                         <Button
                           type="button"
                           variant="ghost"
                           size="icon"
                           className="text-destructive hover:bg-destructive/10 h-8 w-8 sm:ml-2 mt-2 sm:mt-0 shrink-0"
                           onClick={() => remove(index)}
                           disabled={fields.length <= 2 || isLoading}
                         >
                           <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove option</span>
                         </Button>
                       </div>
                     ))}
                   </div>
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     className="mt-3"
                     onClick={() => append({ en: '', ne: '' })}
                     disabled={fields.length >= 6 || isLoading}
                   >
                     <PlusCircle className="mr-2 h-4 w-4" />
                     Add Option
                   </Button>
                    {form.formState.errors.options?.root?.message && (
                           <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.options.root.message}</p>
                       )}
                     {form.formState.errors.options?.message && (
                       <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.options.message}</p>
                     )}
                 </div>

                 {/* Correct Answer Selection */}
                 <FormField
                   control={form.control}
                   name="correctAnswerEn"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Correct Answer (Select English)</FormLabel>
                       <Select
                         onValueChange={field.onChange}
                         value={field.value} // Use value here for controlled component
                         disabled={isLoading || currentOptions.some(opt => !opt.en)}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select the correct English answer" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                            {currentOptions.map((option, index) => (
                               option.en && ( // Only show if English option is filled
                                 <SelectItem key={`${field.name}-${index}`} value={option.en}>
                                   {option.en}
                                 </SelectItem>
                               )
                             ))}
                         </SelectContent>
                       </Select>
                       <FormDescription>The corresponding Nepali answer will be updated automatically.</FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </CardContent>
               <CardFooter className="border-t px-6 py-4">
                 <Button type="submit" disabled={isLoading}>
                   {isLoading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                     </>
                   ) : (
                     'Update Question'
                   )}
                 </Button>
               </CardFooter>
             </Card>
           </form>
         </Form>
       </main>
     </div>
   );
}

// Loading Skeleton component
function EditMCQLoadingSkeleton({ mcqId }: { mcqId?: string }) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminHeader title={`Edit MCQ ${mcqId ? `(ID: ${mcqId})` : ''}`} />
         <main className="flex-1 p-6 md:p-10 bg-muted/30 flex justify-center">
            <div className="w-full max-w-3xl space-y-8">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-48" />
                             <Skeleton className="h-9 w-32" />
                         </div>
                         <Skeleton className="h-4 w-3/4 mt-2" />
                     </CardHeader>
                     <CardContent className="space-y-6 pt-6">
                          {/* Category Skeleton */}
                          <div>
                              <Skeleton className="h-4 w-20 mb-2" />
                              <Skeleton className="h-10 w-full" />
                          </div>
                          {/* Question Skeleton */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <Skeleton className="h-4 w-32 mb-2" />
                                 <Skeleton className="h-24 w-full" />
                             </div>
                               <div>
                                   <Skeleton className="h-4 w-32 mb-2" />
                                   <Skeleton className="h-24 w-full" />
                               </div>
                           </div>
                           {/* Options Skeleton */}
                           <div>
                               <Skeleton className="h-4 w-24 mb-2" />
                               <div className="space-y-4">
                                   {[...Array(2)].map((_, i) => ( // Skeleton for 2 options
                                     <div key={i} className="flex flex-col sm:flex-row gap-2 items-start border p-3 rounded-md">
                                       <Skeleton className="h-5 w-6 mt-1 sm:mt-2" /> {/* # Skeleton */}
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <Skeleton className="h-10 w-full" /> {/* Option EN */}
                                            <Skeleton className="h-10 w-full" /> {/* Option NE */}
                                        </div>
                                       <Skeleton className="h-8 w-8 rounded-md mt-2 sm:mt-0 shrink-0" /> {/* Delete Button */}
                                     </div>
                                   ))}
                               </div>
                               <Skeleton className="h-9 w-28 mt-3" /> {/* Add Option Button */}
                           </div>
                            {/* Correct Answer Skeleton */}
                           <div>
                               <Skeleton className="h-4 w-40 mb-2" />
                               <Skeleton className="h-10 w-full" />
                           </div>
                     </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                          <Skeleton className="h-10 w-32" /> {/* Update Button */}
                      </CardFooter>
                </Card>
            </div>
         </main>
       </div>
    );
}
