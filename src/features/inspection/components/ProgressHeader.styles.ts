import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  container: {

    marginBottom:
      Spacing.xl,

  },

  title: {

    fontSize: 24,

    fontWeight: '700',

    color: Colors.text,

  },

  subtitle: {

    marginTop: 6,

    color:
      Colors.textSecondary,

    marginBottom:
      Spacing.md,

  },

  track: {

    height: 10,

    borderRadius:
      Radius.lg,

    backgroundColor:
      Colors.border,

    overflow: 'hidden',

  },

  fill: {

    height: '100%',

    backgroundColor:
      Colors.primary,

  },

});