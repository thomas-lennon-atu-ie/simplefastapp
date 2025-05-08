import React from 'react';

import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { FastProvider } from './src/context/FastContext';
import Navigation from './src/navigation/Navigation';

if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('react-datetime/css/react-datetime.css');
}

export default function App() {
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