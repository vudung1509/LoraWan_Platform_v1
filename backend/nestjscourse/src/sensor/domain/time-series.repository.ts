import { SensorReading } from './sensor-reading.model';

export const TIME_SERIES_REPOSITORY = 'TIME_SERIES_REPOSITORY';

export interface ITimeSeriesRepository {
  // Save to InfluxDB
  savePoint(reading: SensorReading): Promise<void>;

  // Query InfluxDB history
  queryHistory(devEui: string, start: string, stop: string): Promise<any[]>;
}
