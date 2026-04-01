/**
 * Test E2E cơ bản cho hệ thống LoRaWAN.
 * Nội dung: Xác nhận ứng dụng khởi chạy thành công và Endpoint "/" phản hồi đúng.
 * Nâng cấp: Chuyển vào thư mục test/e2e tập trung để quản lý tốt hơn.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
