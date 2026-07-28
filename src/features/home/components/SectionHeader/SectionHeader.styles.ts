import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../../core/theme';

export default StyleSheet.create({

  container: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: Spacing.md,

  },

  left: {
    flex: 1,
  },

  title: {

    fontSize: 20,

    fontWeight: '700',

    color: Colors.text,

  },

  subtitle: {

    marginTop: 4,

    color: Colors.textSecondary,

    fontSize: 14,

  },

});