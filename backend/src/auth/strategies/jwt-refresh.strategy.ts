// backend/src/auth/strategies/jwt-refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RefreshJwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly usersService: UsersService,
    config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshJwtPayload) {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findWithRefreshToken(
      payload.sub,
    );

    if (!user?.isActive || !user.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    return {
      user: this.usersService.toSafeUser(user),
      refreshToken: req.cookies?.refreshToken,
    };
  }
}