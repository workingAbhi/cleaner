import { useState } from 'react';
import { Alert } from 'react-native';

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

      if (!form.phoneNumber.trim()) {

        Alert.alert(
          'Phone Number',
          'Please enter phone number.',
        );

        return;

      }

      await OtpApi.sendOtp({

        type:
          OtpType.PHONE,

        destination:
          form.phoneNumber,

      });

      setPhoneOtpSent(true);

      Alert.alert(
        'Success',
        'OTP sent successfully.',
      );

    };

  //--------------------------------------------------

  const verifyPhoneOtp =
    async () => {

      const verified =
        await OtpApi.verifyOtp({

          type:
            OtpType.PHONE,

          otp:
            form.phoneOtp,

        });

      if (!verified) {

        Alert.alert(
          'Invalid OTP',
          'Please enter valid OTP.',
        );

        return;

      }

      setPhoneVerified(true);

    };

  //--------------------------------------------------

  const sendMasterOtp =
    async () => {

      await OtpApi.sendOtp({

        type:
          OtpType.MASTER,

      });

      setMasterOtpSent(true);

      Alert.alert(
        'Success',
        'Master OTP sent.',
      );

    };

  //--------------------------------------------------

  const verifyMasterOtp =
    async () => {

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

    };

  //--------------------------------------------------

  const register =
    async () => {

      if (!form.name.trim()) {

        Alert.alert(
          'Name',
          'Please enter your name.',
        );

        return false;

      }

      if (!form.phoneNumber.trim()) {

        Alert.alert(
          'Phone Number',
          'Please enter phone number.',
        );

        return false;

      }

      if (!form.password) {

        Alert.alert(
          'Password',
          'Please enter password.',
        );

        return false;

      }

      if (
        form.password !==
        form.confirmPassword
      ) {

        Alert.alert(
          'Password',
          'Passwords do not match.',
        );

        return false;

      }

      if (!phoneVerified) {

        Alert.alert(
          'OTP',
          'Please verify phone OTP.',
        );

        return false;

      }

      if (!masterVerified) {

        Alert.alert(
          'Master OTP',
          'Please verify Master OTP.',
        );

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

        setLoading(true);

        await AuthApi.registerAdmin(
          request,
        );

        return true;

      } finally {

        setLoading(false);

      }

    };

  //--------------------------------------------------

  return {

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

  };

}