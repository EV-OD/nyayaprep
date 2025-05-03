import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="NyayaPrep - Nepal's Leading MCQ-Based Legal Exam Preparation Platform. Master law exams with practice MCQs, progress tracking, and expert guidance." />
        <meta name="keywords" content="NyayaPrep, MCQ, Legal Exam, Nepal, Law Preparation, Advocate License" />
        <meta name="author" content="NyayaPrep Team" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="NyayaPrep - Legal Exam Preparation" />
        <meta property="og:description" content="Master law exams with NyayaPrep's MCQ practice, progress tracking, and expert guidance." />
        <meta property="og:image" content="/images/hero.png" />
        <meta property="og:url" content="https://nyayaprep.vercel.app/" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="NyayaPrep - Legal Exam Preparation" />
        <meta name="twitter:description" content="Master law exams with NyayaPrep's MCQ practice, progress tracking, and expert guidance." />
        <meta name="twitter:image" content="/images/hero.png" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}