import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function GoalsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Goals</ThemedText>
      <ThemedText>Set and track your fasting goals here.</ThemedText>
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