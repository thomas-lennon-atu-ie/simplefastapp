import {
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  limit,
} from 'firebase/firestore';
import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

import { useAuth } from './AuthContext';
import { db } from '../config/firebase'; 


interface FastState {
  isActive: boolean;
  startTime: Timestamp | null;
  targetDuration: number | null;
}

interface CompletedFast {
  id?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  targetDuration: number | null;
}

type FastContextType = {
  fastState: FastState;
  fastHistory: CompletedFast[];
  lastFastDuration: number | null;
  startFast: (startTime?: number, duration?: number) => Promise<void>;
  endFast: () => Promise<void>;
  loading: boolean;
};

const DEFAULT_FAST_DURATION = 16 * 60 * 60 * 1000;
const USERS_COLLECTION = 'users';
const ACTIVE_FAST_DOC = 'activeFast';
const HISTORY_SUBCOLLECTION = 'fastHistory';

const FastContext = createContext<FastContextType | undefined>(undefined);


export const FastProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;

  const [fastState, setFastState] = useState<FastState>({ isActive: false, startTime: null, targetDuration: null });
  const [fastHistory, setFastHistory] = useState<CompletedFast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && !authLoading) {
      const userDocRef = doc(db, USERS_COLLECTION, userId);
      setDoc(userDocRef, { exists: true }, { merge: true })
        .then(() => console.log("User document initialized"))
        .catch(err => console.error("Error ensuring user document exists:", err));
    }
  }, [userId, authLoading]);

  useEffect(() => {
    if (authLoading || !userId) {
      if (!authLoading && !userId) {
         setFastState({ isActive: false, startTime: null, targetDuration: null });
         setFastHistory([]);
         setLoading(false);
      }
      return;
    }

    setLoading(true);

    const activeFastDocRef = doc(db, USERS_COLLECTION, userId, ACTIVE_FAST_DOC, 'current');

    const unsubscribeActiveFast = onSnapshot(activeFastDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as FastState;
        console.log("Firestore: Active fast data received:", data);
        setFastState(data);
      } else {
        console.log("Firestore: No active fast document found, setting inactive.");
        setFastState({ isActive: false, startTime: null, targetDuration: null });
      }
    }, (error) => {
      console.error("Firestore detailed error:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setLoading(false);
    });

    const historyCollectionRef = collection(db, USERS_COLLECTION, userId, HISTORY_SUBCOLLECTION);
    const historyQuery = query(historyCollectionRef, orderBy('endTime', 'desc'), limit(50));

    const unsubscribeHistory = onSnapshot(historyQuery, (querySnapshot) => {
      const history: CompletedFast[] = [];
      querySnapshot.forEach((docSnap) => {
        history.push({ id: docSnap.id, ...docSnap.data() } as CompletedFast);
      });
     
      setFastHistory(history.toReversed());
      setLoading(false);
    }, () => {
    
      setLoading(false);
    });

    return () => {
      
      unsubscribeActiveFast();
      unsubscribeHistory();
    };

  }, [userId, authLoading]);

  const startFast = useCallback(async (customStartTime?: number, duration?: number) => {
    if (authLoading) {
      console.log("Authentication still in progress, delaying operation");
      return;
    }

    if (!userId) {
      console.error("Cannot start fast: User not logged in.");
      return;
    }

    const startTime = customStartTime ? Timestamp.fromMillis(customStartTime) : Timestamp.now();
    const targetDuration = duration ?? DEFAULT_FAST_DURATION;
    const newFastState: FastState = { isActive: true, startTime, targetDuration };

    try {
      const activeFastDocRef = doc(db, USERS_COLLECTION, userId, ACTIVE_FAST_DOC, 'current');
      await setDoc(activeFastDocRef, newFastState);
      console.log("Firestore: Started fast for user:", userId, newFastState);
    } catch (error) {
      console.error("Firestore: Error starting fast:", error);
    }
  }, [userId, authLoading]);

  const endFast = useCallback(async () => {
 
    if (authLoading) { 
      return; 
    }
    if (!userId) { 
     
      return; 
    }
    if (!fastState.isActive || !fastState.startTime) { 
     
      return; 
    }

    const endTime = Timestamp.now();
    const duration = endTime.toMillis() - fastState.startTime.toMillis();

    const completedFast: CompletedFast = {
      startTime: fastState.startTime,
      endTime: endTime,
      duration: duration,
      targetDuration: fastState.targetDuration,
    };

    try {
      const historyCollectionRef = collection(db, USERS_COLLECTION, userId, HISTORY_SUBCOLLECTION);
      const activeFastDocRef = doc(db, USERS_COLLECTION, userId, ACTIVE_FAST_DOC, 'current');

   
      await addDoc(historyCollectionRef, completedFast);
      
      await setDoc(activeFastDocRef, { isActive: false, startTime: null, targetDuration: null });
      
      setFastState({ isActive: false, startTime: null, targetDuration: null }); 
    

    } catch (error) {
      console.error("Firestore: Error ending fast:", error);
      throw error; 
    }
  
  }, [userId, fastState, authLoading, setFastState]);

  const lastFastDuration = useMemo(() => {
    const duration = fastHistory.length > 0 ? fastHistory[fastHistory.length - 1].duration : null;
    return duration;
  }, [fastHistory]);

  const contextValue = useMemo(() => {
    return {
      fastState,
      fastHistory,
      lastFastDuration,
      startFast,
      endFast,
      loading: loading || authLoading
    };
  }, [fastState, fastHistory, lastFastDuration, startFast, endFast, loading, authLoading]);

  return (
    <FastContext.Provider value={contextValue}>
      {children}
    </FastContext.Provider>
  );
};

export const useFast = () => {
  const context = useContext(FastContext);
  if (context === undefined) {
    throw new Error('useFast must be used within a FastProvider');
  }
  return context;
};