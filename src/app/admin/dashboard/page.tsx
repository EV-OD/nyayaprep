
'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Search, Loader2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@/types/quiz';
import type { UserProfile, SubscriptionPlan, TeacherQuestion } from '@/types/user';
import { AdminHeader } from '@/components/admin/admin-header';
import { cn } from '@/lib/utils';
import {
    setUserValidationStatus,
    getUserProfile,
    getPendingTeacherQuestions,
    answerTeacherQuestion,
    getAllMcqs,
    getAllUsers,
} from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { format, addWeeks } from 'date-fns';
import { auth } from '@/lib/firebase/config';

// Import new tab components
import { OverviewTab } from '@/components/admin/dashboard/OverviewTab';
import { UserTable, UserTableSkeleton } from '@/components/admin/dashboard/UserTable';
import { TeacherQuestionsTab, TeacherQuestionsSkeleton } from '@/components/admin/dashboard/TeacherQuestionsTab';
import { AnswerDialog } from '@/components/admin/dashboard/AnswerDialog';
import { ValidationDialog } from '@/components/admin/dashboard/ValidationDialog';

export default function AdminDashboardPage() {
  const [mcqs, setMcqs] = React.useState<Question[]>([]);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [teacherQuestions, setTeacherQuestions] = React.useState<TeacherQuestion[]>([]);
  const [isLoadingMCQs, setIsLoadingMCQs] = React.useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const [isLoadingTeacherQuestions, setIsLoadingTeacherQuestions] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'teacherQuestions'>('overview');
  const [currentAdminUid, setCurrentAdminUid] = React.useState<string | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = React.useState(false);
  const [selectedQuestionToAnswer, setSelectedQuestionToAnswer] = React.useState<TeacherQuestion | null>(null);
  const [answerText, setAnswerText] = React.useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = React.useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = React.useState(false);
  const [userToValidate, setUserToValidate] = React.useState<UserProfile | null>(null);
  const [validationDuration, setValidationDuration] = React.useState(1);
  const [isUpdatingValidation, setIsUpdatingValidation] = React.useState(false);

  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentAdminUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // Fetching Logic
  React.useEffect(() => {
    const fetchMcqCount = async () => {
      setIsLoadingMCQs(true);
      try {
        const fetchedMcqs = await getAllMcqs();
        setMcqs(fetchedMcqs);
      } catch (err) {
        console.error("Failed to fetch MCQs:", err);
        setError(prev => prev || "Failed to load MCQ count.");
        toast({ variant: "destructive", title: "Loading Error", description: "Could not load MCQ count." });
      } finally {
        setIsLoadingMCQs(false);
      }
    };

    const fetchUsersData = async () => {
      setIsLoadingUsers(true);
      try {
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setError(prev => prev || "Failed to load users.");
        toast({ variant: "destructive", title: "Loading Error", description: "Could not load users." });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const fetchTeacherQuestionsData = async () => {
      setIsLoadingTeacherQuestions(true);
      try {
        const fetchedQuestions = await getPendingTeacherQuestions();
        setTeacherQuestions(fetchedQuestions);
      } catch (err) {
        console.error("Failed to fetch teacher questions:", err);
        setError(prev => prev || "Failed to load pending questions.");
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

    setError(null); // Reset error before fetching

    if (activeTab === 'overview') {
        fetchMcqCount();
        fetchUsersData();
        fetchTeacherQuestionsData();
    } else if (activeTab === 'users') {
        fetchUsersData();
    } else if (activeTab === 'teacherQuestions') {
        fetchTeacherQuestionsData();
    }
  }, [activeTab, toast]);

  // Handlers for dialogs
  const handleOpenValidationDialog = (user: UserProfile) => {
    setUserToValidate(user);
    setValidationDuration(1);
    setValidationDialogOpen(true);
  };

  const handleOpenAnswerDialog = (question: TeacherQuestion) => {
    setSelectedQuestionToAnswer(question);
    setAnswerText('');
    setAnswerDialogOpen(true);
  };

  // Submit handlers
  const handleConfirmValidation = async () => {
    if (!userToValidate) return;
    setIsUpdatingValidation(true);
    const newStatus = !userToValidate.validated;
    let newExpiryDate: Timestamp | null = null;
    if (newStatus) newExpiryDate = Timestamp.fromDate(addWeeks(new Date(), validationDuration));
    try {
        await setUserValidationStatus(userToValidate.uid, newStatus, newExpiryDate);
        toast({
            title: "Validation Status Updated",
            description: `User ${userToValidate.name} set to ${newStatus ? 'Validated' : 'Pending/Expired'}.${newStatus && newExpiryDate ? ` Expires on ${format(newExpiryDate.toDate(), 'PPP')}.` : ''}`,
        });
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.uid === userToValidate.uid ? { ...user, validated: newStatus, expiryDate: newExpiryDate } : user
            )
        );
        setValidationDialogOpen(false);
    } catch (error) {
        console.error("Failed to update validation status:", error);
        toast({ variant: "destructive", title: "Update Failed", description: "Could not update user validation status." });
    } finally {
        setIsUpdatingValidation(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedQuestionToAnswer || !answerText.trim() || !currentAdminUid) {
        toast({ variant: "destructive", title: "Error", description: "Missing question, answer, or admin ID." });
        return;
    }
    setIsSubmittingAnswer(true);
    try {
        const userProfile = await getUserProfile(selectedQuestionToAnswer.userId);
        await answerTeacherQuestion(selectedQuestionToAnswer.id!, answerText, currentAdminUid, userProfile?.unreadNotifications);
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

  // Filtering and Grouping Logic
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
            {(activeTab === 'users' || activeTab === 'teacherQuestions') && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={activeTab === 'users' ? "Search name, email, phone, plan..." : "Search questions, user..."}
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
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
            <OverviewTab
                mcqs={mcqs}
                users={users}
                teacherQuestions={teacherQuestions}
                isLoadingMCQs={isLoadingMCQs}
                isLoadingUsers={isLoadingUsers}
                isLoadingTeacherQuestions={isLoadingTeacherQuestions}
             />
          </TabsContent>

          <TabsContent value="users">
            {error && <div className="text-center py-10 text-destructive">{error}</div>}
            {isLoadingUsers ? <UserTableSkeleton /> : !error && (
              <Card className="overflow-hidden border shadow-sm">
                <UserTable users={filteredUsers} onOpenValidationDialog={handleOpenValidationDialog} />
              </Card>
            )}
          </TabsContent>

          <TabsContent value="teacherQuestions">
            {error && <div className="text-center py-10 text-destructive">{error}</div>}
             <TeacherQuestionsTab
                groupedQuestions={groupedTeacherQuestions}
                onOpenAnswerDialog={handleOpenAnswerDialog}
                isLoading={isLoadingTeacherQuestions}
                isSubmittingAnswer={isSubmittingAnswer}
                searchTerm={searchTerm} // Pass necessary props
                users={users}          // Pass necessary props
             />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AnswerDialog
          isOpen={answerDialogOpen}
          onOpenChange={setAnswerDialogOpen}
          selectedQuestion={selectedQuestionToAnswer}
          answerText={answerText}
          setAnswerText={setAnswerText}
          onSubmit={handleAnswerSubmit}
          isSubmitting={isSubmittingAnswer}
        />

        <ValidationDialog
          isOpen={validationDialogOpen}
          onOpenChange={setValidationDialogOpen}
          userToValidate={userToValidate}
          validationDuration={validationDuration}
          setValidationDuration={setValidationDuration}
          onConfirm={handleConfirmValidation}
          isUpdating={isUpdatingValidation}
        />
      </main>
    </div>
  );
}
