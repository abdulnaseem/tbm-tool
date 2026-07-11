// backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.accessToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (
      payload.tokenType !== 'access' ||
      payload.clientType !== 'WEB_PORTAL'
    ) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user?.isActive) {
      throw new UnauthorizedException();
    }

    return this.usersService.toSafeUser(user);
  }
}