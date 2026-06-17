// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  private users = [
    {
      id: '1',
      email: 'jamee@thebutterflymovement.health',
      passwordHash: bcrypt.hashSync('password123', 10),
      roles: ['COACH'],
    },
    {
      id: '2',
      email: 'abdulhannan@thebutterflymovement.health',
      passwordHash: bcrypt.hashSync('password123', 10),
      roles: ['SUPER_ADMIN'],
    },
    {
      id: '3',
      email: 'emon@thebutterflymovement.health',
      passwordHash: bcrypt.hashSync('password123', 10),
      roles: ['STAFF'],
    },
    {
      id: '4',
      email: 'naseem@thebutterflymovement.health',
      passwordHash: bcrypt.hashSync('password123', 10),
      roles: ['SUPER_ADMIN'],
    },
  ];

  findByEmail(email: string) {
    return this.users.find((u) => u.email === email);
  }

  findById(id: string) {
    return this.users.find((u) => u.id === id);
  }

  async loginStaff(body: { email: string; password: string }) {
    const user = this.findByEmail(body.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(body.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwt.sign(
      { sub: user.id, roles: user.roles, clientType: 'WEB_PORTAL' },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify(token);

      const user = this.users.find((u) => u.id === payload.sub);
      if (!user) throw new UnauthorizedException();

      const accessToken = this.jwt.sign(
        { sub: user.id, roles: user.roles, clientType: 'WEB_PORTAL' },
        { expiresIn: '15m' },
      );

      const refreshToken = this.jwt.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      return { accessToken, refreshToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  getUserFromToken(token: string) {
    try {
      return this.jwt.verify(token);
    } catch {
      return null;
    }
  }
}
