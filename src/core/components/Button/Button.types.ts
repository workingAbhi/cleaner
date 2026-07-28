import { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'solid' | 'outline';

export interface ButtonProps {
  title: string;

  onPress: (event: GestureResponderEvent) => void;

  variant?: ButtonVariant;

  loading?: boolean;

  disabled?: boolean;

  fullWidth?: boolean;

  style?: StyleProp<ViewStyle>;
}