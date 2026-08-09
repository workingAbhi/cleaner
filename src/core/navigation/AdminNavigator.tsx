import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  DashboardScreen,
} from '../../features/admin/dashboard';

import {
  ProfileScreen,
} from '../../features/profile';

const Tab =
  createBottomTabNavigator();

const AdminNavigator = () => {

  return (

    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}>

      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
      />

    </Tab.Navigator>

  );

};

export default AdminNavigator;