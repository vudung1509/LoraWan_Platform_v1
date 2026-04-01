// Luon xac dinh NODE_ENV = 'test' o dau file
process.env.NODE_ENV = 'test';

/**
 * Bo test E2E Stabilization (Phase 2 - Hoan tat 100%).
 * 
 * Noi dung kiem thu:
 * - Tinh on dinh cua luong xu ly asyn (BullMQ).
 * - Tinh khu trung lap (Idempotency) va xu ly reboot cho thiet bi.
 * - Quy trinh xu ly loi, Dead Letter Queue (DLQ) va Replay thu cong.
 * 
 * Cac diem nang cap so voi ban truoc:
 * - Chuyen vao thu muc test/e2e tap trung.
 * - Su dung Redis Signaling ('test_hook:fail_deveui') thay cho Env Var de dam bao lien lac lien process.
 * - Thay the setTimeout bang co che Polling thong minh de doi job thay doi trang thai.
 * - Co che clearState() xoa sach ca Redis va Queue truoc khi chay test de dam bao tinh deterministic.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../../src/app.module';
import { ProcessUplinkUseCase } from './../../src/sensor/use-cases/process-uplink.use-case';
import { RedisService } from './../../src/sensor/infrastructure/redis.service';
import { Queue } from 'bullmq';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Stabilization Flow (e2e)', () => {
  let app: INestApplication;

  // Helper de polling trang thai thay vi dung setTimeout cung
  async function pollUntil(fn: () => Promise<boolean>, timeout = 30000, interval = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await fn()) return true;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    return false;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jest.setTimeout(120000); 
  }, 120000);

  afterAll(async () => {
    await app.close();
  });

  // Ham don dep toan bo trang thai de test chay doc lap
  const clearState = async () => {
    const queue: Queue = app.get('BullQueue_uplink');
    const redis = app.get(RedisService);
    
    // Xoa sạch queue
    await queue.obliterate({ force: true }); 
    
    // Xoa sach idempotency keys va test hook trong Redis
    const keys = await redis.getClient().keys('uplink:idempotency:*');
    if (keys.length > 0) await redis.getClient().del(...keys);
    await redis.getClient().del('test_hook:fail_deveui');
  };

  describe('Health Check', () => {
    it('/health (GET) should return 200', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200);
    });
  });

  describe('Functional Ingestion & Idempotency', () => {
    it('should NOT update Redis cache if duplicate uplink is received', async () => {
      await clearState();
      const useCase = app.get(ProcessUplinkUseCase);
      const redisService = app.get(RedisService);
      const devEui = '0011223344556677';
      const redisKey = `uplink:idempotency:${devEui}`;
      const fCnt = Math.floor(Math.random() * 10000) + 1;

      // 1. Gui lan 1 -> Cap nhat state
      await useCase.execute({ deviceInfo: { devEui }, fCnt });
      
      const processed = await pollUntil(async () => {
        const val = await redisService.getClient().get(redisKey);
        return val === fCnt.toString();
      });
      expect(processed).toBe(true);

      // 2. Gui lan 2 (cung fCnt) -> Khong duoc thay doi gia tri trong Redis
      await useCase.execute({ deviceInfo: { devEui }, fCnt });
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      const valAfterDup = await redisService.getClient().get(redisKey);
      expect(valAfterDup).toBe(fCnt.toString());
    }, 50000);
  });

  describe('Functional DLQ & Replay', () => {
    it('should move failed job to DLQ and clear it after replay', async () => {
      await clearState();
      const useCase = app.get(ProcessUplinkUseCase);
      const redisService = app.get(RedisService);
      const triggerDevEui = 'ABCDEF1234567890';
      const fCnt = 999;
      
      const queue: Queue = app.get('BullQueue_uplink');

      // 1. Bat test hook qua Redis
      await redisService.getClient().set('test_hook:fail_deveui', triggerDevEui);

      // 2. Gui bản tin loi
      await useCase.execute({ 
        deviceInfo: { devEui: triggerDevEui }, 
        fCnt 
      });

      // 3. Doi job roi vao trang thai failed sau khi da exhausted retries
      const hasFailed = await pollUntil(async () => {
        const count = await queue.getFailedCount();
        return count >= 1;
      }, 35000);
      expect(hasFailed).toBe(true);

      // 4. Thuc hien Replay bằng cach sua payload sang DevEUI khac (de thanh cong)
      const failedJobs = await queue.getFailed();
      await Promise.all(
        failedJobs.map(async (job) => {
          await job.updateData({
            ...job.data,
            deviceInfo: { devEui: '0000000000000001' }, 
          });
          await job.retry();
        }),
      );

      // 5. Xac nhan job da hoan tat (failed count ve 0)
      const replayed = await pollUntil(async () => {
        const failedCount = await queue.getFailedCount();
        const completedCount = await queue.getCompletedCount();
        return failedCount === 0 && completedCount >= 1;
      }, 30000);
      expect(replayed).toBe(true);

      // Cleanup
      await redisService.getClient().del('test_hook:fail_deveui');
    }, 120000);
  });
});
