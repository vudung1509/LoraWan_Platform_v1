import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SendCommandUseCase } from './use-cases/send-command.use-case';
import { DeviceCommand } from './domain/device-command.model';
import { DeviceCommandDto } from './dto/device-command.dto';
import { DevEuiParamDto } from '../sensor/dto/sensor-query.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('devices')
export class DeviceController {
  constructor(private readonly sendCommand: SendCommandUseCase) {}

  @Post(':devEui/control')
  async control(
    @Param() params: DevEuiParamDto,
    @Body() commandDto: DeviceCommandDto,
  ) {
    const deviceCommand = new DeviceCommand(params.devEui, commandDto.command);
    return this.sendCommand.execute(deviceCommand);
  }
}
