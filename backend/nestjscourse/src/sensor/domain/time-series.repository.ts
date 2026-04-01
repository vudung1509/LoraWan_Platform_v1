import { SensorReading } from './sensor-reading.model';

export const TIME_SERIES_REPOSITORY = 'TIME_SERIES_REPOSITORY';

export interface ITimeSeriesRepository {
  /**
   * Lưu dữ liệu sensor vào hệ thống Time-series chuyên dụng (InfluxDB)
   */
  savePoint(reading: SensorReading): Promise<void>;

  /**
   * Truy vấn lịch sử từ Time-series DB 
   */
  queryHistory(devEui: string, start: string, stop: string): Promise<any[]>;
}
