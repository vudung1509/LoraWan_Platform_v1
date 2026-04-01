import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { SensorModule } from '../sensor/sensor.module';

@Module({
  imports: [TerminusModule, SensorModule],
  controllers: [HealthController],
})
export class HealthModule {}
