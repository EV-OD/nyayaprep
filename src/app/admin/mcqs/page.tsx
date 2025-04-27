'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Languages, Filter, Search, Loader2, Star, CheckCircle, AlertTriangle, HelpCircle, Send, Clock, Check, X, Bell, Users, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
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
import type { UserProfile, SubscriptionPlan, TeacherQuestion } from '@/types/user';
import { AdminHeader } from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    setUserValidationStatus,
    getUserProfile,
    getPendingTeacherQuestions,
    answerTeacherQuestion,
    getAllMcqs, // Fetch all MCQs
    deleteMcq, // Delete single MCQ
    deleteMultipleMcqs, // Delete multiple MCQs
} from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { auth } from '@/lib/firebase/config';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

// Dummy data removed - will fetch from Firestore

// Placeholder: Dummy user data for admin view (replace with actual fetching later)
const dummyUsers: UserProfile[] = [
    // Will be replaced by actual fetch
];

// Mock function to simulate fetching all users (replace with actual Firestore call)
async function fetchAllUsers(): Promise<UserProfile[]> {
     await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
     return [
         { uid: 'user1', name: 'Alice Smith', email: 'alice@example.com', phone: '1234567890', role: 'user', subscription: 'premium', validated: true, createdAt: Timestamp.now() },
         { uid: 'user2', name: 'Bob Johnson', email: 'bob@example.com', phone: '0987654321', role: 'user', subscription: 'basic', validated: false, createdAt: Timestamp.now() },
         { uid: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '1122334455', role: 'user', subscription: 'free', validated: true, createdAt: Timestamp.now() },
         { uid: 'user4', name: 'Diana Prince', email: 'diana@example.com', phone: '5544332211', role: 'user', subscription: 'premium', validated: false, createdAt: Timestamp.now() },
     ];
}


export default function ManageMCQsPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [teacherQuestions, setTeacherQuestions] = React.useState<TeacherQuestion[]>([]);
  const [isLoadingMCQs, setIsLoadingMCQs] = React.useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const [isLoadingTeacherQuestions, setIsLoadingTeacherQuestions] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMcqs, setSelectedMcqs] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState<'mcqs' | 'users' | 'teacherQuestions'>('mcqs');
  const [currentAdminUid, setCurrentAdminUid] = React.useState<string | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = React.useState(false);
  const [selectedQuestionToAnswer, setSelectedQuestionToAnswer] = React.useState<TeacherQuestion | null>(null);
  const [answerText, setAnswerText] = React.useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = React.useState(false);

  const { toast } = useToast();

    // Get current admin user ID on mount
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentAdminUid(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);


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

    const fetchUsersData = async () => {
         setIsLoadingUsers(true);
         setError(null);
         try {
             const fetchedUsers = await fetchAllUsers(); // Use the mock fetch function for now
             setUsers(fetchedUsers);
         } catch (err) {
             console.error("Failed to fetch users:", err);
             setError("Failed to load users. Please try again.");
             toast({ variant: "destructive", title: "Loading Error", description: "Could not load users."});
         } finally {
             setIsLoadingUsers(false);
         }
     };

     const fetchTeacherQuestionsData = async () => {
         setIsLoadingTeacherQuestions(true);
         setError(null);
         try {
             const fetchedQuestions = await getPendingTeacherQuestions();
             setTeacherQuestions(fetchedQuestions);
         } catch (err) {
             console.error("Failed to fetch teacher questions:", err);
              setError("Failed to load pending questions. Please try again.");
              toast({ variant: "destructive", title: "Loading Error", description: "Could not load pending questions."});
             const firebaseError = err as Error;
             if (firebaseError.message.includes('requires an index')) {
                 console.warn(
                     `Firestore Index Required: The query for pending teacher questions needs a composite index on 'teacherQuestions' collection: status (Ascending), askedAt (Ascending). Please create it in the Firebase console.`
                 );
             }
         } finally {
             setIsLoadingTeacherQuestions(false);
         }
     };


    if (activeTab === 'mcqs') {
        fetchMcqs(); // Fetch MCQs when tab is active or on initial load
    } else if (activeTab === 'users') {
        fetchUsersData(); // Fetch users when tab is active
    } else if (activeTab === 'teacherQuestions') {
        fetchTeacherQuestionsData(); // Fetch teacher questions when tab is active
    }
  }, [activeTab, toast]); // Add toast to dependencies

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

  const handleDeleteUser = async (uid: string) => {
      console.log(`Deleting User with UID: ${uid}`);
      // Implement actual user deletion logic here (requires Admin SDK or Cloud Function usually)
      toast({ title: "Action Not Implemented", description: "User deletion functionality is not yet available." });
  };

  const handleToggleValidation = async (uid: string, currentStatus: boolean) => {
       const newStatus = !currentStatus;
       // Optimistically update UI
       setUsers(prevUsers =>
           prevUsers.map(user =>
               user.uid === uid ? { ...user, validated: newStatus } : user
           )
       );
       try {
           await setUserValidationStatus(uid, newStatus);
           toast({
               title: "Validation Status Updated",
               description: `User validation set to ${newStatus ? 'Validated' : 'Not Validated'}.`,
           });
       } catch (error) {
           console.error("Failed to update validation status:", error);
           // Revert UI on error
            setUsers(prevUsers =>
               prevUsers.map(user =>
                   user.uid === uid ? { ...user, validated: currentStatus } : user // Revert to old status
               )
           );
           toast({
               variant: "destructive",
               title: "Update Failed",
               description: "Could not update user validation status.",
           });
       }
   };

    const handleOpenAnswerDialog = (question: TeacherQuestion) => {
        setSelectedQuestionToAnswer(question);
        setAnswerText('');
        setAnswerDialogOpen(true);
    };

    const handleAnswerSubmit = async () => {
        if (!selectedQuestionToAnswer || !answerText.trim() || !currentAdminUid) {
            toast({ variant: "destructive", title: "Error", description: "Missing question, answer, or admin ID." });
            return;
        }
        setIsSubmittingAnswer(true);
        try {
             // Fetch user profile to pass current notification count (optional optimization)
            const userProfile = await getUserProfile(selectedQuestionToAnswer.userId);

            await answerTeacherQuestion(
                selectedQuestionToAnswer.id!,
                answerText,
                currentAdminUid,
                userProfile?.unreadNotifications
             );
            toast({ title: "Answer Submitted", description: `Answer provided for question ID ${selectedQuestionToAnswer.id}. User notified.` });

            // Remove the answered question from the local state
            setTeacherQuestions(prev => prev.filter(q => q.id !== selectedQuestionToAnswer.id));

            setAnswerDialogOpen(false);
        } catch (error) {
            console.error("Failed to submit answer:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit the answer." });
        } finally {
            setIsSubmittingAnswer(false);
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

  // Filter Users based on search term
  const filteredUsers = users.filter(user =>
     (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.subscription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

   // Group pending questions by user ID
   const groupedTeacherQuestions = React.useMemo(() => {
        return teacherQuestions
         .filter(q => q.status === 'pending')
         .filter(q =>
             q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (q.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
             (q.userEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase())
         )
         .reduce((acc, q) => {
             if (!acc[q.userId]) {
                 // Fetch user profile details here if needed, or rely on stored name/email
                  // Currently relies on name/email stored with the question
                 acc[q.userId] = {
                     userName: q.userName || 'Unknown User',
                     userEmail: q.userEmail || 'No Email',
                     userId: q.userId,
                     questions: [],
                     // Fetch user profile to get subscription (can be optimized)
                     // Find user in the already fetched users list
                     subscription: users.find(u => u.uid === q.userId)?.subscription || 'free'
                 };
             }
             acc[q.userId].questions.push(q);
             return acc;
         }, {} as Record<string, { userName: string; userEmail: string; userId: string, questions: TeacherQuestion[], subscription: SubscriptionPlan }>);
    }, [teacherQuestions, searchTerm, users]); // Depend on users state too

   const isAllSelected = filteredMcqs.length > 0 && selectedMcqs.size === filteredMcqs.length;
   const isIndeterminate = selectedMcqs.size > 0 && selectedMcqs.size < filteredMcqs.length;

   // --- Helper functions for badge styling ---
   const getSubscriptionBadgeDetails = (plan?: SubscriptionPlan) => {
        switch (plan) {
            case 'premium': return { variant: 'default', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', icon: <Star className="mr-1 h-3 w-3 fill-current" /> };
            case 'basic': return { variant: 'secondary', colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', icon: null };
            case 'free': return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
            default: return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
        }
    };

    const getValidationStatus = (validated: boolean, subscription?: SubscriptionPlan) => {
        if (subscription === 'free') {
            return <Badge variant="secondary" className="bg-transparent text-muted-foreground text-xs">N/A</Badge>;
        }
        return validated ? (
             <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                <CheckCircle className="mr-1 h-3 w-3" /> Validated
             </Badge>
         ) : (
             <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Pending
              </Badge>
         );
     };

      const getStatusBadge = (status: TeacherQuestion['status']) => {
         switch (status) {
             case 'pending':
                 return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"><Clock size={12} className="mr-1"/> Pending</Badge>;
             case 'answered':
                 return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"><Check size={12} className="mr-1"/> Answered</Badge>;
             case 'rejected':
                 return <Badge variant="destructive"><X size={12} className="mr-1"/> Rejected</Badge>;
             default:
                 return <Badge variant="secondary">Unknown</Badge>;
         }
     };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Manage Content & Users" />
       <main className="flex-1 p-6 md:p-10 bg-muted/30">
         {/* Tabs */}
         <div className="mb-6 border-b">
             <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                 <button
                     onClick={() => setActiveTab('mcqs')}
                     className={cn(
                         'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                         activeTab === 'mcqs'
                             ? 'border-primary text-primary'
                             : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                     )}
                 >
                    <ListChecks size={16} className="inline mr-1 mb-0.5"/> Manage MCQs
                 </button>
                 <button
                     onClick={() => setActiveTab('users')}
                     className={cn(
                         'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                         activeTab === 'users'
                             ? 'border-primary text-primary'
                             : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                     )}
                 >
                     <Users size={16} className="inline mr-1 mb-0.5"/> Manage Users
                 </button>
                  <button
                     onClick={() => setActiveTab('teacherQuestions')}
                     className={cn(
                         'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                         activeTab === 'teacherQuestions'
                             ? 'border-primary text-primary'
                             : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                     )}
                 >
                     <HelpCircle size={16} className="inline mr-1 mb-0.5"/> User Questions ({isLoadingTeacherQuestions ? '...' : Object.keys(groupedTeacherQuestions).reduce((sum, userId) => sum + groupedTeacherQuestions[userId].questions.length, 0)})
                 </button>
             </nav>
         </div>


         {/* Search and Actions */}
         <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder={
                    activeTab === 'mcqs' ? "Search questions, category..." :
                    activeTab === 'users' ? "Search name, email, phone, plan..." :
                    "Search questions, user..."
                }
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
           <div className="flex gap-2 flex-wrap justify-end w-full sm:w-auto">
              {activeTab === 'mcqs' && selectedMcqs.size > 0 && (
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
             {activeTab === 'mcqs' && (
                 <Link href="/admin/mcqs/add" passHref>
                   <Button size="sm">
                     <PlusCircle className="mr-2 h-4 w-4" /> Add New MCQ
                   </Button>
                 </Link>
             )}
            </div>
         </div>

         {/* Display Error if any */}
         {error && (
             <div className="text-center py-10 text-destructive">{error}</div>
         )}


         {/* Conditional Table/View Rendering */}
         {activeTab === 'mcqs' && (
             isLoadingMCQs ? <MCQTableSkeleton /> : !error && (
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
             )
         )}

         {activeTab === 'users' && (
             isLoadingUsers ? <UserTableSkeleton /> : !error && (
                <Card className="overflow-hidden border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right w-[150px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const planDetails = getSubscriptionBadgeDetails(user.subscription);
                                    return (
                                        <TableRow key={user.uid}>
                                            <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                             <TableCell>{user.phone || 'N/A'}</TableCell>
                                            <TableCell>
                                                 <Badge variant={planDetails.variant} className={cn("capitalize", planDetails.colorClass)}>
                                                    {planDetails.icon}
                                                    {user.subscription || 'Free'}
                                                 </Badge>
                                            </TableCell>
                                            <TableCell>
                                                 {getValidationStatus(user.validated, user.subscription)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-end items-center">
                                                     {user.subscription !== 'free' && (
                                                        <AlertDialog>
                                                             <AlertDialogTrigger asChild>
                                                                  <Button
                                                                     variant="ghost"
                                                                     size="icon"
                                                                     className={cn("h-8 w-8", user.validated ? "text-green-600 hover:bg-green-100" : "text-yellow-600 hover:bg-yellow-100")}
                                                                     aria-label={user.validated ? "Mark as Pending" : "Mark as Validated"}
                                                                  >
                                                                     {user.validated ? <CheckCircle className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                                                                  </Button>
                                                             </AlertDialogTrigger>
                                                              <AlertDialogContent>
                                                                  <AlertDialogHeader>
                                                                      <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                                                      <AlertDialogDescription>
                                                                           Are you sure you want to change the validation status for user "{user.name}" to
                                                                           <strong className="ml-1">{user.validated ? 'Pending' : 'Validated'}</strong>?
                                                                       </AlertDialogDescription>
                                                                  </AlertDialogHeader>
                                                                   <AlertDialogFooter>
                                                                       <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                       <AlertDialogAction
                                                                           onClick={() => handleToggleValidation(user.uid, user.validated)}
                                                                           className={user.validated ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
                                                                       >
                                                                           {user.validated ? 'Set to Pending' : 'Set to Validated'}
                                                                       </AlertDialogAction>
                                                                   </AlertDialogFooter>
                                                              </AlertDialogContent>
                                                        </AlertDialog>
                                                     )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View/Edit User" disabled>
                                                         <Edit className="h-4 w-4" />
                                                     </Button>
                                                     <AlertDialog>
                                                         <AlertDialogTrigger asChild>
                                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete User">
                                                                 <Trash2 className="h-4 w-4" />
                                                             </Button>
                                                         </AlertDialogTrigger>
                                                         <AlertDialogContent>
                                                             <AlertDialogHeader>
                                                                 <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                                                 <AlertDialogDescription>
                                                                     Are you sure you want to delete user "{user.name}" ({user.email})? This action cannot be undone.
                                                                 </AlertDialogDescription>
                                                             </AlertDialogHeader>
                                                             <AlertDialogFooter>
                                                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                 <AlertDialogAction onClick={() => handleDeleteUser(user.uid)} className="bg-destructive hover:bg-destructive/90">
                                                                     Delete User
                                                                 </AlertDialogAction>
                                                             </AlertDialogFooter>
                                                         </AlertDialogContent>
                                                     </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        {users.length === 0 ? "No users found." : "No users found matching your search criteria."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
             )
         )}

         {/* User Questions Tab */}
         {activeTab === 'teacherQuestions' && (
            isLoadingTeacherQuestions ? <TeacherQuestionsSkeleton /> : !error && (
                <div className="space-y-6">
                    {Object.keys(groupedTeacherQuestions).length > 0 ? (
                         Object.entries(groupedTeacherQuestions).map(([userId, userData]) => {
                            const planDetails = getSubscriptionBadgeDetails(userData.subscription);
                            return (
                                 <Card key={userId} className="border shadow-sm">
                                    <CardHeader className="bg-muted/30 p-4 border-b">
                                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                             <div>
                                                 <CardTitle className="text-base font-semibold">{userData.userName}</CardTitle>
                                                 <CardDescription className="text-xs">{userData.userEmail}</CardDescription>
                                             </div>
                                             <Badge variant={planDetails.variant} className={cn("capitalize text-xs w-fit", planDetails.colorClass)}>
                                                 {planDetails.icon}
                                                 {userData.subscription || 'Free'}
                                             </Badge>
                                         </div>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                         {userData.questions.map((q) => (
                                            <div key={q.id} className="border p-3 rounded-md bg-background">
                                                 <p className="text-sm mb-2"><strong>Question:</strong> {q.questionText}</p>
                                                 <div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
                                                     <span>Asked: {q.askedAt ? format(q.askedAt.toDate(), 'PPp') : 'N/A'}</span>
                                                     {getStatusBadge(q.status)}
                                                 </div>
                                                 <Button
                                                     size="sm"
                                                     variant="default"
                                                     onClick={() => handleOpenAnswerDialog(q)}
                                                     className="bg-primary hover:bg-primary/90"
                                                     disabled={isSubmittingAnswer} // Disable while any answer is submitting
                                                 >
                                                     <Send className="mr-1 h-3.5 w-3.5" /> Answer
                                                 </Button>
                                            </div>
                                         ))}
                                    </CardContent>
                                 </Card>
                            );
                         })
                    ) : (
                         <Card className="text-center text-muted-foreground py-10 border shadow-sm">
                            <CardContent>
                                {teacherQuestions.length === 0 ? "No pending questions from users." : "No pending questions found matching your search."}
                            </CardContent>
                         </Card>
                    )}
                </div>
             )
         )}


         {/* Answer Dialog */}
         <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
           <DialogContent className="sm:max-w-[600px]">
             <DialogHeader>
               <DialogTitle>Answer Question</DialogTitle>
               <DialogDescription>
                  Provide an answer for the question below. The user will be notified.
               </DialogDescription>
             </DialogHeader>
             <div className="py-4 space-y-4">
                <div className="text-sm p-3 border rounded-md bg-muted/50">
                  <strong>Question:</strong> {selectedQuestionToAnswer?.questionText}
                  <p className="text-xs text-muted-foreground mt-1">
                     Asked by: {selectedQuestionToAnswer?.userName} ({selectedQuestionToAnswer?.userEmail})
                     on {selectedQuestionToAnswer?.askedAt ? format(selectedQuestionToAnswer.askedAt.toDate(), 'PPp') : 'N/A'}
                  </p>
                </div>
                <Textarea
                    placeholder="Type your answer here..."
                    rows={6}
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    disabled={isSubmittingAnswer}
                    className="text-sm"
                />
             </div>
             <DialogFooter>
               <DialogClose asChild>
                 <Button type="button" variant="outline" disabled={isSubmittingAnswer}>
                   Cancel
                 </Button>
               </DialogClose>
               <Button
                 type="button"
                 onClick={handleAnswerSubmit}
                 disabled={isSubmittingAnswer || !answerText.trim()}
                 className="bg-primary hover:bg-primary/90"
               >
                 {isSubmittingAnswer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                 {isSubmittingAnswer ? 'Submitting...' : 'Submit Answer & Notify'}
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

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


function UserTableSkeleton() {
    return (
        <Card className="overflow-hidden border shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead className="text-right w-[150px]"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                         <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                                <Skeleton className="h-8 w-8 rounded-md" />
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

function TeacherQuestionsSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(2)].map((_, userIndex) => (
                <Card key={userIndex} className="border shadow-sm">
                     <CardHeader className="bg-muted/30 p-4 border-b">
                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                             <div>
                                 <Skeleton className="h-5 w-32 mb-1" />
                                 <Skeleton className="h-3 w-40" />
                             </div>
                             <Skeleton className="h-6 w-20 rounded-full" />
                         </div>
                     </CardHeader>
                     <CardContent className="p-4 space-y-3">
                        {[...Array(2)].map((_, qIndex) => (
                             <div key={qIndex} className="border p-3 rounded-md bg-background">
                                <Skeleton className="h-4 w-full mb-2" />
                                <div className="flex justify-between items-center text-xs mb-3">
                                    <Skeleton className="h-3 w-1/4" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="mt-2 space-y-2">
                                    <Skeleton className="h-8 w-24 rounded-md" />
                                </div>
                             </div>
                         ))}
                     </CardContent>
                </Card>
             ))}
        </div>
    );
}
