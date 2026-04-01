import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Bật Validation toàn cục để bảo vệ dữ liệu đầu vào
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Thắt chặt CORS để chỉ cho phép các domain tin cậy
  const origins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: origins.split(','), 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('LoRaWAN Backend API is running on http://localhost:3000');
}
bootstrap();