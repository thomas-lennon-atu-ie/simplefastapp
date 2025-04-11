import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup
} from 'firebase/auth';
// Wrap web-specific code in Platform checks
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Platform } from 'react-native';

import { auth } from '../config/firebase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("Web Google Sign-In Success:", result.user);
    } catch (error: unknown) { // error is unknown
      // Type guard: Check if it's an object with a 'code' property (Firebase pattern)
      if (typeof error === 'object' && error !== null && 'code' in error) {
         // Cast after check to access properties safely
         const codedError = error as { code: string | number; message?: string };

        if (codedError.code === 'auth/popup-closed-by-user') {
          console.log('Web Google Sign In Cancelled by User');
        } else if (codedError.code === 'auth/cancelled-popup-request' || codedError.code === 'auth/popup-blocked') {
          console.log('Web Google Sign In Popup Blocked/Cancelled');
        } else {
          // Log the specific coded error
          console.error('Web Google Sign In Error:', codedError.code, codedError.message ?? error);
          throw error; // Re-throw original error object
        }
      // Type guard 2: Handle standard Error objects
      } else if (error instanceof Error) {
         console.error('Unexpected Web Google Sign In Error:', error.message);
         throw error;
      // Type guard 3: Handle anything else
      } else {
        console.error('Unexpected non-object error during Web Google Sign In:', error);
        throw error;
      }
    }
  };


  const signInWithGoogleNative = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      // Use 'as any' due to inconsistent type definitions for idToken
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userInfo = await GoogleSignin.signIn() as any;

      // Use optional chaining for SonarLint and check truthiness
      if (!userInfo?.idToken) {
        throw new Error("Native Google Sign-In failed: No ID token received.");
      }

      // Access idToken after the check (userInfo is 'any' here)
      const googleCredential = GoogleAuthProvider.credential(userInfo.idToken);
      await signInWithCredential(auth, googleCredential);

    } catch (error: unknown) { // Use unknown instead of 'any'
      // Check if the error object has a 'code' property (Google Signin pattern)
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const gError = error as { code: string | number }; // Cast after check
        if (gError.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('Native Google Sign In Cancelled');
        } else if (gError.code === statusCodes.IN_PROGRESS) {
          console.log('Native Google Sign In In Progress');
        } else if (gError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.log('Native Google Play Services not available');
        } else {
          console.error('Native Google Sign In Error:', gError);
          throw gError; // Re-throw error
        }
      } else if (error instanceof Error) {
         console.error('Unexpected Native Google Sign In Error:', error.message);
         throw error;
      } else {
        // Handle unexpected error types
        console.error('Unexpected non-object error during Native Google Sign In:', error);
        throw error;
      }
    }
  };

  // Wrap in useCallback for stability
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
        // Keep 'as any' here as a workaround for library type issues
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
      // Decide whether to re-throw or just log
      // throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signInWithGoogle,
    register,
    logout
  }), [user, loading, signInWithGoogle]); // signInWithGoogle is stable due to useCallback

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};