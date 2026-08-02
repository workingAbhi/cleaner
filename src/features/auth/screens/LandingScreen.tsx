import React, { useState } from 'react';

import {
  Text,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Button,
} from '../../../core/components';

import {
  RegisterRoleModal,
} from '../components';

import styles from './LandingScreen.styles';

type Props = NativeStackScreenProps<any>;

const LandingScreen = ({
  navigation,
}: Props) => {

  const [
    registerModalVisible,
    setRegisterModalVisible,
  ] = useState(false);

  const openRegister = () => {
    setRegisterModalVisible(true);
  };

  const closeRegister = () => {
    setRegisterModalVisible(false);
  };

  const navigateUserRegister = () => {
    closeRegister();

    navigation.navigate(
      'RegisterUser',
    );
  };

  const navigateAdminRegister = () => {
    closeRegister();

    navigation.navigate(
      'RegisterAdmin',
    );
  };

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
            navigation.navigate(
              'Login',
            )
          }
        />

        <Button
          title="Register"
          variant="outline"
          onPress={openRegister}
        />

      </View>

      <RegisterRoleModal
        visible={registerModalVisible}
        onClose={closeRegister}
        onUserPress={navigateUserRegister}
        onAdminPress={navigateAdminRegister}
      />

    </View>

  );

};

export default LandingScreen;