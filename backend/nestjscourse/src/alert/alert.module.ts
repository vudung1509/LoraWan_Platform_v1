import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEntity } from './infrastructure/alert.entity';
import { TypeOrmAlertRepository } from './infrastructure/typeorm-alert.repository';
import { IAlertRepository } from './domain/alert.repository';
import { TriggerAlertUseCase } from './use-cases/trigger-alert.use-case';
import { GetAlertsUseCase } from './use-cases/get-alerts.use-case';
import { AlertController } from './alert.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEntity])],
  controllers: [AlertController],
  providers: [
    { provide: IAlertRepository, useClass: TypeOrmAlertRepository },
    TriggerAlertUseCase,
    GetAlertsUseCase,
  ],
  exports: [TriggerAlertUseCase],
})
export class AlertModule {}
