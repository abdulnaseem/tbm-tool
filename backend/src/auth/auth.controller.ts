// backend/src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  private getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      // sameSite: isProduction ? ('none' as const) : ('lax' as const),
      sameSite: 'none' as const,
      secure: true,
    };
  }

  @Post('login/staff')
  async loginStaff(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.auth.loginStaff(body);

    const cookieOptions = this.getCookieOptions();

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { ok: true };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const cookieOptions = this.getCookieOptions();

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    return { ok: true };
  }

  @Get('me')
  me(@Req() req: Request) {
    const token = req.cookies?.accessToken;
    if (!token) throw new UnauthorizedException();

    const payload = this.auth.getUserFromToken(token);
    if (!payload) throw new UnauthorizedException();

    const user = this.auth.findById(payload.sub);
    if (!user) throw new UnauthorizedException();

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
    };
  }
}