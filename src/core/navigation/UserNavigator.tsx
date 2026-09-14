import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

// @ts-ignore — react-native-vector-icons has no bundled types
import Ionicons from 'react-native-vector-icons/Ionicons';

import UserHomeScreen from '../../features/home/screens/UserHomeScreen';

import {
  RewardsScreen,
} from '../../features/rewards';

import {
  ProfileScreen,
} from '../../features/profile';

import InspectionNavigator from '../../features/inspection/navigation/InspectionNavigator';

import {
  UserHomeStackParamList,
} from '../types';

import { Colors } from '../theme';

const Tab =
  createBottomTabNavigator();

const HomeStack =
  createNativeStackNavigator<UserHomeStackParamList>();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}>

      <HomeStack.Screen
        name="UserHome"
        component={UserHomeScreen}
      />

      <HomeStack.Screen
        name="Inspection"
        component={InspectionNavigator}
      />

    </HomeStack.Navigator>
  );
};

const UserNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}>

      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'gift' : 'gift-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

export default UserNavigator;
