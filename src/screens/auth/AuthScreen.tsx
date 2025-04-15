import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Image, TouchableOpacity, View } from 'react-native';

import logoImage from '../../../assets/logo.png';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { RootStackParamList } from '../../navigation/Navigation';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface AuthScreenProps {
  navigation: AuthScreenNavigationProp;
}

export default function AuthScreen({ navigation }: Readonly<AuthScreenProps>) {
  return (
    <ThemedView style={styles.container}>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      <ThemedText type="title">Welcome to SimpleFast</ThemedText>
      <ThemedText style={styles.subtitle}>Your simple intermittent fasting assistant</ThemedText>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate('Register')}
        >
          <ThemedText style={styles.buttonText}>Create Account</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={() => navigation.navigate('SignIn')}
        >
          <ThemedText>Already have an account? Sign In</ThemedText>
        </TouchableOpacity>
      </View>
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
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 20,
  },
  registerButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    alignItems: 'center',
    padding: 10,
  },
});