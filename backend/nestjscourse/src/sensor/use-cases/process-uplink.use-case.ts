import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProcessUplinkUseCase {
  private readonly logger = new Logger(ProcessUplinkUseCase.name);

  constructor(
    @InjectQueue('uplink') 
    private readonly uplinkQueue: Queue,
  ) {}

  async execute(chirpstackData: any): Promise<void> {
    const devEui = chirpstackData.deviceInfo?.devEui;
    
    // Quick validation
    if (!devEui || !/^[0-9a-fA-F]{16}$/.test(devEui)) {
      this.logger.error(`Invalid devEui received via MQTT: ${devEui}`);
      return;
    }

    // Đẩy vào Queue để xử lý bất đồng bộ
    try {
      const isTest = process.env.NODE_ENV === 'test';
      await this.uplinkQueue.add('handleUplink', chirpstackData, {
        jobId: `${devEui}-${chirpstackData.fCnt}`, // Queue-level idempotency
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: isTest ? 200 : 5000, // Fast backoff in test env
        },
        removeOnComplete: true,
        removeOnFail: false, // Giữ lại lỗi để debug (DLQ)
      });
      
      this.logger.debug(`Queued uplink for ${devEui} [fCnt=${chirpstackData.fCnt}]`);
    } catch (error) {
      this.logger.error(`Failed to queue uplink for ${devEui}`, error.stack);
    }
  }
}
