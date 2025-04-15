import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function TimerScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Timer</ThemedText>
      <ThemedText>Your fasting timer will appear here</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});