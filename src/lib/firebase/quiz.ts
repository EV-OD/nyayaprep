
import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  increment,
  deleteDoc,
  writeBatch,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import type { QuizResult } from '@/types/user';
import type { Question, Answer } from '@/types/quiz';

const quizResultsCollection = collection(db, 'quizResults');
const mcqsCollection = collection(db, 'mcqs');

/**
 * Saves a user's quiz result to Firestore.
 * Includes questionText and correctAnswerText in the answers array.
 * @param resultData The QuizResult data (excluding id).
 */
export const saveQuizResult = async (resultData: Omit<QuizResult, 'id' | 'completedAt'>): Promise<string> => {
   const dataToSave = {
      ...resultData,
      completedAt: serverTimestamp(),
   };

   try {
      const docRef = await addDoc(quizResultsCollection, dataToSave);
      console.log('Quiz result saved with ID: ', docRef.id);
      return docRef.id;
   } catch (error) {
      console.error('Error adding quiz result document: ', error);
      throw error;
   }
};


/**
 * Fetches the quiz results for a specific user.
 * Requires Firestore index: quizResults(userId Asc, completedAt Desc).
 * @param userId The UID of the user.
 * @param count The maximum number of results to fetch (optional, defaults to 100 if not provided).
 * @returns An array of QuizResult objects.
 */
export const getUserQuizResults = async (userId: string, count?: number): Promise<QuizResult[]> => {
  if (!userId) return [];
  const fetchLimit = count && count > 0 ? count : 100; // Default limit

  try {
    const q = query(
      quizResultsCollection,
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(fetchLimit)
    );

    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        // Basic validation for required fields
        if (data.userId && data.score !== undefined && data.totalQuestions !== undefined && data.percentage !== undefined && Array.isArray(data.answers) && data.completedAt instanceof Timestamp) {
             // Further validate the structure of each answer in the array
             const validAnswers = data.answers.every((ans: any) =>
                 typeof ans.questionId === 'string' &&
                 typeof ans.questionText === 'string' && // Check for new fields
                 typeof ans.selectedAnswer === 'string' &&
                 typeof ans.correctAnswerText === 'string' && // Check for new fields
                 typeof ans.isCorrect === 'boolean'
             );

             if (validAnswers) {
                const result: QuizResult = {
                    id: doc.id,
                    userId: data.userId,
                    score: data.score,
                    totalQuestions: data.totalQuestions,
                    percentage: data.percentage,
                    answers: data.answers as Answer[], // Cast as the updated Answer type
                    completedAt: data.completedAt,
                    // category: data.category || undefined, // Include if category exists
                };
                results.push(result);
            } else {
                console.warn(`Skipping quiz result document ${doc.id} due to invalid answers structure.`);
            }
        } else {
            console.warn(`Skipping invalid quiz result document: ${doc.id}`);
        }
    });
    return results;
  } catch (error) {
    const firebaseError = error as Error;
    console.error('Error getting user quiz results: ', firebaseError.message);
    // Check for specific index error
    if (firebaseError.message.includes('requires an index')) {
        const isBuilding = firebaseError.message.includes('currently building');
        const indexCreationMessage =
          `Firestore Query Requires Index: The query to fetch user quiz results needs a composite index:\n` +
          `Collection: 'quizResults', Fields: 'userId' (Asc), 'completedAt' (Desc).\n`+
          `Please create this index in your Firebase console. ${isBuilding ? 'The index is currently building, please wait a few minutes and try again.' : 'Ensure the index is fully built before retrying.'}`;
        console.warn(indexCreationMessage);
        // Propagate a more informative error, potentially customizing based on whether it's building
        const userFriendlyMessage = isBuilding
            ? "The database index needed to fetch quiz results is currently being built. Please try again in a few minutes."
            : "A required database index (quizResults: userId Asc, completedAt Desc) is missing. Please contact support or create it in the Firebase console.";
        throw new Error(userFriendlyMessage);
    }
    throw error; // Re-throw other errors
  }
};


// --- MCQ CRUD Operations ---

/**
 * Adds a new MCQ question to the 'mcqs' collection.
 * @param questionData The question data (without id).
 * @returns The ID of the newly created MCQ document.
 */
export const addMcq = async (questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const dataToSave = {
    ...questionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  try {
    const docRef = await addDoc(mcqsCollection, dataToSave);
    console.log('MCQ added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding MCQ document: ', error);
    throw error;
  }
};

/**
 * Fetches all MCQ questions from the 'mcqs' collection.
 * Optionally orders by creation date.
 * Requires Firestore index: mcqs(createdAt Desc) if orderByDate is true.
 * @param orderByDate Fetch ordered by createdAt descending?
 * @returns An array of Question objects.
 */
export const getAllMcqs = async (orderByDate = false): Promise<Question[]> => {
  try {
    let q = query(mcqsCollection);
    if (orderByDate) {
      // Add ordering and check for index errors specifically for this query
      q = query(q, orderBy('createdAt', 'desc'));
    }

    const querySnapshot = await getDocs(q);
    const mcqs: Question[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Basic validation (add more as needed)
      if (data.category && data.question && data.options && data.correctAnswer) {
        mcqs.push({
          id: doc.id,
          category: data.category,
          question: data.question,
          options: data.options,
          correctAnswer: data.correctAnswer,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
        });
      } else {
        console.warn(`Skipping invalid MCQ document: ${doc.id}`);
      }
    });
    return mcqs;
  } catch (error) {
    const firebaseError = error as Error;
    console.error('Error getting all MCQs: ', firebaseError.message);
     if (orderByDate && firebaseError.message.includes('requires an index')) {
        const isBuilding = firebaseError.message.includes('currently building');
        const indexCreationMessage =
          `Firestore Query Requires Index: The query to fetch MCQs ordered by date needs an index:\n` +
          `Collection: 'mcqs', Field: 'createdAt' (Descending).\n`+
          `Please create this index in your Firebase console. ${isBuilding ? 'The index is currently building, please wait a few minutes and try again.' : 'Ensure the index is fully built before retrying.'}`;
        console.warn(indexCreationMessage);
        const userFriendlyMessage = isBuilding
            ? "The database index needed to sort MCQs is currently being built. Please try again in a few minutes."
            : "A required database index (mcqs: createdAt Desc) is missing. Please contact support or create it in the Firebase console.";
        throw new Error(userFriendlyMessage);
     }
    throw error; // Re-throw other errors
  }
};

/**
 * Fetches a specific MCQ question by its ID.
 * @param id The document ID of the MCQ.
 * @returns The Question object or null if not found.
 */
export const getMcqById = async (id: string): Promise<Question | null> => {
  if (!id) return null;
  const mcqRef = doc(mcqsCollection, id);
  try {
    const docSnap = await getDoc(mcqRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
       // Basic validation (add more as needed)
       if (data.category && data.question && data.options && data.correctAnswer) {
          return {
            id: docSnap.id,
            category: data.category,
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
          };
        } else {
            console.warn(`Invalid data structure for MCQ document: ${id}`);
            return null;
        }
    } else {
      console.log('No such MCQ document!');
      return null;
    }
  } catch (error) {
    console.error(`Error getting MCQ document ${id}:`, error);
    throw error;
  }
};

/**
 * Updates an existing MCQ question.
 * @param id The document ID of the MCQ to update.
 * @param updatedData The partial data to update.
 */
export const updateMcq = async (id: string, updatedData: Partial<Omit<Question, 'id' | 'createdAt'>>): Promise<void> => {
  if (!id) throw new Error("MCQ ID is required for update.");
  const mcqRef = doc(mcqsCollection, id);
  const dataToUpdate = {
      ...updatedData,
      updatedAt: serverTimestamp(), // Always update the updatedAt timestamp
  };
  try {
    await updateDoc(mcqRef, dataToUpdate);
    console.log(`MCQ ${id} updated successfully.`);
  } catch (error) {
    console.error(`Error updating MCQ ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes an MCQ question by its ID.
 * @param id The document ID of the MCQ to delete.
 */
export const deleteMcq = async (id: string): Promise<void> => {
  if (!id) throw new Error("MCQ ID is required for deletion.");
  const mcqRef = doc(mcqsCollection, id);
  try {
    await deleteDoc(mcqRef);
    console.log(`MCQ ${id} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting MCQ ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes multiple MCQ questions by their IDs using a batch write.
 * @param ids An array of document IDs to delete.
 */
export const deleteMultipleMcqs = async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) {
        console.log("No MCQ IDs provided for deletion.");
        return;
    }
    const batch = writeBatch(db);
    ids.forEach((id) => {
        const mcqRef = doc(mcqsCollection, id);
        batch.delete(mcqRef);
    });

    try {
        await batch.commit();
        console.log(`Successfully deleted ${ids.length} MCQs.`);
    } catch (error) {
        console.error(`Error deleting multiple MCQs:`, error);
        throw error;
    }
};

/**
 * Fetches a specified number of random MCQ questions.
 * NOTE: Firestore does not natively support random sampling efficiently at scale.
 * This implementation fetches ALL documents and samples locally.
 * For large datasets, consider alternative strategies (e.g., using random IDs, Cloud Functions).
 *
 * @param count The number of random questions to fetch.
 * @returns An array of random Question objects.
 */
export const getRandomMcqs = async (count: number): Promise<Question[]> => {
  if (count <= 0) return [];
  try {
    // Fetch all MCQs (potentially inefficient for very large collections)
    const allMcqsSnapshot = await getDocs(mcqsCollection);
    const allMcqs: Question[] = [];
     allMcqsSnapshot.forEach((doc) => {
       const data = doc.data();
       // Basic validation
       if (data.category && data.question && data.options && data.correctAnswer) {
          allMcqs.push({
            id: doc.id,
            category: data.category,
            question: data.question,
            options: data.options,
            correctAnswer: data.correctAnswer,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
          });
        } else {
          console.warn(`Skipping invalid MCQ document during random fetch: ${doc.id}`);
        }
    });

    if (allMcqs.length === 0) {
        console.warn("No MCQs found in the database to sample from.");
        return [];
    }

    if (allMcqs.length <= count) {
      // If requested count is >= total MCQs, return all shuffled
      return shuffleArray(allMcqs);
    }

    // Shuffle the fetched MCQs and take the required count
    const shuffledMcqs = shuffleArray(allMcqs);
    return shuffledMcqs.slice(0, count);

  } catch (error) {
    console.error('Error getting random MCQs:', error);
    throw error;
  }
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
};


// --- Performance Statistics Calculation ---

export interface UserPerformanceStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number; // Percentage
  averageScore: number; // Percentage
  // categoryStats: { [category: string]: { total: number; correct: number; accuracy: number } };
  // scoreOverTime: { date: string; percentage: number }[]; // For chart
}

/**
 * Calculates performance statistics based on user's quiz results.
 * Fetches all results for the user to perform calculation.
 * @param userId The UID of the user.
 * @returns Promise<UserPerformanceStats | null> Performance stats or null if no results found.
 */
export const calculateUserPerformanceStats = async (userId: string): Promise<UserPerformanceStats | null> => {
  if (!userId) return null;

  try {
    // Fetch ALL quiz results for the user to calculate stats
    // Warning: This can be inefficient for users with a very large number of results.
    // Consider pagination or server-side aggregation for larger scales.
    const allResults = await getUserQuizResults(userId); // No limit specified to fetch all

    if (allResults.length === 0) {
      return null; // No results to calculate stats from
    }

    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    let totalPercentageSum = 0;

    allResults.forEach(result => {
      totalQuestionsAnswered += result.totalQuestions;
      totalCorrectAnswers += result.score;
      totalPercentageSum += result.percentage;
    });

    const totalQuizzes = allResults.length;
    const accuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;
    const averageScore = totalQuizzes > 0 ? Math.round(totalPercentageSum / totalQuizzes) : 0;


    return {
      totalQuizzes,
      totalQuestions: totalQuestionsAnswered,
      correctAnswers: totalCorrectAnswers,
      accuracy,
      averageScore,
    };

  } catch (error) {
    console.error(`Error calculating performance stats for user ${userId}:`, error);
    throw error; // Re-throw the error
  }
};
