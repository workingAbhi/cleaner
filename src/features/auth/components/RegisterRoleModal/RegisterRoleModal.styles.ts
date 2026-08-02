import { StyleSheet } from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../../core/theme';

export default StyleSheet.create({

  overlay: {

    flex: 1,

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,0.45)',

    padding: Spacing.lg,

  },

  card: {

    width: '100%',

    backgroundColor: Colors.surface,

    borderRadius: Radius.xl,

    padding: Spacing.xl,

    position: 'relative',

  },

  closeButton: {

    position: 'absolute',

    right: 16,

    top: 16,

    zIndex: 100,

  },

  close: {

    fontSize: 22,

    color: Colors.textSecondary,

    fontWeight: '700',

  },

  title: {

    fontSize: 24,

    fontWeight: '700',

    color: Colors.text,

    marginBottom: 6,

  },

  subtitle: {

    color: Colors.textSecondary,

    marginBottom: Spacing.xl,

  },

  option: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: Spacing.lg,

    borderRadius: Radius.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    marginBottom: Spacing.md,

    backgroundColor: Colors.card,

  },

  icon: {

    fontSize: 32,

    marginRight: Spacing.md,

  },

  optionTextContainer: {

    flex: 1,

  },

  optionTitle: {

    fontSize: 17,

    fontWeight: '600',

    color: Colors.text,

  },

  optionSubtitle: {

    color: Colors.textSecondary,

    marginTop: 2,

  },

});