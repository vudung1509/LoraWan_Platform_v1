import { Module, forwardRef } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { LorawanModule } from '../lorawan/lorawan.module';
import { SensorModule } from '../sensor/sensor.module';

@Module({
  imports: [
    forwardRef(() => LorawanModule),
    SensorModule,
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}