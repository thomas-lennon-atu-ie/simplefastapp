import React from 'react';

import { AppProvider } from './src/context/AppContext';
import { AuthProvider } from './src/context/AuthContext';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </AppProvider>
  );
}