import { OtpType } from './OtpType';

export interface OtpRequest {

  type: OtpType;

  destination?: string;

}