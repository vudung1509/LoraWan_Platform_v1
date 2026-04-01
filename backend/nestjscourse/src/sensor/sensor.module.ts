import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorReadingEntity } from './infrastructure/sensor-reading.entity';
import { TypeOrmSensorReadingRepository } from './infrastructure/typeorm-sensor-reading.repository';
import { SENSOR_READING_REPOSITORY } from './domain/sensor-reading.repository';
import { SENSOR_CACHE_REPOSITORY } from './domain/sensor-cache.repository';
import { TIME_SERIES_REPOSITORY } from './domain/time-series.repository';
import { ProcessUplinkUseCase } from './use-cases/process-uplink.use-case';
import { GetSensorHistoryUseCase } from './use-cases/get-sensor-history.use-case';
import { SensorCommandController } from './sensor-command.controller';
import { SensorQueryController } from './sensor-query.controller';
import { AlertModule } from '../alert/alert.module';
import { RedisService } from './infrastructure/redis.service';
import { InfluxService } from './infrastructure/influx.service';
import { RedisSensorCacheRepository } from './infrastructure/redis-sensor-cache.repository';
import { InfluxTimeSeriesRepository } from './infrastructure/influx-time-series.repository';

import { BullModule } from '@nestjs/bullmq';
import { UplinkProcessor } from './use-cases/uplink.processor';
import { PriorityUplinkProcessor } from './use-cases/priority-uplink.processor';
import { InjectMetric, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Module({
  imports: [
    TypeOrmModule.forFeature([SensorReadingEntity]),
    AlertModule,
    BullModule.registerQueue(
      { name: 'uplink' },
      { name: 'uplink-priority' },
    ),
  ],
  controllers: [SensorCommandController, SensorQueryController],
  providers: [
    RedisService,
    InfluxService,
    UplinkProcessor,
    PriorityUplinkProcessor,
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
    makeCounterProvider({
      name: 'uplink_processed_total',
      help: 'Total number of LoRaWAN uplinks processed',
      labelNames: ['status'],
    }),
    makeHistogramProvider({
      name: 'uplink_processing_duration_seconds',
      help: 'Time taken to process a LoRaWAN uplink',
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
  ],
  exports: [ProcessUplinkUseCase, RedisService, InfluxService],
})
export class SensorModule {}
