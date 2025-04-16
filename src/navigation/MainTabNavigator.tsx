import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native'; 
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import GoalsScreen from '../screens/GoalsScreen'; 
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

type TabParamList = {
  Home: undefined;
  Goals: undefined; 
  Statistics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
  routeName: keyof TabParamList;
}

function TabBarIcon({ focused, color, size, routeName }: Readonly<TabBarIconProps>) {
  let iconName = '';
  switch (routeName) {
    case 'Home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'Goals': 
      iconName = focused ? 'target' : 'target-variant'; 
      break;
    case 'Statistics':
      iconName = focused ? 'chart-bar' : 'chart-bar-stacked';
      break;
    case 'Profile':
      iconName = focused ? 'account' : 'account-outline';
      break;
  }
  return <Icon name={iconName || 'help-circle-outline'} size={size} color={color} />;
}

const screenOptions = ({ route }: { route: RouteProp<TabParamList, keyof TabParamList> }) => ({
  tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <TabBarIcon focused={focused} color={color} size={size} routeName={route.name} />
  ),
  tabBarActiveTintColor: '#0a7ea4',
  tabBarInactiveTintColor: 'gray',
  headerShown: false,
});

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={screenOptions} 
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} /> 
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}