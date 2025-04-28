
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
         <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                 <CardHeader>
                     <CardTitle className="text-center text-2xl text-primary">Contact Us</CardTitle>
                 </CardHeader>
                  <CardContent className="text-center text-muted-foreground">
                      <p>For inquiries, support, or feedback, please reach out to us:</p>
                      <p className="mt-4 font-medium">Email: support@nyayaprep.com</p>
                      <p className="mt-1 font-medium">Phone: +977 98XXXXXXXX</p>
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