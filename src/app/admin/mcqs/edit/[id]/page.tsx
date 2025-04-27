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
import type { Question } from '@/types/quiz'; // Assuming Question type exists

// Dummy categories - replace with dynamic fetch later
const categories = [
  { value: 'constitutional-law', label: 'Constitutional Law' },
  { value: 'criminal-law', label: 'Criminal Law' },
  { value: 'legal-theory', label: 'Legal Theory' },
  { value: 'international-law', label: 'International Law' },
  { value: 'procedural-law', label: 'Procedural Law' },
];

const optionSchema = z.object({
  en: z.string().min(1, 'English option cannot be empty.'),
  ne: z.string().min(1, 'Nepali option cannot be empty.'),
});

const formSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  questionEn: z.string().min(10, 'English question must be at least 10 characters.'),
  questionNe: z.string().min(10, 'Nepali question must be at least 10 characters.'),
  options: z.array(optionSchema).min(2, 'At least two options are required.').max(6, 'Maximum of six options allowed.'),
  correctAnswerEn: z.string().min(1, 'Correct English answer must be selected.'),
});

type McqFormValues = z.infer<typeof formSchema>;

// Dummy function to simulate fetching existing MCQ data
async function fetchMcqData(id: string): Promise<Question | null> {
  console.log(`Fetching data for MCQ ID: ${id}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  // Find in dummy data or return null if not found
  const dummyData: Question[] = [
     {
       id: '1',
       // Assume category value matches one in `categories`
       category: 'constitutional-law',
       question: { en: 'Which article guarantees freedom?', ne: 'कुन धाराले स्वतन्त्रता दिन्छ?' },
       options: { en: ['Art 16', 'Art 17'], ne: ['धारा १६', 'धारा १७'] },
       correctAnswer: { en: 'Art 17', ne: 'धारा १७' },
     },
       {
       id: '2',
       category: 'legal-theory',
       question: { en: 'Father of Natural Law?', ne: 'प्राकृतिक कानूनका पिता?' },
       options: { en: ['Austin', 'Aquinas'], ne: ['अस्टिन', 'एक्विनास'] },
       correctAnswer: { en: 'Aquinas', ne: 'एक्विनास' },
     },
   ];
   // Map API structure to form structure if needed
   const found = dummyData.find(q => q.id === id);
    if (!found) return null;

     // Need to transform the options structure
     const transformedOptions = found.options.en.map((enOption, index) => ({
       en: enOption,
       ne: found.options.ne[index] || '', // Handle potential mismatch
     }));

     // Return data compatible with form schema
    return {
         ...found,
         // Ensure the return structure matches what the form expects if it differs from API
         // options structure might need transformation before setting default values
         // For this example, assuming the fetch returns data structured like the form expects
         // BUT we need to transform the options:
         options: { en: [], ne: [] }, // Placeholder, we set defaults later
         _optionsForForm: transformedOptions, // Temporary holder for transformation
         _correctAnswerEnForForm: found.correctAnswer.en,
    } as any; // Using any for the temporary fields
}

export default function EditMCQPage() {
  const router = useRouter();
  const params = useParams();
  const mcqId = params.id as string; // Get ID from route parameters
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<McqFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { // Set initial empty defaults
      category: '',
      questionEn: '',
      questionNe: '',
      options: [],
      correctAnswerEn: '',
    },
  });

    // Fetch existing data on component mount
   useEffect(() => {
     if (!mcqId) {
         setFetchError("Invalid MCQ ID.");
         setIsFetching(false);
         return;
     };

     const loadData = async () => {
       setIsFetching(true);
       setFetchError(null);
       try {
         const data = await fetchMcqData(mcqId);
         if (data && data._optionsForForm) {
           // Reset the form with fetched data after transformation
           form.reset({
             category: data.category,
             questionEn: data.question.en,
             questionNe: data.question.ne,
             options: data._optionsForForm,
             correctAnswerEn: data._correctAnswerEnForForm,
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
   }, [mcqId, form]); // Dependency array includes mcqId and form instance


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

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

    // --- Mock API Call for Update ---
    try {
       const payload = {
         id: mcqId,
         category: data.category,
         question: { en: data.questionEn, ne: data.questionNe },
         options: data.options,
         correctAnswer: { en: data.correctAnswerEn, ne: correctAnswerNe },
       };
       console.log("Payload to send for update:", payload);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

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
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
    // --- End Mock API Call ---
  };

    const currentOptions = form.watch('options');

   if (isFetching) {
     return <EditMCQLoadingSkeleton />;
   }

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

  return (
     <div className="flex flex-col min-h-screen">
       <AdminHeader title={`Edit MCQ (ID: ${mcqId})`} />
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
                 <CardDescription>Update the details for this question.</CardDescription>
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
                                 <SelectItem key={index} value={option.en}>
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


function EditMCQLoadingSkeleton() {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminHeader title="Edit MCQ" />
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
                                   {[...Array(2)].map((_, i) => (
                                     <div key={i} className="flex gap-2 items-center border p-3 rounded-md">
                                       <Skeleton className="h-8 w-8" />
                                       <Skeleton className="h-10 flex-1" />
                                       <Skeleton className="h-10 flex-1" />
                                       <Skeleton className="h-8 w-8" />
                                     </div>
                                   ))}
                               </div>
                               <Skeleton className="h-9 w-28 mt-3" />
                           </div>
                            {/* Correct Answer Skeleton */}
                           <div>
                               <Skeleton className="h-4 w-40 mb-2" />
                               <Skeleton className="h-10 w-full" />
                           </div>
                     </CardContent>
                      <CardFooter className="border-t px-6 py-4">
                          <Skeleton className="h-10 w-32" />
                      </CardFooter>
                </Card>
            </div>
         </main>
       </div>
    );
}
