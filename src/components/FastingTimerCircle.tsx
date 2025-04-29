import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from './ThemedText';

interface FastingTimerCircleProps {
  elapsedTime: number;
  targetDuration: number;
  onPress: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const fastingStages = [
  { minHours: 0, maxHours: 4, name: 'Fed State', emoji: '🍽️', description: 'Digesting and absorbing nutrients.' },
  { minHours: 4, maxHours: 8, name: 'Early Fasting', emoji: '📉', description: 'Insulin drops, using glycogen.' },
  { minHours: 8, maxHours: 12, name: 'Transition', emoji: '🔄', description: 'Glycogen depletes, fat burning starts.' },
  { minHours: 12, maxHours: 16, name: 'Ketosis Begins', emoji: '🏃‍♂️', description: 'Fat converts to ketones, autophagy enhances.' },
  { minHours: 16, maxHours: 24, name: 'Deep Ketosis', emoji: '🧹', description: 'Peak cellular repair and detox.' },
  { minHours: 24, maxHours: Infinity, name: 'Extended Fasting', emoji: '🌟', description: 'Maintains ketosis, boosts benefits.' },
];

const getCurrentStage = (elapsedHours: number) => {
  return fastingStages.find(stage => elapsedHours >= stage.minHours && elapsedHours < stage.maxHours) ?? fastingStages[fastingStages.length - 1]; // Default to last stage if somehow out of bounds
};

const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 0) return "00:00:00";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export function FastingTimerCircle({ elapsedTime, targetDuration, onPress }: Readonly<FastingTimerCircleProps>) {
  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = targetDuration > 0 ? Math.min(elapsedTime / targetDuration, 1) : 0;
  const elapsedHours = elapsedTime / (1000 * 60 * 60);
  const currentStage = getCurrentStage(elapsedHours);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress);
    return {
      strokeDashoffset,
    };
  });

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke="#0a7ea4"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
       
      </Svg>
      <View style={styles.centerContent}>
        <ThemedText style={styles.stageEmoji}>{currentStage.emoji}</ThemedText>
        <ThemedText style={styles.timerText}>{formatDuration(elapsedTime)}</ThemedText>
        <ThemedText style={styles.stageNameText}>{currentStage.name}</ThemedText>
        <ThemedText style={styles.endButtonText}>Tap to End Fast</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageEmoji: {
    fontSize: 24, 
    marginBottom: 5,
  },
  timerText: {
    color: '#0a7ea4',
    fontSize: 32, 
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stageNameText: { 
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  endButtonText: {
    color: '#555',
    fontSize: 12,
    opacity: 0.8,
  },
});
