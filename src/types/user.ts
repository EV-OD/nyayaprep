

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
  askTeacherCount?: number; // Number of questions asked today
  lastAskTeacherDate?: Timestamp; // Date when the last question was asked
  unreadNotifications?: number; // Count of unread notifications (e.g., answered questions)
  lastNotificationCheck?: Timestamp; // Timestamp when the user last checked/cleared notifications
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

// Interface for the 'Ask a Teacher' feature
export interface TeacherQuestion {
    id?: string; // Document ID from Firestore
    userId: string; // UID of the user who asked
    userName?: string; // Name of the user (for admin display)
    userEmail?: string; // Email of the user (for admin display)
    questionText: string;
    askedAt: Timestamp;
    status: 'pending' | 'answered' | 'rejected'; // Status of the question
    answerText?: string | null; // The answer provided by the teacher/admin
    answeredAt?: Timestamp | null; // When the question was answered
    answeredBy?: string | null; // UID or name of the admin/teacher who answered
    // fileUrl?: string | null; // Optional: URL for attached file (skipped for now)
    // answerFileUrl?: string | null; // Optional: URL for answer file (skipped for now)
}

```