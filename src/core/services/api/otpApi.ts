import { MockOtp } from '../../../data/auth';

import { OtpRequest, OtpType, OtpVerifyRequest } from '../../../models';

class OtpApi {

  async sendOtp(
   request: OtpRequest,
  ): Promise<void> {

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 800);
    });

    switch (request.type) {

      case OtpType.PHONE:

        console.log(
          `Mock Phone OTP sent to ${request.destination}`,
        );

        break;

      case OtpType.MASTER:

        console.log(
          `Mock Master OTP sent to ${MockOtp.ownerPhoneNumber}`,
        );

        break;
    }
  }

  async verifyOtp(
    request: OtpVerifyRequest,
  ): Promise<boolean> {

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    return (
      MockOtp.otpMap[request.type] === request.otp
    );
  }

  getOwnerPhoneNumber() {

    return MockOtp.ownerPhoneNumber;
  }

}

export default new OtpApi();