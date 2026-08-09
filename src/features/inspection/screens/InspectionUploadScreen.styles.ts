import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: Colors.background,

  },

  content: {

    padding: Spacing.lg,

    paddingBottom: 60,

  },

  back: {

    fontSize: 16,

    color: Colors.primary,

    marginBottom: Spacing.lg,

    fontWeight: '600',

  },

  imageContainer: {

    alignItems: 'center',

    marginBottom: Spacing.xl,

  },

  image: {

    width: 220,

    height: 220,

  },

  title: {

    fontSize: 28,

    fontWeight: '700',

    color: Colors.text,

  },

  description: {

    marginTop: Spacing.sm,

    marginBottom: Spacing.xl,

    color: Colors.textSecondary,

    lineHeight: 22,

  },

  preview: {

    marginTop: Spacing.xl,

    marginBottom: Spacing.xl,

  },

  previewTitle: {

    fontSize: 18,

    fontWeight: '700',

    marginBottom: Spacing.md,

    color: Colors.text,

  },

  placeholder: {

    height: 220,

    borderWidth: 2,

    borderStyle: 'dashed',

    borderColor: Colors.border,

    borderRadius: Radius.lg,

    justifyContent: 'center',

    alignItems: 'center',

  },

  placeholderText: {

    color: Colors.textSecondary,

  },

  referenceImage: {

    width: '100%',

    height: 230,

    resizeMode: 'contain',

    marginBottom: 24,

  },

  instructions: {

    marginBottom: 30,

  },

  point: {

    fontSize: 16,

    marginBottom: 10,

    color: Colors.textSecondary,

  },

  footer: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    gap: 12,

    marginTop: 40,

  },

});