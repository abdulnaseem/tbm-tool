// web-admin/src/types/users.ts
import type { UserRole } from './auth';

export type ManagedUser = {
  id: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserPayload = {
  email: string;
  password: string;
  roles: UserRole[];
  isActive: boolean;
};

export type UpdateUserPayload = {
  email?: string;
  roles?: UserRole[];
  isActive?: boolean;
};