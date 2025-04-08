import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, FlatList, Dimensions, SafeAreaView, Image } from 'react-native';

import logoImage from '../../assets/logo.png'
import { FastProgressCircle } from '../components/FastProgressCircle';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useAppContext } from '../context/AppContext';
import { RootStackParamList } from '../navigation/Navigation';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface OnboardingScreenProps {
  navigation: OnboardingScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Welcome to SimpleFast',
    description: 'Your personal intermittent fasting assistant to help you achieve your health goals.',
  },
  {
    id: '2',
    title: 'Track Your Progress',
    description: 'Monitor your fasting hours, streaks, and health improvements all in one place.',
  },
  {
    id: '3',
    title: 'Choose Your Plan',
    description: 'Select from popular fasting methods like 16/8, OMAD, or create your custom schedule.',
  },
];

export default function OnboardingScreen(_props: Readonly<OnboardingScreenProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingComplete } = useAppContext();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setOnboardingComplete();
    
  };

  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <FastProgressCircle 
          slideNumber={parseInt(item.id)}
          isVisible={index === currentIndex}  
        />
        <Image 
          source={logoImage} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>
        <ThemedText style={styles.description}>{item.description}</ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={onboardingData}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          snapToAlignment="center"
          decelerationRate="fast"
          snapToInterval={width}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
            if (newIndex >= 0 && newIndex < onboardingData.length) {
              setCurrentIndex(newIndex);
            }
          }}
        />

        <ThemedView style={styles.footer}>
          <ThemedView style={styles.paginationContainer}>
            {onboardingData.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  flatListRef.current?.scrollToIndex({ index, animated: true });
                  setCurrentIndex(index);
                }}
                style={styles.paginationDotTouchable}
              >
                <View
                  style={[
                    styles.paginationDot,
                    index === currentIndex ? styles.paginationDotActive : styles.paginationDotInactive
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ThemedView>

          <ThemedView style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={completeOnboarding}>
              <ThemedText>Skip</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={handleNext}>
              <ThemedText style={styles.nextButtonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  illustrationPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
    paddingHorizontal: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    padding: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  paginationDotActive: {
    backgroundColor: '#0a7ea4',
  },
  paginationDotInactive: {
    backgroundColor: '#ccc',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  nextButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  paginationDotTouchable: {
    padding: 10, 
  },
});