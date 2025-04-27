
import { db, auth } from './config';
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
} from 'firebase/firestore';
import type { UserProfile, QuizResult, SubscriptionPlan, TeacherQuestion } from '@/types/user'; // Import TeacherQuestion
import type { User } from 'firebase/auth';

const usersCollection = collection(db, 'users');
const quizResultsCollection = collection(db, 'quizResults');
const teacherQuestionsCollection = collection(db, 'teacherQuestions'); // Collection for teacher questions

/**
 * Creates or updates a user profile document in Firestore.
 * Initializes the 'validated' field based on the subscription plan.
 * Initializes 'askTeacherCount' and 'lastAskTeacherDate'.
 * @param user Firebase User object.
 * @param additionalData Additional data like name, phone, subscription, and profile picture URL.
 */
export const createUserProfileDocument = async (
  user: User,
  additionalData: {
      name: string;
      phone: string;
      subscription: SubscriptionPlan;
      profilePicture?: string | null;
  }
): Promise<void> => {
  if (!user) throw new Error("User object is required.");

  const userRef = doc(usersCollection, user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    name: additionalData.name,
    phone: additionalData.phone,
    role: 'user',
    subscription: additionalData.subscription,
    profilePicture: additionalData.profilePicture || null,
    createdAt: Timestamp.now(),
    validated: additionalData.subscription === 'free',
    // Initialize Ask Teacher fields
    askTeacherCount: 0,
    lastAskTeacherDate: Timestamp.fromMillis(0), // Initialize with epoch to ensure first check works
  };

  try {
    await setDoc(userRef, userProfile, { merge: true });
    console.log(`User profile created/updated successfully for UID: ${user.uid}. Validated: ${userProfile.validated}`);
  } catch (error) {
    console.error('Error creating/updating user profile document:', error);
    throw error;
  }
};


/**
 * Fetches a user profile document from Firestore.
 * @param uid The user's unique ID.
 * @returns The UserProfile object or null if not found.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) return null;
  const userRef = doc(usersCollection, uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Validate data structure before creating UserProfile object
      const profile: UserProfile = {
          uid: data.uid,
          email: data.email || '',
          name: data.name || 'Unknown User',
          phone: data.phone || '',
          role: data.role || 'user',
          subscription: data.subscription || 'free',
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(), // Handle potential missing createdAt
          validated: data.validated === true, // Ensure boolean check
          askTeacherCount: data.askTeacherCount || 0,
          lastAskTeacherDate: data.lastAskTeacherDate instanceof Timestamp ? data.lastAskTeacherDate : Timestamp.fromMillis(0), // Default if missing
      };
      return profile;
    } else {
      console.log('No such user profile document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile document:', error);
    throw error;
  }
};

/**
 * Saves a user's quiz result to Firestore.
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
 * @param count The maximum number of results to fetch (optional).
 * @returns An array of QuizResult objects.
 */
export const getUserQuizResults = async (userId: string, count?: number): Promise<QuizResult[]> => {
  if (!userId) return [];

  try {
    let q = query(
      quizResultsCollection,
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );

    if (count && count > 0) {
       q = query(q, limit(count));
    }

    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic validation for required fields
        if (data.userId && data.score !== undefined && data.totalQuestions !== undefined && data.percentage !== undefined && data.answers && data.completedAt instanceof Timestamp) {
            const result: QuizResult = {
              id: doc.id,
              userId: data.userId,
              score: data.score,
              totalQuestions: data.totalQuestions,
              percentage: data.percentage,
              answers: data.answers,
              completedAt: data.completedAt,
            };
            results.push(result);
        } else {
            console.warn(`Skipping invalid quiz result document: ${doc.id}`);
        }
    });
    return results;
  } catch (error) {
    const firebaseError = error as Error;
    console.error('Error getting user quiz results: ', firebaseError.message);
    if (firebaseError.message.includes('requires an index')) {
        console.warn(
          `Firestore Query Requires Index: The query to fetch user quiz results needs a composite index:\n` +
          `Collection: 'quizResults', Fields: 'userId' (Asc), 'completedAt' (Desc).\n`+
          `Please create this index in your Firebase console. If you've created it, ensure it's enabled.`
        );
    }
     return []; // Return empty array on error
  }
};


/**
 * Checks if the current user is an admin. UI purposes only.
 * @returns Promise<boolean> True if admin, false otherwise.
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
        return false;
    }
    try {
        const profile = await getUserProfile(user.uid);
        return profile?.role === 'admin';
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};


/**
 * Updates the validation status for a user.
 * @param uid The user's unique ID.
 * @param isValidated The new validation status.
 */
export const setUserValidationStatus = async (uid: string, isValidated: boolean): Promise<void> => {
    if (!uid) throw new Error("User UID is required.");
    const userRef = doc(usersCollection, uid);
    try {
        await updateDoc(userRef, {
            validated: isValidated,
        });
        console.log(`User ${uid} validation status updated to ${isValidated}`);
    } catch (error) {
        console.error(`Error updating validation status for user ${uid}:`, error);
        throw error;
    }
};

/**
 * Updates the 'Ask Teacher' usage count and date for a user.
 * This should ideally be called after a question is successfully submitted.
 * @param uid The user's unique ID.
 * @param newCount The new count for the day.
 */
export const updateAskTeacherUsage = async (uid: string, newCount: number): Promise<void> => {
     if (!uid) throw new Error("User UID is required.");
     const userRef = doc(usersCollection, uid);
     try {
         await updateDoc(userRef, {
             askTeacherCount: newCount,
             lastAskTeacherDate: serverTimestamp(), // Update to current time on server
         });
         console.log(`User ${uid} Ask Teacher usage updated to ${newCount}`);
     } catch (error) {
         console.error(`Error updating Ask Teacher usage for user ${uid}:`, error);
         throw error;
     }
 };


// --- Functions for "Ask a Teacher" ---

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

    const questionData: Omit<TeacherQuestion, 'id'> = {
        userId: userId,
        userName: userName || 'Unknown User', // Store name if available
        userEmail: userEmail || 'No Email', // Store email if available
        questionText: questionText,
        askedAt: serverTimestamp() as Timestamp, // Use server timestamp
        status: 'pending',
        // Initialize optional fields
        answerText: null,
        answeredAt: null,
        answeredBy: null,
    };

    try {
        const docRef = await addDoc(teacherQuestionsCollection, questionData);
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
            orderBy('askedAt', 'desc')
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
        if (firebaseError.message.includes('requires an index')) {
           console.warn(
             `Firestore Query Requires Index: The query to fetch user teacher questions needs a composite index:\n` +
             `Collection: 'teacherQuestions', Fields: 'userId' (Asc), 'askedAt' (Desc).\n`+
             `Please create this index in your Firebase console.`
           );
        }
        return []; // Return empty on error
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
            console.warn(
              `Firestore Query Requires Index: The query to fetch pending teacher questions needs a composite index:\n` +
              `Collection: 'teacherQuestions', Fields: 'status' (Asc), 'askedAt' (Asc).\n`+
              `Please create this index in your Firebase console.`
            );
         }
         return []; // Return empty on error
    }
};

/**
 * Updates a teacher question with an answer. Used by admins/teachers.
 * @param questionId The ID of the question document to update.
 * @param answerText The answer text.
 * @param answeredBy UID or name of the admin/teacher answering.
 */
export const answerTeacherQuestion = async (questionId: string, answerText: string, answeredBy: string): Promise<void> => {
    if (!questionId || !answerText || !answeredBy) {
        throw new Error("Question ID, answer text, and answerer ID are required.");
    }
    const questionRef = doc(teacherQuestionsCollection, questionId);
    try {
        await updateDoc(questionRef, {
            answerText: answerText,
            status: 'answered',
            answeredAt: serverTimestamp(),
            answeredBy: answeredBy,
        });
        console.log(`Question ${questionId} answered successfully.`);
        // TODO: Implement notification logic here (e.g., trigger a Cloud Function)
    } catch (error) {
        console.error(`Error answering question ${questionId}:`, error);
        throw error;
    }
};
