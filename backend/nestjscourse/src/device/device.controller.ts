import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { SendCommandUseCase } from './use-cases/send-command.use-case';
import { DeviceService } from './use-cases/device.service';

@Controller('devices')
export class DeviceController {
  constructor(
    private readonly sendCommand: SendCommandUseCase,
    private readonly deviceService: DeviceService,
  ) {}

  /**
   * Xem danh mục thiết bị và trạng thái (Fleet Status)
   */
  @Get()
  async findAll() {
    return this.deviceService.getAllDevices();
  }

  /**
   * Gửi lệnh xuống thiết bị (Downlink)
   */
  @Post(':devEui/command')
  async send(
    @Param('devEui') devEui: string,
    @Body() command: any,
  ) {
    return this.sendCommand.execute(devEui, command);
  }
}
