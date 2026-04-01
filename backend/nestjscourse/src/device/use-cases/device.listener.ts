import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  // Handler for device.seen
  @OnEvent('device.seen', { async: true })
  async handleDeviceSeenEvent(payload: { devEui: string }) {
    await this.deviceService.onDeviceSeen(payload.devEui);
  }
}
