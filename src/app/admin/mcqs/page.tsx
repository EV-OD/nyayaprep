
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, Edit, Trash2, Languages, Filter, Search, Loader2, Star, CheckCircle, AlertTriangle } from 'lucide-react'; // Added CheckCircle, AlertTriangle
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
import type { UserProfile, SubscriptionPlan } from '@/types/user'; // Import UserProfile & SubscriptionPlan
import { AdminHeader } from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils'; // Import cn utility
import { setUserValidationStatus, getUserProfile } from '@/lib/firebase/firestore'; // Import validation function
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

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
   {
    id: '4',
    category: 'Constitutional Law',
    question: { en: 'How many fundamental rights are enshrined in the Constitution of Nepal (2015)?', ne: 'नेपालको संविधान (२०७२) मा कतिवटा मौलिक हकहरू सुनिश्चित गरिएका छन्?' },
    options: { en: ['28', '31', '33', '35'], ne: ['२८', '३१', '३३', '३५'] },
    correctAnswer: { en: '31', ne: '३१' },
  },
];

// Placeholder: Dummy user data for admin view (replace with actual fetching later)
// Ensure dummy data includes `validated` field
const dummyUsers: UserProfile[] = [
    // Will be replaced by actual fetch
];

// Mock function to simulate fetching all users (replace with actual Firestore call)
async function fetchAllUsers(): Promise<UserProfile[]> {
     await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay
     // Replace with actual Firestore call to fetch all users
     // Ensure fetched data conforms to UserProfile, including `validated` field
     return [
         { uid: 'user1', name: 'Alice Smith', email: 'alice@example.com', phone: '1234567890', role: 'user', subscription: 'premium', validated: true, createdAt: Timestamp.now() },
         { uid: 'user2', name: 'Bob Johnson', email: 'bob@example.com', phone: '0987654321', role: 'user', subscription: 'basic', validated: false, createdAt: Timestamp.now() },
         { uid: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '1122334455', role: 'user', subscription: 'free', validated: true, createdAt: Timestamp.now() },
         { uid: 'user4', name: 'Diana Prince', email: 'diana@example.com', phone: '5544332211', role: 'user', subscription: 'premium', validated: false, createdAt: Timestamp.now() },
     ];
}


export default function ManageMCQsPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]); // State for users
  const [isLoadingMCQs, setIsLoadingMCQs] = React.useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true); // Loading state for users
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMcqs, setSelectedMcqs] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState<'mcqs' | 'users'>('mcqs'); // State for active tab
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchMcqs = async () => {
      setIsLoadingMCQs(true);
      setError(null);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        setMcqs(dummyMCQs); // Replace with actual API fetch
      } catch (err) {
         console.error("Failed to fetch MCQs:", err);
         setError("Failed to load MCQs. Please try again.");
      } finally {
        setIsLoadingMCQs(false);
      }
    };

    const fetchUsersData = async () => {
         setIsLoadingUsers(true);
         setError(null); // Clear previous errors
         try {
             const fetchedUsers = await fetchAllUsers(); // Use the new fetch function
             setUsers(fetchedUsers);
         } catch (err) {
             console.error("Failed to fetch users:", err);
             setError("Failed to load users. Please try again."); // Set error state for users
         } finally {
             setIsLoadingUsers(false);
         }
     };


    if (activeTab === 'mcqs') {
        if (mcqs.length === 0) fetchMcqs(); // Fetch only if not already loaded
        else setIsLoadingMCQs(false); // Already loaded
    } else if (activeTab === 'users') {
        if (users.length === 0) fetchUsersData(); // Fetch only if not already loaded
         else setIsLoadingUsers(false); // Already loaded
    }
  }, [activeTab, mcqs.length, users.length]); // Add mcqs.length and users.length dependencies

  const handleDeleteMCQ = async (id: string) => {
     console.log(`Deleting MCQ with ID: ${id}`);
     // Add actual delete logic here
     toast({ title: "Action Not Implemented", description: "MCQ deletion backend not implemented yet." });
  };

  const handleDeleteSelectedMCQs = async () => {
    const idsToDelete = Array.from(selectedMcqs);
    if (idsToDelete.length === 0) {
        toast({ variant: "destructive", title: "No MCQs Selected", description: "Please select MCQs to delete." });
        return;
    }
    console.log(`Deleting selected MCQs: ${idsToDelete.join(', ')}`);
     // Add actual delete logic here
     toast({ title: "Action Not Implemented", description: "Bulk MCQ deletion backend not implemented yet." });
  };

  // Placeholder for deleting users
  const handleDeleteUser = async (uid: string) => {
      console.log(`Deleting User with UID: ${uid}`);
      // Implement actual user deletion logic here (Firestore + Auth)
      toast({ title: "Action Not Implemented", description: "User deletion functionality is not yet available." });
  };

  // Handle toggling validation status
  const handleToggleValidation = async (uid: string, currentStatus: boolean) => {
       const newStatus = !currentStatus;
       try {
           await setUserValidationStatus(uid, newStatus);
           // Update local state for immediate UI feedback
           setUsers(prevUsers =>
               prevUsers.map(user =>
                   user.uid === uid ? { ...user, validated: newStatus } : user
               )
           );
           toast({
               title: "Validation Status Updated",
               description: `User ${uid} validation set to ${newStatus ? 'Validated' : 'Not Validated'}.`,
           });
       } catch (error) {
           console.error("Failed to update validation status:", error);
           toast({
               variant: "destructive",
               title: "Update Failed",
               description: "Could not update user validation status.",
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

  const filteredUsers = users.filter(user =>
     (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.subscription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

   const isAllSelected = filteredMcqs.length > 0 && selectedMcqs.size === filteredMcqs.length;
   const isIndeterminate = selectedMcqs.size > 0 && selectedMcqs.size < filteredMcqs.length;

   const getSubscriptionBadgeDetails = (plan?: SubscriptionPlan) => {
        switch (plan) {
            case 'premium': return { variant: 'default', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Star className="mr-1 h-3 w-3 fill-current" /> }; // Gold
            case 'basic': return { variant: 'secondary', colorClass: 'bg-green-100 text-green-800 border-green-300', icon: null }; // Green
            case 'free': return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300', icon: null }; // Gray
            default: return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300', icon: null };
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

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Manage Content & Users" />
       <main className="flex-1 p-6 md:p-10 bg-muted/30">
         {/* Tabs */}
         <div className="mb-6 border-b">
             <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                 <button
                     onClick={() => setActiveTab('mcqs')}
                     className={cn(
                         'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm',
                         activeTab === 'mcqs'
                             ? 'border-primary text-primary'
                             : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                     )}
                 >
                     Manage MCQs
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
                     Manage Users
                 </button>
             </nav>
         </div>


         {/* Search and Actions */}
         <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                type="search"
                placeholder={activeTab === 'mcqs' ? "Search questions, category..." : "Search name, email, phone, plan..."}
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
             {/* Filter Button Placeholder */}
             {/* <Button variant="outline" size="sm" disabled>
                <Filter className="mr-2 h-4 w-4" /> Filter
              </Button> */}
             {activeTab === 'mcqs' && (
                 <Link href="/admin/mcqs/add" passHref>
                   <Button size="sm">
                     <PlusCircle className="mr-2 h-4 w-4" /> Add New MCQ
                   </Button>
                 </Link>
             )}
             {/* Add button for adding users later if needed */}
            </div>
         </div>

         {/* Display Error if any */}
         {error && activeTab === 'mcqs' && !isLoadingMCQs && (
             <div className="text-center py-10 text-destructive">{error}</div>
         )}
         {error && activeTab === 'users' && !isLoadingUsers && (
             <div className="text-center py-10 text-destructive">{error}</div>
         )}


         {/* Conditional Table Rendering */}
         {activeTab === 'mcqs' && (
             isLoadingMCQs ? (
                <MCQTableSkeleton />
             ) : !error && ( // Only render table if no error
                 <Card className="overflow-hidden border shadow-sm">
                     <Table>
                     <TableHeader>
                        <TableRow>
                         <TableHead className="w-[50px]">
                            <Checkbox
                                checked={isAllSelected || isIndeterminate}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all rows"
                                // className={isIndeterminate ? 'bg-primary/50 border-primary' : ''} // Indeterminate styling needs custom CSS or Radix state
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
                             {mcqs.length === 0 ? "No MCQs found." : "No MCQs found matching your search criteria."}
                           </TableCell>
                         </TableRow>
                        )}
                    </TableBody>
                    </Table>
                 </Card>
             )
         )}

         {activeTab === 'users' && (
             isLoadingUsers ? (
                 <UserTableSkeleton />
             ) : !error && ( // Only render table if no error
                <Card className="overflow-hidden border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="min-w-[150px]">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead> {/* Changed from Joined Date */}
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
                                                    {/* Toggle Validation Button */}
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
                                                    {/* View/Edit User (Placeholder) */}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View/Edit User" disabled>
                                                         <Edit className="h-4 w-4" />
                                                     </Button>
                                                     {/* Delete User */}
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
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead> {/* Status column */}
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
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell> {/* Status skeleton */}
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
