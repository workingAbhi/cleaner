import React, { useEffect } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '../../../core/theme';

interface Props {
  navigation: any;
}

const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Landing');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Cleaner
      </Text>

      <ActivityIndicator
        size="large"
        color={Colors.primary}
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 34,

    fontWeight: '700',

    color: Colors.primary,

    marginBottom: 24,
  },
});