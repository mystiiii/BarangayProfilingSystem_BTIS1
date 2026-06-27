import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResidentsModule } from './residents/residents.module';
import { HouseholdsModule } from './households/households.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'your_strong_password',
      database: process.env.DB_NAME || 'barangay_profiling_db',
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
      },
      autoLoadEntities: true,
      synchronize: false
    }),
    ResidentsModule,
    HouseholdsModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
