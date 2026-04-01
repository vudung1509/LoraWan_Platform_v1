import { SensorReading } from '../domain/sensor-reading.model';

export class SensorReadingResponseDto {
  devEui: string;
  metrics: {
    temp: number | null;
    smoke: number | null;
    hum: number | null;
    co2: number | null;
    dust: number | null;
  };
  alarm: {
    isTriggered: boolean;
    type: string | null;
  };
  timestamp: string;

  static fromDomain(reading: SensorReading): SensorReadingResponseDto {
    return {
      devEui: reading.devEui,
      metrics: {
        temp: reading.temperature,
        smoke: reading.smoke,
        hum: reading.humidity,
        co2: reading.co2,
        dust: reading.dust,
      },
      alarm: {
        isTriggered: reading.isFireAlarm(),
        type: reading.getAlertType(),
      },
      timestamp: reading.recordedAt.toISOString(),
    };
  }
}
