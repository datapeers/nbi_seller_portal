import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local.guard';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SsoLoginDto } from './dto/sso-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getHello() {
    return 'Hello World!';
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }

  @Post('login-with-role')
  async loginWithRole(@Body() body: any) {
    return this.authService.loginWithRole(body.username, body.password);
  }

  @Post('refresh')
  async refresh(@Body() body: any) {
    return this.authService.refresh(body.refreshToken);
  }

  // ── OTP login (segundo portal) ────────────────────────────────────────────

  @Post('otp/request')
  async requestOtp(@Body() body: SendOtpDto) {
    await this.authService.requestOtp(body.email);
    return { message: 'Código enviado al correo' };
  }

  @Post('otp/login')
  async loginWithOtp(@Body() body: VerifyOtpDto) {
    return this.authService.loginWithOtp(body.email, body.code);
  }

  @Post('otp/refresh')
  async refreshOtp(@Body() body: any) {
    return this.authService.refreshOtp(body.refreshToken);
  }

  // ── NBI Auth SSO ────────────────────────────────────────────────────────

  @Post('sso')
  async loginWithSso(@Body() body: SsoLoginDto) {
    return this.authService.loginWithSso(body.token);
  }
}
