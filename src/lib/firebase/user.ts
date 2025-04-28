
import { db, auth } from './config';
import  {
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
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';


export type SubscriptionPlan = 'free' | 'basic' | 'premium';
export type UserProfile = {
    uid: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    role: 'user' | 'admin';
    subscription: SubscriptionPlan;
    profilePicture?: string | null;
    createdAt: Timestamp;
    validated: boolean;
    expiryDate: Timestamp | null; // Subscription expiry date
    askTeacherCount: number;
    lastAskTeacherDate: Timestamp;
    quizCountToday: number;
    lastQuizDate: Timestamp;
    unreadNotifications: number;
    lastNotificationCheck: Timestamp;
};
import type { Question, Answer } from '@/types/quiz'; // Import Question and Answer types
import type { User } from 'firebase/auth';
import { isToday } from 'date-fns'; // Import isToday

const usersCollection = collection(db, 'users');

/**
 * Creates or updates a user profile document in Firestore.
 * Initializes the 'validated' field based on the subscription plan.
 * Initializes 'askTeacherCount', 'lastAskTeacherDate', 'quizCountToday', and 'lastQuizDate'.
 * Initializes 'unreadNotifications' and 'lastNotificationCheck'.
 * Initializes 'expiryDate' to null.
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
    expiryDate: null, // Initialize expiryDate
    askTeacherCount: 0,
    lastAskTeacherDate: Timestamp.fromMillis(0), // Initialize with epoch
    quizCountToday: 0, // Initialize quiz count
    lastQuizDate: Timestamp.fromMillis(0), // Initialize last quiz date with epoch
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
          uid: data.uid || docSnap.id,
          email: data.email || '',
          name: data.name || 'Unknown User',
          phone: data.phone || '',
          role: data.role || 'user',
          subscription: data.subscription || 'free',
          profilePicture: data.profilePicture || null,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt : Timestamp.now(), // Handle potential missing createdAt
          validated: data.validated === true, // Ensure boolean check
          expiryDate: data.expiryDate instanceof Timestamp ? data.expiryDate : null, // Fetch expiryDate
          askTeacherCount: data.askTeacherCount || 0,
          lastAskTeacherDate: data.lastAskTeacherDate instanceof Timestamp ? data.lastAskTeacherDate : Timestamp.fromMillis(0), // Default if missing
          quizCountToday: data.quizCountToday || 0, // Fetch quiz count
          lastQuizDate: data.lastQuizDate instanceof Timestamp ? data.lastQuizDate : Timestamp.fromMillis(0), // Fetch last quiz date
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
 * Updates a user profile document in Firestore.
 * @param userId The user's unique ID.
 * @param data The data to update in the user profile.
 * @throws Error if the user ID is missing, or if the subscription is invalid.
 */

export type CreateUserParams = {
    name?: string | null;
    phone?: string | null;
    subscription?: SubscriptionPlan;
    profilePicture?: string | null;
};
export const updateUserProfileDocument = async (
    userId: string,
    data: Partial<UserProfile>
): Promise<void> => {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    // Validate subscription if it's being updated
    if (data.subscription && !['free', 'basic', 'premium'].includes(data.subscription)) {
        throw new Error(`Invalid subscription type: ${data.subscription}`);
    }

    const userRef = doc(usersCollection, userId);
    try {
        await updateDoc(userRef, data);
        console.log(`User profile updated successfully for UID: ${userId}`);
    } catch (error) {
        console.error("Error updating user profile document:", error);
        throw error;
    }
};




/**
 * Checks if a user's subscription has expired and updates their status if needed.
 * @param uid The user's unique ID.
 * @returns Promise<boolean> True if the subscription was found to be expired and handled, false otherwise.
 */
export const handleSubscriptionExpiry = async (uid: string): Promise<boolean> => {
    if (!uid) return false;
    const userProfile = await getUserProfile(uid);

    if (userProfile && userProfile.subscription !== 'free' && userProfile.expiryDate) {
        const now = new Date();
        const expiry = userProfile.expiryDate.toDate();

        if (now > expiry && userProfile.validated) {
             console.log(`Subscription for user ${uid} expired on ${expiry}. Updating status.`);
             try {
                 // Set validated to false and optionally downgrade plan
                 await setUserValidationStatus(uid, false, null); // Set expiryDate to null when invalidating due to expiry
                 // Optionally, set subscription to 'free'
                 // await updateDoc(doc(usersCollection, uid), { subscription: 'free' });
                 console.log(`User ${uid} status updated to non-validated due to expiry.`);
                 return true; // Indicate expiry was handled
             } catch (error) {
                 console.error(`Failed to handle expiry for user ${uid}:`, error);
                 return false; // Indicate error during handling
             }
        }
    }
    return false; // No expiry needed or already handled/invalid
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
        expiryDate: data.expiryDate instanceof Timestamp ? data.expiryDate : null, // Fetch expiryDate
        askTeacherCount: data.askTeacherCount || 0,
        lastAskTeacherDate: data.lastAskTeacherDate instanceof Timestamp ? data.lastAskTeacherDate : Timestamp.fromMillis(0),
        quizCountToday: data.quizCountToday || 0, // Fetch quiz count
        lastQuizDate: data.lastQuizDate instanceof Timestamp ? data.lastQuizDate : Timestamp.fromMillis(0), // Fetch last quiz date
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
 * Updates the validation status and optionally the expiry date for a user.
 * @param uid The user's unique ID.
 * @param isValidated The new validation status.
 * @param expiryDate The new expiry date (Timestamp or null). If null, it will be set to null.
 */
export const setUserValidationStatus = async (uid: string, isValidated: boolean, expiryDate: Timestamp | null): Promise<void> => {
    if (!uid) throw new Error("User UID is required.");
    const userRef = doc(usersCollection, uid);
    try {
        await updateDoc(userRef, {
            validated: isValidated,
            expiryDate: expiryDate, // Update expiry date
        });
        console.log(`User ${uid} validation status updated to ${isValidated}, expiry set to ${expiryDate ? expiryDate.toDate() : 'null'}`);
    } catch (error) {
        console.error(`Error updating validation status/expiry for user ${uid}:`, error);
        throw error;
    }
};

/**
 * Updates the 'Ask Teacher' usage count and date for a user.
 * Resets the count to 1 if the last ask date was not today.
 * @param uid The user's unique ID.
 * @param newCount The new count for the day (should be calculated before calling).
 */
export const updateAskTeacherUsage = async (uid: string, newCount: number): Promise<void> => {
     if (!uid) throw new Error("User UID is required.");
     const userRef = doc(usersCollection, uid);
     try {
         // Fetch the profile first to check the last date - Although the count is passed,
         // we ensure the date is updated correctly regardless of when the count was calculated.
         // For simplicity, we'll just update the count and timestamp directly here.
         // The calling function should calculate the newCount based on the isToday check.
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

/**
 * Updates the user's quiz count for the day. Resets count to 1 if last quiz was not today.
 * @param uid The user's unique ID.
 */
export const updateUserQuizUsage = async (uid: string): Promise<void> => {
    if (!uid) throw new Error("User UID is required.");
    const userRef = doc(usersCollection, uid);
    try {
        const userProfile = await getUserProfile(uid);
        if (!userProfile) {
             console.warn(`User profile not found for UID: ${uid}. Cannot update quiz usage.`);
             return; // User not found or error fetching profile
        }

        let newCount: number;
        // Check if the last quiz date exists and if it's today
        if (userProfile.lastQuizDate && isToday(userProfile.lastQuizDate.toDate())) {
            // If last quiz was today, increment the current count
            newCount = (userProfile.quizCountToday || 0) + 1;
             console.log(`Incrementing quiz count for user ${uid} for today.`);
        } else {
            // If last quiz was not today (or first quiz ever), reset count to 1
            newCount = 1;
            console.log(`Resetting quiz count for user ${uid} to 1 for the new day.`);
        }

        // Update Firestore with the calculated count and the current timestamp
        await updateDoc(userRef, {
            quizCountToday: newCount,
            lastQuizDate: serverTimestamp(), // Update to current time
        });
        console.log(`User ${uid} Quiz usage updated. Today's count: ${newCount}`);
    } catch (error) {
        console.error(`Error updating Quiz usage for user ${uid}:`, error);
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
