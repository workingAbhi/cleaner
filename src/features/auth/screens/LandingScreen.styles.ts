import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.primary,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  buttons: {
    gap: Spacing.md,
  },
});