import { Inject, Injectable } from '@nestjs/common';
import { ISensorReadingRepository, SENSOR_READING_REPOSITORY } from '../domain/sensor-reading.repository';
import { SensorReading } from '../domain/sensor-reading.model';

@Injectable()
export class GetSensorHistoryUseCase {
  constructor(
    @Inject(SENSOR_READING_REPOSITORY)
    private readonly sensorRepo: ISensorReadingRepository
  ) {}

  async execute(devEui: string, limit = 100): Promise<SensorReading[]> {
    return this.sensorRepo.findByDevEui(devEui, limit);
  }
}
