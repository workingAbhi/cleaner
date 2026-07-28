import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Screen = {
  width,
  height,
};

export const Layout = {
  headerHeight: 60,
  tabBarHeight: 70,
  bottomSheetRadius: 24,

  avatarSmall: 36,
  avatarMedium: 48,
  avatarLarge: 72,

  buttonHeight: 52,

  inputHeight: 52,

  cardRadius: 16,
};