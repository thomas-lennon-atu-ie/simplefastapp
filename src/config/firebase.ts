import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
// eslint-disable-next-line import/no-unresolved
} from '@env';
// Import AsyncStorage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 
import { initializeApp } from 'firebase/app';
// Import initializeAuth and getReactNativePersistence
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};


const app = initializeApp(firebaseConfig);


const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, { 
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

export { auth }; 
export const db = getFirestore(app);

export default app;