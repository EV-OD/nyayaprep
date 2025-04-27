import type { Timestamp } from 'firebase/firestore';

export interface TranslatedText {
  en: string;
  ne: string;
}

export interface Question {
  id: string;
  category: string; // Consider making this an ID linking to a Category type later
  question: TranslatedText;
  options: {
    en: string[];
    ne: string[];
  };
  correctAnswer: TranslatedText;
  // Optional: Add explanation field if needed
  // explanation?: TranslatedText;
  createdAt?: Timestamp; // Added for Firestore
  updatedAt?: Timestamp; // Added for Firestore
  // Internal field for form mapping in edit page, not stored in Firestore
  _optionsForForm?: { en: string, ne: string }[];
  _correctAnswerEnForForm?: string;
}

export interface Answer {
  questionId: string;
  selectedAnswer: string; // Store the selected answer text (in the language it was selected)
  isCorrect: boolean;
  correctAnswerText?: string; // Optional: Store the text of the correct answer for review display
}

export type Language = 'en' | 'ne';
