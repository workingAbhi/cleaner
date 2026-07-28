import { StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: Radius.md,

    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: Spacing.lg,
  },

  fullWidth: {
    width: '100%',
  },

  primary: {
    backgroundColor: Colors.primary,
  },

  secondary: {
    backgroundColor: Colors.surface,
  },

  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  danger: {
    backgroundColor: Colors.error,
  },

  disabled: {
    opacity: 0.5,
  },

  primaryText: {
    color: Colors.textInverse,

    fontWeight: '600',

    fontSize: 16,
  },

  secondaryText: {
    color: Colors.text,

    fontWeight: '600',

    fontSize: 16,
  },

  outlineText: {
    color: Colors.primary,

    fontWeight: '600',

    fontSize: 16,
  },

  dangerText: {
    color: Colors.textInverse,

    fontWeight: '600',

    fontSize: 16,
  },
});