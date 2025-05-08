import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, View, Text } from 'react-native';

import { AuthInput } from './AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { OrDivider } from '../../components/auth/OrDivider';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/Navigation';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  return { valid: true, message: '' };
};


export default function RegisterScreen({ navigation }: Readonly<RegisterScreenProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { register, signInWithGoogle } = useAuth();

  const handleRegister = async () => {
    setEmailError(null);
    setPasswordError(null);
    let isValid = true;

    if (!email) {
      setEmailError('Please enter an email address.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    const passwordValidation = validatePassword(password);
    if (!password) {
      setPasswordError('Please enter a password.');
      isValid = false;
    } else if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message);
      isValid = false;
    } else if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
    } catch (error) {
       if (error instanceof Error && 'code' in error) {
         const firebaseError = error as { code: string; message: string };
         if (firebaseError.code === 'auth/email-already-in-use') {
           setEmailError('This email address is already registered.');
         } else {
           Alert.alert('Error registering', firebaseError.message);
         }
       } else {
         Alert.alert('Error registering', 'An unexpected error occurred.');
       }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setEmailError(null);
    setPasswordError(null);
    try {
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Google Sign-In Error', 'Could not sign in with Google. Please try again.');
      console.error("Google Sign-In component error:", error);
    } finally {
      setGoogleLoading(false);
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
          <ThemedText>← Back</ThemedText>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.title}>Create Account</ThemedText>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(null); }}
            editable={!loading && !googleLoading}
            error={emailError}
            isError={!!emailError}
          />

          <AuthInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setPasswordError(null); }}
            editable={!loading && !googleLoading}
            error={passwordError && passwordError !== 'Passwords do not match.' ? passwordError : null} // Show specific password errors
            isError={!!passwordError}
          />
          <Text style={styles.criteriaText}>
            (Min 8 chars, 1 uppercase, 1 number)
          </Text>

          <AuthInput
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); if (password) setPasswordError(null); }}
            editable={!loading && !googleLoading}
            error={passwordError && passwordError === 'Passwords do not match.' ? passwordError : null} // Show only mismatch error here
            isError={!!passwordError && password !== confirmPassword}
          />

          <AuthButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={googleLoading}
          />

          <OrDivider />

          <GoogleSignInButton
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading}
          />

          <TouchableOpacity
            style={styles.signInPrompt}
            onPress={() => navigation.navigate('SignIn')}
            disabled={loading || googleLoading}
          >
            <ThemedText style={(loading || googleLoading) ? styles.linkDisabled : {}}>
              Already have an account? Sign In
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  container: { flex: 1, padding: 20 },
  backButton: { marginTop: 40, marginBottom: 20 },
  title: { marginBottom: 30, textAlign: 'center' },
  form: { width: '100%' },
  criteriaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    marginLeft: 5,
    marginTop: -5, 
  },
  signInPrompt: { alignItems: 'center', marginTop: 30 },
  linkDisabled: { opacity: 0.6 },
});