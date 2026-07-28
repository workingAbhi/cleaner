import { StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    fontSize: 14,

    color: Colors.text,

    marginBottom: Spacing.xs,

    fontWeight: '600',
  },

  input: {
    height: 52,

    borderRadius: Radius.md,

    borderWidth: 1,

    borderColor: Colors.border,

    backgroundColor: Colors.surface,

    paddingHorizontal: Spacing.md,

    color: Colors.text,

    fontSize: 16,
  },

  errorBorder: {
    borderColor: Colors.error,
  },

  errorText: {
    color: Colors.error,

    marginTop: 4,

    fontSize: 12,
  },
});