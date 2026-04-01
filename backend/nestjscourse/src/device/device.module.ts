import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { SendCommandUseCase } from './use-cases/send-command.use-case';
import { IDownlinkPort } from './domain/downlink.port';
import { MqttModule } from '../mqtt/mqtt.module';
import { MqttService } from '../mqtt/mqtt.service';

@Module({
  imports: [MqttModule],
  controllers: [DeviceController],
  providers: [
    { provide: IDownlinkPort, useExisting: MqttService },
    SendCommandUseCase,
  ],
})
export class DeviceModule {}
