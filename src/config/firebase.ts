import {
  FIREBASE_API_KEY,
  FIREBASE_API_KEY_ANDROID, // Add this for Android-specific API key
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_ANDROID_APP_ID, // Add this
  FIREBASE_IOS_APP_ID // Add this (though it may be undefined)
// eslint-disable-next-line import/no-unresolved
} from '@env';
// Import AsyncStorage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import { initializeApp } from 'firebase/app';
// Import initializeAuth and getReactNativePersistence
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  CACHE_SIZE_UNLIMITED, 
  setLogLevel 
} from 'firebase/firestore'; 
import { Platform } from 'react-native';

// Add platform-specific API key selection
const getApiKey = () => {
  if (Platform.OS === 'android') {
    return FIREBASE_API_KEY_ANDROID ?? FIREBASE_API_KEY;
  }
  return FIREBASE_API_KEY; // web or iOS fallback
};

// Add platform-specific app ID selection
const getAppId = () => {
  if (Platform.OS === 'android') {
    return FIREBASE_ANDROID_APP_ID ?? FIREBASE_APP_ID;
  } else if (Platform.OS === 'ios') {
    return FIREBASE_IOS_APP_ID ?? FIREBASE_APP_ID;
  }
  return FIREBASE_APP_ID; // web or fallback
};

const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: getAppId()
};


const app = initializeApp(firebaseConfig);

// Initialize Auth (keep existing code)
const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, { 
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

export { auth }; 

const databaseId = "simplefast"; // Specify your database name here

// Initialize Firestore with persistence for non-web, specifying the database ID
export const db = Platform.OS === 'web'
  ? getFirestore(app, databaseId) // Correct: databaseId as second argument for getFirestore
  : initializeFirestore(app, 
      { // Correct: Settings object is the second argument
        localCache: persistentLocalCache({ cacheSizeBytes: CACHE_SIZE_UNLIMITED })
      },
      databaseId // Correct: databaseId is the third argument
    );

// Enable debug logging for Firestore
setLogLevel('debug'); 

if (Platform.OS !== 'web') {
  console.log("Firestore persistence enabled via initializeFirestore.");
}

export default app;

// After initializing Firebase
console.log("Firebase initialized with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  platform: Platform.OS,
  appType: typeof app
});

// After initializing auth
console.log("Firebase Auth initialized:", {
  currentUser: auth.currentUser?.uid,
  initialized: !!auth
});