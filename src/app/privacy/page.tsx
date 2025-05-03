import { PublicNavbar } from "@/components/layout/public-navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-center text-3xl font-semibold text-primary">
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="py-6 px-6 md:px-8 text-foreground space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Effective Date:</strong>{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="space-y-4">
              <p>
              Welcome to NyayaPrep. We are committed to protecting your
              personal information and your right to privacy. If you have any
              questions or concerns about this privacy notice, or our
              practices with regards to your personal information, please
              contact us at{" "}
              <a
                href="mailto:nyayaprep@gmail.com"
                className="text-primary hover:underline"
              >
                nyayaprep@gmail.com
              </a>
              .
              </p>
              <p>
              This privacy notice describes how we might use your information
              if you visit our website at{" "}
              <a
                href="https://nyayaprep.vercel.app/"
                className="text-primary hover:underline"
              >
                https://nyayaprep.vercel.app/
              </a>{" "}
              or use our services. Reading this privacy notice will help you
              understand your privacy rights and choices.
              </p>

              <h3 className="text-lg font-semibold mt-6 mb-2">Summary</h3>
              <ul className="list-disc space-y-2 ml-5">
              <li>
                <strong className="font-medium">
                Information We Collect:
                </strong>{" "}
                We collect information you provide during registration (name,
                email, phone), usage data (quiz results, progress), and
                payment information (processed securely).
              </li>
              <li>
                <strong className="font-medium">
                How We Use Information:
                </strong>{" "}
                To provide and improve our services, personalize your
                experience, process payments, communicate with you, and ensure
                security.
              </li>
              <li>
                <strong className="font-medium">Data Security:</strong> We
                implement measures to protect your data, but no system is 100%
                secure.
              </li>
              <li>
                <strong className="font-medium">Your Rights:</strong> You may
                have rights to access, correct, or delete your personal data.
              </li>
              <li>
                <strong className="font-medium">Changes to Policy:</strong> We
                may update this policy; we will notify you of significant
                changes.
              </li>
              </ul>
              <p className="mt-4">
              Contact us if you have questions about this policy.
              </p>
            </div>

            <hr className="my-8 border-muted" />

            <h2 className="text-2xl font-bold text-primary mb-4 mt-8 text-center">
              PRIVACY POLICY
            </h2>
            <p className="mb-6">
              This Privacy Policy outlines NyayaPrep’s practices and procedures
              with respect to the collection, storage, and use of cookies;
              collection, storage, and use of Personally Identifiable
              Information (PII); and aims at informing users on how we manage
              the information we collect and receive.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">1. DEFINITIONS</h3>
            <p className="mb-2">
              <strong>Affiliates:</strong> Any company or entity controlled by
              or under common control with NyayaPrep.
            </p>
            <p className="mb-2">
              <strong>Cookies:</strong> Small data files stored on your device
              to track and personalize your experience.
            </p>
            <p className="mb-2">
              <strong>Device Identifiers:</strong> Unique strings used to
              distinguish your device.
            </p>
            <p className="mb-2">
              <strong>IP Address:</strong> An identifier assigned to your device
              when you access the internet.
            </p>
            <p className="mb-2">
              <strong>Personally Identifiable Information (PII):</strong>{" "}
              Information that identifies a person such as name, email, phone
              number, or payment details.
            </p>
            <p className="mb-2">
              <strong>Non-Personally Identifiable Information (NPII):</strong>{" "}
              Data that does not directly identify a person.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">2. GENERAL</h3>
            <p className="mb-2">
              <strong>2.1</strong> Nyayaprep (https://nyayaprep.vercel.app/) is
              an online legal education platform offering multiple-choice
              questions (MCQs), notes, and performance analytics for law
              aspirants.
            </p>
            <p className="mb-2">
              <strong>2.2</strong> This policy applies to all services,
              applications, and platforms that link to this Privacy Policy.
            </p>
            <p className="mb-2">
              <strong>2.3</strong> This policy explains what information we
              collect, how we use it, when we may contact you, and your choices.
            </p>
            <p className="mb-2">
              <strong>2.4</strong> This policy does not apply to third-party
              websites or services.
            </p>
            <p className="mb-2">
              <strong>2.5</strong> “We”, “Us” or “Our” refers to Nyayaprep and
              its team. “You” or “User” refers to any individual accessing our
              services.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">3. DEEMED ACCEPTANCE</h3>
            <p className="mb-2">
              <strong>3.1</strong> By accessing Nyayaprep, you agree to this
              Privacy Policy.
            </p>
            <p className="mb-2">
              <strong>3.2</strong> Updates to the policy may be made without
              notice. Continued use constitutes acceptance of updated terms.
            </p>
            <p className="mb-2">
              <strong>3.3</strong> If you do not agree to the terms, do not use
              the services.
            </p>
            <p className="mb-2">
              <strong>3.4</strong> By using this website, you consent to our
              data practices as described herein.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">4. WHAT INFORMATION WE COLLECT</h3>
            <p className="mb-2">
              <strong>4.1 Personal Information:</strong>
            </p>
            <ul className="list-disc ml-5 space-y-1 my-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>
              Information provided during account creation or user support
              </li>
            </ul>
            <p className="mb-2">
              <strong>4.2 Payment Information:</strong> Processed securely
              through third-party gateways; we do not store card details.
            </p>
            <p className="mb-2">
              <strong>4.3 Usage and Technical Data:</strong>
            </p>
            <ul className="list-disc ml-5 space-y-1 my-2">
              <li>Quiz attempts and scores</li>
              <li>Progress history and analytics</li>
              <li>IP address, browser type, device model, OS, referral URLs</li>
            </ul>
            <p className="mb-2">
              <strong>4.4 Cookies and Tracking:</strong> We use cookies and
              similar technologies to enhance user experience, retain login
              state, and track usage analytics.
            </p>
            <p className="mb-2">
              <strong>4.5 Children’s Data:</strong> We do not knowingly collect
              PII from users under 18 years of age. If discovered, such data
              will be deleted.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">5. HOW WE USE YOUR INFORMATION</h3>
            <p className="mb-2">
              <strong>5.1</strong> To deliver and personalize services (e.g.,
              quizzes, notes, performance analytics).
            </p>
            <p className="mb-2">
              <strong>5.2</strong> To process and confirm secure payments.
            </p>
            <p className="mb-2">
              <strong>5.3</strong> To track learning progress and provide
              performance history.
            </p>
            <p className="mb-2">
              <strong>5.4</strong> To communicate service updates and respond to
              inquiries.
            </p>
            <p className="mb-2">
              <strong>5.5</strong> To detect and prevent fraudulent or
              unauthorized activity.
            </p>
            <p className="mb-2">
              <strong>5.6</strong> To analyze trends for content and performance
              improvements.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">6. DISCLOSURE OF INFORMATION</h3>
            <p className="mb-2">We may disclose your data:</p>
            <ul className="list-disc ml-5 space-y-1 my-2">
              <li>
              To comply with legal obligations or respond to lawful requests
              </li>
              <li>To protect Nyayaprep’s rights, users, or the public</li>
              <li>
              During business transitions (e.g., mergers or acquisitions)
              </li>
              <li>
              To service providers under confidentiality obligations (e.g.,
              for analytics, customer support)
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-2">7. THIRD-PARTY CONTENT AND SERVICES</h3>
            <p className="mb-2">
              <strong>7.1</strong> Our platform may include links to third-party
              sites or embed external content.
            </p>
            <p className="mb-2">
              <strong>7.2</strong> We are not responsible for the privacy
              practices of third-party services. Users should consult their
              respective privacy policies.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">8. DATA SECURITY</h3>
            <p className="mb-2">
              <strong>8.1</strong> We use reasonable technical and
              organizational measures to protect your data.
            </p>
            <p className="mb-2">
              <strong>8.2</strong> While we strive for security, no system is
              completely immune to breaches.
            </p>
            <p className="mb-2">
              <strong>8.3</strong> Data may be processed by authorized
              third-party providers as required for service delivery.
            </p>
            <p className="mb-2">
              <strong>8.4</strong> We adjust our security protocols based on the
              sensitivity of the data processed.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">9. INTERNATIONAL DATA TRANSFER</h3>
            <p className="mb-2">
              <strong>9.1</strong> Our services are operated under Nepalese law.
            </p>
            <p className="mb-2">
              <strong>9.2</strong> If you access our platform from other
              jurisdictions (e.g., EU), you agree to the transfer and processing
              of data in accordance with applicable laws including GDPR where
              applicable.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">10. DATA DELETION</h3>
            <p className="mb-2">
              <strong>10.1</strong> Users can delete data by clearing cookies
              and session data on their browser.
            </p>
            <p className="mb-2">
              <strong>10.2</strong> For account deletion or personal data
              removal, email{" "}
              <a href="mailto:nyayaprep@gmail.com" className="text-primary hover:underline">nyayaprep@gmail.com</a> with
              the subject “Delete Account”. We will verify and process your
              request accordingly.
            </p>

            <h3>11. CONTACT US</h3>
            <p>
              If you have questions or concerns about this Privacy Policy or our
              data practices, please feel free to contact us:
            </p>
            <div className="mt-2 space-y-1">
              <p>
                <strong>Nyayaprep</strong>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:nyayaprep@gmail.com"
                  className="text-primary hover:underline"
                >
                  nyayaprep@gmail.com
                </a>
              </p>
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href="https://nyayaprep.vercel.app/"
                  className="text-primary hover:underline"
                >
                  https://nyayaprep.vercel.app/
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-4 text-center text-muted-foreground text-sm bg-background border-t">
        NyayaPrep &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
