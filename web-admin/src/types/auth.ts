// web-admin/src/types/auth.ts
export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'STAFF'
  | 'COACH';

export type AuthUser = {
  id: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginResponse = {
  ok: true;
  user: AuthUser;
};