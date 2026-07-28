import { Pagination } from './common';

export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;

  message: string;

  data: T[];

  pagination: Pagination;
}

export interface ApiError {
  success: false;

  message: string;

  code?: string;

  errors?: Record<string, string[]>;
}