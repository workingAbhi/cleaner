import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: Colors.background,
  },

  content: {

    padding: Spacing.lg,

    paddingBottom: 120,
  },

  submitButton: {

    marginTop: Spacing.xl,

    marginBottom: 40,
  },
});