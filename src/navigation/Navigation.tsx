import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Animated } from 'react-native'; 

import MainTabNavigator from './MainTabNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/auth/AuthScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import FastingStagesScreen from '../screens/FastingStagesScreen';
import NotificationSettings from '../screens/NotificationSettings';
import OnboardingScreen from '../screens/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  SignIn: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Main: undefined;
  NotificationSettings: undefined;
  FastingStages: { currentElapsedHours?: number; selectedStageName?: string; sharedId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function Navigation() {
  const { hasCompletedOnboarding } = useAppContext();
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  const renderScreens = () => {
    if (!hasCompletedOnboarding) {
      return <Stack.Screen name="Onboarding" component={OnboardingScreen} />;
    } else if (user) {
      return (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }}/>
          <Stack.Screen
            name="FastingStages"
            component={FastingStagesScreen}
            options={{
              headerShown: false,
              gestureEnabled: false, 
              transitionSpec: {
                open: { animation: 'timing', config: { duration: 400 } },
                close: { animation: 'timing', config: { duration: 400 } },
              },
              cardStyleInterpolator: ({ current }: { 
                current: { progress: Animated.AnimatedInterpolation<number> } 
              }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettings}
            options={{
              headerShown: false,
              cardStyleInterpolator: ({ current }: { 
                current: { progress: Animated.AnimatedInterpolation<number> } 
              }) => ({
                cardStyle: {
                  opacity: current.progress,
                },
              }),
            }}
          />
        </>
      );
    } else {
      return (
        <>
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      );
    }
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {renderScreens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}