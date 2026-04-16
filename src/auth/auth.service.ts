import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as sgMail from '@sendgrid/mail';
import { SellersService } from '..//sellers/sellers.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly sellerService: SellersService,
    private readonly jwtService: JwtService,
    @InjectRepository(OtpCode, 'postgresConnection')
    private readonly otpRepository: Repository<OtpCode>,
    private readonly configService: ConfigService,
  ) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

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
      const userAdmin = await this.sellerService.findRoleByName(name);
      if (!userAdmin) {
        throw new UnauthorizedException('Invalid username or password');
      }
      return { user: userAdmin };
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

  async loginWithRole(username: string, password: string) {
    const authData = await this.login(username, password);
    const user = authData.user.user;

    // Buscar el rol usando el code del usuario
    const roleData = await this.sellerService.findRoleByCode(+user.code);

    return {
      ...authData,
      role: roleData,
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

  async refreshOtp(token: string) {
    const payload = this.jwtService.verify(token, {
      secret: process.env.SECRET_SEED,
    });

    const role = await this.sellerService.findRoleByCode(+payload.sub);
    if (!role) {
      throw new UnauthorizedException('Token inválido');
    }

    const newPayload = { username: role.name, sub: role.code };
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(newPayload, { expiresIn: '30d' });

    return {
      user: { user: role },
      access_token: accessToken,
      refresh_token: refreshToken,
      role,
    };
  }

  // ── OTP login (segundo portal) ──────────────────────────────────────────────

  async requestOtp(email: string): Promise<void> {
    const role = await this.sellerService.findRoleByEmail(email);
    if (!role) {
      throw new NotFoundException('Email no encontrado');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidar códigos anteriores sin usar para este correo
    await this.otpRepository.update({ email, used: false }, { used: true });

    await this.otpRepository.save({ email, code, expiresAt, used: false });

    await sgMail.send({
      to: email,
      from: this.configService.get('SENDGRID_FROM_EMAIL'),
      subject: 'Access code',
      text: `Your access code is: ${code}. It expires in 10 minutes.`,
      html: `<p>Your access code is: <strong>${code}</strong></p><p>It expires in 10 minutes.</p>`,
    });
  }

  async loginWithOtp(email: string, code: string) {
    const role = await this.sellerService.findRoleByEmail(email);
    if (!role) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const otpRecord = await this.otpRepository.findOne({
      where: { email, code, used: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Código inválido');
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.otpRepository.update(otpRecord.id, { used: true });
      throw new UnauthorizedException('Código expirado');
    }

    await this.otpRepository.update(otpRecord.id, { used: true });

    const payload = { username: role.name, sub: role.code };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      user: { user: role },
      access_token: accessToken,
      refresh_token: refreshToken,
      role,
    };
  }
}
