import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, View, Text } from 'react-native'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 

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
          {/* Email Input */}
          <TextInput            
            style={[styles.input, signInError ? styles.inputError : null]} 
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}            
            onChangeText={(text) => { setEmail(text); setSignInError(null); }} 
            editable={!loading && !googleLoading}
          />
          
          {/* Password Input */}
          <TextInput
            style={[styles.input, signInError ? styles.inputError : null]} 
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setSignInError(null); }} 
            editable={!loading && !googleLoading}
          />
    
          {signInError && <Text style={styles.errorText}>{signInError}</Text>}           
    
          <TouchableOpacity
            style={[styles.signInButton, (loading || googleLoading) && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading || googleLoading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>
        
          <ThemedView style={styles.orContainer}>
            <ThemedView style={styles.divider} />
            <ThemedText style={styles.orText}>OR</ThemedText>
            <ThemedView style={styles.divider} />
          </ThemedView>          
      
          <TouchableOpacity
            style={[styles.googleButton, (loading || googleLoading) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading || googleLoading}
          >
            <Icon name="google" size={20} color="#4285F4" style={styles.googleIcon} />
            <ThemedText style={styles.googleButtonText}>
              {googleLoading ? 'Signing In...' : 'Continue with Google'}
            </ThemedText>
          </TouchableOpacity>
          
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15, 
    fontSize: 16,
    color: '#000',
  },
  inputError: {
    borderColor: 'red', 
    borderWidth: 1,
    marginBottom: 5, 
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5, 
  },
  signInButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10, 
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  orContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  orText: { marginHorizontal: 10, color: '#888' },
  googleButton: { 
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleIcon: { marginRight: 10 },
  googleButtonText: { fontSize: 16 },
  forgotPasswordButton: { alignItems: 'center', marginTop: 10 },
  registerPrompt: { alignItems: 'center', marginTop: 20 },
  buttonDisabled: { opacity: 0.6 },
  linkDisabled: { opacity: 0.6 },
});