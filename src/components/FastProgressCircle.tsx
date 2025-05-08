import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface FastProgressCircleProps {
  slideNumber: number;
  isVisible: boolean;
}

const stageInfo: { [key: number]: string } = {
  1: "Stage 1: Glycogen Depletion (0-12 hours)\nYour body uses stored glucose (glycogen). You might feel initial hunger pangs.",
  2: "Stage 2: Ketosis Begins (12-24 hours)\nGlycogen runs low. Your body starts breaking down fat for energy, producing ketones.",
  3: "Stage 3: Autophagy Boost (24+ hours)\nCellular cleanup! Your body removes damaged cells and regenerates newer, healthier cells.",
};

export function FastProgressCircle({ slideNumber, isVisible }: Readonly<FastProgressCircleProps>) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const [showInfo, setShowInfo] = useState(false);

  const getPreviousProgress = (currentSlide: number) => {
    switch (currentSlide) {
      case 1: return 0;
      case 2: return 0.15;
      case 3: return 0.5;
      default: return 0;
    }
  };

  const getProgressValues = () => {
    switch (slideNumber) {
      case 1:
        return {
          progress: 0.15,
          color: '#4CAF50',
          emoji: '🕒',
          label: 'Start Fast'
        };
      case 2:
        return {
          progress: 0.5,
          color: '#FFC107',
          emoji: '⏳',
          label: 'In Progress'
        };
      case 3:
        return {
          progress: 1,
          color: '#FF5722',
          emoji: '🔥',
          label: 'Fast Complete!'
        };
      default:
        return {
          progress: 0,
          color: '#ccc',
          emoji: '',
          label: ''
        };
    }
  };

  const { progress, color, emoji, label } = getProgressValues();
  const previousProgress = getPreviousProgress(slideNumber);


  useEffect(() => {
    if (isVisible) {

      animatedProgress.setValue(previousProgress);

      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, 
      }).start();
    } else {
      setShowInfo(false);
      
    }
  }, [isVisible, slideNumber, progress, previousProgress, animatedProgress]);

  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const emojiSize = 96;

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  const toggleInfo = () => {
    setShowInfo(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleInfo}>
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
            stroke={color}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90, ${size/2}, ${size/2})`}
          />

          <SvgText
            x={size / 2}
            y={size / 2.3 + emojiSize / 6}
            fontSize={emojiSize}
            textAnchor="middle"
            alignmentBaseline="central"
          >
            {emoji}
          </SvgText>
        </Svg>
      </Pressable>

      {showInfo && (
        <ThemedView style={styles.tooltipContainer}>
          <ThemedText style={styles.tooltipText}>
            {stageInfo[slideNumber] || 'More info coming soon!'}
          </ThemedText>
        </ThemedView>
      )}

      <ThemedText style={styles.label}>{slideNumber}/3</ThemedText>
      <ThemedText style={styles.progress}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  progress: {
    marginTop: 5,
    fontSize: 14,
    opacity: 0.7,
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: -50,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  tooltipText: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
});