import React from 'react';

import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import { FastProvider } from './src/context/FastContext';
import Navigation from './src/navigation/Navigation';

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