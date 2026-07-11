// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';

type AuthenticatedUser = {
  id: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async loginStaff(dto: LoginDto) {
    const user = await this.usersService.findForAuthentication(
      dto.email,
    );

    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const safeUser = this.usersService.toSafeUser(user);
    const tokens = await this.issueTokens(safeUser);

    await this.storeRefreshToken(
      safeUser.id,
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async refresh(
    user: AuthenticatedUser,
    currentRefreshToken: string,
  ) {
    if (!currentRefreshToken) {
      throw new UnauthorizedException();
    }

    const storedUser =
      await this.usersService.findWithRefreshToken(user.id);

    if (
      !storedUser?.isActive ||
      !storedUser.refreshTokenHash
    ) {
      throw new UnauthorizedException();
    }

    const refreshTokenMatches = await bcrypt.compare(
      currentRefreshToken,
      storedUser.refreshTokenHash,
    );

    if (!refreshTokenMatches) {
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException();
    }

    const safeUser = this.usersService.toSafeUser(storedUser);
    const tokens = await this.issueTokens(safeUser);

    await this.storeRefreshToken(
      safeUser.id,
      tokens.refreshToken,
    );

    return {
      ...tokens,
      user: safeUser,
    };
  }

  async logout(userId?: string): Promise<void> {
    if (userId) {
      await this.usersService.setRefreshTokenHash(userId, null);
    }
  }

  private async issueTokens(user: AuthenticatedUser) {
    const accessSecret =
      this.config.getOrThrow<string>('JWT_ACCESS_SECRET');

    const refreshSecret =
      this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        {
          sub: user.id,
          roles: user.roles,
          clientType: 'WEB_PORTAL',
          tokenType: 'access',
        },
        {
          secret: accessSecret,
          expiresIn: '15m',
        },
      ),
      this.jwt.signAsync(
        {
          sub: user.id,
          tokenType: 'refresh',
        },
        {
          secret: refreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await this.usersService.setRefreshTokenHash(
      userId,
      refreshTokenHash,
    );
  }
}