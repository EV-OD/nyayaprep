
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DisclaimerPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl text-primary">📢 Disclaimer for Nyayaprep</CardTitle>
                 </CardHeader>
                 <CardContent className="text-left text-muted-foreground space-y-4">
                      <p><strong>Effective Date:</strong> April 30, 2025</p>
                      <p>The information provided by Nyayaprep (“we,” “us,” or “our”) on https://nyayaprep.vercel.app/ is for general educational and informational purposes only.</p>

                      <h3 className="font-semibold text-foreground">1. No Legal Advice</h3>
                      <p>The content available on this website — including but not limited to MCQs, study notes, downloadable PDFs, and performance analytics — is intended solely for academic and exam preparation purposes. It does not constitute legal advice, legal opinion, or legal consultancy under any jurisdiction.</p>
                      <p>You should not rely on this content as a substitute for professional legal advice. If you require legal assistance, you are encouraged to consult a licensed attorney or legal professional.</p>

                      <h3 className="font-semibold text-foreground">2. Accuracy and Completeness</h3>
                      <p>While we strive to ensure that all information on Nyayaprep is accurate and up to date, we make no guarantees regarding:</p>
                      <ul className="list-disc list-inside ml-4">
                          <li>The accuracy,</li>
                          <li>The completeness, or</li>
                          <li>The reliability of any content on the platform.</li>
                      </ul>
                      <p>Examinations may change over time, and law is subject to amendments and judicial interpretations. You are responsible for verifying information through official or institutional sources.</p>

                      <h3 className="font-semibold text-foreground">3. No Guarantees of Success</h3>
                      <p>Nyayaprep does not guarantee:</p>
                       <ul className="list-disc list-inside ml-4">
                          <li>Admission into any academic program,</li>
                          <li>Qualification in any law examination (e.g., BALLB, LLB, Advocate licensing),</li>
                          <li>Employment outcomes.</li>
                       </ul>
                      <p>Use of this platform is at your own risk, and results may vary depending on individual effort and external factors.</p>

                      <h3 className="font-semibold text-foreground">4. Third-Party Links and Content</h3>
                      <p>Nyayaprep may contain links to third-party websites or external content for reference or convenience. We do not endorse or control the accuracy or practices of these third-party sites and disclaim any responsibility for them.</p>

                      <h3 className="font-semibold text-foreground">5. Limitation of Liability</h3>
                      <p>Under no circumstances shall Nyayaprep, its team, or affiliates be liable for any:</p>
                      <ul className="list-disc list-inside ml-4">
                         <li>Direct or indirect losses,</li>
                         <li>Incidental or consequential damages,</li>
                         <li>Personal injury or academic losses,</li>
                      </ul>
                      <p>arising from your use or misuse of the content provided on our platform.</p>

                      <h3 className="font-semibold text-foreground">6. Changes and Updates</h3>
                      <p>This Disclaimer may be updated or revised at any time without prior notice. Users are advised to review this page periodically for any changes.</p>

                      <h3 className="font-semibold text-foreground">7. Contact Us</h3>
                      <p>If you have any questions or concerns about this Disclaimer, please contact us at:</p>
                      <p>📧 Email: nyayaprep@gmail.com</p>
                      <p>🌐 Website: https://nyayaprep.vercel.app/</p>
                 </CardContent>
             </Card>
        </main>
         <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
             NyayaPrep &copy; {new Date().getFullYear()}
         </footer>
    </div>
  );
}
