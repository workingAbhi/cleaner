import { StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../../../core/theme';

export default StyleSheet.create({

  container: {

    marginBottom: Spacing.lg,

  },

  label: {

    fontWeight: '600',

    marginBottom: 6,

    color: Colors.text,

  },

  pickerContainer: {

    borderWidth: 1,

    borderColor: Colors.border,

    borderRadius: Radius.md,

    backgroundColor: Colors.surface,

  },

});