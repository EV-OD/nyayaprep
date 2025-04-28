
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                 <CardHeader>
                    <CardTitle className="text-center text-2xl text-primary">About NyayaPrep</CardTitle>
                 </CardHeader>
                 <CardContent className="text-center text-muted-foreground">
                    <p>NyayaPrep is dedicated to helping aspiring law students and professionals excel in their entrance and licensing exams.</p>
                    <p className="mt-4">(More details about the platform's mission, team, etc. would go here)</p>
                 </CardContent>
             </Card>
        </main>
         <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
             NyayaPrep &copy; {new Date().getFullYear()}
         </footer>
    </div>
  );
}
```