import { UserRole } from "./Role";

export interface RegisterRequest {
  name: string;
  roNumber: string;
  phoneNumber: string;
  password: string;
  role: UserRole;
}