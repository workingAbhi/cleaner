import {
  KeyboardTypeOptions,
  StyleProp,
  TextInputProps,
  ViewStyle,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;

  error?: string;

  containerStyle?: StyleProp<ViewStyle>;

  keyboard?: KeyboardTypeOptions;
}