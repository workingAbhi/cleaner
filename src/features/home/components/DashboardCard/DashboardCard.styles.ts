import { StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
} from '../../../../core/theme';

export default StyleSheet.create({

  card: {

    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    padding: Spacing.lg,

    marginBottom: Spacing.lg,

    ...Shadows.sm,

  },

});