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
}

export interface Answer {
  questionId: string;
  selectedAnswer: string; // Store the selected answer text (in the language it was selected)
  isCorrect: boolean;
}

export type Language = 'en' | 'ne';
