import { Injectable, Logger } from '@nestjs/common';
import { IAlertRepository } from '../domain/alert.repository';
import { Alert } from '../domain/alert.model';
import { SensorReading } from '../../sensor/domain/sensor-reading.model';
const CircuitBreaker = require('opossum');

@Injectable()
export class TriggerAlertUseCase {
  private readonly logger = new Logger(TriggerAlertUseCase.name);
  private breaker: any;

  constructor(private readonly alertRepo: IAlertRepository) {
    this.breaker = new (CircuitBreaker as any)(
      (alert) => this.alertRepo.save(alert),
      {
        timeout: 3000, 
        errorThresholdPercentage: 50,
        resetTimeout: 10000, 
      }
    );

    this.breaker.on('open', () => this.logger.warn('Circuit Breaker [Alert] is OPEN'));
    this.breaker.on('halfOpen', () => this.logger.log('Circuit Breaker [Alert] is HALF-OPEN'));
    this.breaker.on('close', () => this.logger.log('Circuit Breaker [Alert] is CLOSED'));
  }

  async execute(reading: SensorReading): Promise<void> {
    const alertType = reading.getAlertType();
    if (!alertType) return;

    const alert = new Alert({
      devEui: reading.devEui,
      alertType,
      temperature: reading.temperature,
      smoke: reading.smoke,
    });

    try {
      await this.breaker.fire(alert);
      this.logger.warn(`ALERT [${alertType}] for ${reading.devEui} | smoke=${reading.smoke} temp=${reading.temperature}`);
    } catch (error) {
      this.logger.error(`Failed to trigger alert for ${reading.devEui} due to Circuit Breaker or Repository error: ${error.message}`);
    }
  }
}
