import { Module } from '@nestjs/common';
import { LorawanService } from './lorawan.service';
import { SensorModule } from '../sensor/sensor.module';

@Module({
  imports: [SensorModule],
  providers: [LorawanService],
  exports: [LorawanService],
})
export class LorawanModule {}
