
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
  questionText: string; // Store the question text (Preferably consistent language like EN)
  selectedAnswer: string; // Store the selected answer text (in the language it was selected)
  correctAnswerText: string; // Store the correct answer text (Preferably consistent language like EN)
  isCorrect: boolean;
}

export type Language = 'en' | 'ne';
