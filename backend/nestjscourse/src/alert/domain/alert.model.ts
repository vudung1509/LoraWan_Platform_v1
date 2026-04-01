export type AlertType = 'FIRE' | 'SMOKE' | 'HEAT' | 'CO2_HIGH';

export interface AlertProps {
  devEui: string;
  alertType: AlertType;
  temperature: number | null;
  smoke: number | null;
  triggeredAt?: Date;
}

export class Alert {
  readonly devEui: string;
  readonly alertType: AlertType;
  readonly temperature: number | null;
  readonly smoke: number | null;
  readonly triggeredAt: Date;

  constructor(props: AlertProps) {
    this.devEui = props.devEui;
    this.alertType = props.alertType;
    this.temperature = props.temperature;
    this.smoke = props.smoke;
    this.triggeredAt = props.triggeredAt ?? new Date();
  }
}
