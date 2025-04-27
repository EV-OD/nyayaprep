// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Ensure Firestore is imported
// import { getStorage } from "firebase/storage"; // Uncomment if you need Storage
// import { getAnalytics } from "firebase/analytics"; // Analytics is optional

// Your web app's Firebase configuration using environment variables
// Use NEXT_PUBLIC_ prefix for client-side access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
   // Enable analytics only in specific environments if needed and available
   // if (typeof window !== "undefined" && process.env.NODE_ENV === 'production' && firebaseConfig.measurementId) {
   //   getAnalytics(app);
   // }
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
// const storage = getStorage(app); // Uncomment if you need Storage

export { app, auth, db /*, storage */ }; // Export db
