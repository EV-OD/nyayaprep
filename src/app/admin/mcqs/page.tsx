'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Languages, Filter, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types/quiz';
import { AdminHeader } from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';

// Dummy data for initial structure - replace with actual data fetching
const dummyMCQs: Question[] = [
  {
    id: '1',
    category: 'Constitutional Law',
    question: {
      en: 'Which article of the Constitution of Nepal guarantees the right to freedom?',
      ne: 'नेपालको संविधानको कुन धाराले स्वतन्त्रताको हकको प्रत्याभूति गरेको छ?',
    },
    options: { en: ['Art 16', 'Art 17', 'Art 18', 'Art 19'], ne: ['धारा १६', 'धारा १७', 'धारा १८', 'धारा १९'] },
    correctAnswer: { en: 'Article 17', ne: 'धारा १७' },
  },
  {
    id: '2',
    category: 'Legal Theory',
    question: { en: 'Who is considered the father of the theory of Natural Law?', ne: 'प्राकृतिक कानूनको सिद्धान्तका पिता कसलाई मानिन्छ?' },
    options: { en: ['Austin', 'Aquinas', 'Bentham', 'Hart'], ne: ['अस्टिन', 'एक्विनास', 'बेन्थम', 'हार्ट'] },
    correctAnswer: { en: 'Thomas Aquinas', ne: 'थोमस एक्विनास' },
  },
   {
    id: '3',
    category: 'Criminal Law',
    question: { en: 'What does "mens rea" refer to?', ne: '"मेन्स रिया" भन्नाले के बुझिन्छ?' },
    options: { en: ['Guilty act', 'Guilty mind', 'Burden of proof', 'Standard'], ne: ['कार्य', 'मनसाय', 'भार', 'स्तर'] },
    correctAnswer: { en: 'The guilty mind', ne: 'दोषपूर्ण मनसाय' },
  },
  // Add more dummy questions...
   {
    id: '4',
    category: 'Constitutional Law',
    question: { en: 'How many fundamental rights are enshrined in the Constitution of Nepal (2015)?', ne: 'नेपालको संविधान (२०७२) मा कतिवटा मौलिक हकहरू सुनिश्चित गरिएका छन्?' },
    options: { en: ['28', '31', '33', '35'], ne: ['२८', '३१', '३३', '३५'] },
    correctAnswer: { en: '31', ne: '३१' },
  },
];

export default function ManageMCQsPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMcqs, setSelectedMcqs] = React.useState<Set<string>>(new Set());
  const { toast } = useToast();

  React.useEffect(() => {
    // Simulate fetching MCQs
    const fetchMcqs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setMcqs(dummyMCQs); // Replace with actual API fetch
      } catch (err) {
         console.error("Failed to fetch MCQs:", err);
         setError("Failed to load MCQs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMcqs();
  }, []);

  const handleDelete = async (id: string) => {
    // Add API call logic here to delete the MCQ
     console.log(`Deleting MCQ with ID: ${id}`);
     try {
       await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        setMcqs(currentMcqs => currentMcqs.filter(mcq => mcq.id !== id));
       toast({
        title: "MCQ Deleted",
        description: `Successfully deleted MCQ (ID: ${id}).`,
      });
       setSelectedMcqs(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
       });
     } catch (err) {
         console.error("Failed to delete MCQ:", err);
         toast({
           variant: "destructive",
           title: "Deletion Failed",
           description: "Could not delete the MCQ.",
         });
     }
  };

    const handleDeleteSelected = async () => {
    const idsToDelete = Array.from(selectedMcqs);
    if (idsToDelete.length === 0) {
        toast({ variant: "destructive", title: "No MCQs Selected", description: "Please select MCQs to delete." });
        return;
    }
    console.log(`Deleting selected MCQs: ${idsToDelete.join(', ')}`);
     try {
       // Simulate batch delete API call
       await new Promise(resolve => setTimeout(resolve, 800));
       setMcqs(currentMcqs => currentMcqs.filter(mcq => !selectedMcqs.has(mcq.id)));
       setSelectedMcqs(new Set()); // Clear selection
       toast({
         title: "MCQs Deleted",
         description: `Successfully deleted ${idsToDelete.length} selected MCQ(s).`,
       });
     } catch (err) {
       console.error("Failed to delete selected MCQs:", err);
       toast({
         variant: "destructive",
         title: "Deletion Failed",
         description: "Could not delete the selected MCQs.",
       });
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
         <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder="Search questions or categories..."
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
                        <Trash2 className="mr-2 h-4 w-4" /> Delete ({selectedMcqs.size})
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
                     <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive hover:bg-destructive/90">
                       Delete Selected
                     </AlertDialogAction>
                   </AlertDialogFooter>
                 </AlertDialogContent>
               </AlertDialog>
             )}
              {/* <Button variant="outline" size="sm">
                 <Filter className="mr-2 h-4 w-4" /> Filter
               </Button> */}
             <Link href="/admin/mcqs/add" passHref>
               <Button size="sm">
                 <PlusCircle className="mr-2 h-4 w-4" /> Add New MCQ
               </Button>
             </Link>
            </div>
         </div>

         {isLoading ? (
            <MCQTableSkeleton />
         ) : error ? (
             <div className="text-center py-10 text-destructive">{error}</div>
         ) : (
             <Card className="overflow-hidden border shadow-sm">
                 <Table>
                 <TableHeader>
                    <TableRow>
                     <TableHead className="w-[50px]">
                        <Checkbox
                            checked={isAllSelected || isIndeterminate}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all rows"
                            className={isIndeterminate ? 'bg-primary/50 border-primary' : ''}
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
                             {/* Truncate long questions */}
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
                                {/* <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Translate MCQ">
                                    <Languages className="h-4 w-4" />
                                </Button> */}
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
                                    <AlertDialogAction onClick={() => handleDelete(mcq.id)} className="bg-destructive hover:bg-destructive/90">
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
                         No MCQs found matching your search criteria.
                       </TableCell>
                     </TableRow>
                    )}
                </TableBody>
                </Table>
             </Card>
         )}

         {/* Add Pagination component here later */}
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
