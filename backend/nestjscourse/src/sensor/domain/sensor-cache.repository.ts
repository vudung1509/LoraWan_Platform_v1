import { SensorReading } from './sensor-reading.model';

export const SENSOR_CACHE_REPOSITORY = 'SENSOR_CACHE_REPOSITORY';

export interface ISensorCacheRepository {
  // Upsert latest state to Cache
  upsert(reading: SensorReading): Promise<void>;

  // Get latest state by devEui
  getLatest(devEui: string): Promise<SensorReading | null>;
}
