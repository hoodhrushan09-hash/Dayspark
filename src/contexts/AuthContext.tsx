import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import { auth, testConnection } from '../lib/firebase';
import { UserProfile } from '../types';
import {
  initializeUserProfile,
  getUserProfile,
  updateUserProfile as persistUserProfile,
  deleteUserData,
} from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await initializeUserProfile({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
          setUserProfile(profile);
        } catch (err) {
          console.error('Error initializing user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      const profile = await initializeUserProfile({
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      });
      setUserProfile(profile);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await firebaseUpdateProfile(userCredential.user, { displayName });
    }
    // send verification email optionally
    try {
      await sendEmailVerification(userCredential.user);
    } catch {
      // ignore transient verification email error
    }
    const profile = await initializeUserProfile({
      uid: userCredential.user.uid,
      displayName,
      email,
      photoURL: null,
    });
    setUserProfile(profile);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    if (result.user) {
      const profile = await getUserProfile(result.user.uid);
      if (profile) {
        setUserProfile(profile);
      } else {
        const initialized = await initializeUserProfile({
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
        });
        setUserProfile(initialized);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    await persistUserProfile(currentUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));

    if (updates.displayName && auth.currentUser) {
      await firebaseUpdateProfile(auth.currentUser, { displayName: updates.displayName });
    }
  };

  const deleteAccount = async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    await deleteUserData(uid);
    await firebaseDeleteUser(currentUser);
    setCurrentUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthReady,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        resetPassword,
        resendVerificationEmail,
        updateProfileData,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
