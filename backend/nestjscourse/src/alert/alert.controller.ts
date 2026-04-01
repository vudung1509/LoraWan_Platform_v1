import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetAlertsUseCase } from './use-cases/get-alerts.use-case';
import { AlertResponseDto } from './use-cases/alert-response.dto';
import { SensorQueryDto, DevEuiParamDto } from '../sensor/dto/sensor-query.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('alerts')
export class AlertController {
  constructor(private readonly getAlerts: GetAlertsUseCase) {}

  @Get()
  async getRecent(@Query() query: SensorQueryDto) {
    const alerts = await this.getAlerts.getRecent(query.limit || 50);
    return alerts.map(a => AlertResponseDto.fromDomain(a));
  }

  @Get(':devEui')
  async getByDevice(
    @Param() params: DevEuiParamDto,
    @Query() query: SensorQueryDto,
  ) {
    const alerts = await this.getAlerts.getByDevice(params.devEui, query.limit || 50);
    return alerts.map(a => AlertResponseDto.fromDomain(a));
  }
}
