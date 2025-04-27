
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { addMcq } from '@/lib/firebase/firestore'; // Import Firestore function
import type { Question } from '@/types/quiz'; // Import Question type

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
             // Custom validation to ensure all options within the array are unique (English)
             .refine(options => {
                 const englishOptions = options.map(opt => opt.en.trim().toLowerCase());
                 return new Set(englishOptions).size === englishOptions.length;
             }, { message: 'All English options must be unique.' })
             // Custom validation to ensure all options within the array are unique (Nepali)
             .refine(options => {
                 const nepaliOptions = options.map(opt => opt.ne.trim().toLowerCase());
                 return new Set(nepaliOptions).size === nepaliOptions.length;
             }, { message: 'All Nepali options must be unique.' }),
  correctAnswerEn: z.string().min(1, 'Correct English answer must be selected.'),
  // We'll derive correctAnswerNe based on the selected English one and the options array
  // Ensure the selected correct answer actually exists in the options array
}).refine(data => data.options.some(opt => opt.en === data.correctAnswerEn), {
    message: "The selected correct answer must be one of the provided English options.",
    path: ["correctAnswerEn"], // Apply error to the correctAnswerEn field
});


type McqFormValues = z.infer<typeof formSchema>;

export default function AddMCQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<McqFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      questionEn: '',
      questionNe: '',
      options: [
        { en: '', ne: '' },
        { en: '', ne: '' },
      ],
      correctAnswerEn: '',
    },
     mode: 'onChange', // Validate on change for better UX
  });

  // useFieldArray hook to manage dynamic option fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Handle form submission
  const onSubmit = async (data: McqFormValues) => {
    setIsLoading(true);
    console.log("Form Data Submitted:", data);

    // Find the Nepali equivalent of the correct English answer
     const correctOptionPair = data.options.find(opt => opt.en === data.correctAnswerEn);
     if (!correctOptionPair) {
        // This should theoretically be caught by the refine validation, but double-check
        toast({ variant: "destructive", title: "Error", description: "Correct answer mismatch. Please check your options." });
        setIsLoading(false);
        return;
     }
     const correctAnswerNe = correctOptionPair.ne;

    // --- Add to Firestore ---
    try {
      // Construct the payload matching the Question type structure (excluding id, timestamps)
       const payload: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
         category: data.category,
         question: { en: data.questionEn, ne: data.questionNe },
         options: {
             en: data.options.map(opt => opt.en),
             ne: data.options.map(opt => opt.ne),
         },
         correctAnswer: { en: data.correctAnswerEn, ne: correctAnswerNe },
       };
      console.log("Payload to send to Firestore:", payload);

      // Call the Firestore function
      await addMcq(payload);

      toast({
        title: 'MCQ Added Successfully',
        description: 'The new multiple-choice question has been saved.',
      });
      form.reset(); // Reset form after successful submission
      router.push('/admin/mcqs'); // Redirect back to the MCQ list page
    } catch (error) {
      console.error('Failed to add MCQ to Firestore:', error);
      toast({
        variant: 'destructive',
        title: 'Error Adding MCQ',
        description: 'Something went wrong while saving the question. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
    // --- End Firestore Call ---
  };

  // Watch the options array to dynamically update the 'Correct Answer' select dropdown
  const currentOptions = form.watch('options');

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Add New MCQ" />
       <main className="flex-1 p-6 md:p-10 bg-muted/30 flex justify-center">
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-8">
             <Card className="border shadow-sm">
               <CardHeader>
                 <div className="flex justify-between items-center">
                     <CardTitle>New Question Details</CardTitle>
                     <Link href="/admin/mcqs" passHref>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                        </Button>
                     </Link>
                 </div>
                 <CardDescription>Fill in the details for the new question in both English and Nepali.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                 {/* Category Dropdown */}
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value} // Ensure value is controlled
                          disabled={isLoading}
                       >
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

                 {/* Question Textareas (English and Nepali) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="questionEn"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Question (English)</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Enter the question in English" {...field} disabled={isLoading} rows={4}/>
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
                            <Textarea placeholder="नेपालीमा प्रश्न प्रविष्ट गर्नुहोस्" {...field} disabled={isLoading} rows={4}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                 {/* Dynamic Options Section */}
                 <div>
                     <FormLabel>Options</FormLabel>
                     <FormDescription className="mb-2">Provide answer options in both languages. Mark the correct one below.</FormDescription>
                     <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-start border p-3 rounded-md bg-background">
                                {/* Option Number */}
                                <span className="text-sm font-medium text-muted-foreground sm:pt-2">#{index + 1}</span>
                                {/* English and Nepali Input Fields */}
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
                                {/* Remove Option Button */}
                                <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8 sm:ml-2 mt-2 sm:mt-0 shrink-0"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 2 || isLoading} // Disable removal if only 2 options left
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Remove option</span>
                                </Button>
                            </div>
                        ))}
                     </div>
                     {/* Add Option Button */}
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => append({ en: '', ne: '' })}
                        disabled={fields.length >= 6 || isLoading} // Disable adding if 6 options exist
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Option
                      </Button>
                      {/* Display root errors for the options array (e.g., min/max length, unique) */}
                      {form.formState.errors.options?.root?.message && (
                           <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.options.root.message}</p>
                       )}
                       {/* Display general array errors */}
                       {form.formState.errors.options?.message && (
                            <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.options.message}</p>
                       )}
                 </div>


                {/* Correct Answer Selection Dropdown */}
                 <FormField
                   control={form.control}
                   name="correctAnswerEn"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Correct Answer (Select English)</FormLabel>
                       <Select
                         onValueChange={field.onChange}
                         value={field.value} // Controlled component
                         disabled={isLoading || currentOptions.some(opt => !opt.en)} // Disable if any English option is empty
                        >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select the correct English answer" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                            {/* Only show options that have English text filled */}
                            {currentOptions.map((option, index) => (
                               option.en && (
                                 <SelectItem key={`${field.name}-${index}`} value={option.en}>
                                   {option.en}
                                 </SelectItem>
                               )
                             ))}
                         </SelectContent>
                       </Select>
                       <FormDescription>The corresponding Nepali answer will be saved automatically.</FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </CardContent>
               <CardFooter className="border-t px-6 py-4">
                 {/* Submit Button with Loading State */}
                 <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                         'Save Question'
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
