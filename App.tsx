import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { AppProvider } from './src/context/AppContext';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <AppProvider>
      <Navigation />
      <StatusBar style="auto" />
    </AppProvider>
  );
}