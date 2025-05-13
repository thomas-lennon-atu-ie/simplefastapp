import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  getAuth,
  deleteUser,
  // @ts-expect-error - signInWithPopup is web-only and might not be recognized in this environment
  signInWithPopup
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';

import { db, auth } from '../config/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);



if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: '32426588093-c2nq8erqrmou1gts2esmm3hgdde8hh11.apps.googleusercontent.com',
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogleWeb = async () => {
    try {
      
      if (Platform.OS !== 'web') {
        throw new Error('Attempted to use web sign-in on non-web platform');
      }
      
      const provider = new GoogleAuthProvider();
      const webAuth = getAuth();
      
      
      await signInWithPopup(webAuth, provider);
      
      console.log("Web Google Sign-In Popup initiated");
    } catch (error: unknown) { 
      if (typeof error === 'object' && error !== null && 'code' in error) {
         const codedError = error as { code: string | number; message?: string };
        if (codedError.code === 'auth/cancelled-popup-request' || codedError.code === 'auth/popup-blocked') {
          console.log('Web Google Sign In Popup Blocked/Cancelled');
        } else {
          console.error('Web Google Sign In Error:', codedError.code, codedError.message ?? error);
          throw error;
        }
      } else if (error instanceof Error) {
         console.error('Unexpected Web Google Sign In Error:', error.message);
         throw error;
      } else {
        console.error('Unexpected non-object error during Web Google Sign In:', error);
        throw error;
      }
    }
  };


  const signInWithGoogleNative = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userInfo = await GoogleSignin.signIn() as any;

      
      if (!userInfo?.idToken) {
        throw new Error("Native Google Sign-In failed: No ID token received.");
      }

      // Access idToken after the check (userInfo is 'any' here)
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
      await signInWithCredential(auth, googleCredential);

    } catch (error: unknown) { 
      
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const gError = error as { code: string | number }; 
        if (gError.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('Native Google Sign In Cancelled');
        } else if (gError.code === statusCodes.IN_PROGRESS) {
          console.log('Native Google Sign In In Progress');
        } else if (gError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('Native Google Play Services not available');
        } else {
          console.error('Native Google Sign In Error:', gError);
          throw gError; 
        }
      } else if (error instanceof Error) {
         console.error('Unexpected Native Google Sign In Error:', error.message);
         throw error;
      } else {
        
        console.error('Unexpected non-object error during Native Google Sign In:', error);
        throw error;
      }
    }
  };


  const signInWithGoogleWebCallback = useCallback(signInWithGoogleWeb, []);
  const signInWithGoogleNativeCallback = useCallback(signInWithGoogleNative, []);


  const signInWithGoogle = useCallback(async () => {
    if (Platform.OS === 'web') {
      await signInWithGoogleWebCallback();
    } else {
      await signInWithGoogleNativeCallback();
    }
  }, [signInWithGoogleWebCallback, signInWithGoogleNativeCallback]);

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    try {

      if (Platform.OS !== 'web') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isSignedIn = await (GoogleSignin as any).isSignedIn();
        if (isSignedIn) {
          await GoogleSignin.signOut();
        }
      }
      await signOut(auth);
    } catch (error: unknown) { // Use unknown for logout error
      if (error instanceof Error) {
         console.error("Logout error:", error.message);
      } else {
         console.error("Unexpected logout error:", error);
      }
     
    }
  };

  const deleteAccount = useCallback(async () => {
    if (!user) {
      throw new Error('No user is signed in');
    }

    try {
      const userId = user.uid;
      
      // 1. Delete all user data from Firestore
      // Delete active fast document
      await deleteDoc(doc(db, 'users', userId, 'activeFast', 'current'));
      
      // Delete fasting history
      const historyRef = collection(db, 'users', userId, 'fastHistory');
      const historyDocs = await getDocs(historyRef);
      for (const doc of historyDocs.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Delete settings
      const settingsRef = collection(db, 'users', userId, 'settings');
      const settingsDocs = await getDocs(settingsRef);
      for (const doc of settingsDocs.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
      
      // 2. Delete the Firebase Auth user
      await deleteUser(user);
      
      console.log('Account deleted successfully');
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      
      if (error instanceof Error) {
        console.error("Delete account error:", error.message);
      } else {
        console.error("Unexpected delete account error:", error);
      }
      
      throw error;
    }
  }, [user]); // Add user as a dependency

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signInWithGoogle,
    register,
    logout,
    deleteAccount
  }), [user, loading, signInWithGoogle, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};