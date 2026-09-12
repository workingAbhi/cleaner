import { OtpType } from './OtpType';

export interface OtpVerifyRequest {

  type: OtpType;

  otp: string;

  /** Required for PHONE OTP when using Supabase Edge Functions. */
  destination?: string;

}