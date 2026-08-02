import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  LandingScreen,
  LoginScreen,
  RegisterAdminScreen,
  RegisterUserScreen,
  SplashScreen,
} from '../../features/auth/screens';

const Stack =
  createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}>

      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Landing"
        component={LandingScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="RegisterUser"
        component={RegisterUserScreen}
      />

      <Stack.Screen
        name="RegisterAdmin"
        component={RegisterAdminScreen}
      />

    </Stack.Navigator>
  );
};

export default AuthNavigator;