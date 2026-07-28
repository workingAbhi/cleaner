import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

interface Props {
  title: string;

  subtitle?: string;

  rightComponent?: React.ReactNode;
}

const ScreenHeader = ({
  title,
  subtitle,
  rightComponent,
}: Props) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>
          {title}
        </Text>

        {!!subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightComponent}
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',
  },

  title: {
    fontSize: 28,

    fontWeight: '700',

    color: Colors.text,
  },

  subtitle: {
    marginTop: 4,

    color: Colors.textSecondary,

    fontSize: 14,
  },
});