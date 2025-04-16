import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, View } from 'react-native';

import { AuthInput } from './AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { OrDivider } from '../../components/auth/OrDivider';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/Navigation';

type SignInScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignIn'>;

interface SignInScreenProps {
  navigation: SignInScreenNavigationProp;
}

export default function SignInScreen({ navigation }: Readonly<SignInScreenProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const { signIn, signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    setSignInError(null);

    if (!email || !password) {
      setSignInError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
    } catch (error) {
      console.error("Sign In Error Raw:", error);
      setSignInError('Invalid email or password. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSignInError(null);
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

        <ThemedText type="title" style={styles.title}>Sign In</ThemedText>

        <View style={styles.form}>
          <AuthInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setSignInError(null); }}
            editable={!loading && !googleLoading}
            error={signInError && !password ? signInError : null}
            isError={!!signInError}
          />

          <AuthInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setSignInError(null); }}
            editable={!loading && !googleLoading}
            error={signInError && password ? signInError : null}
            isError={!!signInError}
          />

          <AuthButton
            title="Sign In"
            onPress={handleSignIn}
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
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading || googleLoading}
          >
            <ThemedText style={(loading || googleLoading) ? styles.linkDisabled : {}}>Forgot Password?</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerPrompt}
            onPress={() => navigation.navigate('Register')}
            disabled={loading || googleLoading}
          >
             <ThemedText style={(loading || googleLoading) ? styles.linkDisabled : {}}>
              Don&apos;t have an account? Create one
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
  forgotPasswordButton: { alignItems: 'center', marginTop: 20 },
  registerPrompt: { alignItems: 'center', marginTop: 20 },
  linkDisabled: { opacity: 0.6 },
});