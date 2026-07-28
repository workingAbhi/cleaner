import React from 'react';

import {
  useAuth,
} from '../../../core/context';

import {
  UserRole,
} from '../../../models';

import UserHomeScreen from './UserHomeScreen';
//import AdminHomeScreen from './AdminHomeScreen';

import {
  DashboardScreen as AdminHomeScreen,
} from '../../admin/dashboard';

const HomeScreen = () => {

  const { user } = useAuth();

  if (
    user?.role === UserRole.ADMIN
  ) {

    return (
      <AdminHomeScreen />
    );

  }

  return (
    <UserHomeScreen />
  );

};

export default HomeScreen;