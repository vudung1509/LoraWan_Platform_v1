import { Alert } from '../domain/alert.model';

export class AlertResponseDto {
  devEui: string;
  type: string;
  data: {
    temp: number | null;
    smoke: number | null;
  };
  time: string;

  static fromDomain(alert: Alert): AlertResponseDto {
    return {
      devEui: alert.devEui,
      type: alert.alertType,
      data: {
        temp: alert.temperature,
        smoke: alert.smoke,
      },
      time: alert.triggeredAt.toISOString(),
    };
  }
}
