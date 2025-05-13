/* eslint-disable jsx-a11y/accessible-emoji */
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';

import { ConfirmationModal } from '../components/ConfirmationModal';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../context/AuthContext';

type ProfileScreenProps = {
  navigation: StackNavigationProp<ParamListBase>;
  route: RouteProp<ParamListBase, string>;
};

export default function ProfileScreen({ navigation }: Readonly<ProfileScreenProps>) {
  const { user, logout, deleteAccount } = useAuth();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();      
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Account Deletion Failed',
        'There was a problem deleting your account. Please try again later.'
      );
    }
  };
  
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
          <ThemedText style={styles.bellIcon}>🔔</ThemedText>
          <ThemedText style={styles.notificationButtonText}>Notification Settings</ThemedText>
        </View>
      </TouchableOpacity>
      
      {/* Delete Account Button */}
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => setShowDeleteConfirmation(true)}
      >
        <ThemedText style={styles.deleteButtonText}>Delete Account</ThemedText>
      </TouchableOpacity>
      
      {/* Delete Account Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteConfirmation}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
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
  // New styles for delete account button
  deleteButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
});