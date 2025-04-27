# NyayaPrep - BALLB MCQ Preparation

This is a Next.js application designed for BALLB (Bachelor of Arts, Bachelor of Laws) preparation classes, providing an MCQ system with features like real-time translation, user/admin roles, and subscription management.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Firestore Database and Firebase Authentication (Email/Password).
    *   Go to Project Settings > Your apps > Web app.
    *   Register your web app and copy the `firebaseConfig` object.
    *   Create a `.env.local` file in the root of the project and add your Firebase configuration keys:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
        NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-... # Optional

        # For Genkit (if used)
        GOOGLE_GENAI_API_KEY=your_google_ai_api_key
        ```
    *   Replace the placeholder values with your actual Firebase credentials.

4.  **Create Firestore Indexes:**
    This application requires specific Firestore indexes to function correctly. Go to your Firebase project's Firestore Database section and create the following composite indexes:

    *   **Index 1 (for User Quiz Results):**
        *   Collection ID: `quizResults`
        *   Fields to index:
            *   `userId` (Ascending)
            *   `completedAt` (Descending)
        *   Query scope: Collection

    *   **Index 2 (for User Teacher Questions):**
        *   Collection ID: `teacherQuestions`
        *   Fields to index:
            *   `userId` (Ascending)
            *   `askedAt` (Descending)
        *   Query scope: Collection

    *   **Index 3 (for Pending Teacher Questions - Admin View):**
        *   Collection ID: `teacherQuestions`
        *   Fields to index:
            *   `status` (Ascending)
            *   `askedAt` (Ascending)
        *   Query scope: Collection

    *   **Index 4 (for Admin MCQ Management - Ordered by Date):**
        *   Collection ID: `mcqs`
        *   Fields to index:
            *   `createdAt` (Descending)
        *   Query scope: Collection
        *   *(Note: If you plan to filter MCQs by category and order by date simultaneously, you might need a composite index on `category` and `createdAt`.)*

    *Failure to create these indexes will result in runtime errors when fetching data.*

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  Open [http://localhost:9002](http://localhost:9002) (or your specified port) with your browser to see the result.

## Key Features

*   **MCQ Quiz System:** Practice questions one at a time with navigation. Fetches random questions from Firestore.
*   **User Authentication:** Register and Login using Firebase Auth.
*   **Role-Based Access:** Separate dashboards and permissions for regular users and administrators.
*   **Subscription Plans:** Free, Basic, and Premium tiers with varying features and limits.
*   **Manual Validation:** Admins manually validate paid user accounts via the admin panel.
*   **Admin Panel:** Manage MCQs (Add, Edit, View, Delete), view users, manage subscriptions, and answer user questions.
*   **User Dashboard:** View profile, subscription status, recent quiz results (Premium), access resources (Premium), and ask questions to teachers (Basic/Premium) with daily limits. View answers and notifications.
*   **Ask a Teacher:** Users can submit questions, and admins/teachers can answer them. Limits based on subscription. Notifications for answers.
*   **Responsive Design:** Adapts to different screen sizes.
*   **(Future) Real-time Translation:** Switch between English and Nepali (using a mock service currently).
*   **(Future) Profile Picture Upload:** Allow users to upload profile pictures (storage integration needed).

## Technologies Used

*   **Framework:** Next.js (App Router)
*   **UI:** React, TypeScript, Tailwind CSS, ShadCN UI
*   **Authentication & Database:** Firebase (Auth, Firestore)
*   **State Management:** React Hooks (useState, useEffect, useMemo), React Hook Form
*   **Styling:** Tailwind CSS, CSS Variables
*   **Icons:** Lucide React
*   **Linting/Formatting:** ESLint, Prettier (implied by Next.js setup)

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for details on deploying your application. You can use platforms like Vercel, Netlify, or Firebase Hosting. Remember to configure environment variables and Firestore indexes in your deployment environment.
