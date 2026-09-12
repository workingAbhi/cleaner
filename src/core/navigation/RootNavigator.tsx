import React from 'react';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import { useAuth } from '../context';

import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';

import { UserRole } from '../../models';

import { Colors } from '../theme';

const RootNavigator = () => {
  const {
    isAuthenticated,
    user,
    isRestoring,
  } = useAuth();

  if (isRestoring) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === UserRole.ADMIN ? (
        <AdminNavigator />
      ) : (
        <UserNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
