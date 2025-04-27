
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
import type { UserProfile, QuizResult, SubscriptionPlan } from '@/types/user';
import type { User } from 'firebase/auth';

const usersCollection = collection(db, 'users');
const quizResultsCollection = collection(db, 'quizResults');

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
      const profile: UserProfile = {
          uid: data.uid,
          email: data.email || '',
          name: data.name || 'Unknown User',
          phone: data.phone || '',
          role: data.role || 'user',
          subscription: data.subscription || 'free',
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(),
          validated: data.validated === true,
          // Include Ask Teacher fields, provide defaults if missing
          askTeacherCount: data.askTeacherCount || 0,
          lastAskTeacherDate: data.lastAskTeacherDate instanceof Timestamp ? data.lastAskTeacherDate : Timestamp.fromMillis(0),
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
        const result: QuizResult = {
          id: doc.id,
          ...data,
          completedAt: data.completedAt instanceof Timestamp ? data.completedAt : Timestamp.now()
        } as QuizResult;
       results.push(result);
    });
    return results;
  } catch (error) {
    const firebaseError = error as Error;
    console.error('Error getting user quiz results: ', firebaseError.message);
    if (firebaseError.message.includes('requires an index')) {
        console.warn(
          `Firestore Query Requires Index: The query to fetch user quiz results needs a composite index:\n` +
          `Collection: 'quizResults', Fields: 'userId' (Asc), 'completedAt' (Desc).\n`+
          `Please create this index in your Firebase console.`
        );
    }
     return [];
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
