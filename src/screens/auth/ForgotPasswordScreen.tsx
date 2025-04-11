import { StackNavigationProp } from '@react-navigation/stack';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, View, Text } from 'react-native';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { auth } from '../../config/firebase'; 
import { RootStackParamList } from '../../navigation/Navigation';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({ navigation }: Readonly<ForgotPasswordScreenProps>) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    setEmailError(null);
    setSuccessMessage(null);

    if (!email) {
      setEmailError('Please enter your email address.');
      return;
    }
    
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(String(email).toLowerCase())) {
       setEmailError('Please enter a valid email address.');
       return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset email sent! Check your inbox (and spam folder).');
      setTimeout(() => navigation.goBack(), 3000); 
    } catch (error) {
       console.error("Password Reset Error:", error);
       if (error instanceof Error && 'code' in error) {
         const firebaseError = error as { code: string; message: string };
         if (firebaseError.code === 'auth/user-not-found') {
           setEmailError('No user found with this email address.');
         } else {
           Alert.alert('Error', 'Could not send password reset email. Please try again.');
         }
       } else {
         Alert.alert('Error', 'An unexpected error occurred.');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <ThemedView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText>← Back to Sign In</ThemedText>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>Reset Password</ThemedText>
        <ThemedText style={styles.subtitle}>
          Enter the email address associated with your account, and we&apos;ll send you a link to reset your password.
        </ThemedText>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(null); setSuccessMessage(null); }}
            editable={!loading}
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>}
          {successMessage && <Text style={styles.successText}>{successMessage}</Text>}

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.buttonDisabled]}
            onPress={handlePasswordReset}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, padding: 20, justifyContent: 'center' }, 
  backButton: { position: 'absolute', top: 60, left: 20 },
  title: { marginBottom: 15, textAlign: 'center' },
  subtitle: { marginBottom: 30, textAlign: 'center', opacity: 0.7, paddingHorizontal: 10 },
  form: { width: '100%' },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 5,
    fontSize: 16,
    color: '#000',
  },
  inputError: { borderColor: 'red', borderWidth: 1, marginBottom: 0 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 10, marginLeft: 5 },
  successText: { color: 'green', fontSize: 14, marginBottom: 15, marginLeft: 5, textAlign: 'center' },
  resetButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20, 
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
});