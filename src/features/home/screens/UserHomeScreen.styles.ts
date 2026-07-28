import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor:
      Colors.background,

  },

  content: {

    padding: Spacing.lg,

    paddingBottom: 40,

  },

  rewardRow: {

    flexDirection: 'row',

    justifyContent:
      'space-between',

    marginTop: Spacing.md,

  },

});