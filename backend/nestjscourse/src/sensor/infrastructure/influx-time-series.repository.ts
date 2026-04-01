import { Injectable, Logger } from '@nestjs/common';
import { Point } from '@influxdata/influxdb-client';
import { ITimeSeriesRepository } from '../domain/time-series.repository';
import { SensorReading } from '../domain/sensor-reading.model';
import { InfluxService } from './influx.service';

@Injectable()
export class InfluxTimeSeriesRepository implements ITimeSeriesRepository {
  private readonly logger = new Logger(InfluxTimeSeriesRepository.name);

  constructor(private readonly influx: InfluxService) {}

  async savePoint(reading: SensorReading): Promise<void> {
    const writeApi = this.influx.getWriteApi();
    if (!writeApi) return;

    const point = new Point('sensor_reading')
      .tag('devEui', reading.devEui)
      .floatField('temperature', reading.temperature ?? 0)
      .floatField('smoke', reading.smoke ?? 0)
      .floatField('humidity', reading.humidity ?? 0);

    if (reading.co2 !== null) point.floatField('co2', reading.co2);
    if (reading.dust !== null) point.floatField('dust', reading.dust);

    point.timestamp(reading.recordedAt);

    // Ghi dữ liệu vào InfluxDB
    writeApi.writePoint(point);
  }

  async queryHistory(devEui: string, start: string = '-24h', stop: string = 'now()'): Promise<any[]> {
    const queryApi = this.influx.getQueryApi();
    if (!queryApi) return [];

    // Validate devEui and range to prevent injection
    const isValidDevEui = /^[0-9a-fA-F]{16}$/.test(devEui);
    const isValidRange = /^-[0-9]+[smhdw]$/.test(start) || start === '-24h';

    if (!isValidDevEui || !isValidRange) {
      this.logger.error(`Invalid query parameters: devEui=${devEui}, range=${start}`);
      return [];
    }

    const fluxQuery = `
      from(bucket: "sensor_readings")
        |> range(start: ${start}, stop: ${stop})
        |> filter(fn: (r) => r["_measurement"] == "sensor_reading")
        |> filter(fn: (r) => r["devEui"] == "${devEui}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
    `;

    return queryApi.collectRows(fluxQuery);
  }
}
