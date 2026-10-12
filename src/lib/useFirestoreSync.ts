/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  db, 
  ensureAuthenticatedUser, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  User 
} from './firebase';

export interface SyncState {
  user: User | null;
  isLoading: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
}

export function useFirestoreSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    user: null,
    isLoading: true,
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  });

  // Track authentication
  useEffect(() => {
    let isMounted = true;

    // Ensure session exists (auto anonymous login)
    ensureAuthenticatedUser()
      .then((user) => {
        if (isMounted) {
          setSyncState((prev) => ({
            ...prev,
            user,
            isLoading: false,
            isConnected: true,
          }));
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Anonymous auth note:', err);
          setSyncState((prev) => ({
            ...prev,
            isLoading: false,
            isConnected: false,
            error: err.message,
          }));
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isMounted) {
        setSyncState((prev) => ({
          ...prev,
          user,
          isConnected: !!user,
          isLoading: false,
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Save or update a download record in Firestore
  const syncDownloadItem = useCallback(async (item: any) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const docRef = doc(db, 'users', user.uid, 'downloads', item.id);
      await setDoc(docRef, {
        id: item.id,
        name: item.name || 'Untitled Video',
        platform: item.platform || 'General',
        format: item.format || '1080p',
        size: item.size || 'Unknown',
        date: item.date || new Date().toLocaleDateString(),
        speed: item.speed || '0 KB/s',
        status: item.status || 'completed',
        url: item.url || '',
        createdAt: new Date().toISOString(),
        userId: user.uid,
      }, { merge: true });

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
      }));
    } catch (e: any) {
      console.warn('Firestore download sync error:', e);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Delete a download record from Firestore
  const removeDownloadItem = useCallback(async (itemId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const docRef = doc(db, 'users', user.uid, 'downloads', itemId);
      await deleteDoc(docRef);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
      }));
    } catch (e: any) {
      console.warn('Firestore remove error:', e);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Sync scheduled reminders to Firestore
  const syncReminder = useCallback(async (reminder: any) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const docRef = doc(db, 'users', user.uid, 'reminders', reminder.id);
      await setDoc(docRef, {
        id: reminder.id,
        title: reminder.title || 'Video Reminder',
        url: reminder.url || '',
        reminderTime: reminder.reminderTime || new Date().toISOString(),
        status: reminder.status || 'pending',
        createdAt: new Date().toISOString(),
        userId: user.uid,
      }, { merge: true });

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
      }));
    } catch (e: any) {
      console.warn('Firestore reminder sync error:', e);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Delete scheduled reminder from Firestore
  const removeReminder = useCallback(async (reminderId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const docRef = doc(db, 'users', user.uid, 'reminders', reminderId);
      await deleteDoc(docRef);
      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
      }));
    } catch (e: any) {
      console.warn('Firestore delete reminder error:', e);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Sync preferences to Firestore
  const syncPreferences = useCallback(async (prefs: {
    selectedServerId: string;
    fastDownloadMode: boolean;
    language: string;
    defaultFormat?: string;
    mergeSubtitles?: boolean;
  }) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setSyncState((prev) => ({ ...prev, isSyncing: true }));
      const docRef = doc(db, 'users', user.uid, 'preferences', 'general');
      await setDoc(docRef, {
        selectedServerId: prefs.selectedServerId,
        fastDownloadMode: !!prefs.fastDownloadMode,
        language: prefs.language,
        defaultFormat: prefs.defaultFormat || '1080p (HD)',
        mergeSubtitles: !!prefs.mergeSubtitles,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSyncState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: new Date(),
      }));
    } catch (e: any) {
      console.warn('Firestore preferences sync error:', e);
      setSyncState((prev) => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Fetch initial cloud items when user signs in
  const loadCloudData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const [downloadsSnap, remindersSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'downloads')),
        getDocs(collection(db, 'users', user.uid, 'reminders')),
      ]);

      const downloads = downloadsSnap.docs.map((d) => d.data());
      const reminders = remindersSnap.docs.map((d) => d.data());

      return { downloads, reminders };
    } catch (e) {
      console.warn('Load cloud data note:', e);
      return null;
    }
  }, []);

  // Sign in with Google
  const handleGoogleSignIn = useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.error('Google sign in error:', e);
      throw e;
    }
  }, []);

  // Sign out
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      // Re-initialize anonymous user
      await ensureAuthenticatedUser();
    } catch (e: any) {
      console.error('Sign out error:', e);
    }
  }, []);

  return {
    syncState,
    syncDownloadItem,
    removeDownloadItem,
    syncReminder,
    removeReminder,
    syncPreferences,
    loadCloudData,
    handleGoogleSignIn,
    handleSignOut,
  };
}
