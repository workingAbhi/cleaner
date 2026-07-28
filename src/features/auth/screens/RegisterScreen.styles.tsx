import { StyleSheet } from 'react-native';

import {
  Colors,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },

  content: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingBottom: 78,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },

  loading: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    color: Colors.primary,
    fontSize: 14,
  },

  section: {
    marginTop: Spacing.lg,

    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  button: {
    marginTop: Spacing.xl,
    marginBottom: 50,
  },
  success: {
    marginTop: Spacing.sm,
    color: Colors.success,
    fontWeight: '600',
  },

  bottom: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },

   registerContainer: {
    marginTop: Spacing.md,
    marginBottom: 40,
  },

  successText: {
    marginTop: 12,
    color: Colors.success,
    fontWeight: '600',
    fontSize: 15,
  },

});