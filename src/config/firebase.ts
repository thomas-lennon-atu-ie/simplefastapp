import { initializeApp, getApp, getApps } from 'firebase/app';
import { Platform } from 'react-native';
import {
  FIREBASE_API_KEY,
  FIREBASE_API_KEY_ANDROID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_ANDROID_APP_ID,
  FIREBASE_IOS_APP_ID,
} from '@env';


const getApiKey = () => {
  if (Platform.OS === 'android') {
    return FIREBASE_API_KEY_ANDROID ?? FIREBASE_API_KEY;
  }
  return FIREBASE_API_KEY; 
};


let app: ReturnType<typeof initializeApp> | null = null;

export const getFirebaseApp = () => {
  if (app) return app;
  

  const firebaseConfig = {
    apiKey: getApiKey(),
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: Platform.OS === 'android' ? FIREBASE_ANDROID_APP_ID : FIREBASE_IOS_APP_ID,
  };


  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  return app;
};
