// backend/src/auth/interfaces/jwt-payload.interface.ts
import { UserRole } from '../../users/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  roles: UserRole[];
  clientType: 'WEB_PORTAL';
  tokenType: 'access';
  iat?: number;
  exp?: number;
}

export interface RefreshJwtPayload {
  sub: string;
  tokenType: 'refresh';
  iat?: number;
  exp?: number;
}