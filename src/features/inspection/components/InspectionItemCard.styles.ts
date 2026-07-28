import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  card: {

    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    padding: Spacing.lg,

    marginBottom: Spacing.lg,

  },

  title: {

    fontSize: 17,

    fontWeight: '700',

    color: Colors.text,

    marginBottom: Spacing.md,

  },

});