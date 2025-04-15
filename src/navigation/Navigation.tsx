import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import MainTabNavigator from './MainTabNavigator';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/auth/AuthScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'; 
import RegisterScreen from '../screens/auth/RegisterScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  SignIn: undefined;
  Register: undefined;
  ForgotPassword: undefined; 
  Home: undefined; 
  Main: undefined;
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
      return <Stack.Screen name="Main" component={MainTabNavigator} />;
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