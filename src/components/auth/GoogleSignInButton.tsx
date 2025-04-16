import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemedText } from '../ThemedText'; 

interface GoogleSignInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoogleSignInButton({ onPress, loading = false, disabled = false }: Readonly<GoogleSignInButtonProps>) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.googleButton, isDisabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#0a7ea4" /> 
      ) : (
        <>
          <Icon name="google" size={20} color="#4285F4" style={styles.googleIcon} />
          <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, 
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});