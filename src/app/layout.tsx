import type { Metadata } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

// Configure Inter font for sans-serif
const inter = Inter({
  variable: '--font-sans', // Use standard variable name
  subsets: ['latin'],
  display: 'swap', // Improve font loading performance
});

// Configure Roboto Mono for monospace
const roboto_mono = Roboto_Mono({
  variable: '--font-mono', // Use standard variable name
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disable preload for Roboto Mono
});

export const metadata: Metadata = {
  title: 'NyayaPrep - BALLB MCQ Preparation',
  description: 'NyayaPrep - Nepal\'s Leading MCQ-Based Legal Exam Preparation Platform. Master law exams with practice MCQs, progress tracking, and expert guidance.',
  keywords: ['NyayaPrep', 'MCQ', 'Legal Exam', 'Nepal', 'Law Preparation', 'Advocate License'],
  authors: [{ name: 'NyayaPrep Team' }],
  metadataBase: new URL('https://nyayaprep.vercel.app'),
  openGraph: {
    title: 'NyayaPrep - Legal Exam Preparation',
    description: 'Master law exams with NyayaPrep\'s MCQ practice, progress tracking, and expert guidance.',
    url: 'https://nyayaprep.vercel.app',
    type: 'website',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'NyayaPrep Hero Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyayaPrep - Legal Exam Preparation',
    description: 'Master law exams with NyayaPrep\'s MCQ practice, progress tracking, and expert guidance.',
    images: ['/images/hero.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add variables to HTML tag
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${roboto_mono.variable}`}>
      {/* Use font-sans utility */}
      <body className={`font-sans antialiased`}>
        {/* Add ThemeProvider here if needed for dark/light mode toggle */}
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
