

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
  updateDoc, // Import updateDoc for updating validation status
} from 'firebase/firestore';
import type { UserProfile, QuizResult, SubscriptionPlan } from '@/types/user';
import type { User } from 'firebase/auth';

const usersCollection = collection(db, 'users');
const quizResultsCollection = collection(db, 'quizResults');

/**
 * Creates or updates a user profile document in Firestore.
 * Initializes the 'validated' field based on the subscription plan.
 * @param user Firebase User object.
 * @param additionalData Additional data like name, phone, subscription, and profile picture URL.
 */
export const createUserProfileDocument = async (
  user: User,
  additionalData: {
      name: string;
      phone: string;
      subscription: SubscriptionPlan; // Now required
      profilePicture?: string | null; // Optional profile picture URL
  }
): Promise<void> => {
  if (!user) throw new Error("User object is required.");

  const userRef = doc(usersCollection, user.uid);
  const userProfile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    name: additionalData.name,
    phone: additionalData.phone,
    role: 'user', // Default role for new registrations
    subscription: additionalData.subscription, // Save subscription plan
    profilePicture: additionalData.profilePicture || null, // Save picture URL or null
    createdAt: Timestamp.now(), // Use Firestore Timestamp
    validated: additionalData.subscription === 'free', // Automatically validated if free, otherwise false
  };

  try {
    // Use setDoc with merge: true to create or update, preventing overwrite of existing fields unless specified
    await setDoc(userRef, userProfile, { merge: true });
    console.log(`User profile created/updated successfully for UID: ${user.uid}. Validated: ${userProfile.validated}`);
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
      const data = docSnap.data();
       // Add type assertion for safety, ensuring all expected fields exist or have defaults
      const profile: UserProfile = {
          uid: data.uid,
          email: data.email || '',
          name: data.name || 'Unknown User',
          phone: data.phone || '',
          role: data.role || 'user',
          subscription: data.subscription || 'free', // Default to 'free' if not set
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(), // Handle potential mismatch
          validated: data.validated === true, // Ensure boolean, default to false if missing/undefined
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
   // Use serverTimestamp() to let Firestore set the time upon saving
   const dataToSave = {
      ...resultData,
      completedAt: serverTimestamp(),
   };

   try {
      // Explicitly type the data being added if necessary, though Firestore often infers well
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
 *
 * IMPORTANT: This query requires a composite index in Firestore.
 * If you encounter an error mentioning "The query requires an index",
 * you need to create it in your Firebase console. The required index is typically:
 * Collection: quizResults
 * Fields:
 *   1. userId (Ascending)
 *   2. completedAt (Descending)
 *
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
        const data = doc.data();
        // Ensure completedAt is handled correctly as a Timestamp
        const result: QuizResult = {
          id: doc.id,
          ...data,
          // Add type assertion and potentially a default if needed, though serverTimestamp should ensure it's a Timestamp
          completedAt: data.completedAt instanceof Timestamp ? data.completedAt : Timestamp.now()
        } as QuizResult; // Use clearer type assertion
       results.push(result);
    });
    return results;
  } catch (error) {
    const firebaseError = error as Error; // Type assertion
    console.error('Error getting user quiz results: ', firebaseError.message); // Log the specific error message
    // Check for specific index error
    if (firebaseError.message.includes('requires an index')) {
        console.warn(
          `Firestore Query Requires Index: The query to fetch user quiz results needs a composite index that might be missing or still building.` +
          ` Please ensure it exists and is active in your Firebase console:\n` +
          `1. Go to Firestore Database -> Indexes.\n` +
          `2. Check/Create a composite index for 'quizResults' collection.\n` +
          `3. Fields: 'userId' (Ascending), 'completedAt' (Descending).\n` +
          `Dashboard functionality for recent results might be limited until this index is active.`
        );
         // Inform the user via console or a UI element if possible
         // Example: Display a message on the dashboard if this warning occurs
    }
    // Return empty array or re-throw, depending on how you want to handle errors upstream
     return []; // Return empty array to prevent crashing the UI
    // throw error; // Or re-throw the error
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

    try {
        const profile = await getUserProfile(user.uid);
        return profile?.role === 'admin';
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false; // Default to false on error
    }
};


// Function to manually update the validation status (e.g., by an admin)
// This function would typically be called from a secure admin interface or backend process.
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
