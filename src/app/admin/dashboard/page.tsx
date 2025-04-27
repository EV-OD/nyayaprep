
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter
import { PlusCircle, Edit, Trash2, Filter, Search, Loader2, Star, CheckCircle, AlertTriangle, HelpCircle, Send, Clock, Check, X, Bell, Users, ListChecks, FileText, Languages, Settings, CalendarPlus, CalendarOff, CalendarCheck } from 'lucide-react'; // Added necessary icons including Calendar
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar" // Import Calendar
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover" // Import Popover
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
import { Checkbox } from '@/components/ui/checkbox'; // Needed if user selection is added later
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types/quiz'; // Keep if Overview shows MCQ count
import type { UserProfile, SubscriptionPlan, TeacherQuestion } from '@/types/user';
import { AdminHeader } from '@/components/admin/admin-header';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    setUserValidationStatus,
    getUserProfile,
    getPendingTeacherQuestions,
    answerTeacherQuestion,
    getAllMcqs, // Keep for overview count
    getAllUsers, // Function to get all users
    // deleteMcq, // No longer needed here
    // deleteMultipleMcqs, // No longer needed here
} from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { format, addWeeks, parseISO, formatISO } from 'date-fns'; // Added addWeeks, parseISO, formatISO
import { auth } from '@/lib/firebase/config';

export default function AdminDashboardPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]); // Keep for Overview count
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [teacherQuestions, setTeacherQuestions] = React.useState<TeacherQuestion[]>([]);
  const [isLoadingMCQs, setIsLoadingMCQs] = React.useState(true); // For Overview
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const [isLoadingTeacherQuestions, setIsLoadingTeacherQuestions] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'teacherQuestions'>('overview'); // Default to overview
  const [currentAdminUid, setCurrentAdminUid] = React.useState<string | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = React.useState(false);
  const [selectedQuestionToAnswer, setSelectedQuestionToAnswer] = React.useState<TeacherQuestion | null>(null);
  const [answerText, setAnswerText] = React.useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = React.useState(false);

  // State for validation dialog
  const [validationDialogOpen, setValidationDialogOpen] = React.useState(false);
  const [userToValidate, setUserToValidate] = React.useState<UserProfile | null>(null);
  const [validationDuration, setValidationDuration] = React.useState(1); // Default 1 week
  const [isUpdatingValidation, setIsUpdatingValidation] = React.useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Get current admin user ID on mount
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentAdminUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // --- Fetching Logic ---
  React.useEffect(() => {
    const fetchMcqCount = async () => {
      setIsLoadingMCQs(true);
      setError(null);
      try {
        const fetchedMcqs = await getAllMcqs(); // Fetch all MCQs just for the count
        setMcqs(fetchedMcqs);
      } catch (err) {
        console.error("Failed to fetch MCQs for count:", err);
        setError("Failed to load MCQ count.");
        toast({ variant: "destructive", title: "Loading Error", description: "Could not load MCQ count." });
      } finally {
        setIsLoadingMCQs(false);
      }
    };

    const fetchUsersData = async () => {
      setIsLoadingUsers(true);
      setError(null);
      try {
        const fetchedUsers = await getAllUsers(); // Use actual Firestore fetch function
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError("Failed to load users. Please try again.");
        toast({ variant: "destructive", title: "Loading Error", description: "Could not load users." });
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
        toast({ variant: "destructive", title: "Loading Error", description: "Could not load pending questions." });
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

    // Fetch data based on the active tab
    if (activeTab === 'overview') {
        fetchMcqCount(); // Fetch MCQ count for overview
        fetchUsersData(); // Also fetch users for overview count
        fetchTeacherQuestionsData(); // Also fetch pending questions count for overview
    } else if (activeTab === 'users') {
        fetchUsersData(); // Fetch users when tab is active
    } else if (activeTab === 'teacherQuestions') {
        fetchTeacherQuestionsData(); // Fetch teacher questions when tab is active
    }
  }, [activeTab, toast]);

  // --- User Management Handlers ---
  const handleDeleteUser = async (uid: string) => {
      console.log(`Deleting User with UID: ${uid}`);
      // Implement actual user deletion logic here (requires Admin SDK or Cloud Function usually)
      toast({ title: "Action Not Implemented", description: "User deletion functionality is not yet available." });
  };

  // Open dialog to handle validation/expiry
   const handleOpenValidationDialog = (user: UserProfile) => {
       setUserToValidate(user);
       setValidationDuration(1); // Reset duration
       setValidationDialogOpen(true);
   };

   // Handle confirming the validation status change
   const handleConfirmValidation = async () => {
       if (!userToValidate) return;
       setIsUpdatingValidation(true);

       const newStatus = !userToValidate.validated;
       let newExpiryDate: Timestamp | null = null;

       if (newStatus) { // If validating
           const now = new Date();
           newExpiryDate = Timestamp.fromDate(addWeeks(now, validationDuration));
       } else { // If invalidating (setting to pending/expired)
           newExpiryDate = null; // Remove expiry date when invalidating
       }

       try {
           await setUserValidationStatus(userToValidate.uid, newStatus, newExpiryDate);
           toast({
               title: "Validation Status Updated",
               description: `User ${userToValidate.name} set to ${newStatus ? 'Validated' : 'Pending/Expired'}.${newStatus ? ` Subscription expires on ${format(newExpiryDate!.toDate(), 'PPP')}.` : ''}`,
           });
           // Update local state
           setUsers(prevUsers =>
               prevUsers.map(user =>
                   user.uid === userToValidate.uid ? { ...user, validated: newStatus, expiryDate: newExpiryDate } : user
               )
           );
           setValidationDialogOpen(false);
       } catch (error) {
           console.error("Failed to update validation status:", error);
           toast({
               variant: "destructive",
               title: "Update Failed",
               description: "Could not update user validation status.",
           });
       } finally {
           setIsUpdatingValidation(false);
       }
   };


  // --- Teacher Question Handlers ---
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
            const userProfile = await getUserProfile(selectedQuestionToAnswer.userId);
            await answerTeacherQuestion(
                selectedQuestionToAnswer.id!,
                answerText,
                currentAdminUid,
                userProfile?.unreadNotifications
             );
            toast({ title: "Answer Submitted", description: `Answer provided for question ID ${selectedQuestionToAnswer.id}. User notified.` });
            setTeacherQuestions(prev => prev.filter(q => q.id !== selectedQuestionToAnswer.id));
            setAnswerDialogOpen(false);
        } catch (error) {
            console.error("Failed to submit answer:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit the answer." });
        } finally {
            setIsSubmittingAnswer(false);
        }
    };

  // --- Filtering Logic ---
  const filteredUsers = users.filter(user =>
     (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.subscription?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
     (user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

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
          acc[q.userId] = {
            userName: q.userName || 'Unknown User',
            userEmail: q.userEmail || 'No Email',
            userId: q.userId,
            questions: [],
            subscription: users.find(u => u.uid === q.userId)?.subscription || 'free'
          };
        }
        acc[q.userId].questions.push(q);
        return acc;
      }, {} as Record<string, { userName: string; userEmail: string; userId: string, questions: TeacherQuestion[], subscription: SubscriptionPlan }>);
  }, [teacherQuestions, searchTerm, users]);

  // --- Helper functions for badge styling ---
  const getSubscriptionBadgeDetails = (plan?: SubscriptionPlan) => {
    switch (plan) {
        case 'premium': return { variant: 'default', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700', icon: <Star className="mr-1 h-3 w-3 fill-current" /> };
        case 'basic': return { variant: 'secondary', colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700', icon: null };
        case 'free': return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
        default: return { variant: 'outline', colorClass: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700', icon: null };
    }
  };

  const getValidationStatusBadge = (user: UserProfile) => {
      if (user.subscription === 'free') {
          return <Badge variant="secondary" className="bg-transparent text-muted-foreground text-xs">N/A (Free)</Badge>;
      }

      const isExpired = user.expiryDate && user.expiryDate.toDate() < new Date();

      if (isExpired) {
          return (
              <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 text-white text-xs">
                  <CalendarOff className="mr-1 h-3 w-3" /> Expired
              </Badge>
          );
      } else if (user.validated) {
          return (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white text-xs">
                  <CalendarCheck className="mr-1 h-3 w-3" /> Validated
              </Badge>
          );
      } else {
          return (
              <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Pending
              </Badge>
          );
      }
  };


  const getStatusBadge = (status: TeacherQuestion['status']) => {
     switch (status) {
         case 'pending':
             return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"><Clock size={12} className="mr-1"/> Pending</Badge>;
         case 'answered':
             return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700"><Check size={12} className="mr-1"/> Answered</Badge>;
         case 'rejected':
             return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700"><X size={12} className="mr-1"/> Rejected</Badge>;
         default:
             return <Badge variant="secondary">Unknown</Badge>;
     }
  };

  const pendingQuestionCount = Object.keys(groupedTeacherQuestions).reduce((sum, userId) => sum + groupedTeacherQuestions[userId].questions.length, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Admin Dashboard" />
      <main className="flex-1 p-6 md:p-10 bg-muted/30">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
             <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Manage Users ({isLoadingUsers ? '...' : users.length})</TabsTrigger>
                <TabsTrigger value="teacherQuestions">
                  User Questions ({isLoadingTeacherQuestions ? '...' : pendingQuestionCount})
                   {pendingQuestionCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                          {pendingQuestionCount}
                      </span>
                   )}
                </TabsTrigger>
             </TabsList>
             {/* Search bar for relevant tabs */}
             {(activeTab === 'users' || activeTab === 'teacherQuestions') && (
               <div className="relative w-full sm:max-w-xs">
                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input
                   type="search"
                   placeholder={
                     activeTab === 'users' ? "Search name, email, phone, plan..." :
                     "Search questions, user..."
                   }
                   className="pl-8 w-full"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
             )}
             {/* Action buttons for specific tabs */}
              {activeTab === 'overview' && (
                  <div className="flex gap-2">
                      <Link href="/admin/mcqs/add" passHref>
                        <Button size="sm">
                           <PlusCircle className="mr-2 h-4 w-4" /> Add MCQ
                        </Button>
                      </Link>
                       <Link href="/admin/mcqs" passHref>
                         <Button variant="outline" size="sm">
                           <ListChecks className="mr-2 h-4 w-4" /> Manage MCQs
                         </Button>
                       </Link>
                  </div>
              )}
          </div>


          {/* Tab Content */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Summary Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingMCQs ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{mcqs.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                   <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   {isLoadingUsers ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{users.length}</div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <CardTitle className="text-sm font-medium">Pending Questions</CardTitle>
                   <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   {isLoadingTeacherQuestions ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{pendingQuestionCount}</div>}
                </CardContent>
              </Card>
              {/* Add more relevant overview cards */}

              {/* Quick Actions */}
              <Card className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4 bg-card p-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Link href="/admin/mcqs/add" passHref>
                  <Button size="lg" className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" /> Add New MCQ
                  </Button>
                </Link>
                <Link href="/admin/mcqs" passHref>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <ListChecks className="mr-2 h-5 w-5" /> Manage MCQs
                  </Button>
                </Link>
                 <Link href="/admin/settings" passHref>
                   <Button variant="ghost" size="lg" className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
                     <Settings className="mr-2 h-5 w-5" /> Settings
                   </Button>
                 </Link>
              </Card>
            </div>
            {/* Placeholder for Recent Activity or other sections */}
             <div className="mt-10">
               <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
               <Card>
                 <CardContent className="pt-6">
                   <p className="text-muted-foreground">Activity log (e.g., new users, answered questions) will be displayed here...</p>
                    {/* Example items */}
                    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
                       <p className="text-sm">User 'test@example.com' registered.</p>
                       <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                     <div className="flex justify-between items-center py-2">
                       <p className="text-sm">Answered question from 'user@example.com'.</p>
                       <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                 </CardContent>
               </Card>
             </div>
          </TabsContent>

          <TabsContent value="users">
            {error && <div className="text-center py-10 text-destructive">{error}</div>}
            {isLoadingUsers ? <UserTableSkeleton /> : !error && (
              <Card className="overflow-hidden border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Expiry Date</TableHead>
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
                                {user.expiryDate ? format(user.expiryDate.toDate(), 'PP') : user.subscription !== 'free' ? 'Not Set' : 'N/A'}
                             </TableCell>
                            <TableCell>{getValidationStatusBadge(user)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex gap-1 justify-end items-center">
                                  {user.subscription !== 'free' && (
                                     <Button
                                       variant="ghost"
                                       size="icon"
                                       className={cn("h-8 w-8", user.validated ? "text-green-600 hover:bg-green-100" : "text-yellow-600 hover:bg-yellow-100")}
                                       onClick={() => handleOpenValidationDialog(user)}
                                       aria-label={user.validated ? "Manage Validation / Expiry" : "Validate User"}
                                     >
                                        {user.validated ? <CalendarCheck className="h-4 w-4" /> : <CalendarPlus className="h-4 w-4" />}
                                     </Button>
                                  )}
                                  {/* Placeholder for Edit User */}
                                   <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="View/Edit User" disabled>
                                     <Edit className="h-4 w-4" />
                                   </Button>
                                  {/* Delete User Dialog */}
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
                                           Are you sure you want to delete user "{user.name}" ({user.email})? This action cannot be undone. User data will be lost.
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
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          {users.length === 0 ? "No users found." : "No users found matching your search criteria."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teacherQuestions">
             {error && <div className="text-center py-10 text-destructive">{error}</div>}
            {isLoadingTeacherQuestions ? <TeacherQuestionsSkeleton /> : !error && (
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
                                disabled={isSubmittingAnswer}
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
            )}
          </TabsContent>
        </Tabs>

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

         {/* Validation Dialog */}
         <Dialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
             <DialogContent className="sm:max-w-[450px]">
                 <DialogHeader>
                      <DialogTitle>Manage User Validation</DialogTitle>
                      <DialogDescription>
                          {userToValidate?.validated ? 'Invalidate' : 'Validate'} user "{userToValidate?.name}" ({userToValidate?.subscription} plan).
                          {userToValidate?.validated ? ' This will mark their subscription as inactive/expired.' : ' Set the subscription duration.'}
                      </DialogDescription>
                 </DialogHeader>
                  <div className="py-4 space-y-4">
                      {!userToValidate?.validated && (
                          <div className="space-y-2">
                               <label htmlFor="duration-weeks" className="text-sm font-medium">Set Duration (Weeks)</label>
                               <Input
                                   id="duration-weeks"
                                   type="number"
                                   min="1"
                                   value={validationDuration}
                                   onChange={(e) => setValidationDuration(parseInt(e.target.value) || 1)}
                                   disabled={isUpdatingValidation}
                               />
                                <p className="text-xs text-muted-foreground">
                                     Expiry Date will be set to: {format(addWeeks(new Date(), validationDuration), 'PPP')}
                                 </p>
                          </div>
                      )}
                       <p className="text-sm text-muted-foreground">
                           {userToValidate?.validated
                               ? 'Setting status to Pending/Expired will remove their access until re-validated.'
                               : 'Setting status to Validated will activate their subscription for the specified duration.'
                           }
                       </p>
                  </div>
                 <DialogFooter>
                     <DialogClose asChild>
                         <Button type="button" variant="outline" disabled={isUpdatingValidation}>
                             Cancel
                         </Button>
                     </DialogClose>
                     <Button
                        type="button"
                        onClick={handleConfirmValidation}
                        disabled={isUpdatingValidation || (!userToValidate?.validated && validationDuration < 1)}
                        className={userToValidate?.validated ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
                    >
                        {isUpdatingValidation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         {userToValidate?.validated ? 'Set to Pending/Expired' : 'Validate & Set Expiry'}
                     </Button>
                 </DialogFooter>
             </DialogContent>
         </Dialog>


      </main>
    </div>
  );
}


// Skeletons remain the same as in mcqs/page.tsx
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
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead> {/* Expiry Date */}
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead> {/* Status */}
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
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell> {/* Expiry Date */}
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell> {/* Status */}
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
