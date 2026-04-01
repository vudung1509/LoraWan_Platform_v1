import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SendCommandUseCase } from './use-cases/send-command.use-case';
import { DeviceService } from './use-cases/device.service';
import { DeviceCommand } from './domain/device-command.model';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly sendCommand: SendCommandUseCase,
    private readonly deviceService: DeviceService,
  ) {}

  @Get()
  async findAll() {
    return this.deviceService.getAllDevices();
  }

  @Post(':devEui/command')
  async send(@Param('devEui') devEui: string, @Body() body: any) {
    const command = new DeviceCommand(devEui, body.commandType, body.applicationId);
    return this.sendCommand.execute(command);
  }
}
