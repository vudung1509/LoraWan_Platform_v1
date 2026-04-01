import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;

    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('error', (err) => this.logger.error('Redis Error', err));
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  getClient(): Redis {
    return this.client;
  }
}
