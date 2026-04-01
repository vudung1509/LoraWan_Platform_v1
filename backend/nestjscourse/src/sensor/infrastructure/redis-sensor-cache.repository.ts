import { Injectable } from '@nestjs/common';
import { ISensorCacheRepository } from '../domain/sensor-cache.repository';
import { SensorReading } from '../domain/sensor-reading.model';
import { RedisService } from './redis.service';

@Injectable()
export class RedisSensorCacheRepository implements ISensorCacheRepository {
  private readonly KEY_PREFIX = 'sensor:latest:';

  constructor(private readonly redis: RedisService) {}

  async upsert(reading: SensorReading): Promise<void> {
    const key = `${this.KEY_PREFIX}${reading.devEui}`;
    const data = {
      temperature: reading.temperature,
      smoke: reading.smoke,
      humidity: reading.humidity,
      co2: reading.co2,
      dust: reading.dust,
      recordedAt: reading.recordedAt.toISOString(),
    };
    
    // Cập nhật trạng thái mới nhất vào Redis
    await this.redis.getClient().set(key, JSON.stringify(data), 'EX', 86400);
  }

  async getLatest(devEui: string): Promise<SensorReading | null> {
    const data = await this.redis.getClient().get(`${this.KEY_PREFIX}${devEui}`);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return new SensorReading({
      devEui,
      temperature: parsed.temperature,
      smoke: parsed.smoke,
      humidity: parsed.humidity,
      co2: parsed.co2,
      dust: parsed.dust,
      recordedAt: new Date(parsed.recordedAt),
    });
  }
}
