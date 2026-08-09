import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  card: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    backgroundColor: Colors.surface,

    borderRadius: Radius.lg,

    padding: Spacing.lg,

    borderWidth: 1,

    borderColor: Colors.border,

    marginBottom: Spacing.md,

  },

  left: {

    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,

  },

  status: {

    width: 42,

    height: 42,

    borderRadius: 21,

    borderWidth: 2,

    borderColor: Colors.primary,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: Spacing.md,

  },

  completedStatus: {

    backgroundColor: Colors.success,

    borderColor: Colors.success,

  },

  statusIcon: {

    fontSize: 18,

    fontWeight: '700',

    color: Colors.textInverse,

  },

  title: {

    fontSize: 17,

    fontWeight: '700',

    color: Colors.text,

  },

  subtitle: {

    marginTop: 4,

    color: Colors.textSecondary,

    fontSize: 13,

  },

  arrow: {

    fontSize: 28,

    color: Colors.textSecondary,

    fontWeight: '600',

  },

});