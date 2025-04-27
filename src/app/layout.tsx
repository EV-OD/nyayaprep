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
});

export const metadata: Metadata = {
  title: 'NyayaPrep - BALLB MCQ Preparation', // Updated title
  description: 'Your ultimate platform for BALLB multiple choice question preparation.', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${roboto_mono.variable}`}>
      {/* The body tag must immediately follow the html tag without any whitespace */}
      <body className={`font-sans antialiased`}>
        {/* Add ThemeProvider here if needed for dark/light mode toggle */}
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
