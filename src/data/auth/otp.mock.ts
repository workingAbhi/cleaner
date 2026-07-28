import { OtpType } from '../../models';

export const MockOtp = {

  ownerPhoneNumber: '9999999999',

  otpMap: {

    [OtpType.PHONE]: '123456',

    [OtpType.MASTER]: '123456',

  },

};