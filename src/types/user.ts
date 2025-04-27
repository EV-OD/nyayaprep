
import type { Answer } from './quiz'; // Import Answer for detailed results
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
  subscription: SubscriptionPlan; // Track user's subscription plan (now required)
  profilePicture?: string | null; // Optional: URL to the profile picture in storage (can be removed if not used)
  validated: boolean; // Flag to check if a paid subscription is manually validated
  // Optional: Add fields to track daily quiz usage if needed for Free/Basic plans
  // quizzesTakenToday?: number;
  // lastQuizTakenDate?: Timestamp;
}

export interface QuizResult {
  id?: string; // Firestore document ID (optional)
  userId: string; // UID of the user who took the quiz
  score: number;
  totalQuestions: number; // Should always be 10 based on new requirement
  percentage: number;
  // Consider storing category or quiz set ID if applicable
  // category?: string;
  answers: Answer[]; // Store the detailed answers given by the user (Premium feature)
  completedAt: Timestamp; // Use Firestore Timestamp for dates
}
