import React, { useState } from 'react';

import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import {
  Button,
  Card,
  Input,
} from '../../../core/components';

import { useAuth } from '../../../core/context';

import { AuthApi } from '../../../core/services/api';

import { Spacing } from '../../../core/theme';

const LoginScreen = () => {
  const { login } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');

  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const user = await AuthApi.login(
        phoneNumber,
        password,
      );

      login(user);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        'Invalid phoneNumber or password.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Input
          label="Phone Number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Login"
          onPress={handleLogin}
        />
      </Card>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
});