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
import { scheduleEndOfFastNotification, cancelScheduledNotifications } from '../services/NotificationService';


interface FastState {
  isActive: boolean;
  startTime: Timestamp | null;
  targetDuration: number | null;
}

export interface CompletedFast {
  id: string; 
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  targetDuration: number | null;
}

export interface FastingGoal {
  type: 'preset' | 'custom';
  name: string;         
  duration: number;      
  description?: string;  
}

export const FASTING_GOAL_PRESETS: FastingGoal[] = [
  { 
    type: 'preset', 
    name: '16:8 (Leangains)',
    duration: 16 * 60 * 60 * 1000, 
    description: 'Fast for 16 hours, eat during 8-hour window'
  },
  { 
    type: 'preset', 
    name: '18:6',
    duration: 18 * 60 * 60 * 1000, 
    description: 'Fast for 18 hours, eat during 6-hour window'
  },
  { 
    type: 'preset', 
    name: '20:4 (Warrior)',
    duration: 20 * 60 * 60 * 1000, 
    description: 'Fast for 20 hours, eat during 4-hour window'
  },
  { 
    type: 'preset', 
    name: '24-Hour Fast',
    duration: 24 * 60 * 60 * 1000, 
    description: 'Complete 24-hour fast'
  },
  { 
    type: 'preset', 
    name: 'OMAD (One Meal a Day)',
    duration: 23 * 60 * 60 * 1000, 
    description: 'Fast for 23 hours, eat one meal'
  },
  { 
    type: 'preset', 
    name: '48-Hour Fast',
    duration: 48 * 60 * 60 * 1000, 
    description: 'Complete 48-hour fast' 
  }
];

type FastContextType = {
  fastState: FastState;
  fastHistory: CompletedFast[];
  lastFastDuration: number | null;
  startFast: (startTime?: number, duration?: number) => Promise<void>;
  endFast: (endTime?: number) => Promise<void>;
  loading: boolean;
  
  currentGoal: FastingGoal | null;
  setFastingGoal: (goal: FastingGoal) => Promise<void>;
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
  const [currentGoal, setCurrentGoal] = useState<FastingGoal | null>(null);
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
     
      setFastHistory(history.slice().reverse());
      setLoading(false);
    }, () => {
    
      setLoading(false);
    });

    const userGoalRef = doc(db, USERS_COLLECTION, userId, 'settings', 'fastingGoal');
    
    const unsubscribeGoal = onSnapshot(userGoalRef, (docSnap) => {
      if (docSnap.exists()) {
        setCurrentGoal(docSnap.data() as FastingGoal);
      } else {
        // Default to the 16:8 goal if none is set
        setCurrentGoal(FASTING_GOAL_PRESETS[0]);
      }
    }, (error) => {
      console.error("Error loading fasting goal:", error);
    });
    
    return () => {
      unsubscribeActiveFast();
      unsubscribeHistory();
      unsubscribeGoal();
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
      
      // Schedule notification for end of fast
      const endTime = startTime.toMillis() + targetDuration;
      await scheduleEndOfFastNotification(endTime);
      
    } catch (error) {
      console.error("Firestore: Error starting fast:", error);
    }
  }, [userId, authLoading]);

  const endFast = useCallback(async (customEndTime?: number) => {
 
    if (authLoading) { 
      return; 
    }
    if (!userId) { 
     
      return; 
    }
    if (!fastState.isActive || !fastState.startTime) { 
     
      return; 
    }

    const endTime = customEndTime ? Timestamp.fromMillis(customEndTime) : Timestamp.now();
    const duration = endTime.toMillis() - fastState.startTime.toMillis();

    const completedFast = {
      startTime: fastState.startTime,
      endTime: endTime,
      duration: duration,
      targetDuration: fastState.targetDuration,      
    } as Omit<CompletedFast, 'id'>;

    try {
      const historyCollectionRef = collection(db, USERS_COLLECTION, userId, HISTORY_SUBCOLLECTION);
      const activeFastDocRef = doc(db, USERS_COLLECTION, userId, ACTIVE_FAST_DOC, 'current');

   
      await addDoc(historyCollectionRef, completedFast);
      
      await setDoc(activeFastDocRef, { isActive: false, startTime: null, targetDuration: null });
      
      setFastState({ isActive: false, startTime: null, targetDuration: null }); 
    
      // Cancel any scheduled notifications for this fast
      await cancelScheduledNotifications();
    } catch (error) {
      console.error("Firestore: Error ending fast:", error);
      throw error; 
    }
  
  }, [userId, authLoading, fastState, setFastState]);

  const setFastingGoal = useCallback(async (goal: FastingGoal) => {
    if (authLoading || !userId) return;
    
    try {
      const userGoalRef = doc(db, USERS_COLLECTION, userId, 'settings', 'fastingGoal');
      await setDoc(userGoalRef, goal);
      setCurrentGoal(goal);
    } catch (error) {
      console.error("Error saving fasting goal:", error);
      throw error;
    }
  }, [userId, authLoading]);

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
      loading: loading || authLoading,
      currentGoal,
      setFastingGoal
    };
  }, [fastState, fastHistory, lastFastDuration, startFast, endFast, loading, authLoading, currentGoal, setFastingGoal]);

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