import React from 'react';

import {
  View,
} from 'react-native';

import {
  Input,
} from '../../../core/components';

import VerifyButton from './VerifyButton';

interface Props {

  label: string;

  value: string;

  verified: boolean;

  loading?: boolean;

  onChange(
    value: string,
  ): void;

  onVerify(): void;
}

const OtpVerificationField = ({
  label,
  value,
  verified,
  loading,
  onChange,
  onVerify,
}: Props) => {

  return (

    <View>

      <Input
        label={label}
        value={value}
        keyboardType="number-pad"
        onChangeText={onChange}
      />

      <VerifyButton
        title="Verify OTP"
        verified={verified}
        loading={loading}
        onPress={onVerify}
      />

    </View>
  );
};

export default OtpVerificationField;