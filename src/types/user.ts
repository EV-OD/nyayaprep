
import type { Answer } from './quiz';
import type { Timestamp } from 'firebase/firestore';

export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: Timestamp;
  subscription: SubscriptionPlan;
  profilePicture?: string | null;
  validated: boolean;
  // Add fields for 'Ask Teacher' feature tracking
  askTeacherCount?: number; // Number of questions asked today
  lastAskTeacherDate?: Timestamp; // Date when the last question was asked
}

export interface QuizResult {
  id?: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Answer[];
  completedAt: Timestamp;
}
