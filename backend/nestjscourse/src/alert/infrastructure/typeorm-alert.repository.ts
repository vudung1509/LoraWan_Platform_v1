import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAlertRepository } from '../domain/alert.repository';
import { Alert, AlertType } from '../domain/alert.model';
import { AlertEntity } from './alert.entity';

@Injectable()
export class TypeOrmAlertRepository implements IAlertRepository {
  constructor(
    @InjectRepository(AlertEntity)
    private readonly repo: Repository<AlertEntity>,
  ) {}

  async save(alert: Alert): Promise<void> {
    await this.repo.save({
      devEui: alert.devEui,
      alertType: alert.alertType,
      temperature: alert.temperature ?? undefined,
      smoke: alert.smoke ?? undefined,
      triggeredAt: alert.triggeredAt,
    });
  }

  private toModel(e: AlertEntity): Alert {
    return new Alert({
      devEui: e.devEui,
      alertType: e.alertType as AlertType,
      temperature: e.temperature ?? null,
      smoke: e.smoke ?? null,
      triggeredAt: e.triggeredAt,
    });
  }

  async findRecent(limit = 50): Promise<Alert[]> {
    const entities = await this.repo.find({ order: { triggeredAt: 'DESC' }, take: limit });
    return entities.map(e => this.toModel(e));
  }

  async findByDevEui(devEui: string, limit = 50): Promise<Alert[]> {
    const entities = await this.repo.find({
      where: { devEui },
      order: { triggeredAt: 'DESC' },
      take: limit,
    });
    return entities.map(e => this.toModel(e));
  }
}
