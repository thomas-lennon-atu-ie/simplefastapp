import React, { useEffect, useCallback } from 'react';
import { StyleSheet, Image, TouchableOpacity, Alert, View, Platform, Text } from 'react-native'; 
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated'; 

import logoImage from '../../assets/logo.png';
import { ThemedText } from '../components/ThemedText'; 
import { ThemedView } from '../components/ThemedView';

const AnimatedView = Animated.createAnimatedComponent(View); 
const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedText = Animated.createAnimatedComponent(Text); 

export default function HomeScreen() {
 
  const finalLogoY = -180; 
  const logoY = useSharedValue(0);
  const initialTaglineOpacity = useSharedValue(1); 
  const finalTaglineOpacity = useSharedValue(0); 
  const circleScale = useSharedValue(0);

  const startCircleAnimation = useCallback(() => {
    circleScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });
  }, [circleScale]); 

  useEffect(() => {
    const onFadeOutComplete = (finished?: boolean) => {
      if (finished) {       
       
        finalTaglineOpacity.value = withTiming(1, { duration: 300 }); 
        
        runOnJS(startCircleAnimation)();
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

    startAnimation();

  }, [logoY, initialTaglineOpacity, finalTaglineOpacity, circleScale, startCircleAnimation, finalLogoY]); 

 
  const logoContainerAnimatedStyle = useAnimatedStyle(() => {
   
    return {
      transform: [{ translateY: logoY.value }],
    };
  });

  const initialTaglineAnimatedStyle = useAnimatedStyle(() => {
   
    return {
      opacity: initialTaglineOpacity.value,
    };
  });

  const finalTaglineAnimatedStyle = useAnimatedStyle(() => {
   
    return {
      opacity: finalTaglineOpacity.value,
    };
  });

  const circleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: circleScale.value, 
    };
  });


  const handleStartFasting = () => {
    Alert.alert("Start Fasting", "Functionality coming soon!");
  };

  return (
    <ThemedView style={styles.container}>      

      <AnimatedView style={[styles.logoTaglineContainer, logoContainerAnimatedStyle]}>
        <AnimatedImage
          source={logoImage}
          style={styles.logo}
          resizeMode="contain"
        />  
       
        <View style={styles.taglinesWrapper}>
      
            <AnimatedText 
              style={[styles.taglineBase, styles.taglineInitial, initialTaglineAnimatedStyle]}
              numberOfLines={1} 
            >
                Your Simple Fasting Assistant
            </AnimatedText>
    
            <AnimatedText 
              style={[styles.taglineBase, styles.taglineFinal, styles.taglineHighlight, finalTaglineAnimatedStyle]}
              numberOfLines={1} 
            >
                Simple Fast
            </AnimatedText>
        </View>
      </AnimatedView>     

   
      <Animated.View style={[styles.circleContainer, circleAnimatedStyle]}>
        <TouchableOpacity style={styles.circleButton} onPress={handleStartFasting}>
          <ThemedText style={styles.buttonText}>Start fasting!</ThemedText>
        </TouchableOpacity>
      </Animated.View>
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
  logoTaglineContainer: {
    alignItems: 'center', 
    position: 'absolute', 
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10, 
  },
 
  taglinesWrapper: {
    alignItems: 'center', 
    justifyContent: 'center', 
    width: 300, 
    height: 30, 
  },
  
  taglineBase: {
    fontSize: 16,    
    color: '#555', 
    textAlign: 'center',
    
    position: 'absolute', 
    
    width: '100%', 
   
    top: 0,
    left: 0,
  },
 
  taglineInitial: {
     
  },

  taglineFinal: {
    
  },

  taglineHighlight: {
    fontWeight: 'bold',
  },
  
  circleContainer: {
    position: 'absolute', 
  },
  circleButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0a7ea4', 
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }
    })
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});