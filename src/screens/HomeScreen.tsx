import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { RootStackParamList } from '../navigation/Navigation';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ThemedView style={styles.container}>      
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />        
      <ThemedText type="title">SimpleFast</ThemedText>
      <ThemedText>Welcome to your free and simple intermittent fasting assistant!</ThemedText>
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
    width: 120,
    height: 120,
    marginBottom: 20,
  }
});