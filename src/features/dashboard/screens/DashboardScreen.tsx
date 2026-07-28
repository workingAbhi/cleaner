import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Button,
  Card,
  Header,
} from '../../../core/components';

import { useAuth } from '../../../core/context';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

const DashboardScreen = () => {
  const { user, logout } =
    useAuth();

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />

      <Card>
        <Text style={styles.title}>
          Welcome {user?.firstName}
        </Text>

        <Text>
          Role : {user?.role}
        </Text>

        <View
          style={{
            marginTop: 20,
          }}>
          <Button
            title="Logout"
            variant="danger"
            onPress={logout}
          />
        </View>
      </Card>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: Colors.background,

    padding: Spacing.md,
  },

  title: {
    fontSize: 22,

    fontWeight: '700',

    marginBottom: 12,
  },
});