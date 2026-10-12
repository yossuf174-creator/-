/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore using the configured database ID
const configuredDbId = (firebaseConfig as Record<string, any>).firestoreDatabaseId || 'ai-studio-6277c9c9-649f-402c-a9d7-c5ef3bfdb334';
export const db = configuredDbId 
  ? getFirestore(app, configuredDbId)
  : getFirestore(app);

// Test Firestore connection on boot (Mandatory Skill Requirement)
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

// Auto-run connection test
testConnection();

// Sign in helper: Ensure user has a valid authenticated session
export async function ensureAuthenticatedUser(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          resolve(cred.user);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

export { 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut,
  GoogleAuthProvider,
  doc,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot 
};
export type { User };
