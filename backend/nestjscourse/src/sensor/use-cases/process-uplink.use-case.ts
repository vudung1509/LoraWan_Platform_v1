import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ProcessUplinkUseCase {
  private readonly logger = new Logger(ProcessUplinkUseCase.name);

  constructor(
    @InjectQueue('uplink') 
    private readonly uplinkQueue: Queue,
    @InjectQueue('uplink-priority')
    private readonly priorityQueue: Queue,
  ) {}

  async execute(chirpstackData: any): Promise<void> {
    const devEui = chirpstackData.deviceInfo?.devEui;
    
    // Quick validation
    if (!devEui || !/^[0-9a-fA-F]{16}$/.test(devEui)) {
      this.logger.error(`Invalid devEui received via MQTT: ${devEui}`);
      return;
    }

    // Phân luồng ưu tiên (Bulkhead): fPort = 1 thường là tin báo động/khẩn cấp
    const fPort = chirpstackData.fPort;
    const targetQueue = fPort === 1 ? this.priorityQueue : this.uplinkQueue;
    
    try {
      const isTest = process.env.NODE_ENV === 'test';
      await targetQueue.add('handleUplink', chirpstackData, {
        jobId: `${devEui}-${chirpstackData.fCnt}`, 
        priority: fPort === 1 ? 1 : 10, // BullMQ priority (lower is higher)
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: isTest ? 200 : 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });
      
      const qName = fPort === 1 ? 'PRIORITY' : 'STANDARD';
      this.logger.debug(`Queued [${qName}] uplink for ${devEui} [fCnt=${chirpstackData.fCnt}]`);
    } catch (error) {
      this.logger.error(`Failed to queue uplink for ${devEui}`, error.stack);
    }
  }
}
