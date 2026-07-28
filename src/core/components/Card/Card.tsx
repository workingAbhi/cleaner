import React, { PropsWithChildren } from 'react';

import { View, StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
} from '../../theme';

const Card = ({
  children,
}: PropsWithChildren) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    padding: Spacing.md,

    ...Shadows.sm,

    marginVertical: Spacing.sm,
  },
});

export default Card;