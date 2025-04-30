
import { PublicNavbar } from '@/components/layout/public-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
             <Card className="w-full max-w-3xl">
                  <CardHeader>
                      <CardTitle className="text-center text-2xl text-primary">Terms & Conditions of Use – Nyayaprep</CardTitle>
                 </CardHeader>
                 <CardContent className="text-left text-muted-foreground space-y-4">
                      <p><strong>Effective Date:</strong> April 30, 2025</p>
                      <p><strong>Contact Email:</strong> nyayaprep@gmail.com</p>

                      <h3 className="font-semibold text-foreground pt-2">1. Acceptance of Terms</h3>
                      <p>By accessing or using the Nyayaprep platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of the website and services immediately.</p>

                      <h3 className="font-semibold text-foreground pt-2">2. Eligibility</h3>
                      <p>You must be at least 16 years of age, or the age of majority in your jurisdiction, to use Nyayaprep. By using our site, you represent and warrant that you meet these eligibility requirements.</p>

                      <h3 className="font-semibold text-foreground pt-2">3. User Accounts and Responsibilities</h3>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>You must provide accurate and complete registration information.</li>
                          <li>You are responsible for maintaining the confidentiality of your login credentials and any activity under your account.</li>
                          <li>You agree not to share your account with others or impersonate any individual or entity.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground pt-2">4. Use of Services</h3>
                      <p>Nyayaprep provides law-related multiple-choice questions (MCQs), notes, PDFs, and analytics tools for exam preparation (e.g., BALLB, LLB, and Advocate exams).</p>
                      <p>You agree not to:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Use the site for any illegal purpose;</li>
                          <li>Attempt to gain unauthorized access to any part of the platform;</li>
                          <li>Reproduce, distribute, or exploit any part of the website for commercial purposes without express permission.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground pt-2">5. Payments and Subscriptions</h3>
                       <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Some features may require payment. Payments are processed securely through third-party payment processors.</li>
                          <li>Nyayaprep does not store your financial information.</li>
                          <li>Subscription services (if offered) are subject to recurring billing as disclosed during sign-up.</li>
                      </ul>

                      <h3 className="font-semibold text-foreground pt-2">6. Intellectual Property</h3>
                      <p>All content on Nyayaprep, including text, graphics, logos, and original questions, is the intellectual property of Nyayaprep unless otherwise stated. Unauthorized copying, redistribution, or use is strictly prohibited.</p>

                      <h3 className="font-semibold text-foreground pt-2">7. User-Generated Content</h3>
                      <p>If you post or upload content (e.g., comments, contributions), you grant Nyayaprep a non-exclusive, royalty-free, worldwide license to use, reproduce, and display it in connection with our services. We reserve the right to remove any content that violates these terms or applicable laws.</p>

                      <h3 className="font-semibold text-foreground pt-2">8. Disclaimer of Warranties</h3>
                      <p><strong>Disclaimer:</strong> Nyayaprep provides educational content "as-is" and "as available" without warranties of any kind. While we strive for accuracy, we do not guarantee the correctness, completeness, or timeliness of any content. Nyayaprep is not responsible for exam outcomes, legal interpretations, or reliance on materials for professional or academic decisions.</p>
                      <p>We disclaim all warranties, express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>

                      <h3 className="font-semibold text-foreground pt-2">9. Limitation of Liability</h3>
                      <p>To the fullest extent permitted by law, Nyayaprep, its team, and affiliates shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or related to your use of or inability to use the service.</p>

                      <h3 className="font-semibold text-foreground pt-2">10. Privacy Policy</h3>
                      <p>Your use of Nyayaprep is also governed by our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which describes how we collect, use, and safeguard your information.</p>

                      <h3 className="font-semibold text-foreground pt-2">11. Changes to Terms</h3>
                      <p>We may update these Terms at any time without prior notice. Any changes will be posted on this page, and your continued use of the service constitutes acceptance of the updated terms.</p>

                      <h3 className="font-semibold text-foreground pt-2">12. Governing Law and Jurisdiction</h3>
                      <p>These Terms shall be governed by and interpreted in accordance with the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.</p>

                      <h3 className="font-semibold text-foreground pt-2">13. Termination</h3>
                      <p>We reserve the right to suspend or terminate your access to Nyayaprep at any time, with or without notice, for conduct that violates these Terms or applicable laws.</p>

                      <h3 className="font-semibold text-foreground pt-2">14. Contact Us</h3>
                      <p>For questions or concerns regarding these Terms, contact:</p>
                      <p>📧 Email: nyayaprep@gmail.com</p>
                      <p>🌐 Website: https://nyayaprep.vercel.app/</p>
                 </CardContent>
             </Card>
        </main>
         <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
              <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                   <p className="text-muted-foreground text-sm">
                      NyayaPrep &copy; {new Date().getFullYear()}. All rights reserved.
                   </p>
                   <div className="flex gap-4 text-sm text-muted-foreground">
                        <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</a>
                        <a href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</a>
                   </div>
              </div>
         </footer>
    </div>
  );
}
