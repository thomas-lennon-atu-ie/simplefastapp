import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';

import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { FastProvider } from './src/context/FastContext';
import Navigation from './src/navigation/Navigation';

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-datetime/css/react-datetime.css');
}

export default function App() {
  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    // Set up notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification taps here
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <AppProvider>
      <AuthProvider>
        <FastProvider>
          <Navigation />
        </FastProvider>
      </AuthProvider>
    </AppProvider>
  );
}