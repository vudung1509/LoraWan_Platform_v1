import { Injectable, Logger } from '@nestjs/common';
import { IAlertRepository } from '../domain/alert.repository';
import { Alert } from '../domain/alert.model';
import { SensorReading } from '../../sensor/domain/sensor-reading.model';

@Injectable()
export class TriggerAlertUseCase {
  private readonly logger = new Logger(TriggerAlertUseCase.name);

  constructor(private readonly alertRepo: IAlertRepository) {}

  async execute(reading: SensorReading): Promise<void> {
    const alertType = reading.getAlertType();
    if (!alertType) return;

    const alert = new Alert({
      devEui: reading.devEui,
      alertType,
      temperature: reading.temperature,
      smoke: reading.smoke,
    });

    await this.alertRepo.save(alert);
    this.logger.warn(`ALERT [${alertType}] for ${reading.devEui} | smoke=${reading.smoke} temp=${reading.temperature}`);
  }
}
