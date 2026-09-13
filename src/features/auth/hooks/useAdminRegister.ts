import { useState } from 'react';
import { Alert } from 'react-native';

import {
  validatePasswordConfirmation,
  validatePhoneNumber,
} from '../../../core/constants/authValidation';
import {
  AuthApi,
  OtpApi,
} from '../../../core/services/api';

import {
  AdminRegisterRequest,
  OtpType,
} from '../../../models';

interface AdminRegisterForm {

  name: string;

  phoneNumber: string;

  password: string;

  confirmPassword: string;

  phoneOtp: string;

  masterOtp: string;

}

export default function useAdminRegister() {

  //--------------------------------------------------

  const [form, setForm] =
    useState<AdminRegisterForm>({

      name: '',

      phoneNumber: '',

      password: '',

      confirmPassword: '',

      phoneOtp: '',

      masterOtp: '',

    });

  //--------------------------------------------------

  const [
    apiError,
    setApiError,
  ] =
    useState<string | null>(null);

  const clearError = () =>
    setApiError(null);

  //--------------------------------------------------

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    phoneOtpSent,
    setPhoneOtpSent,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    masterOtpSent,
    setMasterOtpSent,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    phoneVerified,
    setPhoneVerified,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    masterVerified,
    setMasterVerified,
  ] =
    useState(false);

  //--------------------------------------------------

  const updateField = <
    K extends keyof AdminRegisterForm,
  >(
    key: K,
    value: AdminRegisterForm[K],
  ) => {

    setForm(previous => ({

      ...previous,

      [key]: value,

    }));

    //------------------------------------

    if (
      key === 'phoneNumber' &&
      phoneVerified
    ) {

      setPhoneVerified(false);

      setPhoneOtpSent(false);

      setForm(previous => ({

        ...previous,

        phoneOtp: '',

      }));

    }

  };

  //--------------------------------------------------

  const sendPhoneOtp =
    async () => {

      const phoneValidation = validatePhoneNumber(form.phoneNumber);
      if (!phoneValidation.valid) {
        Alert.alert(
          'Phone Number',
          phoneValidation.error ?? 'Please enter a valid phone number.',
        );
        return;
      }

      try {

        clearError();

        const result = await OtpApi.sendOtp({

          type:
            OtpType.PHONE,

          destination:
            form.phoneNumber,

        });

        setPhoneOtpSent(true);

        Alert.alert(
          'Success',
          result.devOtp
            ? `OTP sent. Dev code: ${result.devOtp}`
            : 'OTP sent successfully.',
        );

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Failed to send phone OTP.',
        );

      }

    };

  //--------------------------------------------------

  const verifyPhoneOtp =
    async () => {

      try {

        clearError();

        const verified =
          await OtpApi.verifyOtp({

            type:
              OtpType.PHONE,

            otp:
              form.phoneOtp,

            destination:
              form.phoneNumber,

          });

        if (!verified) {

          Alert.alert(
            'Invalid OTP',
            'Please enter valid OTP.',
          );

          return;

        }

        setPhoneVerified(true);

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Failed to verify phone OTP.',
        );

      }

    };

  //--------------------------------------------------

  const sendMasterOtp =
    async () => {

      try {

        clearError();

        const result = await OtpApi.sendOtp({

          type:
            OtpType.MASTER,

        });

        setMasterOtpSent(true);

        Alert.alert(
          'Success',
          result.devOtp
            ? `Master OTP sent to ${result.maskedPhone ?? 'owner'}. Dev code: ${result.devOtp}`
            : `Master OTP sent to ${result.maskedPhone ?? 'owner'}.`,
        );

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Failed to send master OTP.',
        );

      }

    };

  //--------------------------------------------------

  const verifyMasterOtp =
    async () => {

      try {

        clearError();

        const verified =
          await OtpApi.verifyOtp({

            type:
              OtpType.MASTER,

            otp:
              form.masterOtp,

          });

        if (!verified) {

          Alert.alert(
            'Invalid OTP',
            'Please enter valid Master OTP.',
          );

          return;

        }

        setMasterVerified(true);

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Failed to verify master OTP.',
        );

      }

    };

  //--------------------------------------------------

  const register =
    async () => {

      if (!form.name.trim()) {
        Alert.alert('Name', 'Please enter your name.');
        return false;
      }

      const phoneValidation = validatePhoneNumber(form.phoneNumber);
      if (!phoneValidation.valid) {
        Alert.alert('Phone Number', phoneValidation.error ?? 'Please enter a valid phone number.');
        return false;
      }

      const passwordValidation = validatePasswordConfirmation(
        form.password,
        form.confirmPassword,
      );
      if (!passwordValidation.valid) {
        Alert.alert('Password', passwordValidation.error ?? 'Please check your password.');
        return false;
      }

      if (!phoneVerified) {
        Alert.alert('OTP', 'Please verify phone OTP.');
        return false;
      }

      if (!masterVerified) {
        Alert.alert('Master OTP', 'Please verify Master OTP.');
        return false;
      }

      const request: AdminRegisterRequest = {

        name:
          form.name,

        phoneNumber:
          form.phoneNumber,

        password:
          form.password,

      };

      try {

        clearError();

        setLoading(true);

        await AuthApi.registerAdmin(
          request,
        );

        return true;

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Registration failed. Please try again.',
        );

        return false;

      } finally {

        setLoading(false);

      }

    };

  //--------------------------------------------------

  return {

    form,

    updateField,

    loading,

    apiError,

    clearError,

    phoneOtpSent,

    masterOtpSent,

    phoneVerified,

    masterVerified,

    sendPhoneOtp,

    verifyPhoneOtp,

    sendMasterOtp,

    verifyMasterOtp,

    register,

  };

}