import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../../../core/theme';

export default StyleSheet.create({

  container: {

    marginBottom: Spacing.xl,

  },

  logo: {

    fontSize: 26,

    fontWeight: '700',

    color: Colors.primary,

  },

  title: {

    marginTop: 8,

    fontSize: 24,

    fontWeight: '700',

    color: Colors.text,

  },

  subtitle: {

    marginTop: 6,

    color: Colors.textSecondary,

  },

});