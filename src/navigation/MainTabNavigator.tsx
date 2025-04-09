import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import TimerScreen from '../screens/TimerScreen';

type TabParamList = {
  Home: undefined;
  Timer: undefined;
  Statistics: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();


const getTabBarIcon = (route: { name: string }) => {
  const TabBarIconComponent = ({
                                 focused,
                                 color,
                                 size,
                               }: {
    focused: boolean;
    color: string;
    size: number;
  }) => {
    let iconName: string;

    switch (route.name) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Timer':
        iconName = focused ? 'timer' : 'timer-outline';
        break;
      case 'Statistics':
        iconName = focused ? 'chart-bar' : 'chart-bar-stacked';
        break;
      case 'Profile':
        iconName = focused ? 'account' : 'account-outline';
        break;
      default:
        iconName = 'help';
        break;
    }

    return <Icon name={iconName} size={size} color={color} />;
  };
  
  TabBarIconComponent.displayName = `TabBarIcon_${route.name}`;
  return TabBarIconComponent;
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: getTabBarIcon(route),
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}