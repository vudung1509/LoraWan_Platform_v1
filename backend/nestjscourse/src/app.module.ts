import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MqttModule } from './mqtt/mqtt.module';
import { LorawanModule } from './lorawan/lorawan.module';
import { DeviceModule } from './device/device.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SensorModule } from './sensor/sensor.module';
import { AlertModule } from './alert/alert.module';

import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    MqttModule,
    LorawanModule,
    DeviceModule,
    SensorModule,
    AlertModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}