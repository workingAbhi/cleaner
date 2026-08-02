import React from 'react';

import {
  Alert,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  Button,
  Input,
} from '../../../core/components';

import {
  OtpVerificationField,
  VerifyButton,
} from '../components';

import useAdminRegister from '../hooks/useAdminRegister';

import styles from './RegisterScreen.styles';

type Props = NativeStackScreenProps<any>;

const RegisterAdminScreen = ({
  navigation,
}: Props) => {

  const {

    form,

    updateField,

    loading,

    phoneOtpSent,

    masterOtpSent,

    phoneVerified,

    masterVerified,

    sendPhoneOtp,

    verifyPhoneOtp,

    sendMasterOtp,

    verifyMasterOtp,

    register,

  } = useAdminRegister();

  //------------------------------------------------

  const onRegister =
    async () => {

      const success =
        await register();

      if (!success) {
        return;
      }

      Alert.alert(

        'Registration Successful',

        'Administrator account created successfully.',

        [
          {
            text: 'OK',

            onPress: () =>
              navigation.replace(
                'Login',
              ),
          },
        ],

      );

    };

  //------------------------------------------------

  return (

    <ScrollView

      style={styles.container}

      contentContainerStyle={styles.content}

      keyboardShouldPersistTaps="handled"

      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>
        Administrator Registration
      </Text>

      {/* -------------------------------- */}

      <View style={styles.section}>

        <Input

          label="Name"

          value={form.name}

          onChangeText={text =>
            updateField(
              'name',
              text,
            )
          }

        />

      </View>

      {/* -------------------------------- */}

      <View style={styles.section}>

        <Input

          label="Password"

          secureTextEntry

          value={form.password}

          onChangeText={text =>
            updateField(
              'password',
              text,
            )
          }

        />

        <Input

          label="Confirm Password"

          secureTextEntry

          value={form.confirmPassword}

          onChangeText={text =>
            updateField(
              'confirmPassword',
              text,
            )
          }

        />

      </View>

      {/* -------------------------------- */}

      <View style={styles.section}>

        <Input

          label="Phone Number"

          keyboardType="phone-pad"

          editable={!phoneVerified}

          value={form.phoneNumber}

          onChangeText={text =>
            updateField(
              'phoneNumber',
              text,
            )
          }

        />

        {!phoneVerified &&
          !phoneOtpSent && (

          <VerifyButton

            title="Send OTP"

            onPress={
              sendPhoneOtp
            }

          />

        )}

        {phoneOtpSent &&
          !phoneVerified && (

          <OtpVerificationField

            label="Phone OTP"

            value={
              form.phoneOtp
            }

            verified={
              phoneVerified
            }

            onChange={text =>
              updateField(
                'phoneOtp',
                text,
              )
            }

            onVerify={
              verifyPhoneOtp
            }

          />

        )}

        {phoneVerified && (

          <Text
            style={
              styles.successText
            }>
            ✓ Phone Number Verified
          </Text>

        )}

      </View>

      {/* -------------------------------- */}

      <View style={styles.section}>

        {!masterVerified &&
          !masterOtpSent && (

          <VerifyButton

            title="Send Master OTP"

            onPress={
              sendMasterOtp
            }

          />

        )}

        {masterOtpSent &&
          !masterVerified && (

          <OtpVerificationField

            label="Master OTP"

            value={
              form.masterOtp
            }

            verified={
              masterVerified
            }

            onChange={text =>
              updateField(
                'masterOtp',
                text,
              )
            }

            onVerify={
              verifyMasterOtp
            }

          />

        )}

        {masterVerified && (

          <Text
            style={
              styles.successText
            }>
            ✓ Master OTP Verified
          </Text>

        )}

      </View>

      {/* -------------------------------- */}

      <View
        style={
          styles.registerContainer
        }>

        <Button

          title={
            loading
              ? 'Registering...'
              : 'Register'
          }

          loading={
            loading
          }

          onPress={
            onRegister
          }

        />

      </View>

    </ScrollView>

  );

};

export default RegisterAdminScreen;