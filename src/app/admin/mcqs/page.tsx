
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Languages, Filter, Search, Loader2, Star, CheckCircle, AlertTriangle, HelpCircle, Send, Clock, Check, X, Bell, Users, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Keep if needed for detailed view later
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, // Keep if needed for detailed view later
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types/quiz';
import { AdminHeader } from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    getAllMcqs, // Fetch all MCQs
    deleteMcq, // Delete single MCQ
    deleteMultipleMcqs, // Delete multiple MCQs
} from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Keep if date formatting is used
import { format } from 'date-fns'; // Keep if date formatting is used
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


export default function ManageMCQsPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]);
  const [isLoadingMCQs, setIsLoadingMCQs] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMcqs, setSelectedMcqs] = React.useState<Set<string>>(new Set());

  const { toast } = useToast();

  React.useEffect(() => {
    const fetchMcqs = async () => {
      setIsLoadingMCQs(true);
      setError(null);
      try {
        const fetchedMcqs = await getAllMcqs(true); // Fetch from Firestore, order by date
        setMcqs(fetchedMcqs);
      } catch (err) {
         console.error("Failed to fetch MCQs:", err);
         setError("Failed to load MCQs. Please try again.");
         toast({ variant: "destructive", title: "Loading Error", description: "Could not load MCQs from the database."});
      } finally {
        setIsLoadingMCQs(false);
      }
    };
    fetchMcqs();
  }, [toast]); // Add toast to dependencies

  // Handle deleting a single MCQ
  const handleDeleteMCQ = async (id: string) => {
     console.log(`Attempting to delete MCQ with ID: ${id}`);
     // Optimistically remove from UI
     setMcqs(prev => prev.filter(mcq => mcq.id !== id));
     setSelectedMcqs(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
     });

     try {
         await deleteMcq(id); // Call Firestore delete function
         toast({ title: "MCQ Deleted", description: `Question ID ${id} has been removed.` });
     } catch (error) {
         console.error(`Failed to delete MCQ ${id}:`, error);
         toast({ variant: "destructive", title: "Deletion Failed", description: `Could not delete MCQ ${id}. It might have been restored.` });
         // Re-fetch to ensure consistency if deletion fails
          setError(null); // Clear previous error
          try {
              const fetchedMcqs = await getAllMcqs(true);
              setMcqs(fetchedMcqs);
          } catch (fetchError) {
              console.error("Failed to re-fetch MCQs after delete error:", fetchError);
              setError("Failed to reload MCQs after deletion error.");
          }
     }
  };

  // Handle deleting selected MCQs
  const handleDeleteSelectedMCQs = async () => {
    const idsToDelete = Array.from(selectedMcqs);
    if (idsToDelete.length === 0) {
        toast({ variant: "destructive", title: "No MCQs Selected", description: "Please select MCQs to delete." });
        return;
    }
    console.log(`Attempting to delete selected MCQs: ${idsToDelete.join(', ')}`);

    // Optimistically remove from UI
    setMcqs(prev => prev.filter(mcq => !idsToDelete.includes(mcq.id)));
    setSelectedMcqs(new Set()); // Clear selection

     try {
         await deleteMultipleMcqs(idsToDelete); // Call Firestore bulk delete function
         toast({ title: "MCQs Deleted", description: `${idsToDelete.length} question(s) have been removed.` });
     } catch (error) {
         console.error(`Failed to delete selected MCQs:`, error);
         toast({ variant: "destructive", title: "Deletion Failed", description: `Could not delete selected MCQs. They might have been restored.` });
          // Re-fetch to ensure consistency
          setError(null);
          try {
              const fetchedMcqs = await getAllMcqs(true);
              setMcqs(fetchedMcqs);
          } catch (fetchError) {
              console.error("Failed to re-fetch MCQs after bulk delete error:", fetchError);
              setError("Failed to reload MCQs after deletion error.");
          }
     }
  };


  const handleSelectAll = (checked: boolean | 'indeterminate') => {
     if (checked === true) {
       setSelectedMcqs(new Set(filteredMcqs.map(mcq => mcq.id)));
     } else {
       setSelectedMcqs(new Set());
     }
   };

   const handleRowSelect = (id: string, checked: boolean) => {
     setSelectedMcqs(prev => {
       const next = new Set(prev);
       if (checked) {
         next.add(id);
       } else {
         next.delete(id);
       }
       return next;
     });
   };

  // Filter MCQs based on search term
  const filteredMcqs = mcqs.filter(mcq =>
    mcq.question.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mcq.question.ne.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mcq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

   const isAllSelected = filteredMcqs.length > 0 && selectedMcqs.size === filteredMcqs.length;
   const isIndeterminate = selectedMcqs.size > 0 && selectedMcqs.size < filteredMcqs.length;


  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Manage MCQs" />
       <main className="flex-1 p-6 md:p-10 bg-muted/30">

         {/* Search and Actions */}
         <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search questions, category..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
           <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
             {selectedMcqs.size > 0 && (
               <AlertDialog>
                 <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({selectedMcqs.size})
                    </Button>
                 </AlertDialogTrigger>
                 <AlertDialogContent>
                   <AlertDialogHeader>
                     <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                     <AlertDialogDescription>
                       Are you sure you want to delete {selectedMcqs.size} selected MCQ(s)? This action cannot be undone.
                     </AlertDialogDescription>
                   </AlertDialogHeader>
                   <AlertDialogFooter>
                     <AlertDialogCancel>Cancel</AlertDialogCancel>
                     <AlertDialogAction onClick={handleDeleteSelectedMCQs} className="bg-destructive hover:bg-destructive/90">
                       Delete Selected
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
             )}
             <Link href="/admin/mcqs/add" passHref>
               <Button size="sm">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add New MCQ
               </Button>
             </Link>
            </div>
         </div>

         {/* Display Error if any */}
         {error && (
             <div className="text-center py-10 text-destructive">{error}</div>
         )}

         {/* MCQ Table */}
         {isLoadingMCQs ? <MCQTableSkeleton /> : !error && (
             <Card className="overflow-hidden border shadow-sm">
                 <Table>
                 <TableHeader>
                    <TableRow>
                     <TableHead className="w-[50px]">
                        <Checkbox
                            checked={isAllSelected ? true : isIndeterminate ? 'indeterminate' : false}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all rows"
                        />
                     </TableHead>
                    <TableHead className="min-w-[250px]">Question (English)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Correct Answer (EN)</TableHead>
                    <TableHead className="text-right w-[150px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMcqs.length > 0 ? (
                    filteredMcqs.map((mcq) => (
                        <TableRow key={mcq.id} data-state={selectedMcqs.has(mcq.id) ? 'selected' : ''}>
                         <TableCell>
                             <Checkbox
                                checked={selectedMcqs.has(mcq.id)}
                                onCheckedChange={(checked) => handleRowSelect(mcq.id, !!checked)}
                                aria-label={`Select row ${mcq.id}`}
                              />
                         </TableCell>
                        <TableCell className="font-medium">
                             <span title={mcq.question.en} className="line-clamp-2">
                               {mcq.question.en}
                             </span>
                         </TableCell>
                        <TableCell>
                             <Badge variant="secondary">{mcq.category}</Badge>
                         </TableCell>
                        <TableCell>{mcq.correctAnswer.en}</TableCell>
                        <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                                <Link href={`/admin/mcqs/edit/${mcq.id}`} passHref>
                                 <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit MCQ">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                </Link>
                                <AlertDialog>
                                 <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete MCQ">
                                         <Trash2 className="h-4 w-4" />
                                     </Button>
                                 </AlertDialogTrigger>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete this MCQ? This action cannot be undone.
                                        <br /> <strong className='mt-2 block'>Question: "{mcq.question.en.substring(0, 50)}..."</strong>
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMCQ(mcq.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                     <TableRow>
                       <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                         {mcqs.length === 0 ? "No MCQs found in the database." : "No MCQs found matching your search criteria."}
                       </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
             </Card>
         )}
       </main>
    </div>
  );
}


function MCQTableSkeleton() {
    return (
        <Card className="overflow-hidden border shadow-sm">
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]"><Skeleton className="h-5 w-5" /></TableHead>
                <TableHead><Skeleton className="h-4 w-3/4" /></TableHead>
                <TableHead><Skeleton className="h-4 w-1/2" /></TableHead>
                <TableHead><Skeleton className="h-4 w-1/2" /></TableHead>
                <TableHead className="text-right w-[150px]"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                     <Skeleton className="h-8 w-8 rounded-md" />
                     <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                 </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </Card>
    );
}
