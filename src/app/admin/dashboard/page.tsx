import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, ListChecks, Languages, Settings, LogOut } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header"; // Import AdminHeader

export default function AdminDashboardPage() {
  // This page is the central hub for administrators.
  // It will display summaries and provide navigation to manage MCQs, etc.

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader title="Admin Dashboard" />
      <main className="flex-1 p-6 md:p-10 bg-muted/30">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Summary Cards (Example) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">150</div> {/* Replace with dynamic data */}
              <p className="text-xs text-muted-foreground">+10 from last week</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div> {/* Replace with dynamic data */}
               <p className="text-xs text-muted-foreground">Constitutional, Criminal, etc.</p>
            </CardContent>
          </Card>
            <Card>
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Languages</CardTitle>
               <Languages className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">2</div>
               <p className="text-xs text-muted-foreground">English, Nepali</p>
             </CardContent>
           </Card>
          {/* Add more summary cards as needed */}


          {/* Action Links */}
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
             {/* Add links for Categories, Translations, Settings later */}
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
               <p className="text-muted-foreground">Activity log will be displayed here...</p>
                {/* Example Item */}
                <div className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <p className="text-sm">Added new question to 'Constitutional Law'</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                 <div className="flex justify-between items-center py-2">
                  <p className="text-sm">Edited question ID #12</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
             </CardContent>
           </Card>
         </div>
      </main>
    </div>
  );
}
