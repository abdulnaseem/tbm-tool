export interface JwtPayload {
  sub: string;
  roles: string[];
  clientType: 'WEB_PORTAL';
  iat?: number;
  exp?: number;
}