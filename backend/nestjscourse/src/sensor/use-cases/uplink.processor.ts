import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SensorReading } from '../domain/sensor-reading.model';
import { SENSOR_READING_REPOSITORY } from '../domain/sensor-reading.repository';
import type { ISensorReadingRepository } from '../domain/sensor-reading.repository';
import { SENSOR_CACHE_REPOSITORY } from '../domain/sensor-cache.repository';
import type { ISensorCacheRepository } from '../domain/sensor-cache.repository';
import { TIME_SERIES_REPOSITORY } from '../domain/time-series.repository';
import type { ITimeSeriesRepository } from '../domain/time-series.repository';
import { DecoderRegistry } from '../domain/decoder.registry';
import { TriggerAlertUseCase } from '../../alert/use-cases/trigger-alert.use-case';
import { RedisService } from '../infrastructure/redis.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor('uplink', { concurrency: 20 })
export class UplinkProcessor extends WorkerHost {
  private readonly logger = new Logger(UplinkProcessor.name);

  constructor(
    @Inject(SENSOR_READING_REPOSITORY)
    private readonly sensorRepo: ISensorReadingRepository,
    @Inject(SENSOR_CACHE_REPOSITORY)
    private readonly cacheRepo: ISensorCacheRepository,
    @Inject(TIME_SERIES_REPOSITORY)
    private readonly timeSeriesRepo: ITimeSeriesRepository,
    private readonly triggerAlert: TriggerAlertUseCase,
    private readonly redisService: RedisService,
    private readonly decoderRegistry: DecoderRegistry,
    @InjectMetric('uplink_processed_total')
    private readonly processedCounter: Counter<string>,
    @InjectMetric('uplink_processing_duration_seconds')
    private readonly processingDuration: Histogram<string>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const chirpstackData = job.data;
    const devEui = chirpstackData.deviceInfo?.devEui;
    const timer = this.processingDuration.startTimer();
    
    
    // Test-Hook: Dung Redis de xac dinh cac DevEUI can gia lap loi (phuc vu E2E Testing)
    const redis = this.redisService.getClient();
    const failureTrigger = await redis.get('test_hook:fail_deveui');
    
    if (failureTrigger && devEui === failureTrigger) {
      throw new Error(`Simulated failure for E2E Testing with DevEUI: ${devEui}`);
    }

    if (!devEui) {
      this.logger.error('No devEui found in uplink data');
      return;
    }
    const fCnt = chirpstackData.fCnt;

    try {
      // 1. Kiem tra Idempotency va xu ly reboot
      if (fCnt !== undefined) {
        const redisKey = `uplink:idempotency:${devEui}`;
        const lastFCntStr = await this.redisService.getClient().get(redisKey);
        
        if (lastFCntStr !== null) {
          const lastFCnt = parseInt(lastFCntStr);
          
          if (lastFCnt >= fCnt) {
            // Neu fCnt reset (nho hon nhieu so voi gia tri truoc), coi nhu thiet bi reboot
            const isReboot = fCnt < (lastFCnt - 100); 
            if (!isReboot) {
              this.logger.debug(`Skipping duplicate uplink for ${devEui} | fCnt: ${fCnt} | last: ${lastFCnt}`);
              return;
            }
            this.logger.log(`Device reboot detected for ${devEui} (fCnt reset ${lastFCnt} -> ${fCnt}). Accepting.`);
          }
        }
        // Luu fCnt moi vao Redis voi TTL 10 phut
        await this.redisService.getClient().set(redisKey, fCnt.toString(), 'EX', 600);
      }

      // 2. Decode va luu tru du lieu
      const payload = this.decoderRegistry.decode(chirpstackData);
      const reading = new SensorReading({
        devEui,
        ...payload,
        rawPayload: chirpstackData,
      });

      await Promise.all([
        this.cacheRepo.upsert(reading),
        this.timeSeriesRepo.savePoint(reading),
        this.sensorRepo.save(reading),
      ]);

      if (reading.isFireAlarm()) {
        await this.triggerAlert.execute(reading);
      }

      this.eventEmitter.emit('device.seen', { devEui });

      this.logger.log(`Worker processed ${devEui} [fCnt=${fCnt}]`);
      this.processedCounter.labels('success').inc();
      timer();
    } catch (error) {
      this.processedCounter.labels('error').inc();
      timer();
      this.logger.error(`Error in UplinkProcessor for ${devEui}`, error.stack);
      throw error; 
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed with error: ${error.message}. Payload: ${JSON.stringify(job.data)}`);
  }
}
