import React from 'react';

import {
  Text,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Button,
} from '../../../core/components';

import styles from './LandingScreen.styles';

type Props = NativeStackScreenProps<any>;

const LandingScreen = ({
  navigation,
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>
          Cleaner
        </Text>

        <Text style={styles.subtitle}>
          Daily Outlet Inspection System
        </Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Sign In"
          onPress={() =>
            navigation.navigate('Login')
          }
        />

        <Button
          title="Register"
          variant="outline"
          onPress={() =>
            navigation.navigate(
              'Register',
            )
          }
        />
      </View>
    </View>
  );
};

export default LandingScreen;