import { Controller, Post, Get, UseGuards, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@UseGuards(AuthGuard('jwt'))
@Controller('sensors/commands')
export class SensorCommandController {
  constructor(
    @InjectQueue('uplink') private readonly uplinkQueue: Queue,
    @InjectQueue('uplink-priority') private readonly priorityQueue: Queue,
  ) {}

  @Get('failed-jobs')
  async getFailedJobs() {
    const [standardFailed, priorityFailed] = await Promise.all([
      this.uplinkQueue.getFailed(),
      this.priorityQueue.getFailed(),
    ]);

    const formatJob = (job: any, source: string) => ({
      id: job.id,
      source,
      data: job.data,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
    });

    return [
      ...standardFailed.map(j => formatJob(j, 'STANDARD')),
      ...priorityFailed.map(j => formatJob(j, 'PRIORITY')),
    ];
  }

  @Post('replay-failed')
  async replayFailed() {
    const [standardFailed, priorityFailed] = await Promise.all([
      this.uplinkQueue.getFailed(),
      this.priorityQueue.getFailed(),
    ]);

    await Promise.all([
      ...standardFailed.map((job) => job.retry()),
      ...priorityFailed.map((job) => job.retry()),
    ]);

    return { 
      message: `Triggered replay for ${standardFailed.length + priorityFailed.length} jobs`,
      standardCount: standardFailed.length,
      priorityCount: priorityFailed.length
    };
  }
}
