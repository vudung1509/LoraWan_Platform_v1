import { SensorReading } from './sensor-reading.model';

export const SENSOR_READING_REPOSITORY = 'SENSOR_READING_REPOSITORY';

export abstract class ISensorReadingRepository {
  abstract save(reading: SensorReading): Promise<void>;
  abstract findByDevEui(devEui: string, limit?: number): Promise<SensorReading[]>;
  abstract findLatestByDevEui(devEui: string): Promise<SensorReading | null>;
}
