import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native'; 
import React from 'react';

import AccountIcon from '../../assets/icons/account.svg';
import ChartIcon from '../../assets/icons/chart.svg';
import HomeIcon from '../../assets/icons/home.svg';
import TargetIcon from '../../assets/icons/target.svg';
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
  color: string;
  size: number;
  routeName: keyof TabParamList;
  focused: boolean;
}

function TabBarIcon({ color, size, routeName }: Readonly<TabBarIconProps>) {
  switch (routeName) {
    case 'Home':
      return <HomeIcon width={size} height={size} fill={color} />;
    case 'Goals':
      return <TargetIcon width={size} height={size} fill={color} />;
    case 'Statistics':
      return <ChartIcon width={size} height={size} fill={color} />;
    case 'Profile':
      return <AccountIcon width={size} height={size} fill={color} />;
    default:
      return null;
  }
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
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} /> 
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}