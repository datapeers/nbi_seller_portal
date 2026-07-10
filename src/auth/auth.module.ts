import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SellersModule } from 'src/sellers/sellers.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpCode } from './entities/otp-code.entity';
import { NbiSsoService } from './nbi-sso.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('SECRET_SEED'),
          signOptions: { expiresIn: '1y' },
        };
      },
    }),
    TypeOrmModule.forFeature([OtpCode], 'postgresConnection'),
    SellersModule,
  ],
  providers: [AuthService, JwtStrategy, NbiSsoService],
  controllers: [AuthController],
})
export class AuthModule {}
