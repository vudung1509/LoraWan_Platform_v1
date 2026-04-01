import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';

/**
 * Lắng nghe các sự kiện từ hệ thống để tách rời logic Device và Sensor.
 * Áp dụng mô hình Event-Driven theo kiến trúc Platform tổng quát.
 */
@Injectable()
export class DeviceListener {
  private readonly logger = new Logger(DeviceListener.name);

  constructor(private readonly deviceService: DeviceService) {}

  /**
   * Cập nhật trạng thái thiết bị mỗi khi có Uplink mới
   * @param payload { devEui: string }
   */
  @OnEvent('device.seen', { async: true })
  async handleDeviceSeenEvent(payload: { devEui: string }) {
    try {
      await this.deviceService.onDeviceSeen(payload.devEui);
    } catch (err) {
      this.logger.error(`Error processing device.seen for ${payload.devEui}`, err);
    }
  }
}
