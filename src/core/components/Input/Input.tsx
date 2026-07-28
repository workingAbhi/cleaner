import React from 'react';

import {
  Text,
  TextInput,
  View,
} from 'react-native';

import { styles } from './Input.styles';
import { InputProps } from './Input.types';

const Input: React.FC<InputProps> = ({
  label,

  error,

  containerStyle,

  keyboard,

  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {!!label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <TextInput
        {...props}
        keyboardType={keyboard}
        style={[
          styles.input,
          error && styles.errorBorder,
        ]}
      />

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;