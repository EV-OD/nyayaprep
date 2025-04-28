
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, Users, HelpCircle, PlusCircle, Settings } from 'lucide-react';
import type { Question } from '@/types/quiz';
import type { UserProfile, TeacherQuestion } from '@/types/user';

interface OverviewTabProps {
  mcqs: Question[];
  users: UserProfile[];
  teacherQuestions: TeacherQuestion[];
  isLoadingMCQs: boolean;
  isLoadingUsers: boolean;
  isLoadingTeacherQuestions: boolean;
}

export function OverviewTab({
  mcqs,
  users,
  teacherQuestions,
  isLoadingMCQs,
  isLoadingUsers,
  isLoadingTeacherQuestions,
}: OverviewTabProps) {

  // Calculate pending question count directly here
  const pendingQuestionCount = teacherQuestions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-6">
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
    </div>
  );
}
