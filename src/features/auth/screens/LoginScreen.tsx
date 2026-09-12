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
import { AuthValidationRules } from '../../../core/constants/authValidation';

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
      const message =
        error instanceof Error ? error.message : 'Invalid phone number or password.';
      Alert.alert('Login Failed', message);
    }
  };

  return (
    <View style={styles.container}>
      <Card>
        <Input
          label="Phone Number"
          keyboardType="phone-pad"
          maxLength={AuthValidationRules.MAX_PHONE_DIGITS}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Input
          label="Password"
          maxLength={AuthValidationRules.MAX_PASSWORD_LENGTH}
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