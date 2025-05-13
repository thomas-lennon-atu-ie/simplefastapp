import { ParamListBase, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../context/AuthContext';

type ProfileScreenProps = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, string>;
};

export default function ProfileScreen({ navigation }: Readonly<ProfileScreenProps>) {
  const { user, logout } = useAuth();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={styles.email}>{user?.email}</ThemedText>
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <ThemedText style={styles.buttonText}>Log Out</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.notificationButton}
        onPress={() => navigation.navigate('NotificationSettings')}
      >
        <View style={styles.buttonContent}>
          {/* Bell emoji as icon */}
          {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
          <ThemedText style={styles.bellIcon}>🔔</ThemedText>
          <ThemedText style={styles.notificationButtonText}>Notification Settings</ThemedText>
        </View>
      </TouchableOpacity>
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
  email: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, 
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationButton: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notificationButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0a7ea4',
  },
});