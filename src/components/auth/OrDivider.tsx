import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '../ThemedText'; 
import { ThemedView } from '../ThemedView'; 

export function OrDivider() {
  return (
    <ThemedView style={styles.orContainer}>
      <ThemedView style={styles.divider} />
      <ThemedText style={styles.orText}>OR</ThemedText>
      <ThemedView style={styles.divider} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: 'transparent', 
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0', 
  },
  orText: {
    marginHorizontal: 10,
    color: '#888', 
  },
});
