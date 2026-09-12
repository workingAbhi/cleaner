import { useState } from 'react';
import { Alert } from 'react-native';

import {
  AuthApi,
  MasterApi,
  OtpApi,
} from '../../../core/services/api';

import {
  OutletHierarchy,
  OtpType,
  RegisterRequest,
  UserRole,
} from '../../../models';

interface RegisterForm {
  name: string;
  roNumber: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  phoneOtp: string;
  masterOtp: string;
}

export default function useRegister() {
  const [role, setRoleState] =
    useState<UserRole>(UserRole.USER);

  const [form, setForm] =
    useState<RegisterForm>({
      name: '',
      roNumber: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      phoneOtp: '',
      masterOtp: '',
    });

  const [
    hierarchy,
    setHierarchy,
  ] =
    useState<OutletHierarchy | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    findingOutlet,
    setFindingOutlet,
  ] =
    useState(false);

  const [
    outletVerified,
    setOutletVerified,
  ] =
    useState(false);

  const [
    phoneVerified,
    setPhoneVerified,
  ] =
    useState(false);

  const [
    masterVerified,
    setMasterVerified,
  ] =
    useState(false);

  const [
    phoneOtpSent,
    setPhoneOtpSent,
  ] =
    useState(false);

  const [
    masterOtpSent,
    setMasterOtpSent,
  ] =
    useState(false);

  //------------------------------------------------------

  const resetOutlet = () => {
    setHierarchy(null);
    setOutletVerified(false);

    setForm(previous => ({
      ...previous,
      roNumber: '',
    }));
  };

  //------------------------------------------------------

  const resetPhoneVerification =
    () => {

      setPhoneOtpSent(false);

      setPhoneVerified(false);

      setForm(previous => ({
        ...previous,
        phoneOtp: '',
      }));

    };

  //------------------------------------------------------

  const resetMasterVerification =
    () => {

      setMasterOtpSent(false);

      setMasterVerified(false);

      setForm(previous => ({
        ...previous,
        masterOtp: '',
      }));

    };

  //------------------------------------------------------

  const setRole = (
    newRole: UserRole,
  ) => {

    if (newRole === role) {
      return;
    }

    setRoleState(newRole);

    resetOutlet();

    resetPhoneVerification();

    resetMasterVerification();

  };

  //------------------------------------------------------

  const updateField = <
    K extends keyof RegisterForm,
  >(
    key: K,
    value: RegisterForm[K],
  ) => {

    setForm(previous => {

      const updated = {
        ...previous,
        [key]: value,
      };

      return updated;

    });

    //----------------------------------

    if (
      key === 'roNumber' &&
      outletVerified
    ) {

      setHierarchy(null);

      setOutletVerified(false);

    }

    //----------------------------------

    if (
      key === 'phoneNumber' &&
      phoneVerified
    ) {

      resetPhoneVerification();

    }

  };

  //------------------------------------------------------

  const verifyOutlet =
    async () => {

      if (
        role === UserRole.ADMIN
      ) {

        return true;

      }

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

        setFindingOutlet(
          true,
        );

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

      } finally {

        setFindingOutlet(false);

      }

    };

  //------------------------------------------------------

  const sendPhoneOtp =
    async () => {

      if (
        !form.phoneNumber.trim()
      ) {

        Alert.alert(
          'Phone Number',
          'Please enter phone number.',
        );

        return;

      }

      const result = await OtpApi.sendOtp({

        type: OtpType.PHONE,

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

    };

  //------------------------------------------------------

  const verifyPhoneOtp =
    async () => {

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

    };

  //------------------------------------------------------

  const sendMasterOtp =
    async () => {

      const result = await OtpApi.sendOtp({

        type:
          OtpType.MASTER,

      });

      setMasterOtpSent(true);

      Alert.alert(
        'Success',
        result.devOtp
          ? `Master OTP sent. Dev code: ${result.devOtp}`
          : 'Master OTP sent.',
      );

    };

  //------------------------------------------------------

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

  //------------------------------------------------------

  const register =
    async () => {

      if (!form.name.trim()) {

        Alert.alert(
          'Name',
          'Please enter your name.',
        );

        return false;

      }

      if (
        role === UserRole.USER &&
        !outletVerified
      ) {

        Alert.alert(
          'Outlet',
          'Please verify outlet.',
        );

        return false;

      }

      if (
        !form.phoneNumber.trim()
      ) {

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

      if (
        role === UserRole.ADMIN &&
        !masterVerified
      ) {

        Alert.alert(
          'Admin',
          'Please verify Master OTP.',
        );

        return false;

      }

      const request: RegisterRequest = {

        name:
          form.name,

        role,

        phoneNumber:
          form.phoneNumber,

        password:
          form.password,

        roNumber:
          role === UserRole.USER
            ? hierarchy!.outlet.roNumber
            : undefined,

      };

      try {

        setLoading(true);

        await AuthApi.register(
          request,
        );

        return true;

      } finally {

        setLoading(false);

      }

    };

  //------------------------------------------------------

  return {

    role,

    setRole,

    form,

    updateField,

    hierarchy,

    loading,

    findingOutlet,

    outletVerified,

    phoneVerified,

    masterVerified,

    phoneOtpSent,

    masterOtpSent,

    verifyOutlet,

    sendPhoneOtp,

    verifyPhoneOtp,

    sendMasterOtp,

    verifyMasterOtp,

    register,

  };

}