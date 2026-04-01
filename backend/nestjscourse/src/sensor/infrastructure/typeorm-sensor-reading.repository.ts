import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISensorReadingRepository } from '../domain/sensor-reading.repository';
import { SensorReading } from '../domain/sensor-reading.model';
import { SensorReadingEntity } from './sensor-reading.entity';

@Injectable()
export class TypeOrmSensorReadingRepository implements ISensorReadingRepository {
  constructor(
    @InjectRepository(SensorReadingEntity)
    private readonly repo: Repository<SensorReadingEntity>,
  ) {}

  async save(reading: SensorReading): Promise<void> {
    const entity = this.repo.create({
      devEui: reading.devEui,
      temperature: reading.temperature ?? undefined,
      smoke: reading.smoke ?? undefined,
      humidity: reading.humidity ?? undefined,
      dust: reading.dust ?? undefined,
      co2: reading.co2 ?? undefined,
      rawPayload: reading.rawPayload,
      recordedAt: reading.recordedAt,
    });
    await this.repo.save(entity);
  }

  async findByDevEui(devEui: string, limit = 100): Promise<SensorReading[]> {
    const entities = await this.repo.find({
      where: { devEui },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
    return entities.map(e => new SensorReading({
      devEui: e.devEui,
      temperature: e.temperature,
      smoke: e.smoke,
      humidity: e.humidity,
      dust: e.dust,
      co2: e.co2,
      rawPayload: e.rawPayload,
      recordedAt: e.recordedAt,
    }));
  }

  async findLatestByDevEui(devEui: string): Promise<SensorReading | null> {
    const entity = await this.repo.findOne({ where: { devEui }, order: { recordedAt: 'DESC' } });
    if (!entity) return null;
    return new SensorReading({
      devEui: entity.devEui,
      temperature: entity.temperature,
      smoke: entity.smoke,
      humidity: entity.humidity,
      dust: entity.dust,
      co2: entity.co2,
      rawPayload: entity.rawPayload,
      recordedAt: entity.recordedAt,
    });
  }
}
