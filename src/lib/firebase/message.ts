// message.tsx

import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

// TypeScript type for a message
export interface Message {
  id?: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  message: string;
  createdAt?: Timestamp;
}

// Store a message in Firestore
export async function storeMessage(messageData: Omit<Message, "id" | "createdAt">): Promise<void> {
  try {
    const messageWithTimestamp = {
      ...messageData,
      createdAt: Timestamp.now(),
    };

    await addDoc(collection(db, "messages"), messageWithTimestamp);
    console.log("Message stored successfully.");
  } catch (error) {
    console.error("Error storing message:", error);
    throw error;
  }
}

// Fetch all messages from Firestore
export async function fetchMessages(): Promise<Message[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "messages"));
    const messages: Message[] = querySnapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
      }) as Message
    );

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}
