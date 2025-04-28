
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl text-primary">Privacy Policy</CardTitle>
                 </CardHeader>
                 <CardContent className="text-left text-muted-foreground space-y-3">
                      <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
                      <p>We value your privacy. This policy explains how we collect, use, and protect your personal information when you use NyayaPrep.</p>
                      <p><strong>Information We Collect:</strong> We collect information you provide during registration (name, email, phone), usage data (quiz results, progress), and payment information (processed securely).</p>
                      <p><strong>How We Use Information:</strong> To provide and improve our services, personalize your experience, process payments, communicate with you, and ensure security.</p>
                      <p><strong>Data Security:</strong> We implement measures to protect your data, but no system is 100% secure.</p>
                       <p><strong>Your Rights:</strong> You may have rights to access, correct, or delete your personal data.</p>
                       <p><strong>Changes to Policy:</strong> We may update this policy; we will notify you of significant changes.</p>
                       <p>Contact us if you have questions about this policy.</p>
                 </CardContent>
             </Card>
        </main>
         <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
             NyayaPrep &copy; {new Date().getFullYear()}
         </footer>
    </div>
  );
}