import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersModule } from './sellers/sellers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { QueryModule } from './query/query.module';
import { PiersModule } from './piers/piers.module';
import { CashFlowVersionsModule } from './cash-flow-versions/cash-flow-versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      name: 'postgresConnectionPierce',
      type: 'postgres',
      host: process.env.DB_HOST_PIERS,
      port: +process.env.DB_PORT_PIERS,
      username: process.env.DB_USERNAME_PIERS,
      password: process.env.DB_PASSWORD_PIERS,
      database: process.env.DB_NAME_PIERS,
      autoLoadEntities: true,
      ssl: {
        rejectUnauthorized: false, // Desactiva la validación del hostname
      },
    }),
    TypeOrmModule.forRoot({
      name: 'postgresConnection',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forRoot({
      name: 'mssqlConnection',
      type: 'mssql',
      host: process.env.DB_HOST_SQLS,
      port: +process.env.DB_PORT_SQLS,
      username: process.env.DB_USERNAME_SQLS,
      password: process.env.DB_PASSWORD_SQLS,
      database: process.env.DB_NAME_SQLS,
      autoLoadEntities: true,
      synchronize: true,

      options: {
        encrypt: true, // Necesario para Azure
        trustServerCertificate: true, // Desactiva la validación del hostname
      },
      extra: {
        requestTimeout: 300000, // Timeout aumentado a 5 minutos para consultas largas
      },
    }),
    AuthModule,
    SellersModule,
    DashboardModule,
    PiersModule,
    CashFlowVersionsModule,
    //QueryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
