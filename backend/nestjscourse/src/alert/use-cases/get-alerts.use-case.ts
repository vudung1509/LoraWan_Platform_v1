import { Injectable } from '@nestjs/common';
import { IAlertRepository } from '../domain/alert.repository';
import { Alert } from '../domain/alert.model';

@Injectable()
export class GetAlertsUseCase {
  constructor(private readonly alertRepo: IAlertRepository) {}

  async getRecent(limit = 50): Promise<Alert[]> {
    return this.alertRepo.findRecent(limit);
  }

  async getByDevice(devEui: string, limit = 50): Promise<Alert[]> {
    return this.alertRepo.findByDevEui(devEui, limit);
  }
}
