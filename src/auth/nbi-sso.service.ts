import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface NbiSsoClaims {
  sub: string;
  email: string;
  roles: string[];
}

@Injectable()
export class NbiSsoService {
  private readonly issuer: string;
  private readonly audience: string[];
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly configService: ConfigService) {
    this.issuer = this.configService.getOrThrow<string>('NBI_AUTH_URL');
    this.audience = this.configService
      .getOrThrow<string>('NBI_PORTAL_CODES')
      .split(',')
      .map((code) => code.trim());
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
    );
  }

  async verifyToken(token: string): Promise<NbiSsoClaims> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: this.audience,
      });

      if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
        throw new Error('Invalid SSO claims');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
      };
    } catch {
      throw new UnauthorizedException('Token SSO inválido');
    }
  }
}
