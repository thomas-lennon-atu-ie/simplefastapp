import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, View, Text } from 'react-native'; // Import Text for validation messages
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { useAuth } from '../../context/AuthContext'; 
import { RootStackParamList } from '../../navigation/Navigation';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
        
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]} 
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => { setEmail(text); setEmailError(null); }} 
            editable={!loading && !googleLoading} 
          />
          {emailError && <Text style={styles.errorText}>{emailError}</Text>} 

         
          <TextInput
            style={[styles.input, passwordError ? styles.inputError : null]} 
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={(text) => { setPassword(text); setPasswordError(null); }} 
            editable={!loading && !googleLoading} 
          />
     
          <Text style={styles.criteriaText}>
            (Min 8 chars, 1 uppercase, 1 number)
          </Text>
          
     
          <TextInput
            style={[styles.input, passwordError && password !== confirmPassword ? styles.inputError : null]} 
            placeholder="Confirm Password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); if (password) setPasswordError(null); }} 
            editable={!loading && !googleLoading} 
          />
           {passwordError && <Text style={styles.errorText}>{passwordError}</Text>} 

          <TouchableOpacity
            style={[styles.registerButton, (loading || googleLoading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading || googleLoading}
          >
            <ThemedText style={styles.buttonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 5, 
    fontSize: 16,
    color: '#000', 
  },
  inputError: {
    borderColor: 'red', 
    borderWidth: 1,
    marginBottom: 0, 
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10, 
    marginLeft: 5,
  },
  criteriaText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10, 
    marginLeft: 5,
  },
  registerButton: {
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
  },
  googleIcon: { marginRight: 10 },
  googleButtonText: { fontSize: 16 },
  signInPrompt: { alignItems: 'center', marginTop: 30 },
  buttonDisabled: { opacity: 0.6 },
  linkDisabled: { opacity: 0.6 },
});