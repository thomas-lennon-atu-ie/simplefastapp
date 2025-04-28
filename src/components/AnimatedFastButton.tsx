import { useNavigation } from '@react-navigation/native'; 
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native'; 
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg'; 

import { ThemedText } from './ThemedText';

interface FastingStage {
  minHours: number;
  maxHours: number;
  name: string;
  description: string;
  benefits: string;
  emoji: string;
}

const fastingStages: FastingStage[] = [
  { minHours: 0, maxHours: 4, name: "Fed State", description: "Digesting and absorbing nutrients.", benefits: "Elevated blood sugar and insulin.", emoji: "🍽️" },
  { minHours: 4, maxHours: 8, name: "Early Fasting", description: "Insulin drops; body uses stored glycogen.", benefits: "Starting to tap into reserves.", emoji: "📉" },
  { minHours: 8, maxHours: 12, name: "Transition", description: "Glycogen depletes; body shifts to fat; autophagy begins.", benefits: "Metabolic shift initiating.", emoji: "🔄" },
  { minHours: 12, maxHours: 16, name: "Ketosis Begins", description: "Fat converts to ketones; enhanced autophagy.", benefits: "Fat burning & cellular repair.", emoji: "🏃‍♂️" },
  { minHours: 16, maxHours: 24, name: "Deep Ketosis", description: "Heavy reliance on ketones; peak cellular repair.", benefits: "Enhanced detoxification.", emoji: "🧹" },
  { minHours: 24, maxHours: Infinity, name: "Extended Fasting", description: "Maintains ketosis; boosts autophagy.", benefits: "Improved insulin sensitivity.", emoji: "🌟" },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);

interface AnimatedFastButtonProps {
  isActive: boolean;
  elapsedTime: number;
  targetDuration: number | null;
  onStartPress: () => void;
  onEndPress: () => void;
  size?: number;
  gradient?: readonly [string, string, ...string[]];
  onViewStagesPress?: () => void;
}

const DEFAULT_GRADIENT = ['#0a7ea4', '#0a7ea4'] as const;
const ACTIVE_GRADIENT = ['#FFC107', '#FF9800'] as const;
const defaultButtonSize = 200;

interface EmojiItemProps {
  stage: FastingStage;
  index: number;
  elapsedHours: number;
  size: number;
  emojiRadius: number;
  emojiSize: number;
  onPress: (stage: FastingStage) => void;
}

const EmojiItem: React.FC<EmojiItemProps> = ({ 
  stage, 
  index, 
  elapsedHours, 
  size, 
  emojiRadius, 
  emojiSize, 
  onPress 
}) => {
  const isStageMet = elapsedHours >= stage.minHours;
  const totalStages = fastingStages.length;
  
  const angleOffset = -Math.PI / 2;
  const angleIncrement = (2 * Math.PI) / totalStages;
  const angle = angleOffset + (index * angleIncrement);
  
  const x = size / 2 + (emojiRadius * 0.5) * Math.cos(angle);
  const y = size / 2 + (emojiRadius * 0.5) * Math.sin(angle);

  const opacity = isStageMet ? 1 : 0.4;

  const handlePress = () => {
    onPress(stage);
  };

  if (Platform.OS === 'web') {
    return (
      <G opacity={opacity.toString()}>
        <Circle
          cx={x}
          cy={y}
          r={emojiSize * 1.5} 
          fill="transparent"
          stroke="transparent" 
          onPress={handlePress}
        />
        <SvgText
          x={x}
          y={y}
          fontSize={emojiSize}
          textAnchor="middle"
          alignmentBaseline="central"
        >
          {stage.emoji}
        </SvgText>
      </G>
    );
  }

  return (
    <G opacity={opacity.toString()}>
      <Circle
        cx={x}
        cy={y}
        r={emojiSize * 1.5} 
        fill="transparent"
        stroke="transparent" 
        onPress={handlePress}
      />
      <SvgText
        x={x}
        y={y}
        fontSize={emojiSize}
        textAnchor="middle"
        alignmentBaseline="central"
      >
        {stage.emoji}
      </SvgText>
    </G>
  );
};

export function AnimatedFastButton({
  isActive,
  elapsedTime,
  targetDuration,
  onStartPress,
  onEndPress,
  size = defaultButtonSize,
  gradient = DEFAULT_GRADIENT,
  onViewStagesPress,
}: Readonly<AnimatedFastButtonProps>) {
  const navigation = useNavigation(); 
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const activeState = useSharedValue(0);
  const buttonSize = useSharedValue(size);
  const innerSize = useSharedValue(size * 0.9);

  const elapsedHours = elapsedTime / (1000 * 60 * 60);
  const percentComplete = targetDuration ? Math.min(elapsedTime / targetDuration, 1) : 0;

  useEffect(() => {
    if (isActive) {
      progress.value = withTiming(percentComplete, { duration: 500 });
    } else {
      progress.value = withTiming(0, { duration: 150 });
    }
  }, [percentComplete, isActive, progress]);

  useEffect(() => {
    activeState.value = withTiming(isActive ? 1 : 0, { duration: 400 });
    buttonSize.value = withSpring(isActive ? size * 1.05 : size);
    innerSize.value = withSpring(isActive ? size * 0.88 : size * 0.9);
  }, [isActive, size, activeState, buttonSize, innerSize]);

  const onPressIn = () => { scale.value = withSpring(0.95); };
  const onPressOut = () => { scale.value = withSpring(1); };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    width: buttonSize.value,
    height: buttonSize.value,
    transform: [{ scale: scale.value }],
  }));

  const innerCircleStyle = useAnimatedStyle(() => ({
    width: innerSize.value,
    height: innerSize.value,
  }));

  const animatedGProps = useAnimatedProps(() => ({
    opacity: activeState.value,
  }));

  const progressAnimatedProps = useAnimatedProps(() => {
    const circumference = (size - 10) * Math.PI;
    return {
      strokeDashoffset: interpolate(progress.value, [0, 1], [circumference, 0]),
    };
  });

  const formatDisplayTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEmojiPress = (stage: FastingStage) => {
    console.log(`Emoji pressed: ${stage.name} (${elapsedHours.toFixed(1)} hours into fast)`);
    
    if (onViewStagesPress) {
      onViewStagesPress();
    } else {
      try {
        //@ts-expect-error due to navigation type issues
        navigation.navigate('FastingStages', { 
          currentElapsedHours: elapsedHours,
          selectedStageName: stage.name
        });
      } catch (error) {
        console.error('Navigation failed:', error);
        
        alert(`${stage.name} (${stage.minHours}-${stage.maxHours === Infinity ? '∞' : stage.maxHours}h): ${stage.description}\n\nBenefits: ${stage.benefits}`);
      }
    }
  };

  const renderEmojis = () => {
    if (!isActive) return null;

    return (
      <>
        {__DEV__ && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={size * 0.5 * 0.5}
            stroke="rgba(200, 200, 200, 0.2)"
            strokeWidth={1}
            fill="none"
          />
        )}

        {fastingStages.map((stage, index) => (
          <EmojiItem
            key={stage.name}
            stage={stage}
            index={index}
            elapsedHours={elapsedHours}
            size={size}
            emojiRadius={size}
            emojiSize={22} 
            onPress={handleEmojiPress}
          />
        ))}
      </>
    );
  };

  return (
    <Pressable
      onPress={isActive ? onEndPress : onStartPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Animated.View style={[styles.button, buttonAnimatedStyle]}>
        <LinearGradient
          colors={isActive ? ACTIVE_GRADIENT : gradient}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={[styles.innerCircle, innerCircleStyle]}>
            {isActive ? (
              <View style={styles.contentContainer}>
                <ThemedText style={styles.timeText}>
                  {formatDisplayTime(elapsedTime)}
                </ThemedText>
                <ThemedText style={styles.statusText}>Fasting</ThemedText>
                
                <ThemedText style={styles.debugText}>
                  {elapsedHours.toFixed(1)}h • {Platform.OS} • {fastingStages.length} stages
                </ThemedText>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                <ThemedText style={styles.startText}>Start</ThemedText>
                <ThemedText style={styles.startText}>Fasting</ThemedText>
              </View>
            )}
          </Animated.View>
        </LinearGradient>
        <View style={styles.absoluteContainer}>
          <Svg 
            width={size + 60}
            height={size + 60} 
            viewBox={`${-30} ${-30} ${size + 60} ${size + 60}`}
          >
            <AnimatedG 
              transform={`rotate(-90, ${size/2}, ${size/2})`}
              animatedProps={animatedGProps} 
            >
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={(size - 10) / 2}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={4}
                fill="transparent"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={(size - 10) / 2}
                stroke="rgba(255, 255, 255, 0.9)"
                strokeWidth={4}
                fill="transparent"
                strokeDasharray={`${(size - 10) * Math.PI}`}
                strokeLinecap="round"
                animatedProps={progressAnimatedProps}
              />
            </AnimatedG>

            {renderEmojis()}
          </Svg>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: 'white',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a7ea4',
    lineHeight: 28,
  },
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  debugText: {
    fontSize: 9,
    color: '#999',
    marginTop: 4,
  },
});