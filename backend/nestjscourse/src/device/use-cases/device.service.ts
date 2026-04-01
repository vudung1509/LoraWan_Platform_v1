import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity, DeviceStatus } from '../entities/device.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepo: Repository<DeviceEntity>,
  ) {}

  // Sync status on activity
  async onDeviceSeen(devEui: string) {
    const device = await this.deviceRepo.findOne({ where: { devEui } });
    if (!device) return;

    await this.deviceRepo.update(devEui, {
      lastSeen: new Date(),
      status: DeviceStatus.ONLINE,
    });
  }

  // Heartbeat check (Every 1m)
  @Cron(CronExpression.EVERY_MINUTE)
  async heartbeatCheck() {
    const devices = await this.deviceRepo.find({ where: { status: DeviceStatus.ONLINE } });
    const now = new Date();

    for (const device of devices) {
      if (!device.lastSeen) continue;
      const diff = (now.getTime() - device.lastSeen.getTime()) / 1000;
      if (diff > device.timeoutSeconds) {
        await this.deviceRepo.update(device.devEui, { status: DeviceStatus.OFFLINE });
        this.logger.warn(`Device ${device.devEui} OFFLINE`);
      }
    }
  }

  async getAllDevices() {
    return this.deviceRepo.find();
  }
}
