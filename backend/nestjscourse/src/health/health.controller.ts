import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, TypeOrmHealthIndicator, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '../sensor/infrastructure/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redisService: RedisService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async () => {
        try {
          await this.redisService.getClient().ping();
          return { redis: { status: 'up' } };
        } catch (e) {
          throw new HealthCheckError('Redis check failed', { redis: { status: 'down', message: e.message } });
        }
      },
    ]);
  }
}
