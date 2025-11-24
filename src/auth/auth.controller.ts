import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guard/local.guard';

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

  @Post('refresh')
  @UseGuards(LocalAuthGuard)
  async refresh(@Body() body: any) {
    return this.authService.refresh(body.refreshToken);
  }
}
