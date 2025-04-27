
import Papa from 'papaparse'; // Correct import
import type { Question } from '@/types/quiz';

/**
 * Processes a CSV file and converts it into an array of MCQ objects.
 * The CSV file must have the following columns: category, questionEn, questionNe, optionEn1, optionNe1, optionEn2, optionNe2, optionEn3 (optional), optionNe3 (optional), optionEn4 (optional), optionNe4 (optional), correctAnswerEn
 * Assumes the correct Nepali answer corresponds to the index of the correct English answer.
 * @param csvFile The CSV file to process.
 * @returns A promise that resolves to an array of MCQ objects.
 */
export const processCSVData = async (csvFile: File): Promise<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mcqs: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[] = [];

        (results.data as any[]).forEach((row, rowIndex) => {
          // Basic validation - check for required fields
          if (!row.category || !row.questionEn || !row.questionNe || !row.optionEn1 || !row.optionNe1 || !row.optionEn2 || !row.optionNe2 || !row.correctAnswerEn) {
            console.warn(`Skipping row ${rowIndex + 1} due to missing required fields:`, row);
            return; // Skip this row
          }

          const optionsEn = [row.optionEn1, row.optionEn2];
          const optionsNe = [row.optionNe1, row.optionNe2];

          if (row.optionEn3 && row.optionNe3) {
             optionsEn.push(row.optionEn3);
             optionsNe.push(row.optionNe3);
          }
          if (row.optionEn4 && row.optionNe4) {
             optionsEn.push(row.optionEn4);
             optionsNe.push(row.optionNe4);
          }
          // Add more option pairs if needed (up to 6)
          if (row.optionEn5 && row.optionNe5) {
             optionsEn.push(row.optionEn5);
             optionsNe.push(row.optionNe5);
          }
           if (row.optionEn6 && row.optionNe6) {
             optionsEn.push(row.optionEn6);
             optionsNe.push(row.optionNe6);
           }

          // Find the index of the correct English answer
          const correctEnIndex = optionsEn.findIndex(opt => opt === row.correctAnswerEn);

          if (correctEnIndex === -1) {
             console.warn(`Skipping row ${rowIndex + 1} because correctAnswerEn "${row.correctAnswerEn}" was not found in English options:`, optionsEn);
             return; // Skip if correct answer isn't in options
          }

          // Get the corresponding Nepali answer using the same index
          const correctNeAnswer = optionsNe[correctEnIndex];

           if (!correctNeAnswer) {
                console.warn(`Skipping row ${rowIndex + 1} because corresponding Nepali answer was not found at index ${correctEnIndex} for correctAnswerEn "${row.correctAnswerEn}". Nepali options:`, optionsNe);
                return; // Skip if corresponding Nepali answer is missing
           }


          mcqs.push({
            category: row.category.trim(), // Trim whitespace
            question: { en: row.questionEn.trim(), ne: row.questionNe.trim() },
            options: {
              en: optionsEn.map(opt => opt.trim()), // Trim options
              ne: optionsNe.map(opt => opt.trim()),
            },
            correctAnswer: { en: row.correctAnswerEn.trim(), ne: correctNeAnswer.trim() },
          });
        });

        if (mcqs.length === 0 && (results.data as any[]).length > 0) {
            console.warn("No valid MCQs could be processed from the CSV. Check column names and data format.");
            reject(new Error("No valid MCQs found in the CSV file. Please check the file format and ensure required columns (category, questionEn, questionNe, optionEn1, optionNe1, optionEn2, optionNe2, correctAnswerEn) are present and correctly named."));
            return;
        }

        resolve(mcqs);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        reject(new Error(`Failed to parse CSV file: ${error.message}`));
      },
    });
  });
};
