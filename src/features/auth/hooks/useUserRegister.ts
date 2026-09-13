import { useState } from 'react';
import { Alert } from 'react-native';

import {
  validatePasswordConfirmation,
  validatePhoneNumber,
} from '../../../core/constants/authValidation';
import {
  AuthApi,
  MasterApi,
  OtpApi,
} from '../../../core/services/api';

import {
  OutletHierarchy,
  OtpType,
  UserRegisterRequest,
} from '../../../models';

interface UserRegisterForm {

  roNumber: string;

  phoneNumber: string;

  password: string;

  confirmPassword: string;

  phoneOtp: string;

}

export default function useUserRegister() {

  //--------------------------------------------------
  // Form
  //--------------------------------------------------

  const [form, setForm] =
    useState<UserRegisterForm>({
      roNumber: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      phoneOtp: '',
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
    hierarchy,
    setHierarchy,
  ] =
    useState<OutletHierarchy | null>(
      null,
    );

  //--------------------------------------------------

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    findingOutlet,
    setFindingOutlet,
  ] =
    useState(false);

  //--------------------------------------------------

  const [
    outletVerified,
    setOutletVerified,
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
    phoneVerified,
    setPhoneVerified,
  ] =
    useState(false);

  //--------------------------------------------------

  const updateField = <
    K extends keyof UserRegisterForm,
  >(
    key: K,
    value: UserRegisterForm[K],
  ) => {

    setForm(previous => ({

      ...previous,

      [key]: value,

    }));

    //----------------------------------------

    if (
      key === 'roNumber' &&
      outletVerified
    ) {

      setHierarchy(null);

      setOutletVerified(false);

    }

    //----------------------------------------

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

  const verifyOutlet =
    async () => {

      if (
        !form.roNumber.trim()
      ) {

        Alert.alert(
          'RO Number',
          'Please enter RO Number.',
        );

        return false;

      }

      try {

        clearError();

        setFindingOutlet(true);

        const result =
          await MasterApi.getOutletHierarchy(
            form.roNumber.trim(),
          );

        if (!result) {

          Alert.alert(
            'Invalid Outlet',
            'RO Number not found.',
          );

          setHierarchy(null);

          setOutletVerified(false);

          return false;

        }

        setHierarchy(result);

        setOutletVerified(true);

        return true;

      } catch (err) {

        setApiError(
          err instanceof Error
            ? err.message
            : 'Failed to verify outlet.',
        );

        return false;

      } finally {

        setFindingOutlet(false);

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

  const register =
    async () => {

      if (!outletVerified) {
        Alert.alert('Outlet', 'Please verify outlet.');
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

      const request:
        UserRegisterRequest = {

        roNumber:
          hierarchy!.outlet.roNumber,

        phoneNumber:
          form.phoneNumber,

        password:
          form.password,

      };

      try {

        clearError();

        setLoading(true);

        await AuthApi.registerUser(
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

  };

}