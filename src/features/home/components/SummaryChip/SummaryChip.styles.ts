import { StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../../core/theme';

export default StyleSheet.create({

  container: {

    backgroundColor: Colors.primary,

    borderRadius: Radius.md,

    paddingVertical: Spacing.md,

    paddingHorizontal: Spacing.lg,

    alignItems: 'center',

    minWidth: 90,

  },

  value: {

    fontSize: 20,

    fontWeight: '700',

    color: Colors.textInverse,

  },

  label: {

    marginTop: 4,

    color: Colors.textInverse,

    fontSize: 12,

  },

});