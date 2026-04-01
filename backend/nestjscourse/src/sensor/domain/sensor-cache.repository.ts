import { SensorReading } from './sensor-reading.model';

export const SENSOR_CACHE_REPOSITORY = 'SENSOR_CACHE_REPOSITORY';

export interface ISensorCacheRepository {
  /**
   * Lưu trạng thái mới nhất của sensor vào Cache (RAM)
   */
  upsert(reading: SensorReading): Promise<void>;

  /**
   * Lấy trạng thái mới nhất của một sensor cụ thể
   */
  getLatest(devEui: string): Promise<SensorReading | null>;
}
