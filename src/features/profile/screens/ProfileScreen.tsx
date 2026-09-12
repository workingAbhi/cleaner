import React from 'react';

import {
  Alert,
  Text,
  View,
} from 'react-native';

import {
  Button,
} from '../../../core/components';

import {
  useAuth,
} from '../../../core/context';

import {
  Colors,
} from '../../../core/theme';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const onLogout = () => {
    Alert.alert(
      'Sign out',
      'Sign out of Cleaner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: () => {
            void logout();
          },
        },
      ],
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        padding: 24,
        justifyContent: 'center',
      }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: '700',
          color: Colors.text,
          marginBottom: 8,
        }}>
        {user?.name || 'Profile'}
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: Colors.textSecondary,
          marginBottom: 4,
        }}>
        Phone: {user?.phoneNumber ?? '—'}
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: Colors.textSecondary,
          marginBottom: 4,
        }}>
        Role: {user?.role ?? '—'}
      </Text>

      {user?.roNumber ? (
        <Text
          style={{
            fontSize: 15,
            color: Colors.textSecondary,
            marginBottom: 24,
          }}>
          RO: {user.roNumber}
        </Text>
      ) : (
        <View style={{ marginBottom: 24 }} />
      )}

      <Button
        title="Sign out"
        variant="danger"
        onPress={onLogout}
      />
    </View>
  );
};

export default ProfileScreen;
