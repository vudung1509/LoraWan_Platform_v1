import { Alert } from './alert.model';

export const ALERT_REPOSITORY = 'ALERT_REPOSITORY';

export abstract class IAlertRepository {
  abstract save(alert: Alert): Promise<void>;
  abstract findRecent(limit?: number): Promise<Alert[]>;
  abstract findByDevEui(devEui: string, limit?: number): Promise<Alert[]>;
}
