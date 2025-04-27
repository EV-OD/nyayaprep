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
  // We'll derive correctAnswerNe based on the selected English one and the options array
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
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const onSubmit = async (data: McqFormValues) => {
    setIsLoading(true);
    console.log("Form Data:", data);

    // Find the Nepali equivalent of the correct English answer
     const correctOptionPair = data.options.find(opt => opt.en === data.correctAnswerEn);
     if (!correctOptionPair) {
        toast({ variant: "destructive", title: "Error", description: "Correct answer mismatch. Please check your options." });
        setIsLoading(false);
        return;
     }
     const correctAnswerNe = correctOptionPair.ne;


    // --- Mock API Call ---
    try {
      // Construct the payload for the API
       const payload = {
         category: data.category,
         question: { en: data.questionEn, ne: data.questionNe },
         options: data.options, // The structure is slightly different here
         correctAnswer: { en: data.correctAnswerEn, ne: correctAnswerNe },
       };
      console.log("Payload to send:", payload);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

       // Reset form after successful submission? Optional.
       // form.reset();

      toast({
        title: 'MCQ Added Successfully',
        description: 'The new multiple-choice question has been saved.',
      });
      router.push('/admin/mcqs'); // Redirect back to the MCQ list
    } catch (error) {
      console.error('Failed to add MCQ:', error);
      toast({
        variant: 'destructive',
        title: 'Error Adding MCQ',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
    // --- End Mock API Call ---
  };

  const currentOptions = form.watch('options'); // Watch options to update the correct answer select

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
                 {/* Category */}
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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

                 {/* Options */}
                 <div>
                     <FormLabel>Options</FormLabel>
                     <FormDescription className="mb-2">Provide answer options in both languages. Mark the correct one below.</FormDescription>
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
                                        {/* <FormLabel className="text-xs">English</FormLabel> */}
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
                                         {/* <FormLabel className="text-xs">Nepali</FormLabel> */}
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
                         defaultValue={field.value}
                         disabled={isLoading || currentOptions.some(opt => !opt.en)} // Disable if any English option is empty
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
                       <FormDescription>The corresponding Nepali answer will be saved automatically.</FormDescription>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </CardContent>
               <CardFooter className="border-t px-6 py-4">
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
