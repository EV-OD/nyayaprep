import type { Answer } from './quiz'; // Import if needed for detailed results
import type { Timestamp } from 'firebase/firestore'; // Import Timestamp

// Define possible subscription plans
export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin'; // Role definition
  createdAt: Timestamp; // Track when the user was created
  subscription?: SubscriptionPlan; // Optional: Track user's subscription plan
  profilePicture?: string | null; // Optional: URL to the profile picture in storage
}

export interface QuizResult {
  id?: string; // Firestore document ID (optional)
  userId: string; // UID of the user who took the quiz
  score: number;
  totalQuestions: number;
  percentage: number;
  // Consider storing category or quiz set ID if applicable
  // category?: string;
  answers: Answer[]; // Store the detailed answers given by the user
  completedAt: Timestamp; // Use Firestore Timestamp for dates
}
