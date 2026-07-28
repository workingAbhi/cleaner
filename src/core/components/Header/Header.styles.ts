import { StyleSheet } from 'react-native';

import {
  Colors,
  Shadows,
  Spacing,
} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    height: 60,

    backgroundColor: Colors.surface,

    paddingHorizontal: Spacing.md,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    ...Shadows.sm,
  },

  title: {
    fontSize: 20,

    fontWeight: '700',

    color: Colors.text,
  },
});