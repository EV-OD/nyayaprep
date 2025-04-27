
import { parse } from 'papaparse';
import type { Question } from '@/types/quiz';

/**
 * Processes a CSV file and converts it into an array of MCQ objects.
 * The CSV file must have the following columns: category, questionEn, questionNe, optionEn1, optionNe1, optionEn2, optionNe2, optionEn3 (optional), optionNe3 (optional), optionEn4 (optional), optionNe4 (optional), correctAnswerEn
 * @param csvFile The CSV file to process.
 * @returns A promise that resolves to an array of MCQ objects.
 */
export const processCSVData = async (csvFile: File): Promise<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[]> => {
  return new Promise((resolve, reject) => {
    parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const mcqs: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>[] = (results.data as any[]).map((row) => {
          // Basic validation - check for required fields
          if (!row.category || !row.questionEn || !row.questionNe || !row.optionEn1 || !row.optionNe1 || !row.optionEn2 || !row.optionNe2 || !row.correctAnswerEn) {
            console.warn("Skipping row due to missing required fields:", row);
            return null; // Skip this row
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


          return {
            category: row.category,
            question: { en: row.questionEn, ne: row.questionNe },
            options: {
              en: optionsEn,
              ne: optionsNe,
            },
            correctAnswer: { en: row.correctAnswerEn, ne: '' }, // correctNepaliAnswer will be auto generated on add mcq page
          };
        }).filter(mcq => mcq !== null); // Filter out any null values from skipped rows

        resolve(mcqs);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};
