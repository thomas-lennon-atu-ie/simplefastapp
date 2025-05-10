import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Timestamp } from 'firebase/firestore';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Image, Alert, View, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

import logoImage from '../../assets/logo.png';
import fireworksLottie from '../../assets/lottie/fireworks.json';
import { AnimatedFastButton } from '../components/AnimatedFastButton';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DateTimePickerModal } from '../components/DateTimePickerModal';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { useFast } from '../context/FastContext';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text);

const formatDuration = (milliseconds: number | null): string => {
    if (milliseconds === null || milliseconds < 0) return "--:--:--";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  FastingStages: { currentElapsedHours: number };
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { 
    fastState, 
    startFast, 
    endFast, 
    lastFastDuration, 
    currentGoal, 
    loading: contextLoading  
  } = useFast();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEndFastModalVisible, setIsEndFastModalVisible] = useState(false);
  const [isStartPickerVisible, setStartPickerVisible] = useState(false);
  const [isEndPickerVisible, setEndPickerVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<'start' | 'end' | null>(null);
  const [pickerValue, setPickerValue] = useState<Date>(new Date());
  const [showFireworks, setShowFireworks] = useState(false);

  const finalLogoY = Math.min(height * 1.35, 120); 
  const logoY = useSharedValue(0);
  const initialTaglineOpacity = useSharedValue(1);
  const finalTaglineOpacity = useSharedValue(0);
  
  useEffect(() => {
    if (!contextLoading) {
        const onFadeOutComplete = (finished?: boolean) => {
            if (finished) {
                finalTaglineOpacity.value = withTiming(1, { duration: 300 });
            }
        };
        const startAnimation = () => {
            logoY.value = withTiming(finalLogoY, { duration: 800, easing: Easing.out(Easing.exp) },
                (finished?: boolean) => {
                    if (finished) {
                        initialTaglineOpacity.value = withTiming(0, { duration: 800 }, onFadeOutComplete);
                    }
                }
            );
        };

        if (!fastState.isActive) {
             startAnimation();
        } else {
             logoY.value = finalLogoY;
             initialTaglineOpacity.value = 0;
             finalTaglineOpacity.value = 1;
        }
    }
  }, [fastState.isActive, logoY, initialTaglineOpacity, finalTaglineOpacity, finalLogoY, contextLoading]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (fastState.isActive && fastState.startTime instanceof Timestamp) {
      const initialElapsed = Date.now() - fastState.startTime.toMillis();
      setElapsedTime(initialElapsed > 0 ? initialElapsed : 0);

      intervalId = setInterval(() => {
        if (fastState.startTime instanceof Timestamp) {
           const currentElapsed = Date.now() - fastState.startTime.toMillis();
           setElapsedTime(currentElapsed > 0 ? currentElapsed : 0);
        }
      }, 1000);

    } else {
      setElapsedTime(0);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fastState.isActive, fastState.startTime]);


  const logoContainerAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: logoY.value }] }));
  const initialTaglineAnimatedStyle = useAnimatedStyle(() => ({ opacity: initialTaglineOpacity.value }));
  const finalTaglineAnimatedStyle = useAnimatedStyle(() => ({ opacity: finalTaglineOpacity.value }));

  const handleStartFasting = () => {
    setPickerValue(new Date());
    setPendingAction('start');
    setStartPickerVisible(true);
  };

  const performEndFast = async () => {
    console.log("[HomeScreen] performEndFast called");
    setIsEndFastModalVisible(false);
    try {
        await endFast();
        console.log("[HomeScreen] endFast() call completed.");
    } catch (error) {
      console.error("[HomeScreen] Error caught after calling endFast:", error);
      Alert.alert('Error Ending Fast', 'Could not update fast status. Please check logs or try again.');
    }
  };

  const handleEndFasting = () => {
    setPickerValue(new Date());
    setPendingAction('end');
    setEndPickerVisible(true);
  };

  const handlePickerConfirm = async (date: Date) => {
    if (pendingAction === 'start') {
      await startFast(date.getTime());
      setStartPickerVisible(false);
    } else if (pendingAction === 'end') {
      await endFast(date.getTime());
      setEndPickerVisible(false);
      setShowFireworks(true);
      setTimeout(() => setShowFireworks(false), 2500); 
    }
    setPendingAction(null);
  };

  const handlePickerCancel = () => {
    setStartPickerVisible(false);
    setEndPickerVisible(false);
    setPendingAction(null);
  };

  const handleViewStages = () => {
    navigation.navigate('FastingStages', { 
      currentElapsedHours: elapsedTime / (1000 * 60 * 60) 
    });
  };
  
  if (contextLoading) {
      return <ThemedView style={styles.container}><ActivityIndicator size="large" color="#0a7ea4" /></ThemedView>;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Create a flex container with proper spacing */}
      <View style={styles.contentWrapper}>
        {/* Logo container with fixed zIndex */}
        <AnimatedView style={[styles.logoTaglineContainer, logoContainerAnimatedStyle, { zIndex: 10 }]}>
          <AnimatedImage source={logoImage} style={styles.logo} resizeMode="contain" />
          <View style={styles.taglinesWrapper}>
            <AnimatedText style={[styles.taglineBase, styles.taglineInitial, initialTaglineAnimatedStyle]} numberOfLines={1}>
              Your Simple Fasting Assistant
            </AnimatedText>
            <AnimatedText style={[styles.taglineBase, styles.taglineFinal, styles.taglineHighlight, finalTaglineAnimatedStyle]} numberOfLines={1}>
              Simple Fast
            </AnimatedText>
          </View>
        </AnimatedView>
        
        {/* Button container that takes remaining space */}
        <View style={styles.buttonContainer}>
          <AnimatedFastButton
            isActive={fastState.isActive}
            elapsedTime={elapsedTime}
            targetDuration={fastState.targetDuration}
            onStartPress={handleStartFasting}
            onEndPress={handleEndFasting}
            onViewStagesPress={handleViewStages}
            size={Math.min(width * 0.5, 200)}
            goalDuration={currentGoal?.duration} 
          />
          
          
          {fastState.isActive && (
            <TouchableOpacity
              style={styles.endFastButton}
              onPress={handleEndFasting}
            >
              <ThemedText style={styles.endFastButtonText}>End Fast</ThemedText>
            </TouchableOpacity>
          )}
          
          {/* When showing last fast duration, add goal comparison */}
          {!fastState.isActive && lastFastDuration !== null && (
            <View style={styles.lastFastContainer}>
              <ThemedText style={styles.lastDurationText}>
                Last fast: {formatDuration(lastFastDuration)}
              </ThemedText>
              
              {currentGoal && (
                <ThemedText style={[
                  styles.goalComparisonText,
                  lastFastDuration >= (currentGoal.duration) 
                    ? styles.goalMetText 
                    : styles.goalNotMetText
                ]}>
                  {lastFastDuration >= (currentGoal.duration) 
                    ? `Goal met! (${(currentGoal.duration / (1000 * 60 * 60)).toFixed(0)}h ${currentGoal.name})` 
                    : `Goal: ${(currentGoal.duration / (1000 * 60 * 60)).toFixed(0)}h not reached`}
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </View>


      <ConfirmationModal
        visible={isEndFastModalVisible}
        title="End Fast"
        message="Are you sure you want to end your current fast?"
        confirmText="End Fast"
        cancelText="Cancel"
        onConfirm={performEndFast}
        onCancel={() => {
          console.log("[HomeScreen] Modal Cancel pressed");
          setIsEndFastModalVisible(false);
        }}
      />

      <DateTimePickerModal
        visible={isStartPickerVisible}
        value={pickerValue}
        onChange={handlePickerConfirm}
        onCancel={handlePickerCancel}
        maxDate={fastState.isActive && fastState.startTime ? fastState.startTime.toDate() : new Date()}
        title="Select Start date/time"
      />
      <DateTimePickerModal
        visible={isEndPickerVisible}
        value={pickerValue}
        onChange={handlePickerConfirm}
        onCancel={handlePickerCancel}
        minDate={fastState.startTime ? fastState.startTime.toDate() : undefined}
        maxDate={new Date()}
        title="Select End date/time"
      />

      {showFireworks && (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      left: 0, top: 0, right: 0, bottom: 0,
      zIndex: 9999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    }}
  >
    <LottieView
      source={fireworksLottie}
      autoPlay
      loop={false}
      style={{ width: 300, height: 300 }}
      resizeMode="cover"
    />
  </View>
)}

      {showFireworks && Platform.OS !== 'web' && (
        <LottieView
          source={fireworksLottie}
          autoPlay
          loop={false}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
          }}
          onAnimationFinish={() => setShowFireworks(false)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  logoTaglineContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? '5%' : '2%', 
    height: Math.min(height * 0.15, 100), 
    zIndex: 10, 
  },
  logo: {
    width: Math.min(width * 0.4, 150),
    height: Math.min(width * 0.15, 150), 
    resizeMode: 'contain',
  },
  taglinesWrapper: {
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    height: 30
  },
  taglineBase: { fontSize: 16, color: '#555', textAlign: 'center', position: 'absolute', width: '100%', top: 0, left: 0 },
  taglineInitial: {},
  taglineFinal: {},
  taglineHighlight: { fontWeight: 'bold' },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '5%', 
    maxHeight: height * 0.7, 
  },
  lastFastContainer: {
    alignItems: 'center',
  },
  lastDurationText: {
    fontSize: 14,
    color: '#555',
    opacity: 0.8,
    textAlign: 'center',
  },
  goalComparisonText: {
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
  },
  goalMetText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  goalNotMetText: {
    color: '#FFC107',
  },
  endFastButton: {
    marginTop: 20,
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  endFastButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});