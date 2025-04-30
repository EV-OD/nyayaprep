
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl text-primary">Terms & Conditions</CardTitle>
                 </CardHeader>
                 <CardContent className="text-left text-muted-foreground space-y-3">
                      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                      <p>Welcome to NyayaPrep! These terms outline the rules for using our website and services. By accessing NyayaPrep, you agree to these terms.</p>
                      <p><strong>User Accounts:</strong> You are responsible for maintaining the confidentiality of your account and password.</p>
                      <p><strong>Subscriptions:</strong> Paid subscriptions (Basic, Premium) are billed weekly and require manual validation after payment. Features are subject to the selected plan.</p>
                      <p><strong>Content Usage:</strong> Content is for personal, non-commercial use only. Reproduction or redistribution is prohibited.</p>
                      <p><strong>Prohibited Conduct:</strong> You agree not to misuse the platform, interfere with its operation, or violate any laws.</p>
                      <p><strong>Disclaimer:</strong> Content is for educational purposes only and is not legal advice. We don't guarantee accuracy or success in exams.</p>
                      <p><strong>Limitation of Liability:</strong> We are not liable for any damages arising from your use of the platform.</p>
                      <p><strong>Changes to Terms:</strong> We may modify these terms at any time. Continued use constitutes acceptance of changes.</p>
                      <p><strong>Governing Law:</strong> These terms are governed by the laws of Nepal.</p>
                      <p>Contact us if you have questions about these terms.</p>
                 </CardContent>
             </Card>
        </main>
         <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
             NyayaPrep &copy; {new Date().getFullYear()}
         </footer>
    </div>
  );
}
