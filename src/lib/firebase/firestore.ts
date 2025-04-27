
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
  increment,
  deleteDoc, // Import deleteDoc
  collectionGroup, // Needed for potential cross-collection queries if structure changes
  writeBatch, // For bulk operations like deleting selected MCQs
} from 'firebase/firestore';
import type { UserProfile, QuizResult, SubscriptionPlan, TeacherQuestion } from '@/types/user';
import type { Question } from '@/types/quiz'; // Import Question type
import type { User } from 'firebase/auth';

const usersCollection = collection(db, 'users');
const quizResultsCollection = collection(db, 'quizResults');
const teacherQuestionsCollection = collection(db, 'teacherQuestions');
const mcqsCollection = collection(db, 'mcqs'); // Collection for MCQs

/**
 * Creates or updates a user profile document in Firestore.
 * Initializes the 'validated' field based on the subscription plan.
 * Initializes 'askTeacherCount' and 'lastAskTeacherDate'.
 * Initializes 'unreadNotifications' and 'lastNotificationCheck'.
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
  const userProfile: Omit<UserProfile, 'createdAt'> = { // Omit createdAt as it's set by serverTimestamp
    uid: user.uid,
    email: user.email || '',
    name: additionalData.name,
    phone: additionalData.phone,
    role: 'user', // Default role
    subscription: additionalData.subscription,
    profilePicture: additionalData.profilePicture || null,
    validated: additionalData.subscription === 'free', // Free plans are auto-validated
    askTeacherCount: 0,
    lastAskTeacherDate: Timestamp.fromMillis(0), // Initialize with epoch
    unreadNotifications: 0,
    lastNotificationCheck: Timestamp.now(), // Initialize check time
  };

  try {
    // Use serverTimestamp() for createdAt during the set operation
    await setDoc(userRef, { ...userProfile, createdAt: serverTimestamp() }, { merge: true });
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
          unreadNotifications: data.unreadNotifications || 0, // Default to 0 if missing
          lastNotificationCheck: data.lastNotificationCheck instanceof Timestamp ? data.lastNotificationCheck : Timestamp.now(), // Default to now if missing
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
    // Return empty array on error to prevent breaking the UI if not throwing
    // return [];
    throw error; // Re-throw other errors
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
 * Fetches all user profiles from Firestore.
 * @returns An array of UserProfile objects.
 */
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    // Optional: Add ordering if needed, e.g., orderBy('createdAt', 'desc')
    const q = query(usersCollection, orderBy('createdAt', 'desc')); // Example: Order by creation date
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Perform validation similar to getUserProfile
      const profile: UserProfile = {
        uid: data.uid || doc.id, // Use doc.id as fallback if uid field is missing
        email: data.email || '',
        name: data.name || 'Unknown User',
        phone: data.phone || '',
        role: data.role || 'user',
        subscription: data.subscription || 'free',
        profilePicture: data.profilePicture || null,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
        validated: data.validated === true,
        askTeacherCount: data.askTeacherCount || 0,
        lastAskTeacherDate: data.lastAskTeacherDate instanceof Timestamp ? data.lastAskTeacherDate : Timestamp.fromMillis(0),
        unreadNotifications: data.unreadNotifications || 0,
        lastNotificationCheck: data.lastNotificationCheck instanceof Timestamp ? data.lastNotificationCheck : Timestamp.now(),
      };
      users.push(profile);
    });
    return users;
  } catch (error) {
    console.error('Error getting all user profiles:', error);
    throw error; // Re-throw the error for the caller to handle
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

    const questionData: Omit<TeacherQuestion, 'id' | 'askedAt'> = {
        userId: userId,
        userName: userName || 'Unknown User', // Store name if available
        userEmail: userEmail || 'No Email', // Store email if available
        questionText: questionText,
        // askedAt: serverTimestamp() as Timestamp, // Use server timestamp
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
         if (firebaseError.message.includes('requires an index')) {
           const isBuilding = firebaseError.message.includes('currently building');
           const indexCreationMessage =
             `Firestore Query Requires Index: The query to fetch user teacher questions needs a composite index:\n` +
             `Collection: 'teacherQuestions', Fields: 'userId' (Ascending), 'askedAt' (Descending).\n`+
             `Please create this index in your Firebase console. ${isBuilding ? 'The index is currently building, please wait a few minutes and try again.' : 'Ensure the index is fully built before retrying.'}`;
           console.warn(indexCreationMessage);
           // Throw or display a user-friendly message indicating the index issue
           const userFriendlyMessage = isBuilding
              ? "The database index needed to fetch your questions is currently being built. Please try again in a few minutes."
              : "A required database index (teacherQuestions: userId Asc, askedAt Desc) is missing. Please contact support or create it in the Firebase console.";
           throw new Error(userFriendlyMessage); // Propagate a more informative error
         }
        // Return empty array on error
        // return [];
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
         // Return empty on error
         // return [];
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

/**
 * Clears the unread notification count for a user and updates the last check time.
 * @param uid The user's unique ID.
 */
export const clearUserNotifications = async (uid: string): Promise<void> => {
    if (!uid) throw new Error("User UID is required.");
    const userRef = doc(usersCollection, uid);
    try {
        await updateDoc(userRef, {
            unreadNotifications: 0,
            lastNotificationCheck: serverTimestamp(), // Update the last time notifications were checked
        });
        console.log(`Notifications cleared for user ${uid}`);
    } catch (error) {
        console.error(`Error clearing notifications for user ${uid}:`, error);
        throw error;
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
    const allMcqs = await getAllMcqs(); // Fetch all MCQs
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
