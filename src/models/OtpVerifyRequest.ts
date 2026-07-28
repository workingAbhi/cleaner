import { OtpType } from './OtpType';

export interface OtpVerifyRequest {

  type: OtpType;

  otp: string;

}