import { BaseEntity } from '../core/types';

import { UserRole } from './Role';

export interface User extends BaseEntity {
  name: string;

  phoneNumber: string;

  /** Present only in mock store rows — never returned from Supabase Auth. */
  password?: string;

  role: UserRole;

  roNumber?: string;

  active: boolean;
}