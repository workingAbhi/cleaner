import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import { useAuth } from '../context';

import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import AdminNavigator from './AdminNavigator';

import { UserRole } from '../../models';

const RootNavigator = () => {

  const {
    isAuthenticated,
    user,
  } = useAuth();

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