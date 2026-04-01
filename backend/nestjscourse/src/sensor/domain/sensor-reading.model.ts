export interface SensorReadingProps {
  devEui: string;
  temperature: number | null;
  smoke: number | null;
  humidity: number | null;
  dust?: number | null;
  co2?: number | null;
  rawPayload?: any;
  recordedAt?: Date;
}

export class SensorReading {
  readonly devEui: string;
  readonly temperature: number | null;
  readonly smoke: number | null;
  readonly humidity: number | null;
  readonly dust: number | null;
  readonly co2: number | null;
  readonly rawPayload: any;
  readonly recordedAt: Date;

  constructor(props: SensorReadingProps) {
    this.devEui = props.devEui;
    this.temperature = props.temperature ?? null;
    this.smoke = props.smoke ?? null;
    this.humidity = props.humidity ?? null;
    this.dust = props.dust ?? null;
    this.co2 = props.co2 ?? null;
    this.rawPayload = props.rawPayload ?? null;
    this.recordedAt = props.recordedAt ?? new Date();
  }

  isFireAlarm(): boolean {
    // Ngưỡng cảnh báo sensor
    const smokeThreshold = 400;
    const temperatureThreshold = 60;
    const co2Threshold = 1000;

    const smokeTriggered = this.smoke !== null && this.smoke > smokeThreshold;
    const heatTriggered = this.temperature !== null && this.temperature > temperatureThreshold;
    const co2Triggered = this.co2 !== null && this.co2 > co2Threshold;

    return smokeTriggered || heatTriggered || co2Triggered;
  }

  getAlertType(): 'FIRE' | 'SMOKE' | 'HEAT' | 'CO2_HIGH' | null {
    const smokeTriggered = this.smoke !== null && this.smoke > 400;
    const heatTriggered = this.temperature !== null && this.temperature > 60;
    const co2Triggered = this.co2 !== null && this.co2 > 1000;

    if (smokeTriggered && heatTriggered) return 'FIRE';
    if (smokeTriggered) return 'SMOKE';
    if (heatTriggered) return 'HEAT';
    if (co2Triggered) return 'CO2_HIGH';
    return null;
  }
}
