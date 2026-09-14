import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

// @ts-ignore — react-native-vector-icons has no bundled types
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  DashboardScreen,
} from '../../features/admin/dashboard';

import {
  ProfileScreen,
} from '../../features/profile';

import { Colors } from '../theme';

const Tab =
  createBottomTabNavigator();

const AdminNavigator = () => {

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
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
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

export default AdminNavigator;
