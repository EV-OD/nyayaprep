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
} from 'firebase/firestore';
import type { UserProfile, QuizResult } from '@/types/user';
import type { User } from 'firebase/auth';

const usersCollection = collection(db, 'users');
const quizResultsCollection = collection(db, 'quizResults');

/**
 * Creates or updates a user profile document in Firestore.
 * @param user Firebase User object.
 * @param additionalData Additional data like name and phone number.
 */
export const createUserProfileDocument = async (
  user: User,
  additionalData: { name: string; phone: string }
): Promise<void> => {
  const userRef = doc(usersCollection, user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    name: additionalData.name,
    phone: additionalData.phone,
    role: 'user', // Default role for new registrations
    createdAt: Timestamp.now(), // Use Firestore Timestamp
  };

  try {
    await setDoc(userRef, userProfile, { merge: true }); // Use merge to avoid overwriting existing data if any
    console.log('User profile created/updated successfully for UID:', user.uid);
  } catch (error) {
    console.error('Error creating/updating user profile document:', error);
    throw error; // Re-throw the error to be handled by the caller
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
      return docSnap.data() as UserProfile;
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
export const saveQuizResult = async (resultData: Omit<QuizResult, 'id'>): Promise<string> => {
   // Ensure completedAt is a Firestore Timestamp
   const dataToSave: Omit<QuizResult, 'id'> & { completedAt: Timestamp } = {
      ...resultData,
      completedAt: serverTimestamp(), // Use server timestamp for consistency
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
      orderBy('completedAt', 'desc') // Order by most recent first
    );

    if (count && count > 0) {
       q = query(q, limit(count)); // Apply limit if provided
    }

    const querySnapshot = await getDocs(q);
    const results: QuizResult[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as QuizResult);
    });
    return results;
  } catch (error) {
    console.error('Error getting user quiz results: ', error);
    throw error;
  }
};

/**
 * Checks if the current user is an admin.
 * WARNING: Client-side checks are not secure for protecting resources.
 * Use Firestore Security Rules or Backend verification for true security.
 * This is a basic check for UI purposes only.
 * @returns Promise<boolean> True if the user has an 'admin' role in Firestore, false otherwise.
 */
export const isCurrentUserAdmin = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
        return false; // Not logged in
    }

    const profile = await getUserProfile(user.uid);
    return profile?.role === 'admin';
};
