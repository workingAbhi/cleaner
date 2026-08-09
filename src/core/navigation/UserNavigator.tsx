import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import UserHomeScreen from '../../features/home/screens/UserHomeScreen';

import {
  RewardsScreen,
} from '../../features/rewards';

import {
  ProfileScreen,
} from '../../features/profile';

import InspectionNavigator from '../../features/inspection/navigation/InspectionNavigator';

const Tab =
  createBottomTabNavigator();

const HomeStack =
  createNativeStackNavigator();

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
      }}>

      <Tab.Screen
        name="Home"
        component={HomeNavigator}
      />

      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />

    </Tab.Navigator>
  );
};

export default UserNavigator;