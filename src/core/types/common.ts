export type ID = string;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export interface BaseEntity {
  id: ID;

  createdAt: string;

  updatedAt: string;
}

export interface Pagination {
  page: number;

  pageSize: number;

  total: number;

  totalPages: number;
}

export interface SelectOption {
  label: string;

  value: string;
}