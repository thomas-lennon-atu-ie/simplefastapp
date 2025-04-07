import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

import { ThemedText } from './ThemedText';

interface FastProgressCircleProps {
  slideNumber: number;
  isVisible: boolean; 
}

export function FastProgressCircle({ slideNumber, isVisible }: FastProgressCircleProps) {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
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
  
  // Trigger animation when slide becomes visible
  useEffect(() => {
    if (isVisible) {
      console.log(`Animating slide ${slideNumber} from ${previousProgress} to ${progress}`);
      animatedProgress.setValue(previousProgress);
      
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration: 1000, 
        easing: Easing.out(Easing.cubic), 
        useNativeDriver: true,
      }).start();
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

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Circle */}
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Animated Progress Circle */}
        <AnimatedCircle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size/2}, ${size/2})`} 
        />
        
        {/* Center Text with Emoji */}
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
  },
  circleContainer: {
    position: 'relative',
    width: 200,
    height: 200,
  },
  emojiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
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
});