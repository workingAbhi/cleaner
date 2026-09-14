import {
  StyleSheet,
} from 'react-native';

import {
  Colors,
  Radius,
  Spacing,
} from '../../../core/theme';

export default StyleSheet.create({

  //-------------------------------------
  // SCREEN
  //-------------------------------------

  container: {

    flex: 1,

    backgroundColor:
      Colors.background,

  },

  content: {

    padding:
      Spacing.lg,

    paddingBottom:
      60,

  },

  //-------------------------------------
  // LOADING / EMPTY STATES
  //-------------------------------------

  loadingContainer: {

    flex: 1,

    justifyContent:
      'center',

    alignItems:
      'center',

    backgroundColor:
      Colors.background,

  },

  emptyContainer: {

    flex: 1,

    justifyContent:
      'center',

    padding:
      Spacing.lg,

    backgroundColor:
      Colors.background,

  },

  emptyText: {

    textAlign:
      'center',

    marginBottom:
      Spacing.lg,

    color:
      Colors.text,

  },

  //-------------------------------------
  // HEADER / CONTENT
  //-------------------------------------

  back: {

    fontSize:
      16,

    color:
      Colors.primary,

    marginBottom:
      Spacing.lg,

    fontWeight:
      '600',

  },

  imageContainer: {

    alignItems:
      'center',

    marginBottom:
      Spacing.xl,

  },

  image: {

    width:
      220,

    height:
      220,

  },

  title: {

    fontSize:
      28,

    fontWeight:
      '700',

    color:
      Colors.text,

    marginBottom:
      Spacing.md,

  },

  description: {

    marginTop:
      Spacing.sm,

    marginBottom:
      Spacing.xl,

    color:
      Colors.textSecondary,

    lineHeight:
      22,

  },

  //-------------------------------------
  // REFERENCE IMAGE
  //-------------------------------------

  referenceImageWrap: {

    width: '100%',
    marginBottom: 24,
    minHeight: 230,

  },

  referenceImage: {

    width: '100%',

    height: 230,

    resizeMode: 'contain',

  },

  referenceImageHidden: {

    opacity: 0,
    height: 0,

  },

  referenceImageShimmer: {

    width: '100%',

  },

  //-------------------------------------
  // INSTRUCTIONS
  //-------------------------------------

  instructions: {

    marginBottom:
      30,

  },

  point: {

    fontSize:
      16,

    marginBottom:
      10,

    color:
      Colors.textSecondary,

    lineHeight:
      22,

  },

  //-------------------------------------
  // CAPTURED IMAGE
  //-------------------------------------

  capturedImageContainer: {

    position:
      'relative',

    width:
      '100%',

  },

  capturedImage: {

    width:
      '100%',

    height:
      320,

    borderRadius:
      16,

  },

  //-------------------------------------
  // IMAGE ACTION BUTTONS
  //-------------------------------------

  imageActions: {

    position:
      'absolute',

    bottom:
      16,

    left:
      0,

    right:
      0,

    flexDirection:
      'row',

    justifyContent:
      'center',

    alignItems:
      'center',

    gap:
      24,

  },

  retakeButton: {

    width:
      58,

    height:
      58,

    borderRadius:
      29,

    backgroundColor:
      '#EF4444',

    alignItems:
      'center',

    justifyContent:
      'center',

  },

  confirmButton: {

    width:
      58,

    height:
      58,

    borderRadius:
      29,

    backgroundColor:
      '#22C55E',

    alignItems:
      'center',

    justifyContent:
      'center',

  },

  imageActionText: {

    color:
      '#FFFFFF',

    fontSize:
      30,

    lineHeight:
      34,

    fontWeight:
      '700',

  },

  //-------------------------------------
  // FOOTER
  //-------------------------------------

  footer: {

    flexDirection:
      'row',

    alignItems:
      'center',

    gap:
      12,

    marginTop:
      24,

  },

  footerButton: {

    flex:
      1,

  },

  //-------------------------------------

  preview: {

    marginTop:
      Spacing.xl,

    marginBottom:
      Spacing.xl,

  },

  previewTitle: {

    fontSize:
      18,

    fontWeight:
      '700',

    marginBottom:
      Spacing.md,

    color:
      Colors.text,

  },

  placeholder: {

    height:
      220,

    borderWidth:
      2,

    borderStyle:
      'dashed',

    borderColor:
      Colors.border,

    borderRadius:
      Radius.lg,

    justifyContent:
      'center',

    alignItems:
      'center',

  },

  placeholderText: {

    color:
      Colors.textSecondary,

  },

});