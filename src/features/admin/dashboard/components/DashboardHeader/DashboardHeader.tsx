import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import { useAuth } from '../../../../../core/context';

import styles from './DashboardHeader.styles';

const DashboardHeader = () => {

  const { user } =
    useAuth();

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        BPCL
      </Text>

      <Text style={styles.title}>
        Territory Dashboard
      </Text>

      <Text style={styles.subtitle}>
        Welcome,
        {' '}
        {user?.name}
      </Text>

    </View>

  );

};

export default DashboardHeader;