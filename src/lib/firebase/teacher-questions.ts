
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
  collectionGroup,
} from 'firebase/firestore';
import type { TeacherQuestion } from '@/types/user';

const teacherQuestionsCollection = collection(db, 'teacherQuestions');
const usersCollection = collection(db, 'users'); // Needed to update user notifications

/**
 * Saves a question submitted by a user to the 'teacherQuestions' collection.
 * @param userId The UID of the user asking.
 * @param questionText The text of the question.
 * @param userName The name of the user (optional).
 * @param userEmail The email of the user (optional).
 * @returns The ID of the newly created question document.
 */
export const saveTeacherQuestion = async (
    userId: string,
    questionText: string,
    userName?: string,
    userEmail?: string
): Promise<string> => {
    if (!userId || !questionText) {
        throw new Error("User ID and question text are required.");
    }

    const questionData: Omit<TeacherQuestion, 'id' | 'askedAt'> = {
        userId: userId,
        userName: userName || 'Unknown User', // Store name if available
        userEmail: userEmail || 'No Email', // Store email if available
        questionText: questionText,
        status: 'pending',
        // Initialize optional fields
        answerText: null,
        answeredAt: null,
        answeredBy: null,
    };

    try {
        const docRef = await addDoc(teacherQuestionsCollection, { ...questionData, askedAt: serverTimestamp() });
        console.log('Teacher question saved with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding teacher question document: ', error);
        throw error;
    }
};

/**
 * Fetches all questions asked by a specific user, ordered by date.
 * Requires Firestore index: teacherQuestions(userId Asc, askedAt Desc).
 * @param userId The UID of the user.
 * @returns An array of TeacherQuestion objects.
 */
export const getUserTeacherQuestions = async (userId: string): Promise<TeacherQuestion[]> => {
    if (!userId) return [];

    try {
        const q = query(
            teacherQuestionsCollection,
            where('userId', '==', userId),
            orderBy('askedAt', 'desc') // Order by descending asked date
        );

        const querySnapshot = await getDocs(q);
        const questions: TeacherQuestion[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Basic validation
            if (data.userId && data.questionText && data.askedAt instanceof Timestamp && data.status) {
                questions.push({
                    id: doc.id,
                    ...data,
                    askedAt: data.askedAt, // Ensure it's a Timestamp
                    answeredAt: data.answeredAt instanceof Timestamp ? data.answeredAt : null, // Handle null/undefined
                } as TeacherQuestion);
            } else {
                console.warn(`Skipping invalid teacher question document: ${doc.id}`);
            }
        });
        return questions;
    } catch (error) {
         const firebaseError = error as Error;
         console.error('Error getting user teacher questions: ', firebaseError.message);
         // Check for specific index error
         if (firebaseError.message.includes('requires an index')) {
            const isBuilding = firebaseError.message.includes('currently building');
            const indexCreationMessage =
              `Firestore Query Requires Index: The query to fetch user teacher questions needs a composite index:\n` +
              `Collection: 'teacherQuestions', Fields: 'userId' (Ascending), 'askedAt' (Descending).\n`+
              `Please create this index in your Firebase console. ${isBuilding ? 'The index is currently building, please wait a few minutes and try again.' : 'Ensure the index is fully built before retrying.'}`;
            console.warn(indexCreationMessage);
            // Propagate a more informative error
            const userFriendlyMessage = isBuilding
                 ? "The database index needed to fetch your questions is currently being built. Please try again in a few minutes."
                 : "A required database index (teacherQuestions: userId Asc, askedAt Desc) is missing. Please contact support or create it in the Firebase console.";
            throw new Error(userFriendlyMessage); // Propagate a more informative error
         }
        throw error; // Re-throw other errors
    }
};

/**
 * Fetches all pending questions for the admin/teacher panel, ordered by date.
 * Requires Firestore index: teacherQuestions(status Asc, askedAt Asc).
 * @returns An array of TeacherQuestion objects with status 'pending'.
 */
export const getPendingTeacherQuestions = async (): Promise<TeacherQuestion[]> => {
    try {
        const q = query(
            teacherQuestionsCollection,
            where('status', '==', 'pending'),
            orderBy('askedAt', 'asc') // Oldest pending first
        );

        const querySnapshot = await getDocs(q);
        const questions: TeacherQuestion[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.userId && data.questionText && data.askedAt instanceof Timestamp && data.status) {
                 questions.push({
                    id: doc.id,
                    ...data,
                    askedAt: data.askedAt,
                    answeredAt: data.answeredAt instanceof Timestamp ? data.answeredAt : null,
                 } as TeacherQuestion);
            } else {
                 console.warn(`Skipping invalid pending teacher question document: ${doc.id}`);
            }
        });
        return questions;
    } catch (error) {
         const firebaseError = error as Error;
         console.error('Error getting pending teacher questions: ', firebaseError.message);
         if (firebaseError.message.includes('requires an index')) {
            const isBuilding = firebaseError.message.includes('currently building');
            const indexCreationMessage =
              `Firestore Query Requires Index: The query to fetch pending teacher questions needs a composite index:\n` +
              `Collection: 'teacherQuestions', Fields: 'status' (Ascending), 'askedAt' (Ascending).\n`+
              `Please create this index in your Firebase console. ${isBuilding ? 'The index is currently building, please wait a few minutes and try again.' : 'Ensure the index is fully built before retrying.'}`;
            console.warn(indexCreationMessage);
            // Throw or display a user-friendly message indicating the index issue
             const userFriendlyMessage = isBuilding
              ? "The database index needed to fetch pending questions is currently being built. Please try again in a few minutes."
              : "A required database index (teacherQuestions: status Asc, askedAt Asc) is missing. Please contact support or create it in the Firebase console.";
            throw new Error(userFriendlyMessage); // Propagate a more informative error
         }
         throw error; // Re-throw other errors
    }
};

/**
 * Updates a teacher question with an answer and increments the user's notification count.
 * @param questionId The ID of the question document to update.
 * @param answerText The answer text.
 * @param answeredBy UID or name of the admin/teacher answering.
 * @param currentUnreadCount The current unread notification count for the user (optional, for optimization).
 */
export const answerTeacherQuestion = async (
    questionId: string,
    answerText: string,
    answeredBy: string,
    currentUnreadCount?: number // Optional current count
): Promise<void> => {
    if (!questionId || !answerText || !answeredBy) {
        throw new Error("Question ID, answer text, and answerer ID are required.");
    }
    const questionRef = doc(teacherQuestionsCollection, questionId);

    try {
        // Get the question to find the user ID
        const questionSnap = await getDoc(questionRef);
        if (!questionSnap.exists()) {
            throw new Error(`Question with ID ${questionId} not found.`);
        }
        const questionData = questionSnap.data() as TeacherQuestion; // Assume type is correct
        const userId = questionData.userId;
        if (!userId) {
             throw new Error(`User ID not found on question document ${questionId}.`);
        }
        const userRef = doc(usersCollection, userId);

        // Update the question document
        await updateDoc(questionRef, {
            answerText: answerText,
            status: 'answered',
            answeredAt: serverTimestamp(),
            answeredBy: answeredBy,
        });

        // Update the user's notification count atomically
        await updateDoc(userRef, {
            unreadNotifications: increment(1) // Use Firestore increment
        });

        console.log(`Question ${questionId} answered successfully. Notification count incremented for user ${userId}.`);

    } catch (error) {
        console.error(`Error answering question ${questionId}:`, error);
        throw error;
    }
};
