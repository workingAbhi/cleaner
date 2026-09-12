import { UserRole } from './Role';

export interface UserRegisterRequest {

  roNumber: string;

  phoneNumber: string;

  password: string;

  name?: string;

}

export interface AdminRegisterRequest {

  name: string;

  phoneNumber: string;

  password: string;

}

export interface RegisterRequest {

  role: UserRole;

  user?: UserRegisterRequest;

  admin?: AdminRegisterRequest;

}