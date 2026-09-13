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
import { AuthValidationRules } from '../../../core/constants/authValidation';

import {
  ApiErrorBanner,
  OutletInfoCard,
  OtpVerificationField,
  VerifyButton,
} from '../components';

import useUserRegister from '../hooks/useUserRegister';

import styles from './RegisterScreen.styles';

type Props = NativeStackScreenProps<any>;

const RegisterUserScreen = ({
  navigation,
}: Props) => {

  const {

    form,
    updateField,

    hierarchy,

    loading,
    apiError,
    clearError,
    findingOutlet,

    outletVerified,

    phoneOtpSent,
    phoneVerified,

    verifyOutlet,

    sendPhoneOtp,

    verifyPhoneOtp,

    register,

  } = useUserRegister();

  //--------------------------------------------------

  const onRegister =
    async () => {

      try {

        const success = await register();

        if (!success) {
          return;
        }

        Alert.alert(

          'Registration Successful',

          'Outlet account created successfully.',

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

      } catch (err) {

        // Safety net — prevents unhandled promise rejection;
        // hook should have already set apiError.
        console.error('[RegisterUserScreen] unexpected error:', err);

      }

    };

  //--------------------------------------------------

  return (

    <ScrollView

      style={styles.container}

      contentContainerStyle={
        styles.content
      }

      keyboardShouldPersistTaps="handled"

      showsVerticalScrollIndicator={false}>

      <Text style={styles.title}>
        Outlet Registration
      </Text>

      {/* Error dialog — Modal manages its own visibility via `message` prop */}
      <ApiErrorBanner
        message={apiError}
        onDismiss={clearError}
      />

      {/* -------------------------------- */}

      <View style={styles.section}>

        <Input

          label="RO Number"

          value={
            form.roNumber
          }

          editable={
            !outletVerified
          }

          autoCapitalize="characters"

          onChangeText={text =>
            updateField(
              'roNumber',
              text,
            )
          }

        />

        {!outletVerified && (

          <VerifyButton

            title="Verify Outlet"

            loading={
              findingOutlet
            }

            onPress={
              verifyOutlet
            }

          />

        )}

        {hierarchy && (

          <OutletInfoCard
            hierarchy={
              hierarchy
            }
          />

        )}

      </View>

      {/* -------------------------------- */}

      <View style={styles.section}>

        <Input

          label="Password"

          secureTextEntry

          maxLength={AuthValidationRules.MAX_PASSWORD_LENGTH}

          value={
            form.password
          }

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

          maxLength={AuthValidationRules.MAX_PASSWORD_LENGTH}

          value={
            form.confirmPassword
          }

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

          maxLength={AuthValidationRules.MAX_PHONE_DIGITS}

          editable={
            !phoneVerified
          }

          value={
            form.phoneNumber
          }

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

export default RegisterUserScreen;