import { MockOtp } from '../../../data/auth';

import { OtpRequest, OtpType, OtpVerifyRequest } from '../../../models';

import {
  AppConfig,
  isSupabaseConfigured,
  normalizePhone,
} from '../../config/appConfig';

import { invokeFunction } from '../supabaseClient';

type SendOtpResponse = {
  ok?: boolean;
  destination?: string;
  maskedPhone?: string;
  devOtp?: string;
  error?: string;
};

type VerifyOtpResponse = {
  ok?: boolean;
  error?: string;
};

class OtpApi {
  async sendOtp(request: OtpRequest): Promise<SendOtpResponse> {
    if (!isSupabaseConfigured()) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 800);
      });

      switch (request.type) {
        case OtpType.PHONE:
          console.log(`Mock Phone OTP sent to ${request.destination}`);
          break;
        case OtpType.MASTER:
          console.log(
            `Mock Master OTP sent to ${MockOtp.ownerPhoneNumber}`,
          );
          break;
      }

      return {
        ok: true,
        destination:
          request.type === OtpType.MASTER
            ? MockOtp.ownerPhoneNumber
            : request.destination,
        maskedPhone: '******9999',
        devOtp: MockOtp.otpMap[request.type],
      };
    }

    if (request.type === OtpType.MASTER) {
      return invokeFunction<SendOtpResponse>('send-master-otp', {});
    }

    const destination = normalizePhone(request.destination ?? '');
    if (destination.length < 10) {
      throw new Error('Phone number required to send OTP.');
    }

    return invokeFunction<SendOtpResponse>('send-otp', { destination });
  }

  async verifyOtp(request: OtpVerifyRequest): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      await new Promise<void>(resolve => {
        setTimeout(resolve, 500);
      });

      return MockOtp.otpMap[request.type] === request.otp;
    }

    if (request.type === OtpType.MASTER) {
      const result = await invokeFunction<VerifyOtpResponse>(
        'verify-master-otp',
        { otp: request.otp },
      );
      return Boolean(result.ok);
    }

    const destination = normalizePhone(request.destination ?? '');
    if (destination.length < 10) {
      return false;
    }

    const result = await invokeFunction<VerifyOtpResponse>('verify-otp', {
      destination,
      otp: request.otp,
    });

    return Boolean(result.ok);
  }

  async getOwnerPhoneNumber(): Promise<string> {
    if (!isSupabaseConfigured()) {
      return MockOtp.ownerPhoneNumber;
    }

    try {
      const response = await fetch(
        `${AppConfig.supabaseUrl.replace(/\/$/, '')}/rest/v1/app_settings?key=eq.master_owner_phone&select=value`,
        {
          headers: {
            apikey: AppConfig.supabaseAnonKey,
            Authorization: `Bearer ${AppConfig.supabaseAnonKey}`,
          },
        },
      );

      if (!response.ok) {
        return AppConfig.masterOwnerPhone;
      }

      const rows = (await response.json()) as Array<{ value: string }>;
      return rows[0]?.value || AppConfig.masterOwnerPhone;
    } catch {
      return AppConfig.masterOwnerPhone;
    }
  }
}

export default new OtpApi();
