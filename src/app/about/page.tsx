import { PublicNavbar } from '@/components/layout/public-navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react'; // Assuming lucide-react for icons

export default function AboutPage() {
  const features = [
    'Thousands of MCQs covering key subjects',
    'Supporting notes and legal references',
    'Latest laws and updates for Advocate License Exam',
    'Ask the Teacher feature for expert help',
    'Detailed performance analytics',
    'History and analysis of attempts',
  ];

  const whyChooseUs = [
    'Focused purely on legal MCQ preparation',
    'Regularly updated content',
    'Designed by experienced legal educators',
    'Smart tools for progress tracking',
    'Clean, distraction-free design',
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar />
      <main className="flex-1 p-6 bg-muted/30">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-3xl text-primary">
              About NyayaPrep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Introduction */}
            <section className="text-center text-muted-foreground">
              <p className="text-lg">
                Nepal’s Leading MCQ-Based Legal Exam Preparation Platform.
              </p>
              <p className="mt-2">
                We help aspiring advocates and law students prepare smarter,
                faster, and more effectively for legal exams using MCQs based
                on key Nepali legal codes.
              </p>
            </section>

            {/* Features & Why Choose Us Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">
                    Our Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-primary">
                    Why Choose Nyay Prep?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {whyChooseUs.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{reason}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-center font-medium text-primary">
                    Repeated practice + real-time feedback = guaranteed
                    improvement.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Meet the Team */}
            <section>
              <h2 className="text-2xl font-semibold text-primary text-center mb-4">
                Meet the Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div className="flex flex-col items-center p-4 border rounded-lg bg-card">
                  <Avatar className="w-20 h-20 mb-3">
                    {/* <AvatarImage src="/path/to/subhash.jpg" alt="Subhash Lamichhane" /> */}
                    <AvatarFallback>SL</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-foreground">
                    Subhash Lamichhane
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Owner &amp; Law Graduate
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground px-2">
                    Founder, empowering the next generation of legal
                    professionals in Nepal.
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-lg bg-card">
                  <Avatar className="w-20 h-20 mb-3">
                    {/* <AvatarImage src="/path/to/rabin.jpg" alt="Rabin Lamichhane" /> */}
                    <AvatarFallback>RL</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg text-foreground">
                    Rabin Lamichhane
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Owner &amp; Web Developer
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground px-2">
                    The creative force behind Nyay Prep’s user-friendly design
                    and platform.
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center text-muted-foreground mt-6">
              <h2 className="text-2xl font-semibold text-primary mb-2">
                Let’s Ace the Exam Together
              </h2>
              <p>
                Join thousands of students practicing smarter with Nyay Prep.
                Take control of your legal career with confidence.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
      <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
        NyayaPrep &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
