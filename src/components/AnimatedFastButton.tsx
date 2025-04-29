import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';

import { ThemedText } from './ThemedText';
import deepKetosisLottie from '../../assets/lottie/deep-ketosis.json';
import earlyFastingLottie from '../../assets/lottie/early-fasting.json';
import extendedLottie from '../../assets/lottie/extended.json';
import fedStateLottie from '../../assets/lottie/fed-state.json';
import ketosisLottie from '../../assets/lottie/ketosis.json';
import transitionLottie from '../../assets/lottie/transition.json';

interface FastingStage {
  minHours: number;
  maxHours: number;
  name: string;
  description: string;
  benefits: string;
  lottieSource: LottieView['props']['source'];
}

const fastingStages: FastingStage[] = [
  { minHours: 0, maxHours: 4, name: "Fed State", description: "Digesting and absorbing nutrients.", benefits: "Elevated blood sugar and insulin.", lottieSource: fedStateLottie },
  { minHours: 4, maxHours: 8, name: "Early Fasting", description: "Insulin drops; body uses stored glycogen.", benefits: "Starting to tap into reserves.", lottieSource: earlyFastingLottie },
  { minHours: 8, maxHours: 12, name: "Transition", description: "Glycogen depletes; body shifts to fat; autophagy begins.", benefits: "Metabolic shift initiating.", lottieSource: transitionLottie },
  { minHours: 12, maxHours: 16, name: "Ketosis Begins", description: "Fat converts to ketones; enhanced autophagy.", benefits: "Fat burning & cellular repair.", lottieSource: ketosisLottie },
  { minHours: 16, maxHours: 24, name: "Deep Ketosis", description: "Heavy reliance on ketones; peak cellular repair.", benefits: "Enhanced detoxification.", lottieSource: deepKetosisLottie },
  { minHours: 24, maxHours: Infinity, name: "Extended Fasting", description: "Maintains ketosis; boosts autophagy.", benefits: "Improved insulin sensitivity.", lottieSource: extendedLottie },
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

interface IconItemProps {
  stage: FastingStage;
  index: number;
  elapsedHours: number;
  size: number;
  iconRadius: number;
  iconSize: number;
  onPress: (stage: FastingStage) => void;
  isCurrentActiveStage: boolean;
}

const IconItem: React.FC<IconItemProps> = ({
  stage,
  index,
  elapsedHours,
  size,
  iconRadius,
  iconSize, 
  onPress,
  isCurrentActiveStage,
}) => {
  const isStageMet = elapsedHours >= stage.minHours;
  const totalStages = fastingStages.length;
  const lottieRef = useRef<LottieView>(null);
  const hasPlayedMetAnimation = useRef(false);

  const angleOffset = -Math.PI / 2;
  const angleIncrement = (2 * Math.PI) / totalStages;
  const angle = angleOffset + (index * angleIncrement);
  const radiusMultiplier = 0.5;
  const x = size / 2 + (iconRadius * radiusMultiplier) * Math.cos(angle);
  const y = size / 2 + (iconRadius * radiusMultiplier) * Math.sin(angle);


  let dynamicIconSize: number;
  let dynamicOpacity: number;

  if (isCurrentActiveStage) {
    dynamicIconSize = iconSize; 
    dynamicOpacity = 1; 
  } else if (isStageMet) {
    dynamicIconSize = iconSize * 0.8; 
    dynamicOpacity = 0.7;
  } else {
 
    dynamicIconSize = iconSize * 0.8;
    dynamicOpacity = 0.5; 
  }



  useEffect(() => {
    const lottieInstance = lottieRef.current;
    if (!lottieInstance) return;

    if (isCurrentActiveStage) {
      hasPlayedMetAnimation.current = false;
      lottieInstance.play();
    } else if (isStageMet) {
      if (!hasPlayedMetAnimation.current) {
        lottieInstance.play(0);
        hasPlayedMetAnimation.current = true;
      } else {
        lottieInstance.reset();  
      }
    } else {
      lottieInstance.reset();
      hasPlayedMetAnimation.current = false;
    }
  }, [isCurrentActiveStage, isStageMet]);



  const handlePress = () => {
    console.log(`IconItem handlePress for ${stage.name}`);
    onPress(stage);
  };


  return (
    <Pressable
      onPress={handlePress}
      style={{
        position: 'absolute',
        left: x - dynamicIconSize / 2,
        top: y - dynamicIconSize / 2,
        width: dynamicIconSize,
        height: dynamicIconSize,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: dynamicOpacity,
      }}
    >
      <LottieView
        ref={lottieRef}
        source={stage.lottieSource}
        style={{ width: dynamicIconSize, height: dynamicIconSize }}
        autoPlay={true} 
        loop={isCurrentActiveStage}
        renderMode={Platform.OS === 'android' ? 'HARDWARE' : 'AUTOMATIC'}
      />
    </Pressable>
  );
};

const AnimatedTimerText: React.FC<{ elapsedTime: number }> = ({ elapsedTime }) => {
  const totalSecondsValue = Math.max(0, Math.floor(elapsedTime / 1000));
  const hoursValue = Math.floor(totalSecondsValue / 3600);
  const minutesValue = Math.floor((totalSecondsValue % 3600) / 60);
  const secondsValue = totalSecondsValue % 60;
  const displayTime = `${hoursValue.toString().padStart(2, '0')}:${minutesValue.toString().padStart(2, '0')}:${secondsValue.toString().padStart(2, '0')}`;
  return <ThemedText style={styles.timeText}>{displayTime}</ThemedText>;
};

export function AnimatedFastButton({
  isActive,
  elapsedTime,
  targetDuration,
  onStartPress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const currentActiveStageName = fastingStages.slice().reverse().find(stage => elapsedHours >= stage.minHours)?.name;

  useEffect(() => {
    const percentComplete = targetDuration ? Math.min(elapsedTime / targetDuration, 1) : 0;
    if (isActive) {
      progress.value = withTiming(percentComplete, { duration: 500 });
    } else {
      progress.value = withTiming(0, { duration: 150 });
    }
  }, [elapsedTime, targetDuration, isActive, progress]);

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

  const handleIconPress = (stage: FastingStage) => {
    console.log(`Icon pressed: ${stage.name} (${elapsedHours.toFixed(1)} hours into fast)`);
    if (onViewStagesPress) {
      onViewStagesPress();
      return;
    }
    try {
      // @ts-expect-error Type definitions mismatch
      navigation.navigate('FastingStages', {
        currentElapsedHours: elapsedHours,
        selectedStageName: stage.name
      });
    } catch (error) {
      console.error('Navigation failed:', error);
      alert(`${stage.name} (${stage.minHours}-${stage.maxHours === Infinity ? '∞' : stage.maxHours}h)\n\n${stage.description}\n\nBenefits: ${stage.benefits}`);
    }
  };

  const renderIcons = () => {
    if (!isActive) return null;
    const baseIconSize = size * 0.18; 
    return (
      <>
        {fastingStages.map((stage, index) => (
          <IconItem
            key={stage.name}
            stage={stage}
            index={index}
            elapsedHours={elapsedHours}
            size={size}
            iconRadius={size}
            iconSize={baseIconSize} 
            onPress={handleIconPress}
            isCurrentActiveStage={stage.name === currentActiveStageName}
          />
        ))}
      </>
    );
  };

  const handleButtonPress = () => {
    if (isActive) {
      console.log("Main button pressed while active - no action (End Fast is separate).");
    } else {
      onStartPress();
    }
  };

  return (
    <Pressable
      onPress={handleButtonPress}
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
                <AnimatedTimerText elapsedTime={elapsedTime} />
                <ThemedText style={styles.statusText}>Fasting</ThemedText>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                <ThemedText style={styles.startText}>Start</ThemedText>
                <ThemedText style={styles.startText}>Fasting</ThemedText>
              </View>
            )}
          </Animated.View>
        </LinearGradient>

        <View style={styles.absoluteContainer} pointerEvents="none">
           <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <AnimatedG transform={`rotate(-90, ${size/2}, ${size/2})`} animatedProps={animatedGProps}>
              <Circle cx={size / 2} cy={size / 2} r={(size - 10) / 2} stroke="rgba(255, 255, 255, 0.3)" strokeWidth={4} fill="transparent" />
              <AnimatedCircle cx={size / 2} cy={size / 2} r={(size - 10) / 2} stroke="rgba(255, 255, 255, 0.9)" strokeWidth={4} fill="transparent" strokeDasharray={`${(size - 10) * Math.PI}`} strokeLinecap="round" animatedProps={progressAnimatedProps} />
            </AnimatedG>
          </Svg>
        </View>

        <View style={styles.absoluteContainer} pointerEvents="box-none">
             {renderIcons()}
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
    minWidth: 100,
    textAlign: 'center',
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
  },
  debugText: {
    fontSize: 9,
    color: '#999',
    marginTop: 4,
  },
});