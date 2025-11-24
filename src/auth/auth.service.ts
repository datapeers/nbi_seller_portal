import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SellersService } from '..//sellers/sellers.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly sellerService: SellersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.sellerService.find(username);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid username or password');
    }
    delete user.password;
    delete user.temporalPassword;
    return { user };
  }

  async getUserByName(name: string): Promise<any> {
    const user = await this.sellerService.findByName(name);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    delete user.password;
    delete user.temporalPassword;
    return { user };
  }

  async getUser(id: string): Promise<any> {
    const user = await this.sellerService.findById(id);
    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    delete user.password;
    delete user.temporalPassword;
    return { user };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { username: user.user.name, sub: user.user.id };

    const accessToken = this.jwtService.sign(payload);
    const dec = this.jwtService.decode(accessToken);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refresh(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.SECRET_SEED,
    });
    const user = await this.getUserByName(payload.username);

    const payload2 = { username: user.user.name, sub: user.user.id };
    const accessToken = this.jwtService.sign(payload2, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload2, { expiresIn: '30d' });

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
