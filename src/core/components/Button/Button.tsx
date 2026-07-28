import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
} from 'react-native';

import { Colors } from '../../theme';

import { styles } from './Button.styles';
import { ButtonProps } from './Button.types';

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,

  variant = 'primary',

  loading = false,

  disabled = false,

  fullWidth = true,

  style,
}) => {
  const containerStyle = [
    styles.container,

    fullWidth && styles.fullWidth,

    styles[variant],

    disabled && styles.disabled,

    style,
  ];

  const textStyle = styles[
    `${variant}Text` as
      | 'primaryText'
      | 'secondaryText'
      | 'outlineText'
      | 'dangerText'
  ];

  return (
    <Pressable
      style={containerStyle}
      disabled={disabled || loading}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={Colors.textInverse} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;