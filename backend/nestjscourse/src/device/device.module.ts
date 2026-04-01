import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceController } from './device.controller';
import { SendCommandUseCase } from './use-cases/send-command.use-case';
import { IDownlinkPort } from './domain/downlink.port';
import { MqttModule } from '../mqtt/mqtt.module';
import { MqttService } from '../mqtt/mqtt.service';
import { DeviceEntity } from './entities/device.entity';
import { DeviceService } from './use-cases/device.service';
import { DeviceListener } from './use-cases/device.listener';

@Module({
  imports: [
    MqttModule,
    TypeOrmModule.forFeature([DeviceEntity]),
  ],
  controllers: [DeviceController],
  providers: [
    { provide: IDownlinkPort, useExisting: MqttService },
    SendCommandUseCase,
    DeviceService,
    DeviceListener,
  ],
  exports: [DeviceService],
})
export class DeviceModule {}
