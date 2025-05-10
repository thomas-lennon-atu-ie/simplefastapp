import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import Animated,
{
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

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

interface AnimatedFastButtonProps {
  isActive: boolean;
  elapsedTime: number;
  targetDuration: number | null;
  onStartPress: () => void;
  onEndPress: () => void;
  size?: number;
  gradient?: readonly [string, string, ...string[]];
  onViewStagesPress?: () => void;
  goalDuration?: number | null; 
}

const DEFAULT_GRADIENT = ['#0a7ea4', '#0a7ea4'] as const;

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
    dynamicIconSize = iconSize * 1.2; 
    dynamicOpacity = 1; 
  } else if (isStageMet) {
    dynamicIconSize = iconSize; 
    dynamicOpacity = 0.8; 
  } else {
    dynamicIconSize = iconSize * 0.9; 
    dynamicOpacity = 0.6; 
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
        zIndex: 20,      
        padding: 10, 
      }}
    >
      <LottieView
        ref={lottieRef}
        source={stage.lottieSource}
        style={{ 
          width: dynamicIconSize,  
          height: dynamicIconSize, 
          position: 'absolute',    
          top: -dynamicIconSize/2, 
          left: -dynamicIconSize/2, 
        }}
        autoPlay={true} 
        loop={isCurrentActiveStage}
        renderMode={Platform.OS === 'android' ? 'HARDWARE' : 'AUTOMATIC'}
      />
    </Pressable>
  );
};


export function AnimatedFastButton({ 
  isActive, 
  elapsedTime, 
  targetDuration, 
  onStartPress,  
  onEndPress: _onEndPress, 
  size = defaultButtonSize, 
  gradient = DEFAULT_GRADIENT,
  onViewStagesPress,
  goalDuration
}: Readonly<AnimatedFastButtonProps>) {
  const navigation = useNavigation();
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

  const _renderIcons = () => {
    if (!isActive) return null;
    const baseIconSize = size * 0.22; 
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


 
  const goalProgress = isActive && goalDuration ? Math.min(elapsedTime / goalDuration, 1) : 0;
  const isGoalReached = isActive && goalDuration && elapsedTime >= goalDuration;


  const circleRadius = (size - 10) / 2;
  const stroke = "#0a7ea4";
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * circleRadius;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.button, { width: size, height: size }]}>
        <LinearGradient
          colors={gradient}
          style={[styles.gradientContainer, { width: size, height: size, borderRadius: size / 2 }]}
        />
        
        {/* Goal progress indicator */}
        {isActive && goalDuration && (
          <Svg width={size} height={size} style={styles.goalProgressContainer}>
            {/* Dashed goal indicator circle */}
            <Circle
              stroke={isGoalReached ? "#4CAF50" : "#FF5722"}
              strokeWidth={3}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 4} 
              strokeDasharray="8,4" 
              opacity={0.8}
            />
            
            {/* Goal marker */}
            <Circle
              cx={size/2 + (size/2 - 4) * Math.sin(goalProgress * 2 * Math.PI)}
              cy={size/2 - (size/2 - 4) * Math.cos(goalProgress * 2 * Math.PI)}
              r={7}
              fill={isGoalReached ? "#4CAF50" : "#FF5722"}
            />
            
            {/* Goal text */}
            {isGoalReached ? (
              <SvgText
                x={size / 2}
                y={size - 24}
                textAnchor="middle"
                fill="#4CAF50"
                fontSize={12}
                fontWeight="bold"
              >
                Goal Reached!
              </SvgText>
            ) : (
              <SvgText
                x={size / 2}
                y={size - 24}
                textAnchor="middle"
                fill="#FF5722"
                fontSize={12}
                fontWeight="bold"
              >
                Goal: {(goalDuration / (1000 * 60 * 60)).toFixed(0)}h
              </SvgText>
            )}
          </Svg>
        )}
        
        {/* Inner animated circle showing progress */}
        <Pressable 
          onPress={!isActive ? onStartPress : undefined} 
          style={[
            styles.buttonPressable,
         
            isActive ? { pointerEvents: 'box-none' } : undefined
          ]}
        >
          <Animated.View style={[styles.innerCircle, { width: size * 0.9, height: size * 0.9 }]}>
            <View style={styles.contentContainer}>
              {isActive ? (
                <>
                  <ThemedText style={styles.timeText}>
                    {`${Math.floor(elapsedHours).toString().padStart(2, '0')}:${Math.floor((elapsedHours % 1) * 60).toString().padStart(2, '0')}`}
                  </ThemedText>
                  <ThemedText style={styles.statusText}>
                    {currentActiveStageName ?? "Fasting"}
                  </ThemedText>
                  {onViewStagesPress && (
                    <Pressable 
                      onPress={onViewStagesPress} 
                      style={{ 
                        marginTop: 5,
                        padding: 10,
                        zIndex: 25,  
                      }}
                    >
                      <ThemedText style={{ color: '#0a7ea4', fontSize: 12 }}>
                        View Stages
                      </ThemedText>
                    </Pressable>
                  )}
                </>
              ) : (
                <ThemedText style={styles.startText}>Start{'\n'}Fast</ThemedText>
              )}
            </View>
          </Animated.View>
        </Pressable>
        
        {/* Progress indicator circle */}
        {isActive && (
          <Svg
            width={size}
            height={size}
            style={StyleSheet.absoluteFill}
          >
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={circleRadius}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - (targetDuration ? Math.min(elapsedTime / targetDuration, 1) : 0))}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
        )}
        
        {_renderIcons()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
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
    position: 'absolute',
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
    textAlign: 'center',
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
  goalProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'box-none', 
  },
  buttonPressable: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
});