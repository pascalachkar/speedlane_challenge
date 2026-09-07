import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public() @Post('register') async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.register(body);
    this.setCookie(response, result.token);
    return { user: result.user };
  }
  @Public() @HttpCode(200) @Post('login') async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(body.email, body.password);
    this.setCookie(response, result.token);
    return { user: result.user };
  }
  @HttpCode(204) @Post('logout') logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie('access_token', { httpOnly: true, sameSite: 'lax' });
  }
  @Get('me') me(@CurrentUser() user: AuthUser): { user: AuthUser } {
    return { user };
  }
  private setCookie(response: Response, token: string): void {
    const secure = process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production';
    response.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      maxAge: 15 * 60 * 1000,
    });
  }
}
