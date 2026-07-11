// backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, CookieOptions } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { JwtService } from '@nestjs/jwt';

type AccessRequest = Request & {
  user: {
    id: string;
    email: string;
    roles: UserRole[];
    isActive: boolean;
  };
};

type RefreshRequest = Request & {
  user: {
    user: {
      id: string;
      email: string;
      roles: UserRole[];
      isActive: boolean;
    };
    refreshToken: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  private getCookieOptions(): CookieOptions {
    const isProduction =
      this.config.get<string>('NODE_ENV') === 'production';

    const configuredSameSite =
      this.config.get<string>('COOKIE_SAME_SITE');

    const sameSite: CookieOptions['sameSite'] =
      configuredSameSite === 'none'
        ? 'none'
        : configuredSameSite === 'strict'
          ? 'strict'
          : 'lax';

    return {
      httpOnly: true,
      secure: isProduction,
      sameSite,
      path: '/',
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const options = this.getCookieOptions();

    res.cookie('accessToken', accessToken, {
      ...options,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...options,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response): void {
    const options = this.getCookieOptions();

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
  }

  @Post('login/staff')
  @HttpCode(HttpStatus.OK)
  async loginStaff(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.loginStaff(dto);

    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    return {
      ok: true,
      user: result.user,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: RefreshRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.refresh(
      req.user.user,
      req.user.refreshToken,
    );

    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
    );

    return {
      ok: true,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
  
    if (refreshToken) {
      const decoded = this.jwt.decode(refreshToken) as {
        sub?: string;
      } | null;
  
      await this.authService.logout(decoded?.sub);
    }
  
    this.clearAuthCookies(res);
  
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AccessRequest) {
    return req.user;
  }
}