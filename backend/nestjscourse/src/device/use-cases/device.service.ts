import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { DeviceEntity, DeviceStatus } from '../entities/device.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
  ) {}

  /**
   * Cập nhật trạng thái khi thiết bị hoạt động (Event-Driven)
   */
  async onDeviceSeen(devEui: string) {
    const device = await this.deviceRepo.findOne({ where: { devEui } });
    if (!device) return; // Theo yêu cầu: Không tự động đăng ký mới

    await this.deviceRepo.update(devEui, {
      lastSeen: new Date(),
      status: DeviceStatus.ONLINE,
    });
    
    this.logger.debug(`Device ${devEui} marked ONLINE`);
  }

  /**
   * Tác vụ quét tìm thiết bị mất kết nối (Heartbeat Check)
   * Chạy định kỳ mỗi 1 phút theo kế hoạch.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async heartbeatCheck() {
    const devices = await this.deviceRepo.find({
      where: { status: DeviceStatus.ONLINE },
    });

    const now = new Date();
    let offlineCount = 0;

    for (const device of devices) {
      if (!device.lastSeen) continue;

      const diffSeconds = (now.getTime() - device.lastSeen.getTime()) / 1000;
      if (diffSeconds > device.timeoutSeconds) {
        await this.deviceRepo.update(device.devEui, {
          status: DeviceStatus.OFFLINE,
        });
        this.logger.warn(`Device ${device.devEui} timed out and marked OFFLINE`);
        offlineCount++;
      }
    }

    if (offlineCount > 0) {
      this.logger.log(`Heartbeat summary: ${offlineCount} devices went OFFLINE`);
    }
  }

  async getAllDevices() {
    return this.deviceRepo.find();
  }
}
