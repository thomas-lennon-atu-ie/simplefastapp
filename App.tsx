import React from 'react';
import { StatusBar } from 'expo-status-bar';
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