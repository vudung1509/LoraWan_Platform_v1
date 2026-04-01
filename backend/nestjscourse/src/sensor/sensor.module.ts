import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorReadingEntity } from './infrastructure/sensor-reading.entity';
import { TypeOrmSensorReadingRepository } from './infrastructure/typeorm-sensor-reading.repository';
import { SENSOR_READING_REPOSITORY } from './domain/sensor-reading.repository';
import { SENSOR_CACHE_REPOSITORY } from './domain/sensor-cache.repository';
import { TIME_SERIES_REPOSITORY } from './domain/time-series.repository';
import { ProcessUplinkUseCase } from './use-cases/process-uplink.use-case';
import { GetSensorHistoryUseCase } from './use-cases/get-sensor-history.use-case';
import { SensorController } from './sensor.controller';
import { AlertModule } from '../alert/alert.module';
import { RedisService } from './infrastructure/redis.service';
import { InfluxService } from './infrastructure/influx.service';
import { RedisSensorCacheRepository } from './infrastructure/redis-sensor-cache.repository';
import { InfluxTimeSeriesRepository } from './infrastructure/influx-time-series.repository';

import { BullModule } from '@nestjs/bullmq';
import { UplinkProcessor } from './use-cases/uplink.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorReadingEntity]),
    AlertModule,
    BullModule.registerQueue({
      name: 'uplink',
    }),
  ],
  controllers: [SensorController],
  providers: [
    RedisService,
    InfluxService,
    UplinkProcessor,
    {
      provide: SENSOR_READING_REPOSITORY,
      useClass: TypeOrmSensorReadingRepository,
    },
    {
      provide: SENSOR_CACHE_REPOSITORY,
      useClass: RedisSensorCacheRepository,
    },
    {
      provide: TIME_SERIES_REPOSITORY,
      useClass: InfluxTimeSeriesRepository,
    },
    ProcessUplinkUseCase,
    GetSensorHistoryUseCase,
  ],
  exports: [ProcessUplinkUseCase, RedisService, InfluxService],
})
export class SensorModule {}
