import { Controller, Get, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetSensorHistoryUseCase } from './use-cases/get-sensor-history.use-case';
import { SensorReadingResponseDto } from './use-cases/sensor-reading-response.dto';
import { SENSOR_CACHE_REPOSITORY } from './domain/sensor-cache.repository';
import type { ISensorCacheRepository } from './domain/sensor-cache.repository';
import { TIME_SERIES_REPOSITORY } from './domain/time-series.repository';
import type { ITimeSeriesRepository } from './domain/time-series.repository';
import { SensorQueryDto, DevEuiParamDto } from './dto/sensor-query.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('sensors/queries')
export class SensorQueryController {
  constructor(
    private readonly getSensorHistory: GetSensorHistoryUseCase,
    @Inject(SENSOR_CACHE_REPOSITORY)
    private readonly cacheRepo: ISensorCacheRepository,
    @Inject(TIME_SERIES_REPOSITORY)
    private readonly timeSeriesRepo: ITimeSeriesRepository,
  ) {}

  @Get(':devEui/latest')
  async getLatest(@Param() params: DevEuiParamDto) {
    const reading = await this.cacheRepo.getLatest(params.devEui);
    return reading ? SensorReadingResponseDto.fromDomain(reading) : { message: 'No data in cache' };
  }

  @Get(':devEui/history')
  async getHistory(
    @Param() params: DevEuiParamDto,
    @Query() query: SensorQueryDto,
  ) {
    const readings = await this.getSensorHistory.execute(
      params.devEui, 
      query.limit || 100
    );
    return readings.map(r => SensorReadingResponseDto.fromDomain(r));
  }

  @Get(':devEui/analytics')
  async getAnalytics(
    @Param() params: DevEuiParamDto,
    @Query() query: SensorQueryDto,
  ) {
    const data = await this.timeSeriesRepo.queryHistory(
      params.devEui, 
      query.range || '-24h', 
      'now()'
    );
    return data;
  }
}
